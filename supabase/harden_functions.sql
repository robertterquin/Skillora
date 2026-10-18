-- Locks down the sign-up trigger function (flagged by Supabase's security advisor).
-- It runs with the owner's rights (security definer), so:
--   * pin its search_path so it can't be tricked into using other schemas' objects;
--   * stop it being called directly through the API (/rest/v1/rpc/handle_new_user).
-- The trigger on auth.users keeps working. Safe to re-run.
alter function public.handle_new_user() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;
