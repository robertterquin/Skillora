create table if not exists public.user_practice_stats (
  user_id uuid references auth.users(id) on delete cascade primary key,
  practice_dates jsonb not null default '[]'::jsonb,
  sm2_records jsonb not null default '{}'::jsonb,
  total_practice_seconds integer default 0,
  last_active_date text,
  updated_at timestamptz default now() not null
);

create index if not exists idx_user_practice_stats_user
  on public.user_practice_stats(user_id);

alter table public.user_practice_stats enable row level security;

drop policy if exists "Users can view own practice stats" on public.user_practice_stats;
create policy "Users can view own practice stats" on public.user_practice_stats
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own practice stats" on public.user_practice_stats;
create policy "Users can insert own practice stats" on public.user_practice_stats
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own practice stats" on public.user_practice_stats;
create policy "Users can update own practice stats" on public.user_practice_stats
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own practice stats" on public.user_practice_stats;
create policy "Users can delete own practice stats" on public.user_practice_stats
  for delete using (auth.uid() = user_id);
