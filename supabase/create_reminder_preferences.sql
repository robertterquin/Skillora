create table if not exists public.reminder_preferences (
  user_id uuid references auth.users(id) on delete cascade primary key,
  reminders_enabled boolean not null default false,
  remind_at time not null default '19:00',
  remind_days smallint[] not null default '{1,2,3,4,5,6,7}',
  weekly_recap_enabled boolean not null default false,
  timezone text not null default 'UTC',
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  last_reminder_on date,
  last_recap_on date,
  updated_at timestamptz not null default now()
);

alter table public.reminder_preferences enable row level security;

drop policy if exists "Users can view own reminder preferences" on public.reminder_preferences;
create policy "Users can view own reminder preferences" on public.reminder_preferences
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own reminder preferences" on public.reminder_preferences;
create policy "Users can insert own reminder preferences" on public.reminder_preferences
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own reminder preferences" on public.reminder_preferences;
create policy "Users can update own reminder preferences" on public.reminder_preferences
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
