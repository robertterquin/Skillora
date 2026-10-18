-- Daily AI usage per learner, so one account can't run up OpenAI costs.
-- Only the server (service role) reads or writes it: RLS is on with no policies,
-- and the counter function is not callable from the browser. Safe to re-run.
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  calls integer not null default 0,
  primary key (user_id, usage_date)
);
alter table public.ai_usage enable row level security;

-- Counts one AI request for the user today (UTC) and returns true, or returns
-- false without counting once they have reached the limit. Atomic, so parallel
-- requests can't slip past it.
create or replace function public.consume_ai_quota(p_user uuid, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
begin
  insert into public.ai_usage (user_id, usage_date, calls)
  values (p_user, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, usage_date) do update
    set calls = public.ai_usage.calls + 1
    where public.ai_usage.calls < p_limit
  returning true into allowed;
  return coalesce(allowed, false);
end;
$$;

revoke execute on function public.consume_ai_quota(uuid, integer) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(uuid, integer) to service_role;

-- Old days are not needed once they have passed.
delete from public.ai_usage where usage_date < (now() at time zone 'utc')::date - 7;
