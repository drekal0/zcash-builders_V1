-- Zcash Builders — Admin & Mentor RLS Policies
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- This fills the gaps left in supabase-schema.sql:
--   · applications   had insert-only (no admin read)
--   · lesson_progress had user-only (no mentor/admin read)
--   · lab_submissions had user-only (no mentor/admin read)
--   · profiles        had no admin read of private profiles
--   · achievements    had no admin read

-- ── HELPER: reusable role checks ─────────────────────────────────────────────
-- Returns true when the current user's role is 'admin' or 'admin+student'
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'admin+student')
  );
$$;

-- Returns true when the current user's role is 'mentor', 'admin', or 'admin+student'
create or replace function public.is_mentor_or_admin()
returns boolean language sql security definer stable set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('mentor', 'admin', 'admin+student')
  );
$$;

-- ── PROFILES ─────────────────────────────────────────────────────────────────
-- Admins can read ALL profiles (including private ones) for the admin panel
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- ── APPLICATIONS ─────────────────────────────────────────────────────────────
-- Admins can read all applications (review queue)
create policy "Admins can read all applications"
  on public.applications for select
  using (public.is_admin());

-- Admins can update applications (accept, reject, add notes, set cohort_id)
create policy "Admins can update applications"
  on public.applications for update
  using (public.is_admin());

-- ── LESSON PROGRESS ──────────────────────────────────────────────────────────
-- Mentors and admins can read all lesson progress (for cohort oversight)
create policy "Mentors and admins can read all lesson progress"
  on public.lesson_progress for select
  using (public.is_mentor_or_admin());

-- ── LAB SUBMISSIONS ──────────────────────────────────────────────────────────
-- Mentors and admins can read all lab submissions (review queue)
create policy "Mentors and admins can read all lab submissions"
  on public.lab_submissions for select
  using (public.is_mentor_or_admin());

-- Mentors and admins can update lab submissions (feedback, status, xp_awarded)
create policy "Mentors and admins can update lab submissions"
  on public.lab_submissions for update
  using (public.is_mentor_or_admin());

-- ── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
-- Admins can read all achievements (leaderboard, graduation checks)
create policy "Admins can read all achievements"
  on public.achievements for select
  using (public.is_admin());

-- Admins can insert achievements (manually award on graduation etc.)
create policy "Admins can insert achievements"
  on public.achievements for insert
  with check (public.is_admin());

-- ── COHORTS ──────────────────────────────────────────────────────────────────
-- cohorts table has no RLS yet — enable it and add policies
alter table public.cohorts enable row level security;

-- Everyone can read cohorts (needed for landing page, apply page)
create policy "Cohorts are publicly readable"
  on public.cohorts for select
  using (true);

-- Only admins can create or update cohorts
create policy "Admins can manage cohorts"
  on public.cohorts for all
  using (public.is_admin());

-- ── VERIFY (run separately to check) ─────────────────────────────────────────
-- select schemaname, tablename, policyname, roles, cmd, qual
-- from pg_policies
-- where schemaname = 'public'
-- order by tablename, policyname;
