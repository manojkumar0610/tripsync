-- ===========================================
-- TripSync Database Schema (Supabase)
-- Run this in Supabase SQL Editor
-- ===========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ===========================================
-- USERS TABLE (extends Supabase auth.users)
-- ===========================================
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  referral_code text unique default substr(md5(random()::text), 1, 8),
  referred_by uuid references public.users(id),
  is_premium boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.users enable row level security;
create policy "Users can view all profiles" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- ===========================================
-- TRIPS TABLE
-- ===========================================
create table public.trips (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  budget numeric(12,2) default 0,
  trip_type text check (trip_type in ('friends','family','solo','bike_trip')) default 'friends',
  notes text,
  cover_image text,
  invite_code text unique default upper(substr(md5(random()::text), 1, 6)),
  created_by uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.trips enable row level security;
create policy "Trip members can view trips" on public.trips for select
  using (exists (select 1 from public.trip_members where trip_id = id and user_id = auth.uid()));
create policy "Authenticated users can create trips" on public.trips for insert
  with check (auth.uid() = created_by);
create policy "Trip owners can update trips" on public.trips for update
  using (auth.uid() = created_by);
create policy "Trip owners can delete trips" on public.trips for delete
  using (auth.uid() = created_by);

-- ===========================================
-- TRIP MEMBERS TABLE
-- ===========================================
create table public.trip_members (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text check (role in ('owner','admin','member')) default 'member',
  joined_at timestamptz default now(),
  unique(trip_id, user_id)
);

alter table public.trip_members enable row level security;
create policy "Members can view trip members" on public.trip_members for select
  using (user_id = auth.uid() or exists (
    select 1 from public.trip_members tm where tm.trip_id = trip_id and tm.user_id = auth.uid()
  ));
create policy "Anyone can join trips" on public.trip_members for insert
  with check (auth.uid() = user_id);
create policy "Owners can manage members" on public.trip_members for delete
  using (auth.uid() = user_id or exists (
    select 1 from public.trip_members where trip_id = trip_members.trip_id and user_id = auth.uid() and role = 'owner'
  ));

-- ===========================================
-- EXPENSES TABLE
-- ===========================================
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  title text not null,
  amount numeric(12,2) not null,
  currency text default 'USD',
  paid_by uuid references public.users(id) not null,
  split_type text check (split_type in ('equal','custom','percentage')) default 'equal',
  category text default 'other',
  notes text,
  receipt_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.expenses enable row level security;
create policy "Trip members can view expenses" on public.expenses for select
  using (exists (select 1 from public.trip_members where trip_id = expenses.trip_id and user_id = auth.uid()));
create policy "Trip members can add expenses" on public.expenses for insert
  with check (exists (select 1 from public.trip_members where trip_id = expenses.trip_id and user_id = auth.uid()));
create policy "Expense creator can update" on public.expenses for update
  using (paid_by = auth.uid());
create policy "Expense creator can delete" on public.expenses for delete
  using (paid_by = auth.uid());

-- ===========================================
-- EXPENSE SPLITS TABLE
-- ===========================================
create table public.expense_splits (
  id uuid default uuid_generate_v4() primary key,
  expense_id uuid references public.expenses(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  is_settled boolean default false,
  settled_at timestamptz,
  unique(expense_id, user_id)
);

alter table public.expense_splits enable row level security;
create policy "Trip members can view splits" on public.expense_splits for select
  using (user_id = auth.uid() or exists (
    select 1 from public.expenses e
    join public.trip_members tm on tm.trip_id = e.trip_id
    where e.id = expense_id and tm.user_id = auth.uid()
  ));
create policy "Anyone can insert splits" on public.expense_splits for insert with check (true);
create policy "Users can settle own splits" on public.expense_splits for update using (user_id = auth.uid());

-- ===========================================
-- VOTES TABLE
-- ===========================================
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  title text not null,
  description text,
  options jsonb not null default '[]',
  status text check (status in ('open','closed')) default 'open',
  ends_at timestamptz,
  created_by uuid references public.users(id) not null,
  created_at timestamptz default now()
);

alter table public.votes enable row level security;
create policy "Trip members can view votes" on public.votes for select
  using (exists (select 1 from public.trip_members where trip_id = votes.trip_id and user_id = auth.uid()));
create policy "Trip members can create votes" on public.votes for insert
  with check (exists (select 1 from public.trip_members where trip_id = votes.trip_id and user_id = auth.uid()));
create policy "Vote creator can update" on public.votes for update using (created_by = auth.uid());

-- ===========================================
-- VOTE RESPONSES TABLE
-- ===========================================
create table public.vote_responses (
  id uuid default uuid_generate_v4() primary key,
  vote_id uuid references public.votes(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  option_id text not null,
  created_at timestamptz default now(),
  unique(vote_id, user_id)
);

alter table public.vote_responses enable row level security;
create policy "Trip members can view responses" on public.vote_responses for select
  using (exists (
    select 1 from public.votes v
    join public.trip_members tm on tm.trip_id = v.trip_id
    where v.id = vote_id and tm.user_id = auth.uid()
  ));
create policy "Users can vote" on public.vote_responses for insert with check (auth.uid() = user_id);
create policy "Users can change vote" on public.vote_responses for update using (user_id = auth.uid());

-- ===========================================
-- ITINERARIES TABLE
-- ===========================================
create table public.itineraries (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  generated_by uuid references public.users(id) not null,
  content jsonb not null,
  created_at timestamptz default now()
);

alter table public.itineraries enable row level security;
create policy "Trip members can view itineraries" on public.itineraries for select
  using (exists (select 1 from public.trip_members where trip_id = itineraries.trip_id and user_id = auth.uid()));
create policy "Trip members can create itineraries" on public.itineraries for insert
  with check (exists (select 1 from public.trip_members where trip_id = itineraries.trip_id and user_id = auth.uid()));

-- ===========================================
-- NOTIFICATIONS TABLE
-- ===========================================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean default false,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Users can view own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Users can update own notifications" on public.notifications for update using (user_id = auth.uid());

-- ===========================================
-- FUNCTIONS & TRIGGERS
-- ===========================================

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-add creator as owner when trip is created
create or replace function public.handle_new_trip()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.trip_members (trip_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_trip_created
  after insert on public.trips
  for each row execute procedure public.handle_new_trip();

-- Enable realtime
alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.vote_responses;
alter publication supabase_realtime add table public.notifications;
