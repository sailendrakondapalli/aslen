-- ============================================
-- ASLEN TECH SOLUTIONS - Supabase Setup SQL
-- Run this in your Supabase SQL Editor
-- ============================================

-- Users table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  profile_url text,
  created_at timestamptz default now()
);

-- Bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  user_email text,
  service_id text,
  service_title text,
  package_name text,
  payment_id text,
  advance_paid numeric default 0,
  total_amount numeric default 0,
  extra_pages integer default 0,
  description text,
  status text default 'confirmed',
  created_at timestamptz default now()
);

-- Contacts table
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table public.users enable row level security;
alter table public.bookings enable row level security;
alter table public.contacts enable row level security;

-- Users policies
create policy "Users can view own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can upsert own profile"
  on public.users for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- Admin can view all users
create policy "Admins can view all users"
  on public.users for select
  using (
    auth.jwt() ->> 'email' in ('sailendrakondapalli@gmail.com', 'adduriaswani@gmail.com')
  );

-- Bookings: users see own, admins see all
create policy "Users can view own bookings"
  on public.bookings for select using (auth.uid() = user_id);

create policy "Users can insert own bookings"
  on public.bookings for insert with check (auth.uid() = user_id);

create policy "Admins can view all bookings"
  on public.bookings for select
  using (
    auth.jwt() ->> 'email' in ('sailendrakondapalli@gmail.com', 'adduriaswani@gmail.com')
  );

create policy "Admins can update all bookings"
  on public.bookings for update
  using (
    auth.jwt() ->> 'email' in ('sailendrakondapalli@gmail.com', 'adduriaswani@gmail.com')
  );

-- Contacts: anyone can insert
create policy "Anyone can submit contact"
  on public.contacts for insert with check (true);

create policy "Admins can view contacts"
  on public.contacts for select
  using (
    auth.jwt() ->> 'email' in ('sailendrakondapalli@gmail.com', 'adduriaswani@gmail.com')
  );
