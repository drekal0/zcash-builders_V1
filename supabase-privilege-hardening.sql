-- ─────────────────────────────────────────────────────────────────────────────
-- Privilege hardening — close self-escalation holes in profiles & lab_submissions
-- ─────────────────────────────────────────────────────────────────────────────
-- Problem this fixes:
--   RLS let a signed-in user UPDATE their own profiles row and their own
--   lab_submissions row freely. Because RLS is row-level, not column-level, that
--   meant a student could:
--     • set their own profiles.role to 'admin' (full account takeover),
--     • set their own profiles.cohort_id (self-enroll, bypassing review),
--     • set their own lab_submissions.status='approved' and xp_awarded (self-grade).
--
-- Fix: keep the existing row-ownership RLS, and add BEFORE-write triggers that
-- block non-privileged writes to the sensitive columns. Legitimate writes still
-- go through the SECURITY DEFINER enrolment functions (accept_and_enroll,
-- handle_new_user), which run as an admin / the signing-up user and are allowed
-- by the checks below.
--
-- NOT addressed here (needs an app change): profiles.xp is still written by the
-- client when a lesson is completed, so the XP total remains client-trusted.
-- Moving XP awards into a SECURITY DEFINER RPC with server-side lesson values is
-- the follow-up. Locking xp now would break the current completion flow.
-- Run this whole file once in the Supabase SQL Editor.

-- ── profiles: guard role and cohort_id ───────────────────────────────────────
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Admins (and the SECURITY DEFINER enrolment RPCs, which run as an admin) may
  -- change anything. Everyone else must leave role and cohort_id untouched.
  if public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Not authorized to change role'
      using errcode = '42501';
  end if;

  if new.cohort_id is distinct from old.cohort_id then
    raise exception 'Not authorized to change cohort'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_privileged_columns on public.profiles;
create trigger guard_profile_privileged_columns
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

-- ── lab_submissions: only mentors/admins may review ──────────────────────────
-- Students may create a submission and (re)submit it, editing only the URL and
-- notes and setting status to 'submitted'. The review fields — status beyond
-- 'submitted', xp_awarded, mentor_id, feedback, reviewed_at — are mentor-only.
create or replace function public.guard_lab_submission_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_mentor_or_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if coalesce(new.status, 'submitted') <> 'submitted' then
      raise exception 'Not authorized to set submission status'
        using errcode = '42501';
    end if;
    if coalesce(new.xp_awarded, 0) <> 0
       or new.mentor_id is not null
       or new.feedback is not null
       or new.reviewed_at is not null then
      raise exception 'Not authorized to set review fields'
        using errcode = '42501';
    end if;
    return new;
  end if;

  -- UPDATE by a non-reviewer: a resubmission at most.
  if new.status is distinct from old.status and new.status <> 'submitted' then
    raise exception 'Not authorized to change submission status'
      using errcode = '42501';
  end if;
  if new.xp_awarded is distinct from old.xp_awarded
     or new.mentor_id is distinct from old.mentor_id
     or new.feedback  is distinct from old.feedback
     or new.reviewed_at is distinct from old.reviewed_at then
    raise exception 'Not authorized to change review fields'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_lab_submission_review on public.lab_submissions;
create trigger guard_lab_submission_review
  before insert or update on public.lab_submissions
  for each row execute function public.guard_lab_submission_review();
