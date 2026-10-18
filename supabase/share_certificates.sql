-- Shareable certificates. Each certificate gets a random share code; it is
-- only visible at /c/<code> while the learner has sharing switched on.
-- The public page reads through the server (service role), so no public
-- select policy is needed and certificates stay private by default.
alter table public.user_certifications
  add column if not exists share_token uuid not null default gen_random_uuid(),
  add column if not exists is_public boolean not null default false;

create unique index if not exists idx_user_certifications_share_token
  on public.user_certifications(share_token);

drop policy if exists "Users can update own certifications" on public.user_certifications;
create policy "Users can update own certifications" on public.user_certifications
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
