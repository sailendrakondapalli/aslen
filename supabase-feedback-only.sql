-- ============================================
-- Run this ONLY if you already ran supabase-setup.sql before
-- This adds just the feedback table + policies
-- ============================================

-- Feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  user_email text,
  name text,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.feedback enable row level security;

-- Drop old policies if they exist (safe to re-run)
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
