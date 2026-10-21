create table if not exists public.resource_feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  resource_url text not null check (char_length(resource_url) <= 2000),
  step_id text,
  kind text not null check (kind in ('helpful', 'broken')),
  created_at timestamptz default now() not null,
  unique(user_id, resource_url, kind)
);

create index if not exists idx_resource_feedback_user on public.resource_feedback(user_id);
create index if not exists idx_resource_feedback_url on public.resource_feedback(resource_url);

alter table public.resource_feedback enable row level security;

drop policy if exists "Users can view own resource feedback" on public.resource_feedback;
create policy "Users can view own resource feedback" on public.resource_feedback
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can add own resource feedback" on public.resource_feedback;
create policy "Users can add own resource feedback" on public.resource_feedback
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove own resource feedback" on public.resource_feedback;
create policy "Users can remove own resource feedback" on public.resource_feedback
  for delete using ((select auth.uid()) = user_id);

create or replace view public.resource_feedback_summary
with (security_invoker = true) as
select
  resource_url,
  count(*) filter (where kind = 'broken') as broken_reports,
  count(*) filter (where kind = 'helpful') as helpful_votes,
  max(created_at) as last_feedback_at
from public.resource_feedback
group by resource_url
order by broken_reports desc, helpful_votes desc;
