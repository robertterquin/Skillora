alter table public.skills
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;
create index if not exists idx_skills_owner on public.skills(owner_id);

drop policy if exists "Public can view skills" on public.skills;
drop policy if exists "Users can insert skills" on public.skills;
drop policy if exists "Users can update skills" on public.skills;

create policy "Public can view skills" on public.skills
  for select using (owner_id is null or owner_id = (select auth.uid()));
create policy "Users can create own skills" on public.skills
  for insert with check (owner_id = (select auth.uid()));
create policy "Owners can update own skills" on public.skills
  for update using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owners can delete own skills" on public.skills
  for delete using (owner_id = (select auth.uid()));

drop policy if exists "Public can view skill_steps" on public.skill_steps;
drop policy if exists "Users can insert skill_steps" on public.skill_steps;

create policy "Public can view skill_steps" on public.skill_steps
  for select using (
    exists (select 1 from public.skills s
            where s.id = skill_id and (s.owner_id is null or s.owner_id = (select auth.uid())))
  );
create policy "Owners can add steps" on public.skill_steps
  for insert with check (
    exists (select 1 from public.skills s where s.id = skill_id and s.owner_id = (select auth.uid()))
  );
create policy "Owners can update steps" on public.skill_steps
  for update using (
    exists (select 1 from public.skills s where s.id = skill_id and s.owner_id = (select auth.uid()))
  );
create policy "Owners can delete steps" on public.skill_steps
  for delete using (
    exists (select 1 from public.skills s where s.id = skill_id and s.owner_id = (select auth.uid()))
  );

drop policy if exists "Public can view learning_resources" on public.learning_resources;
drop policy if exists "Users can insert learning_resources" on public.learning_resources;

create policy "Public can view learning_resources" on public.learning_resources
  for select using (
    exists (select 1 from public.skill_steps st join public.skills s on s.id = st.skill_id
            where st.id = step_id and (s.owner_id is null or s.owner_id = (select auth.uid())))
  );
create policy "Owners can add resources" on public.learning_resources
  for insert with check (
    exists (select 1 from public.skill_steps st join public.skills s on s.id = st.skill_id
            where st.id = step_id and s.owner_id = (select auth.uid()))
  );
create policy "Owners can update resources" on public.learning_resources
  for update using (
    exists (select 1 from public.skill_steps st join public.skills s on s.id = st.skill_id
            where st.id = step_id and s.owner_id = (select auth.uid()))
  );
create policy "Owners can delete resources" on public.learning_resources
  for delete using (
    exists (select 1 from public.skill_steps st join public.skills s on s.id = st.skill_id
            where st.id = step_id and s.owner_id = (select auth.uid()))
  );
