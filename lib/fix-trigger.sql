-- ============================================================
-- TRIPSYNC — Fix user profile trigger + RLS
-- Run this in Supabase SQL Editor BEFORE merging the PR
-- ============================================================

-- 1. Fix the auto-profile trigger to handle conflicts
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do update set
    email        = excluded.email,
    full_name    = coalesce(excluded.full_name, public.users.full_name),
    avatar_url   = coalesce(excluded.avatar_url, public.users.avatar_url),
    updated_at   = now();
  return new;
end;
$$;

-- Re-attach trigger (safe to run again)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Allow users to insert their own profile (needed by the callback route)
drop policy if exists "Allow profile creation on signup" on public.users;
create policy "Allow profile creation on signup" on public.users
  for insert with check (true);

-- 3. Ensure upsert works from the callback
drop policy if exists "Service can upsert profiles" on public.users;
create policy "Service can upsert profiles" on public.users
  for update using (true);

-- 4. Fix trip_members insert policy (allow authenticated users)
drop policy if exists "Anyone can join trips" on public.trip_members;
create policy "Anyone can join trips" on public.trip_members
  for insert with check (auth.uid() = user_id);

-- 5. Backfill: create profiles for any existing auth users missing a profile
insert into public.users (id, email, full_name, avatar_url)
select
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name',
  au.raw_user_meta_data->>'avatar_url'
from auth.users au
left join public.users pu on pu.id = au.id
where pu.id is null
on conflict (id) do nothing;

select 'Done! ' || count(*) || ' users in public.users' as status from public.users;
