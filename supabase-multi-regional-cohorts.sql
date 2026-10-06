-- Zcash Builders — Multi-Regional Cohorts
-- Enables regional communities (West Africa, East Africa, LATAM, etc.)
-- to create and manage their own cohorts independently.
-- Run in Supabase Dashboard → SQL Editor → New Query
-- (Applied to live DB via MCP migration)

-- ── 1. EXTEND COHORTS TABLE ───────────────────────────────────────────────────
alter table public.cohorts
  add column if not exists region         text,          -- 'west-africa' | 'east-africa' | 'latam' | 'apac' | 'europe' | 'global'
  add column if not exists region_lead_id uuid references public.profiles(id),
  add column if not exists language       text default 'en',
  add column if not exists timezone       text default 'UTC',
  add column if not exists description    text,
  add column if not exists website        text,
  add column if not exists is_public      boolean default true;

-- Tag existing cohort as west-africa
update public.cohorts
  set region      = 'west-africa',
      language    = 'en',
      timezone    = 'Africa/Lagos',
      description = 'Inaugural Zcash Builders cohort — West Africa'
  where id = 'cohort-01';

-- ── 2. REGION COLUMN ON PROFILES ─────────────────────────────────────────────
alter table public.profiles
  add column if not exists region text;

-- ── 3. ROLE: region_lead ─────────────────────────────────────────────────────
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student','admin','admin+student','mentor','region_lead'));

-- ── 4. HELPERS ────────────────────────────────────────────────────────────────
-- Returns true when the current user is the lead of a specific cohort
create or replace function public.is_lead_of(p_cohort_id text)
returns boolean language sql security definer stable set search_path = ''
as $$
  select exists (
    select 1 from public.cohorts
    where id = p_cohort_id
      and region_lead_id = auth.uid()
  );
$$;

-- Returns true when the current user is admin or a region lead
create or replace function public.is_admin_or_lead()
returns boolean language sql security definer stable set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin','admin+student','region_lead')
  );
$$;

revoke execute on function public.is_lead_of(text) from anon, authenticated;
revoke execute on function public.is_admin_or_lead() from anon, authenticated;

-- ── 5. ACCEPT & ENROLL (cohort-aware) ────────────────────────────────────────
drop function if exists public.accept_and_enroll(uuid, text, text);

create function public.accept_and_enroll(
  p_application_id  uuid,
  p_cohort_id       text,          -- required — admin/lead picks the cohort
  p_admin_notes     text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_app         public.applications%rowtype;
  v_profile_id  uuid;
  v_enrolled    boolean := false;
begin
  -- Must be global admin or lead of the target cohort
  if not (public.is_admin() or public.is_lead_of(p_cohort_id)) then
    return json_build_object('ok', false, 'message', 'Unauthorized');
  end if;

  select * into v_app
  from public.applications
  where id = p_application_id
  for update;

  if not found then
    return json_build_object('ok', false, 'message', 'Application not found');
  end if;

  update public.applications set
    status      = 'accepted',
    cohort_id   = p_cohort_id,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    admin_notes = coalesce(p_admin_notes, admin_notes)
  where id = p_application_id;

  select p.id into v_profile_id
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(u.email) = lower(v_app.email)
  limit 1;

  if v_profile_id is not null then
    update public.profiles set
      cohort_id   = p_cohort_id,
      enrolled_at = now(),
      role        = case
                      when role in ('admin','admin+student','mentor','region_lead') then role
                      else 'student'
                    end
    where id = v_profile_id;
    v_enrolled := true;
  end if;

  return json_build_object(
    'ok',               true,
    'profile_enrolled', v_enrolled,
    'message',          case when v_enrolled
                          then 'Accepted and enrolled in ' || p_cohort_id
                          else 'Accepted — will be enrolled on first sign-in'
                        end
  );
end;
$$;

revoke execute on function public.accept_and_enroll(uuid, text, text) from anon, authenticated;
grant execute on function public.accept_and_enroll(uuid, text, text) to authenticated;

-- ── 6. RLS POLICIES FOR REGION LEADS ─────────────────────────────────────────

-- Applications: leads see only their cohort
create policy "Region leads can read their cohort applications"
  on public.applications for select
  using (cohort_id is not null and public.is_lead_of(cohort_id));

create policy "Region leads can update their cohort applications"
  on public.applications for update
  using (cohort_id is not null and public.is_lead_of(cohort_id));

-- Profiles: leads see students in their cohort
create policy "Region leads can read their cohort profiles"
  on public.profiles for select
  using (cohort_id is not null and public.is_lead_of(cohort_id));

-- Lesson progress: scoped to cohort
create policy "Region leads can read their cohort lesson progress"
  on public.lesson_progress for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = lesson_progress.user_id
        and p.cohort_id is not null
        and public.is_lead_of(p.cohort_id)
    )
  );

-- Lab submissions: scoped to cohort
create policy "Region leads can read their cohort lab submissions"
  on public.lab_submissions for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = lab_submissions.user_id
        and p.cohort_id is not null
        and public.is_lead_of(p.cohort_id)
    )
  );

create policy "Region leads can update their cohort lab submissions"
  on public.lab_submissions for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = lab_submissions.user_id
        and p.cohort_id is not null
        and public.is_lead_of(p.cohort_id)
    )
  );

-- ── 7. INDEXES ────────────────────────────────────────────────────────────────
create index if not exists cohorts_region_idx  on public.cohorts(region);
create index if not exists profiles_region_idx on public.profiles(region);
create index if not exists cohorts_lead_idx    on public.cohorts(region_lead_id);

-- ── SEED: GLOBAL COHORT ──────────────────────────────────────────────────────
-- Open to builders from any region worldwide
insert into public.cohorts (id, name, region, language, timezone, description, start_date, end_date, max_students, status, is_public)
values (
  'cohort-global-01',
  'Global Cohort 01',
  'global',
  'en',
  'UTC',
  'Open to Zcash builders worldwide — no regional requirement',
  '2026-11-01',
  '2026-12-27',
  50,
  'open',
  true
)
on conflict (id) do nothing;

-- ── HOW TO CREATE A NEW REGIONAL COHORT ──────────────────────────────────────
-- 1. Insert the cohort:
--    insert into public.cohorts (id, name, region, region_lead_id, language, timezone, start_date, end_date, max_students, status)
--    values ('cohort-ea-01', 'East Africa Cohort 01', 'east-africa', '<lead_user_id>', 'en', 'Africa/Nairobi', '2026-11-01', '2026-12-26', 20, 'open');
--
-- 2. Assign the lead role:
--    update public.profiles set role = 'region_lead' where id = '<lead_user_id>';
--
-- 3. The lead now sees only their cohort's applicants and students in the admin panel.
