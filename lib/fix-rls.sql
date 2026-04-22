-- ============================================================
-- TRIPSYNC — RLS FIX
-- Run this entire script in Supabase SQL Editor
-- It drops and recreates all policies cleanly
-- ============================================================

-- ── TRIPS ────────────────────────────────────────────────────
drop policy if exists "Trip members can view trips" on public.trips;
drop policy if exists "Authenticated users can create trips" on public.trips;
drop policy if exists "Trip owners can update trips" on public.trips;
drop policy if exists "Trip owners can delete trips" on public.trips;

create policy "Trip members can view trips" on public.trips
  for select using (
    auth.uid() = created_by
    or exists (
      select 1 from public.trip_members
      where trip_id = id and user_id = auth.uid()
    )
  );

create policy "Authenticated users can create trips" on public.trips
  for insert with check (auth.uid() IS NOT NULL);

create policy "Trip owners can update trips" on public.trips
  for update using (auth.uid() = created_by);

create policy "Trip owners can delete trips" on public.trips
  for delete using (auth.uid() = created_by);

-- ── TRIP MEMBERS ─────────────────────────────────────────────
drop policy if exists "Members can view trip members" on public.trip_members;
drop policy if exists "Anyone can join trips" on public.trip_members;
drop policy if exists "Owners can manage members" on public.trip_members;

create policy "Members can view trip members" on public.trip_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.trip_members tm
      where tm.trip_id = trip_id and tm.user_id = auth.uid()
    )
  );

create policy "Anyone can join trips" on public.trip_members
  for insert with check (auth.uid() IS NOT NULL);

create policy "Owners can manage members" on public.trip_members
  for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from public.trip_members tm
      where tm.trip_id = trip_members.trip_id
        and tm.user_id = auth.uid()
        and tm.role = 'owner'
    )
  );

-- ── EXPENSES ─────────────────────────────────────────────────
drop policy if exists "Trip members can view expenses" on public.expenses;
drop policy if exists "Trip members can add expenses" on public.expenses;
drop policy if exists "Expense creator can update" on public.expenses;
drop policy if exists "Expense creator can delete" on public.expenses;

create policy "Trip members can view expenses" on public.expenses
  for select using (
    exists (
      select 1 from public.trip_members
      where trip_id = expenses.trip_id and user_id = auth.uid()
    )
  );

create policy "Trip members can add expenses" on public.expenses
  for insert with check (
    auth.uid() IS NOT NULL
    and exists (
      select 1 from public.trip_members
      where trip_id = expenses.trip_id and user_id = auth.uid()
    )
  );

create policy "Expense creator can update" on public.expenses
  for update using (paid_by = auth.uid());

create policy "Expense creator can delete" on public.expenses
  for delete using (paid_by = auth.uid());

-- ── EXPENSE SPLITS ───────────────────────────────────────────
drop policy if exists "Trip members can view splits" on public.expense_splits;
drop policy if exists "Anyone can insert splits" on public.expense_splits;
drop policy if exists "Users can settle own splits" on public.expense_splits;

create policy "Trip members can view splits" on public.expense_splits
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.expenses e
      join public.trip_members tm on tm.trip_id = e.trip_id
      where e.id = expense_id and tm.user_id = auth.uid()
    )
  );

create policy "Anyone can insert splits" on public.expense_splits
  for insert with check (auth.uid() IS NOT NULL);

create policy "Users can settle own splits" on public.expense_splits
  for update using (auth.uid() IS NOT NULL);

-- ── VOTES ────────────────────────────────────────────────────
drop policy if exists "Trip members can view votes" on public.votes;
drop policy if exists "Trip members can create votes" on public.votes;
drop policy if exists "Vote creator can update" on public.votes;

create policy "Trip members can view votes" on public.votes
  for select using (
    exists (
      select 1 from public.trip_members
      where trip_id = votes.trip_id and user_id = auth.uid()
    )
  );

create policy "Trip members can create votes" on public.votes
  for insert with check (
    auth.uid() IS NOT NULL
    and exists (
      select 1 from public.trip_members
      where trip_id = votes.trip_id and user_id = auth.uid()
    )
  );

create policy "Vote creator can update" on public.votes
  for update using (created_by = auth.uid());

-- ── VOTE RESPONSES ───────────────────────────────────────────
drop policy if exists "Trip members can view responses" on public.vote_responses;
drop policy if exists "Users can vote" on public.vote_responses;
drop policy if exists "Users can change vote" on public.vote_responses;

create policy "Trip members can view responses" on public.vote_responses
  for select using (auth.uid() IS NOT NULL);

create policy "Users can vote" on public.vote_responses
  for insert with check (auth.uid() = user_id);

create policy "Users can change vote" on public.vote_responses
  for update using (user_id = auth.uid());

-- ── ITINERARIES ──────────────────────────────────────────────
drop policy if exists "Trip members can view itineraries" on public.itineraries;
drop policy if exists "Trip members can create itineraries" on public.itineraries;

create policy "Trip members can view itineraries" on public.itineraries
  for select using (
    exists (
      select 1 from public.trip_members
      where trip_id = itineraries.trip_id and user_id = auth.uid()
    )
  );

create policy "Trip members can create itineraries" on public.itineraries
  for insert with check (auth.uid() IS NOT NULL);

-- ── NOTIFICATIONS ────────────────────────────────────────────
drop policy if exists "Users can view own notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;

create policy "Users can view own notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "Users can update own notifications" on public.notifications
  for update using (user_id = auth.uid());

create policy "System can insert notifications" on public.notifications
  for insert with check (auth.uid() IS NOT NULL);

-- ── USERS ────────────────────────────────────────────────────
drop policy if exists "Users can view all profiles" on public.users;
drop policy if exists "Users can update own profile" on public.users;

create policy "Users can view all profiles" on public.users
  for select using (auth.uid() IS NOT NULL);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Allow the trigger to insert new user profiles
create policy "Allow profile creation on signup" on public.users
  for insert with check (true);

-- ── VERIFY TRIGGER EXISTS ────────────────────────────────────
-- Re-create the user auto-profile trigger (safe to run again)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url);
  return new;
end;
$$;

-- Re-create trip member auto-add trigger
create or replace function public.handle_new_trip()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.trip_members (trip_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (trip_id, user_id) do nothing;
  return new;
end;
$$;

-- Make sure triggers exist
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists on_trip_created on public.trips;
create trigger on_trip_created
  after insert on public.trips
  for each row execute procedure public.handle_new_trip();
