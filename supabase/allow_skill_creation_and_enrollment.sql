alter table public.skills enable row level security;
drop policy if exists "Users can insert skills" on public.skills;
create policy "Users can insert skills" on public.skills
  for insert with check (true);

drop policy if exists "Users can update skills" on public.skills;
create policy "Users can update skills" on public.skills
  for update using (true);

alter table public.skill_steps enable row level security;
drop policy if exists "Users can insert skill_steps" on public.skill_steps;
create policy "Users can insert skill_steps" on public.skill_steps
  for insert with check (true);

alter table public.learning_resources enable row level security;
drop policy if exists "Users can insert learning_resources" on public.learning_resources;
create policy "Users can insert learning_resources" on public.learning_resources
  for insert with check (true);

alter table public.user_enrollments enable row level security;
drop policy if exists "Users can insert own enrollments" on public.user_enrollments;
create policy "Users can insert own enrollments" on public.user_enrollments
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own enrollments" on public.user_enrollments;
create policy "Users can update own enrollments" on public.user_enrollments
  for update using (auth.uid() = user_id);

insert into public.skills (id, category_id, title, slug, summary, difficulty, estimated_hours, time_commitment_label, is_featured)
values
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Fingerstyle Acoustic Guitar Basics',
    'fingerstyle-acoustic-guitar',
    'Develop thumb independence, alternating bass lines, and fluid arpeggio picking patterns without relying on a plectrum.',
    'beginner',
    8.0,
    '20 mins/day for 3 weeks',
    true
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Read the Cyrillic Alphabet in One Afternoon',
    'read-cyrillic-alphabet',
    'De-mystify Russian, Ukrainian, and Serbian signage and script by mapping false friends, Greek cognates, and unfamiliar phonetic glyphs.',
    'beginner',
    2.0,
    '2 hours total',
    true
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Whetstone Knife Sharpening: Razor Edge',
    'whetstone-knife-sharpening',
    'Achieve paper-slicing sharpness on chef knives using a 1000/6000 grit water stone, consistent 15-degree angle control, and burr alignment.',
    'beginner',
    1.5,
    '90 minutes total',
    false
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'Touch Typing at 80+ Words Per Minute',
    'touch-typing-speed',
    'Eliminate hunt-and-peck typing habits with home row discipline, finger independence, and rhythmic cadence tracking.',
    'beginner',
    5.0,
    '15 mins/day for 2 weeks',
    false
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333333',
    'Dialing In Specialty Espresso Extraction',
    'dialing-in-espresso',
    'Master grind size distribution, brew ratios (1:2), contact time, and channeling prevention for balanced, sweet espresso shots.',
    'intermediate',
    3.0,
    '3 hours total',
    false
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    'Solve the 3x3 Rubik''s Cube (CFOP Layer-by-Layer)',
    'solve-rubiks-cube',
    'Memorize 5 simple sequential algorithms to consistently solve any scrambled 3x3 puzzle in under two minutes.',
    'beginner',
    2.0,
    '2 hours total',
    false
  ),
  (
    'a7777777-7777-7777-7777-777777777777',
    '33333333-3333-3333-3333-333333333333',
    'Artisan Sourdough Bread from Scratch',
    'artisan-sourdough-bread',
    'Cultivate a wild yeast levain, master autolyse, coil folds, hydration control, banneton shaping, and Dutch oven steam baking.',
    'intermediate',
    4.0,
    'Weekend project (4 hours active)',
    false
  ),
  (
    'a8888888-8888-8888-8888-888888888888',
    '33333333-3333-3333-3333-333333333333',
    'Three-Ball Cascade Juggling',
    'three-ball-juggling',
    'Unlock rhythmic hand-eye coordination with scooping arc throws, dwell time management, and drop-prevention conditioning.',
    'beginner',
    2.5,
    '20 mins/day for 1 week',
    false
  )
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  summary = excluded.summary,
  difficulty = excluded.difficulty,
  estimated_hours = excluded.estimated_hours,
  time_commitment_label = excluded.time_commitment_label;
