-- Zcash Builders — Fix: carry the applicant's name onto their profile at enrolment
-- Run in Supabase Dashboard → SQL Editor → New Query.
--
-- Problem: an accepted builder's name was never written to profiles.name.
--   • accept_and_enroll() updated cohort_id/enrolled_at/role on an existing
--     profile but left name untouched.
--   • handle_new_user() (first sign-in after acceptance) only read the name
--     from signup metadata — email/magic-link sign-ups carry none, so name
--     stayed NULL and never fell back to the application.
-- Fix: both paths now fill name from the application when the profile has none,
-- and a one-time backfill repairs builders already enrolled without a name.
-- The applications table always has name (NOT NULL), so it's a reliable source.

-- ── accept_and_enroll: fill profile.name from the application ─────────────────
create or replace function public.accept_and_enroll(
  p_application_id  uuid,
  p_cohort_id       text    default 'cohort-01',
  p_admin_notes     text    default null
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
  if not public.is_admin() then
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
      -- Keep a name the builder already set; otherwise take it from the application.
      name        = coalesce(nullif(trim(name), ''), v_app.name),
      cohort_id   = p_cohort_id,
      enrolled_at = now(),
      role        = case when role in ('admin','admin+student','mentor') then role else 'student' end
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

-- ── handle_new_user: fall back to the application's name on first sign-in ─────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cohort_id   text;
  v_enrolled_at timestamptz;
  v_app_name    text;
begin
  select cohort_id, reviewed_at, name
    into v_cohort_id, v_enrolled_at, v_app_name
  from public.applications
  where lower(email) = lower(new.email)
    and status = 'accepted'
  order by reviewed_at desc
  limit 1;

  insert into public.profiles (id, name, cohort_id, enrolled_at)
  values (
    new.id,
    -- Prefer the name supplied at sign-up; otherwise use the application's name.
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), v_app_name),
    v_cohort_id,
    case when v_cohort_id is not null then now() else null end
  );

  return new;
end;
$$;

-- ── One-time backfill: repair builders already enrolled without a name ────────
update public.profiles p set
  name = a.name
from public.applications a
join auth.users u on lower(u.email) = lower(a.email)
where u.id = p.id
  and a.status = 'accepted'
  and (p.name is null or trim(p.name) = '')
  and a.name is not null and trim(a.name) <> '';
