create table if not exists public.user_step_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  step_id text not null,
  note text not null check (char_length(note) <= 2000),
  updated_at timestamptz default now() not null,
  unique(user_id, step_id)
);

create index if not exists idx_user_step_notes_user
  on public.user_step_notes(user_id);

alter table public.user_step_notes enable row level security;

drop policy if exists "Users can view own step notes" on public.user_step_notes;
create policy "Users can view own step notes" on public.user_step_notes
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own step notes" on public.user_step_notes;
create policy "Users can insert own step notes" on public.user_step_notes
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own step notes" on public.user_step_notes;
create policy "Users can update own step notes" on public.user_step_notes
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own step notes" on public.user_step_notes;
create policy "Users can delete own step notes" on public.user_step_notes
  for delete using ((select auth.uid()) = user_id);
