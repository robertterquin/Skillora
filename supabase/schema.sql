create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  display_order integer default 0,
  created_at timestamptz default now() not null
);

create table if not exists public.skills (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text not null,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced', 'all-levels')) default 'beginner',
  estimated_hours numeric(5,2) default 1.0,
  time_commitment_label text not null,   is_featured boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.skill_steps (
  id uuid default gen_random_uuid() primary key,
  skill_id uuid references public.skills(id) on delete cascade not null,
  step_number integer not null,
  title text not null,
  instructions text not null,
  estimated_minutes integer default 20,
  created_at timestamptz default now() not null,
  unique(skill_id, step_number)
);

create table if not exists public.learning_resources (
  id uuid default gen_random_uuid() primary key,
  step_id uuid references public.skill_steps(id) on delete cascade not null,
  platform_name text not null,   url text not null,
  resource_type text check (resource_type in ('video', 'interactive', 'article', 'book', 'tool', 'course')) default 'interactive',
  is_free boolean default true,
  created_at timestamptz default now() not null
);

create table if not exists public.user_enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  status text check (status in ('active', 'paused', 'completed')) default 'active',
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  unique(user_id, skill_id)
);

create table if not exists public.user_step_completions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  step_id uuid references public.skill_steps(id) on delete cascade not null,
  completed_at timestamptz default now() not null,
  unique(user_id, step_id)
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.skills enable row level security;
alter table public.skill_steps enable row level security;
alter table public.learning_resources enable row level security;
alter table public.user_enrollments enable row level security;
alter table public.user_step_completions enable row level security;

drop policy if exists "Public can view categories" on public.categories;
create policy "Public can view categories" on public.categories for select using (true);

drop policy if exists "Public can view skills" on public.skills;
create policy "Public can view skills" on public.skills for select using (true);

drop policy if exists "Users can insert skills" on public.skills;
create policy "Users can insert skills" on public.skills for insert with check (true);

drop policy if exists "Public can view skill_steps" on public.skill_steps;
create policy "Public can view skill_steps" on public.skill_steps for select using (true);

drop policy if exists "Users can insert skill_steps" on public.skill_steps;
create policy "Users can insert skill_steps" on public.skill_steps for insert with check (true);

drop policy if exists "Public can view learning_resources" on public.learning_resources;
create policy "Public can view learning_resources" on public.learning_resources for select using (true);

drop policy if exists "Users can insert learning_resources" on public.learning_resources;
create policy "Users can insert learning_resources" on public.learning_resources for insert with check (true);

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can view own enrollments" on public.user_enrollments;
create policy "Users can view own enrollments" on public.user_enrollments for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own enrollments" on public.user_enrollments;
create policy "Users can insert own enrollments" on public.user_enrollments for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own enrollments" on public.user_enrollments;
create policy "Users can update own enrollments" on public.user_enrollments for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own enrollments" on public.user_enrollments;
create policy "Users can delete own enrollments" on public.user_enrollments for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own step completions" on public.user_step_completions;
create policy "Users can view own step completions" on public.user_step_completions for select using (auth.uid() = user_id);

drop policy if exists "Users can toggle own step completions" on public.user_step_completions;
create policy "Users can toggle own step completions" on public.user_step_completions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own step completions" on public.user_step_completions;
create policy "Users can delete own step completions" on public.user_step_completions for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create index if not exists idx_skills_category on public.skills(category_id);
create index if not exists idx_skills_slug on public.skills(slug);
create index if not exists idx_skill_steps_skill on public.skill_steps(skill_id);
create index if not exists idx_learning_resources_step on public.learning_resources(step_id);
create index if not exists idx_enrollments_user on public.user_enrollments(user_id);
create index if not exists idx_completions_user on public.user_step_completions(user_id, step_id);

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
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own consultations" on public.owl_consultations;
create policy "Users can insert own consultations" on public.owl_consultations
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own consultations" on public.owl_consultations;
create policy "Users can update own consultations" on public.owl_consultations
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own consultations" on public.owl_consultations;
create policy "Users can delete own consultations" on public.owl_consultations
  for delete using (auth.uid() = user_id);

create table if not exists public.user_certifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  certified_at timestamptz default now() not null,
  unique(user_id, skill_id)
);

create index if not exists idx_user_certifications_user
  on public.user_certifications(user_id);

alter table public.user_certifications enable row level security;

drop policy if exists "Users can view own certifications" on public.user_certifications;
create policy "Users can view own certifications" on public.user_certifications
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own certifications" on public.user_certifications;
create policy "Users can insert own certifications" on public.user_certifications
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own certifications" on public.user_certifications;
create policy "Users can delete own certifications" on public.user_certifications
  for delete using (auth.uid() = user_id);

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
