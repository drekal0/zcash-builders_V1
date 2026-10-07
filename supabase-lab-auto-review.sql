-- ─────────────────────────────────────────────────────────────────────────────
-- Automatic lab review (phase 1: validity / reachability checks)
-- ─────────────────────────────────────────────────────────────────────────────
-- When a cohort's lab_review_mode is 'auto', the platform checks a new lab
-- submission and either approves it automatically or leaves it for a mentor.
-- The network check (does the URL resolve? does the GitHub repo exist?) runs in
-- the 'lab-auto-review' Edge Function, which calls apply_lab_auto_review() with
-- the service role. This file provides the server-side pieces that function needs:
--   • lab_catalog — the canonical XP per lab (so a pass awards the right amount).
--   • apply_lab_auto_review() — the ONLY path that may auto-approve; it awards XP
--     and records the decision, and is callable only by the service role.
--   • an 'app.auto_review' flag honoured by the lab-submissions guard, so that
--     RPC may write the review fields while students still cannot.
--
-- Apply AFTER supabase-privilege-hardening.sql and supabase-xp-server-side.sql
-- (it extends the lab guard those files rely on). Richer auto-grading (tests,
-- rubrics) is a later phase. Run once in the SQL Editor; re-running is safe.

-- ── 1. Canonical lab XP ───────────────────────────────────────────────────────
create table if not exists public.lab_catalog (
  id    text primary key,
  stage text not null,
  xp    int  not null
);
alter table public.lab_catalog enable row level security;
drop policy if exists "Lab catalog is publicly readable" on public.lab_catalog;
create policy "Lab catalog is publicly readable"
  on public.lab_catalog for select using (true);

insert into public.lab_catalog (id, stage, xp) values
  ('lab-00', '00', 200),
  ('lab-01', '01', 200),
  ('lab-06', '01', 250),
  ('lab-02', '02', 300),
  ('lab-03', '02', 300),
  ('lab-07', '02', 350),
  ('lab-04', '03', 400),
  ('lab-08', '03', 400),
  ('lab-05', '03', 400)
on conflict (id) do update set stage = excluded.stage, xp = excluded.xp;

-- ── 2. Lab-submissions guard: honour the auto-review flag ─────────────────────
-- Supersedes the version from supabase-privilege-hardening.sql. Mentors/admins
-- review by hand as before; in addition, the apply_lab_auto_review() RPC may set
-- the review fields while it holds the transaction-local 'app.auto_review' flag.
-- Students still cannot touch status (beyond 'submitted'), xp_awarded, etc.
create or replace function public.guard_lab_submission_review()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_mentor_or_admin()
     or coalesce(current_setting('app.auto_review', true), '') = 'on' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if coalesce(new.status, 'submitted') <> 'submitted' then
      raise exception 'Not authorized to set submission status' using errcode = '42501';
    end if;
    if coalesce(new.xp_awarded, 0) <> 0
       or new.mentor_id is not null
       or new.feedback is not null
       or new.reviewed_at is not null then
      raise exception 'Not authorized to set review fields' using errcode = '42501';
    end if;
    return new;
  end if;

  if new.status is distinct from old.status and new.status <> 'submitted' then
    raise exception 'Not authorized to change submission status' using errcode = '42501';
  end if;
  if new.xp_awarded is distinct from old.xp_awarded
     or new.mentor_id is distinct from old.mentor_id
     or new.feedback  is distinct from old.feedback
     or new.reviewed_at is distinct from old.reviewed_at then
    raise exception 'Not authorized to change review fields' using errcode = '42501';
  end if;
  return new;
end;
$$;
-- Trigger itself is unchanged (created by the hardening migration).

-- ── 3. Apply an automatic review decision ─────────────────────────────────────
-- Called by the Edge Function (service role) after it has done the network check.
-- p_passed=true approves the submission and awards the lab's catalog XP (once);
-- p_passed=false leaves it 'submitted' for a mentor, recording why. It never
-- trusts a client: it only acts when the submission's cohort is in 'auto' mode.
create or replace function public.apply_lab_auto_review(
  p_submission_id uuid,
  p_passed        boolean,
  p_detail        text default null
)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_user     uuid;
  v_lab      text;
  v_status   text;
  v_mode     text;
  v_xp       int;
  v_already  int;
begin
  select user_id, lab_id, status into v_user, v_lab, v_status
  from public.lab_submissions where id = p_submission_id;
  if v_user is null then
    return json_build_object('ok', false, 'message', 'Submission not found');
  end if;

  -- Only auto-act for cohorts in 'auto' mode.
  select c.lab_review_mode into v_mode
  from public.profiles p join public.cohorts c on c.id = p.cohort_id
  where p.id = v_user;
  if coalesce(v_mode, 'manual') <> 'auto' then
    return json_build_object('ok', false, 'message', 'Cohort is not in auto mode');
  end if;

  -- Never override a decision already made (e.g. a mentor got there first).
  if v_status in ('approved') then
    return json_build_object('ok', true, 'already', true, 'status', v_status);
  end if;

  perform set_config('app.auto_review', 'on', true);

  if not p_passed then
    update public.lab_submissions
      set status = 'revision_requested',
          feedback = coalesce(p_detail, 'Automatic check could not verify this submission. A mentor will review it.'),
          reviewed_at = now()
    where id = p_submission_id;
    return json_build_object('ok', true, 'approved', false);
  end if;

  select xp into v_xp from public.lab_catalog where id = v_lab;
  v_xp := coalesce(v_xp, 0);
  v_already := coalesce((select xp_awarded from public.lab_submissions where id = p_submission_id), 0);

  update public.lab_submissions
    set status = 'approved',
        xp_awarded = v_xp,
        feedback = coalesce(p_detail, 'Auto-approved: submission verified by the platform.'),
        reviewed_at = now()
  where id = p_submission_id;

  -- Award the difference to the student's profile (guard allows it via the flag).
  if v_xp > v_already then
    update public.profiles
      set xp = coalesce(xp, 0) + (v_xp - v_already)
    where id = v_user;
  end if;

  return json_build_object('ok', true, 'approved', true, 'xp_awarded', v_xp);
end;
$$;

-- Only the service role (the Edge Function) may apply auto-review decisions.
revoke all on function public.apply_lab_auto_review(uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.apply_lab_auto_review(uuid, boolean, text) to service_role;
