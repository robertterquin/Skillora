-- ==============================================================================
-- Skillora: Archimedes Owl Consultations & Cloud Chat History Table
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Create table for storing conversation history per user account
create table if not exists public.owl_consultations (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New Inquiry',
  outcome_tag text check (outcome_tag in ('curriculum', 'suggestions', 'enrolled', 'inquiry')) default 'inquiry',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Performance index for instant retrieval ordered by last updated
create index if not exists idx_owl_consultations_user_updated
  on public.owl_consultations(user_id, updated_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.owl_consultations enable row level security;

-- 4. RLS Policies: Authenticated users have full control over their own consultations
drop policy if exists "Users can view own consultations" on public.owl_consultations;
create policy "Users can view own consultations" on public.owl_consultations
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own consultations" on public.owl_consultations;
create policy "Users can insert own consultations" on public.owl_consultations
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own consultations" on public.owl_consultations;
create policy "Users can update own consultations" on public.owl_consultations
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own consultations" on public.owl_consultations;
create policy "Users can delete own consultations" on public.owl_consultations
  for delete using (auth.uid() = user_id);
