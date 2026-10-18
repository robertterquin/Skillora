-- Optimize row-level-security policies (Supabase advisor: auth_rls_initplan)
-- Wraps auth.uid() as (select auth.uid()) so Postgres evaluates it once per
-- query instead of once per row. Each policy keeps its name, command, roles
-- and conditions; only the auth.uid() call changes. Safe to re-run.

begin;

-- profiles -------------------------------------------------------------------
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using ((select auth.uid()) = id);

-- user_enrollments -----------------------------------------------------------
drop policy if exists "Users can view own enrollments" on public.user_enrollments;
create policy "Users can view own enrollments" on public.user_enrollments
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own enrollments" on public.user_enrollments;
create policy "Users can insert own enrollments" on public.user_enrollments
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own enrollments" on public.user_enrollments;
create policy "Users can update own enrollments" on public.user_enrollments
  for update using ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own enrollments" on public.user_enrollments;
create policy "Users can delete own enrollments" on public.user_enrollments
  for delete using ((select auth.uid()) = user_id);

-- user_step_completions ------------------------------------------------------
drop policy if exists "Users can view own step completions" on public.user_step_completions;
create policy "Users can view own step completions" on public.user_step_completions
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can toggle own step completions" on public.user_step_completions;
create policy "Users can toggle own step completions" on public.user_step_completions
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own step completions" on public.user_step_completions;
create policy "Users can delete own step completions" on public.user_step_completions
  for delete using ((select auth.uid()) = user_id);

-- owl_consultations ----------------------------------------------------------
drop policy if exists "Users can view own consultations" on public.owl_consultations;
create policy "Users can view own consultations" on public.owl_consultations
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own consultations" on public.owl_consultations;
create policy "Users can insert own consultations" on public.owl_consultations
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own consultations" on public.owl_consultations;
create policy "Users can update own consultations" on public.owl_consultations
  for update using ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own consultations" on public.owl_consultations;
create policy "Users can delete own consultations" on public.owl_consultations
  for delete using ((select auth.uid()) = user_id);

-- user_certifications --------------------------------------------------------
drop policy if exists "Users can view own certifications" on public.user_certifications;
create policy "Users can view own certifications" on public.user_certifications
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own certifications" on public.user_certifications;
create policy "Users can insert own certifications" on public.user_certifications
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own certifications" on public.user_certifications;
create policy "Users can update own certifications" on public.user_certifications
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own certifications" on public.user_certifications;
create policy "Users can delete own certifications" on public.user_certifications
  for delete using ((select auth.uid()) = user_id);

-- user_practice_stats --------------------------------------------------------
drop policy if exists "Users can view own practice stats" on public.user_practice_stats;
create policy "Users can view own practice stats" on public.user_practice_stats
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own practice stats" on public.user_practice_stats;
create policy "Users can insert own practice stats" on public.user_practice_stats
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own practice stats" on public.user_practice_stats;
create policy "Users can update own practice stats" on public.user_practice_stats
  for update using ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own practice stats" on public.user_practice_stats;
create policy "Users can delete own practice stats" on public.user_practice_stats
  for delete using ((select auth.uid()) = user_id);

-- user_step_notes ------------------------------------------------------------
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

-- reminder_preferences -------------------------------------------------------
drop policy if exists "Users can view own reminder preferences" on public.reminder_preferences;
create policy "Users can view own reminder preferences" on public.reminder_preferences
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own reminder preferences" on public.reminder_preferences;
create policy "Users can insert own reminder preferences" on public.reminder_preferences
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own reminder preferences" on public.reminder_preferences;
create policy "Users can update own reminder preferences" on public.reminder_preferences
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- resource_feedback ----------------------------------------------------------
drop policy if exists "Users can view own resource feedback" on public.resource_feedback;
create policy "Users can view own resource feedback" on public.resource_feedback
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Users can add own resource feedback" on public.resource_feedback;
create policy "Users can add own resource feedback" on public.resource_feedback
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove own resource feedback" on public.resource_feedback;
create policy "Users can remove own resource feedback" on public.resource_feedback
  for delete using ((select auth.uid()) = user_id);

-- progress_photos ------------------------------------------------------------
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

-- skills ---------------------------------------------------------------------
drop policy if exists "Public can view skills" on public.skills;
create policy "Public can view skills" on public.skills
  for select using (owner_id is null or owner_id = (select auth.uid()));

drop policy if exists "Users can create own skills" on public.skills;
create policy "Users can create own skills" on public.skills
  for insert with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can update own skills" on public.skills;
create policy "Owners can update own skills" on public.skills
  for update using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can delete own skills" on public.skills;
create policy "Owners can delete own skills" on public.skills
  for delete using (owner_id = (select auth.uid()));

-- skill_steps ----------------------------------------------------------------
drop policy if exists "Public can view skill_steps" on public.skill_steps;
create policy "Public can view skill_steps" on public.skill_steps
  for select using (
    exists (select 1 from public.skills s
            where s.id = skill_id and (s.owner_id is null or s.owner_id = (select auth.uid())))
  );

drop policy if exists "Owners can add steps" on public.skill_steps;
create policy "Owners can add steps" on public.skill_steps
  for insert with check (
    exists (select 1 from public.skills s where s.id = skill_id and s.owner_id = (select auth.uid()))
  );

drop policy if exists "Owners can update steps" on public.skill_steps;
create policy "Owners can update steps" on public.skill_steps
  for update using (
    exists (select 1 from public.skills s where s.id = skill_id and s.owner_id = (select auth.uid()))
  );

drop policy if exists "Owners can delete steps" on public.skill_steps;
create policy "Owners can delete steps" on public.skill_steps
  for delete using (
    exists (select 1 from public.skills s where s.id = skill_id and s.owner_id = (select auth.uid()))
  );

-- learning_resources ---------------------------------------------------------
drop policy if exists "Public can view learning_resources" on public.learning_resources;
create policy "Public can view learning_resources" on public.learning_resources
  for select using (
    exists (select 1 from public.skill_steps st join public.skills s on s.id = st.skill_id
            where st.id = step_id and (s.owner_id is null or s.owner_id = (select auth.uid())))
  );

drop policy if exists "Owners can add resources" on public.learning_resources;
create policy "Owners can add resources" on public.learning_resources
  for insert with check (
    exists (select 1 from public.skill_steps st join public.skills s on s.id = st.skill_id
            where st.id = step_id and s.owner_id = (select auth.uid()))
  );

drop policy if exists "Owners can update resources" on public.learning_resources;
create policy "Owners can update resources" on public.learning_resources
  for update using (
    exists (select 1 from public.skill_steps st join public.skills s on s.id = st.skill_id
            where st.id = step_id and s.owner_id = (select auth.uid()))
  );

drop policy if exists "Owners can delete resources" on public.learning_resources;
create policy "Owners can delete resources" on public.learning_resources
  for delete using (
    exists (select 1 from public.skill_steps st join public.skills s on s.id = st.skill_id
            where st.id = step_id and s.owner_id = (select auth.uid()))
  );

commit;
