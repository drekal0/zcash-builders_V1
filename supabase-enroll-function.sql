-- Zcash Builders — Accept & Enroll Function
-- Run in Supabase Dashboard → SQL Editor → New Query
-- (Already applied to live DB via MCP migration)

-- ── ACCEPT & ENROLL ───────────────────────────────────────────────────────────
-- Atomically accepts an application and enrolls the student's profile.
-- If the applicant hasn't signed up yet, enrollment happens at first sign-in
-- via the updated handle_new_user trigger.
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

-- ── UPDATED handle_new_user TRIGGER ──────────────────────────────────────────
-- Auto-enrolls students who sign up after being accepted.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cohort_id   text;
  v_enrolled_at timestamptz;
begin
  select cohort_id, reviewed_at into v_cohort_id, v_enrolled_at
  from public.applications
  where lower(email) = lower(new.email)
    and status = 'accepted'
  order by reviewed_at desc
  limit 1;

  insert into public.profiles (id, name, cohort_id, enrolled_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    v_cohort_id,
    case when v_cohort_id is not null then now() else null end
  );

  return new;
end;
$$;
