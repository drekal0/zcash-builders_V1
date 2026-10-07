-- ─────────────────────────────────────────────────────────────────────────────
-- Server-authoritative lesson XP
-- ─────────────────────────────────────────────────────────────────────────────
-- Before this, the browser wrote profiles.xp directly when a lesson was marked
-- complete, so the XP total (and the leaderboard) was client-trusted — anyone
-- could POST any number. This migration moves XP awarding to the server:
--
--   • lesson_catalog holds the canonical XP for every lesson (seeded below).
--   • complete_lesson(p_lesson_id) is the ONLY path that may raise profiles.xp.
--     It marks the lesson complete and, the first time only, adds the catalog XP.
--   • the profiles guard trigger now blocks any other xp change by a non-admin.
--
-- Apply AFTER supabase-privilege-hardening.sql (it extends the trigger function
-- that file creates). Run the whole file once in the Supabase SQL Editor.
-- Re-run safe: the seed upserts and the functions are CREATE OR REPLACE.

-- ── 1. Canonical lesson XP ────────────────────────────────────────────────────
create table if not exists public.lesson_catalog (
  id    text primary key,
  stage text not null,
  xp    int  not null
);

alter table public.lesson_catalog enable row level security;

drop policy if exists "Lesson catalog is publicly readable" on public.lesson_catalog;
create policy "Lesson catalog is publicly readable"
  on public.lesson_catalog for select using (true);
-- No write policy: only admins/service role (which bypass RLS) may change it.

insert into public.lesson_catalog (id, stage, xp) values
  ('l-00-01', '00', 50),
  ('l-00-02', '00', 50),
  ('l-00-03', '00', 75),
  ('l-00-04', '00', 75),
  ('l-00-05', '00', 50),
  ('l-00-06', '00', 50),
  ('l-00-07', '00', 75),
  ('l-00-08', '00', 50),
  ('l-00-09', '00', 75),
  ('l-00-10', '00', 50),
  ('l-00-11', '00', 100),
  ('l-01-01', '01', 50),
  ('l-01-02', '01', 50),
  ('l-01-03', '01', 75),
  ('l-01-04', '01', 100),
  ('l-01-05', '01', 75),
  ('l-01-06', '01', 75),
  ('l-01-07', '01', 75),
  ('l-01-08', '01', 50),
  ('l-01-09', '01', 50),
  ('l-01-10', '01', 50),
  ('l-01-11', '01', 75),
  ('l-01-12', '01', 75),
  ('l-01-13', '01', 75),
  ('l-01-14', '01', 50),
  ('l-02-01', '02', 75),
  ('l-02-02', '02', 100),
  ('l-02-03', '02', 150),
  ('l-02-04', '02', 100),
  ('l-02-05', '02', 75),
  ('l-02-06', '02', 75),
  ('l-02-07', '02', 150),
  ('l-02-08', '02', 100),
  ('l-02-09', '02', 75),
  ('l-02-10', '02', 75),
  ('l-02-11', '02', 100),
  ('l-02-12', '02', 75),
  ('l-02-13', '02', 75),
  ('l-02-14', '02', 100),
  ('l-02-15', '02', 100),
  ('l-02-16', '02', 125),
  ('l-02-17', '02', 125),
  ('l-02-18', '02', 100),
  ('l-02-19', '02', 75),
  ('l-03-01', '03', 75),
  ('l-03-02', '03', 100),
  ('l-03-03', '03', 150),
  ('l-03-04', '03', 50),
  ('l-03-05', '03', 100),
  ('l-03-06', '03', 100),
  ('l-03-07', '03', 75),
  ('l-03-15', '03', 100),
  ('l-03-16', '03', 150),
  ('l-03-17', '03', 100),
  ('l-03-18', '03', 125),
  ('l-03-19', '03', 100),
  ('l-03-08', '03', 75),
  ('l-03-09', '03', 100),
  ('l-03-10', '03', 100),
  ('l-03-11', '03', 50),
  ('l-03-12', '03', 75),
  ('l-03-13', '03', 50),
  ('l-03-14', '03', 50)
on conflict (id) do update set stage = excluded.stage, xp = excluded.xp;

-- ── 2. Award XP server-side ───────────────────────────────────────────────────
-- Marks a lesson complete for the caller and, only on the first completion,
-- adds the lesson's catalog XP to their profile. Returns the new total.
create or replace function public.complete_lesson(p_lesson_id text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_xp       int;
  v_stage    text;
  v_was_done boolean;
  v_total    int;
begin
  if auth.uid() is null then
    return json_build_object('ok', false, 'message', 'Not signed in');
  end if;

  select xp, stage into v_xp, v_stage
  from public.lesson_catalog where id = p_lesson_id;

  if v_xp is null then
    return json_build_object('ok', false, 'message', 'Unknown lesson');
  end if;

  -- Caller must be enrolled (mirrors the app's own gate)
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and cohort_id is not null
  ) then
    return json_build_object('ok', false, 'message', 'Not enrolled');
  end if;

  select completed into v_was_done
  from public.lesson_progress
  where user_id = auth.uid() and lesson_id = p_lesson_id;

  insert into public.lesson_progress (user_id, lesson_id, stage, completed, completed_at)
  values (auth.uid(), p_lesson_id, v_stage, true, now())
  on conflict (user_id, lesson_id) do update
    set completed = true,
        completed_at = coalesce(public.lesson_progress.completed_at, now());

  if coalesce(v_was_done, false) then
    -- Already completed before: no second award
    select xp into v_total from public.profiles where id = auth.uid();
    return json_build_object('ok', true, 'awarded', 0, 'xp', coalesce(v_total, 0), 'already', true);
  end if;

  -- First completion: award XP. The guard trigger permits the change only while
  -- this transaction-local flag is set, so the client cannot award XP itself.
  perform set_config('app.award_xp', 'on', true);
  update public.profiles
    set xp = coalesce(xp, 0) + v_xp
  where id = auth.uid()
  returning xp into v_total;

  return json_build_object('ok', true, 'awarded', v_xp, 'xp', coalesce(v_total, 0), 'already', false);
end;
$$;

grant execute on function public.complete_lesson(text) to authenticated;

-- ── 3. Lock direct xp writes ──────────────────────────────────────────────────
-- Extends the profiles guard from supabase-privilege-hardening.sql to also block
-- xp changes by non-admins, except the award path above (which sets app.award_xp).
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Not authorized to change role' using errcode = '42501';
  end if;

  if new.cohort_id is distinct from old.cohort_id then
    raise exception 'Not authorized to change cohort' using errcode = '42501';
  end if;

  if new.xp is distinct from old.xp
     and coalesce(current_setting('app.award_xp', true), '') <> 'on' then
    raise exception 'XP is awarded by the server, not set directly' using errcode = '42501';
  end if;

  return new;
end;
$$;
-- Trigger itself is unchanged (created by the hardening migration); replacing the
-- function body is enough.
