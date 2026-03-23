-- ============================================
-- ASLEN TECH SOLUTIONS - Supabase Setup SQL
-- Safe to run multiple times (idempotent)
-- ============================================

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  profile_url text,
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  user_email text,
  service_id text,
  service_title text,
  package_name text,
  payment_id text,
  payment_method text default 'upi',
  payment_screenshot_url text,
  advance_paid numeric default 0,
  total_amount numeric default 0,
  extra_pages integer default 0,
  description text,
  status text default 'pending_verification',
  created_at timestamptz default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text,
  created_at timestamptz default now()
);

-- ── Migrations (safe if columns already exist) ───────────────────────────────

alter table public.bookings add column if not exists payment_method text default 'upi';
alter table public.bookings add column if not exists payment_screenshot_url text;
alter table public.bookings add column if not exists user_email text;

-- ── Enable RLS ───────────────────────────────────────────────────────────────

alter table public.users enable row level security;
alter table public.bookings enable row level security;
alter table public.contacts enable row level security;

-- ── Drop old policies before recreating (avoids "already exists" errors) ─────

drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can upsert own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Admins can view all users" on public.users;

drop policy if exists "Users can view own bookings" on public.bookings;
drop policy if exists "Users can insert own bookings" on public.bookings;
drop policy if exists "Admins can view all bookings" on public.bookings;
drop policy if exists "Admins can update all bookings" on public.bookings;

drop policy if exists "Anyone can submit contact" on public.contacts;
drop policy if exists "Admins can view contacts" on public.contacts;

drop policy if exists "Users can upload payment screenshots" on storage.objects;
drop policy if exists "Users can view own screenshots" on storage.objects;
drop policy if exists "Admins can view all screenshots" on storage.objects;

-- ── Users policies ───────────────────────────────────────────────────────────

create policy "Users can view own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can upsert own profile"
  on public.users for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "Admins can view all users"
  on public.users for select
  using (auth.jwt() ->> 'email' in ('sailendrakondapalli@gmail.com', 'adduriaswani@gmail.com'));

-- ── Bookings policies ────────────────────────────────────────────────────────

create policy "Users can view own bookings"
  on public.bookings for select using (auth.uid() = user_id);

create policy "Users can insert own bookings"
  on public.bookings for insert with check (auth.uid() = user_id);

create policy "Admins can view all bookings"
  on public.bookings for select
  using (auth.jwt() ->> 'email' in ('sailendrakondapalli@gmail.com', 'adduriaswani@gmail.com'));

create policy "Admins can update all bookings"
  on public.bookings for update
  using (auth.jwt() ->> 'email' in ('sailendrakondapalli@gmail.com', 'adduriaswani@gmail.com'));

-- ── Contacts policies ────────────────────────────────────────────────────────

create policy "Anyone can submit contact"
  on public.contacts for insert with check (true);

create policy "Admins can view contacts"
  on public.contacts for select
  using (auth.jwt() ->> 'email' in ('sailendrakondapalli@gmail.com', 'adduriaswani@gmail.com'));

-- ── Storage policies (run AFTER creating bucket "payment-screenshots") ────────
-- Create the bucket manually in Supabase Dashboard → Storage → New bucket
-- Name: payment-screenshots, Public: OFF

create policy "Users can upload payment screenshots"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-screenshots'
    and auth.role() = 'authenticated'
  );

create policy "Users can view own screenshots"
  on storage.objects for select
  using (
    bucket_id = 'payment-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins can view all screenshots"
  on storage.objects for select
  using (
    bucket_id = 'payment-screenshots'
    and auth.jwt() ->> 'email' in ('sailendrakondapalli@gmail.com', 'adduriaswani@gmail.com')
  );
