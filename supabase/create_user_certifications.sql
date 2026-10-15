-- ==============================================================================
-- Skillora: Craftsman's Guild Mastery Certifications Table (Hankō Seals)
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

create table if not exists public.user_certifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  certified_at timestamptz default now() not null,
  unique(user_id, skill_id)
);

-- Performance index for instant profile retrieval
create index if not exists idx_user_certifications_user
  on public.user_certifications(user_id);

-- Enable Row Level Security (RLS)
alter table public.user_certifications enable row level security;

-- Policies: Authenticated users can view and insert their own certifications
drop policy if exists "Users can view own certifications" on public.user_certifications;
create policy "Users can view own certifications" on public.user_certifications
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own certifications" on public.user_certifications;
create policy "Users can insert own certifications" on public.user_certifications
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own certifications" on public.user_certifications;
create policy "Users can delete own certifications" on public.user_certifications
  for delete using (auth.uid() = user_id);
