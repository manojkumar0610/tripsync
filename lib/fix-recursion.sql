-- ============================================================
-- TRIPSYNC — Fix Infinite Recursion in trip_members policy
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── DROP ALL trip_members policies first ─────────────────────
drop policy if exists "Members can view trip members" on public.trip_members;
drop policy if exists "Anyone can join trips" on public.trip_members;
drop policy if exists "Owners can manage members" on public.trip_members;

-- ── Recreate WITHOUT self-referencing subquery ────────────────

-- SELECT: user can see members of trips they belong to
-- Use a security definer function to avoid recursion
create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid()
  );
$$;

-- Simple non-recursive policies
create policy "Members can view trip members"
  on public.trip_members for select
  using (user_id = auth.uid());

create policy "View co-members"
  on public.trip_members for select
  using (public.is_trip_member(trip_id));

create policy "Anyone can join trips"
  on public.trip_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave trips"
  on public.trip_members for delete
  using (user_id = auth.uid());

create policy "Owners can remove members"
  on public.trip_members for delete
  using (
    exists (
      select 1 from public.trips
      where id = trip_id and created_by = auth.uid()
    )
  );

-- ── Also fix trips SELECT policy (was causing recursion too) ──
drop policy if exists "Trip members can view trips" on public.trips;

create policy "Trip members can view trips"
  on public.trips for select
  using (
    created_by = auth.uid()
    or public.is_trip_member(id)
  );

-- ── Verify trips INSERT policy is correct ─────────────────────
drop policy if exists "Authenticated users can create trips" on public.trips;

create policy "Authenticated users can create trips"
  on public.trips for insert
  with check (auth.uid() is not null);
