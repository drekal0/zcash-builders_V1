-- Zcash Builders — Region Lead Cohort Self-Management
-- Allows a region_lead to create and update their own cohort.
-- Apply AFTER multi_regional_cohorts migration.
-- Run in Supabase Dashboard → SQL Editor → New Query

-- ── CREATE COHORT (region lead self-service) ──────────────────────────────────
create or replace function public.create_regional_cohort(
  p_cohort_id     text,
  p_name          text,
  p_region        text,
  p_language      text    default 'en',
  p_timezone      text    default 'UTC',
  p_description   text    default null,
  p_website       text    default null,
  p_start_date    date    default null,
  p_end_date      date    default null,
  p_max_students  int     default 30
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
begin
  select role into v_role from public.profiles where id = auth.uid();

  if v_role not in ('admin','admin+student','region_lead') then
    return json_build_object('ok', false, 'message', 'Only region leads or admins can create cohorts');
  end if;

  -- region leads can only set themselves as the lead
  insert into public.cohorts (
    id, name, region, region_lead_id, language, timezone,
    description, website, start_date, end_date, max_students,
    status, is_public
  ) values (
    p_cohort_id, p_name, p_region, auth.uid(), p_language, p_timezone,
    p_description, p_website, p_start_date, p_end_date, p_max_students,
    'upcoming', true
  );

  -- tag the lead's own profile with this region
  update public.profiles set region = p_region where id = auth.uid();

  return json_build_object('ok', true, 'cohort_id', p_cohort_id);
end;
$$;

revoke execute on function public.create_regional_cohort(text,text,text,text,text,text,text,date,date,int) from anon, authenticated;
grant  execute on function public.create_regional_cohort(text,text,text,text,text,text,text,date,date,int) to authenticated;

-- ── UPDATE COHORT (region lead self-service) ──────────────────────────────────
create or replace function public.update_regional_cohort(
  p_cohort_id     text,
  p_name          text    default null,
  p_language      text    default null,
  p_timezone      text    default null,
  p_description   text    default null,
  p_website       text    default null,
  p_start_date    date    default null,
  p_end_date      date    default null,
  p_max_students  int     default null,
  p_status        text    default null,
  p_is_public     boolean default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (public.is_admin() or public.is_lead_of(p_cohort_id)) then
    return json_build_object('ok', false, 'message', 'Unauthorized');
  end if;

  update public.cohorts set
    name         = coalesce(p_name,         name),
    language     = coalesce(p_language,     language),
    timezone     = coalesce(p_timezone,     timezone),
    description  = coalesce(p_description,  description),
    website      = coalesce(p_website,      website),
    start_date   = coalesce(p_start_date,   start_date),
    end_date     = coalesce(p_end_date,     end_date),
    max_students = coalesce(p_max_students, max_students),
    status       = coalesce(p_status,       status),
    is_public    = coalesce(p_is_public,    is_public)
  where id = p_cohort_id;

  return json_build_object('ok', true);
end;
$$;

revoke execute on function public.update_regional_cohort(text,text,text,text,text,text,date,date,int,text,boolean) from anon, authenticated;
grant  execute on function public.update_regional_cohort(text,text,text,text,text,text,date,date,int,text,boolean) to authenticated;
