-- ============================================
-- Run this if you already ran supabase-setup.sql
-- Adds feedback table + policies (safe to re-run)
-- ============================================

-- Drop and recreate feedback table cleanly
drop table if exists public.feedback;

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_email text,
  name text,
  avatar_url text,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.feedback enable row level security;

-- Drop old policies if they exist
drop policy if exists "Anyone can submit feedback" on public.feedback;
drop policy if exists "Anyone can view feedback" on public.feedback;
drop policy if exists "Admins can delete feedback" on public.feedback;

-- Policies
create policy "Anyone can submit feedback"
  on public.feedback for insert with check (true);

create policy "Anyone can view feedback"
  on public.feedback for select using (true);

create policy "Admins can delete feedback"
  on public.feedback for delete
  using (
    auth.jwt() ->> 'email' in ('sailendrakondapalli@gmail.com', 'adduriaswani@gmail.com')
  );
