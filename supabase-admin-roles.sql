-- ─────────────────────────────────────────────────────────────────────────────
-- Admin roles & capabilities  (data model + rules; the admin panel UI is later)
-- ─────────────────────────────────────────────────────────────────────────────
-- What this sets up:
--   • A PRIMARY ADMIN (you) with total control. Only the primary admin, or an
--     admin you grant 'manage_admins', can promote others or change permissions.
--   • SECONDARY ADMINS: anyone the primary admin promotes (regional leads and
--     others). What each one may do is controlled by capability toggles, not a
--     fixed tier.
--   • Per-cohort LAB REVIEW MODE: 'manual' or 'auto'. Stored now; the actual
--     automatic checks (URL/repo validity, then richer criteria) are a later
--     phase, so 'auto' does not yet approve anything on its own.
--   • Stores for admin-authored content: supporting VIDEOS on existing lessons,
--     and net-new CUSTOM LESSONS. The authoring UI comes with the admin panel;
--     the tables and access rules exist now.
--
-- It is additive (new columns/tables/functions) and safe to apply while the app
-- runs. APPLY ORDER for the security set: 1) supabase-privilege-hardening.sql
-- 2) supabase-xp-server-side.sql 3) THIS FILE. This file finalises the profiles
-- guard trigger, so it must be applied last. Re-running is safe.

-- ── 1. Primary admin flag ─────────────────────────────────────────────────────
-- (The owner is made primary admin in section 5, after the guard that governs
-- this column is in place.)
alter table public.profiles
  add column if not exists is_primary_admin boolean not null default false;

create or replace function public.is_primary_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_primary_admin = true
  );
$$;

-- ── 2. Capability toggles ─────────────────────────────────────────────────────
-- Each row grants one capability to one admin. The known capabilities:
--   review_labs          — review / approve / request changes on lab submissions
--   manage_applications  — review, accept and reject cohort applications
--   manage_cohort        — edit cohort settings, enrol students
--   edit_lessons         — add / edit lessons and supporting videos
--   manage_admins        — promote admins and grant / revoke their capabilities
create table if not exists public.admin_capabilities (
  admin_id   uuid not null references public.profiles(id) on delete cascade,
  capability text not null check (capability in (
    'review_labs', 'manage_applications', 'manage_cohort', 'edit_lessons', 'manage_admins'
  )),
  granted_by uuid references public.profiles(id),
  granted_at timestamptz not null default now(),
  primary key (admin_id, capability)
);

alter table public.admin_capabilities enable row level security;

-- The primary admin has every capability implicitly; others have what they were granted.
create or replace function public.has_capability(p_capability text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_primary_admin() or exists (
    select 1 from public.admin_capabilities
    where admin_id = auth.uid() and capability = p_capability
  );
$$;

drop policy if exists "Admins can read their own capabilities" on public.admin_capabilities;
create policy "Admins can read their own capabilities"
  on public.admin_capabilities for select
  using (admin_id = auth.uid() or public.is_primary_admin() or public.has_capability('manage_admins'));

drop policy if exists "Only admin managers can change capabilities" on public.admin_capabilities;
create policy "Only admin managers can change capabilities"
  on public.admin_capabilities for all
  using (public.is_primary_admin() or public.has_capability('manage_admins'))
  with check (public.is_primary_admin() or public.has_capability('manage_admins'));

-- ── 3. Per-cohort lab review mode ─────────────────────────────────────────────
alter table public.cohorts
  add column if not exists lab_review_mode text not null default 'manual'
  check (lab_review_mode in ('manual', 'auto'));

-- ── 4. Admin-authored content ─────────────────────────────────────────────────
-- Supporting videos attached to a lesson (lesson_id matches the curriculum ids,
-- e.g. 'l-01-06'). Publicly readable so students see them; only editors write.
create table if not exists public.lesson_videos (
  id         uuid primary key default gen_random_uuid(),
  lesson_id  text not null,
  title      text not null,
  url        text not null,
  position   int not null default 0,
  added_by   uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.lesson_videos enable row level security;

drop policy if exists "Lesson videos are publicly readable" on public.lesson_videos;
create policy "Lesson videos are publicly readable"
  on public.lesson_videos for select using (true);

drop policy if exists "Editors manage lesson videos" on public.lesson_videos;
create policy "Editors manage lesson videos"
  on public.lesson_videos for all
  using (public.has_capability('edit_lessons'))
  with check (public.has_capability('edit_lessons'));

-- Net-new lessons added through the product. The reader will merge these with
-- the code-based curriculum once the authoring UI lands. Published ones are
-- public; drafts are visible only to editors.
create table if not exists public.custom_lessons (
  id         text primary key,
  stage      text not null,
  week       int  not null,
  title      text not null,
  subtitle   text,
  content    text not null default '',
  type       text not null default 'lesson' check (type in ('lesson', 'lab')),
  xp         int  not null default 50,
  duration   int  not null default 10,
  published  boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.custom_lessons enable row level security;

drop policy if exists "Published custom lessons are readable" on public.custom_lessons;
create policy "Published custom lessons are readable"
  on public.custom_lessons for select
  using (published or public.has_capability('edit_lessons'));

drop policy if exists "Editors manage custom lessons" on public.custom_lessons;
create policy "Editors manage custom lessons"
  on public.custom_lessons for all
  using (public.has_capability('edit_lessons'))
  with check (public.has_capability('edit_lessons'));

-- ── 5. Finalised profiles guard ───────────────────────────────────────────────
-- Supersedes the versions from the hardening and XP migrations. Rules for a
-- non-primary editor of a profiles row:
--   • role: may only be changed by the primary admin or an admin with
--     'manage_admins'. (Enrolment, which only ever sets role to 'student', is
--     also allowed for any admin so the accept/enrol flow keeps working.)
--   • cohort_id: admins only (enrolment goes through SECURITY DEFINER functions
--     that run as an admin).
--   • xp: only the server award path (complete_lesson, which sets app.award_xp)
--     may change it; direct client writes are rejected.
create or replace function public.guard_profile_privileged_columns()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- Trusted server-side contexts have no end-user: the SQL Editor, the service
  -- role, migrations, and SECURITY DEFINER maintenance all run with a null
  -- auth.uid(). End users always have a non-null auth.uid() (and cannot pass the
  -- profiles RLS for a row that isn't theirs), so allowing null here does not
  -- open a hole — it just lets admin/migration code through.
  if auth.uid() is null or public.is_primary_admin() then
    return new;
  end if;

  -- Past this point the caller is not the primary admin, so they may never
  -- grant themselves (or anyone) primary-admin status.
  if new.is_primary_admin is distinct from old.is_primary_admin then
    raise exception 'Not authorized to change primary admin' using errcode = '42501';
  end if;

  if new.role is distinct from old.role then
    if not (public.has_capability('manage_admins')
            or (public.is_admin() and new.role = 'student')) then
      raise exception 'Not authorized to change role' using errcode = '42501';
    end if;
  end if;

  if new.cohort_id is distinct from old.cohort_id and not public.is_admin() then
    raise exception 'Not authorized to change cohort' using errcode = '42501';
  end if;

  if new.xp is distinct from old.xp
     and not public.is_admin()
     and coalesce(current_setting('app.award_xp', true), '') <> 'on' then
    raise exception 'XP is awarded by the server, not set directly' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_privileged_columns on public.profiles;
create trigger guard_profile_privileged_columns
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

-- Make the owner the primary admin (and ensure an admin role). Runs now that the
-- guard above is in place; in the SQL Editor auth.uid() is null, so the guard's
-- trusted-context branch permits this write. Safe no-op if the account does not
-- exist yet — re-run after first sign-in.
update public.profiles p
set is_primary_admin = true,
    role = case when p.role in ('admin', 'admin+student') then p.role else 'admin+student' end
where p.id in (
  select u.id from auth.users u where lower(u.email) = lower('darekalejaiye0@gmail.com')
);

-- ── 6. Management RPCs (for the future panel; usable now) ──────────────────────
-- Promote / demote. Only the primary admin or a 'manage_admins' holder may call
-- it, and nobody may change their own primary-admin status here.
create or replace function public.set_admin_role(p_user_id uuid, p_role text)
returns json language plpgsql security definer set search_path = '' as $$
begin
  if not (public.is_primary_admin() or public.has_capability('manage_admins')) then
    return json_build_object('ok', false, 'message', 'Unauthorized');
  end if;
  if p_role not in ('student', 'admin', 'admin+student', 'mentor') then
    return json_build_object('ok', false, 'message', 'Invalid role');
  end if;
  update public.profiles set role = p_role where id = p_user_id;
  if not found then
    return json_build_object('ok', false, 'message', 'User not found');
  end if;
  return json_build_object('ok', true);
end;
$$;

create or replace function public.grant_admin_capability(p_user_id uuid, p_capability text)
returns json language plpgsql security definer set search_path = '' as $$
begin
  if not (public.is_primary_admin() or public.has_capability('manage_admins')) then
    return json_build_object('ok', false, 'message', 'Unauthorized');
  end if;
  insert into public.admin_capabilities (admin_id, capability, granted_by)
  values (p_user_id, p_capability, auth.uid())
  on conflict (admin_id, capability) do nothing;
  return json_build_object('ok', true);
exception when check_violation then
  return json_build_object('ok', false, 'message', 'Unknown capability');
end;
$$;

create or replace function public.revoke_admin_capability(p_user_id uuid, p_capability text)
returns json language plpgsql security definer set search_path = '' as $$
begin
  if not (public.is_primary_admin() or public.has_capability('manage_admins')) then
    return json_build_object('ok', false, 'message', 'Unauthorized');
  end if;
  delete from public.admin_capabilities where admin_id = p_user_id and capability = p_capability;
  return json_build_object('ok', true);
end;
$$;

create or replace function public.set_cohort_lab_review_mode(p_cohort_id text, p_mode text)
returns json language plpgsql security definer set search_path = '' as $$
begin
  if not (public.is_primary_admin() or public.has_capability('review_labs')) then
    return json_build_object('ok', false, 'message', 'Unauthorized');
  end if;
  if p_mode not in ('manual', 'auto') then
    return json_build_object('ok', false, 'message', 'Invalid mode');
  end if;
  update public.cohorts set lab_review_mode = p_mode where id = p_cohort_id;
  if not found then
    return json_build_object('ok', false, 'message', 'Cohort not found');
  end if;
  return json_build_object('ok', true);
end;
$$;

grant execute on function public.is_primary_admin()                       to authenticated;
grant execute on function public.has_capability(text)                     to authenticated;
grant execute on function public.set_admin_role(uuid, text)               to authenticated;
grant execute on function public.grant_admin_capability(uuid, text)       to authenticated;
grant execute on function public.revoke_admin_capability(uuid, text)      to authenticated;
grant execute on function public.set_cohort_lab_review_mode(text, text)   to authenticated;
