create table if not exists public.owl_consultations (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New Inquiry',
  outcome_tag text check (outcome_tag in ('curriculum', 'suggestions', 'enrolled', 'inquiry')) default 'inquiry',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_owl_consultations_user_updated
  on public.owl_consultations(user_id, updated_at desc);

alter table public.owl_consultations enable row level security;

drop policy if exists "Users can view own consultations" on public.owl_consultations;
create policy "Users can view own consultations" on public.owl_consultations
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own consultations" on public.owl_consultations;
create policy "Users can insert own consultations" on public.owl_consultations
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own consultations" on public.owl_consultations;
create policy "Users can update own consultations" on public.owl_consultations
  for update using ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own consultations" on public.owl_consultations;
create policy "Users can delete own consultations" on public.owl_consultations
  for delete using ((select auth.uid()) = user_id);
