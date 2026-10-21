insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress-photos', 'progress-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owners can read their progress photos" on storage.objects;
create policy "Owners can read their progress photos" on storage.objects
  for select using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners can upload progress photos" on storage.objects;
create policy "Owners can upload progress photos" on storage.objects
  for insert with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners can replace progress photos" on storage.objects;
create policy "Owners can replace progress photos" on storage.objects
  for update using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners can delete progress photos" on storage.objects;
create policy "Owners can delete progress photos" on storage.objects
  for delete using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create table if not exists public.progress_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  skill_id text not null,
  kind text not null check (kind in ('before', 'after')),
  storage_path text not null,
  created_at timestamptz default now() not null,
  unique(user_id, skill_id, kind)
);

create index if not exists idx_progress_photos_user on public.progress_photos(user_id);

alter table public.progress_photos enable row level security;

drop policy if exists "Users can view own progress photos" on public.progress_photos;
create policy "Users can view own progress photos" on public.progress_photos
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can add own progress photos" on public.progress_photos;
create policy "Users can add own progress photos" on public.progress_photos
  for insert with check ((select auth.uid()) = user_id and storage_path like (select auth.uid())::text || '/%');

drop policy if exists "Users can update own progress photos" on public.progress_photos;
create policy "Users can update own progress photos" on public.progress_photos
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and storage_path like (select auth.uid())::text || '/%');

drop policy if exists "Users can delete own progress photos" on public.progress_photos;
create policy "Users can delete own progress photos" on public.progress_photos
  for delete using ((select auth.uid()) = user_id);
