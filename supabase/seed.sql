-- ==============================================================================
-- Skillora Complete 1-Time Master Seed Script
-- Run this entire script in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- STEP 1: Update the check constraint to include 'course'
alter table public.learning_resources drop constraint if exists learning_resources_resource_type_check;
alter table public.learning_resources add constraint learning_resources_resource_type_check
  check (resource_type in ('video', 'interactive', 'article', 'book', 'tool', 'course'));

-- STEP 2: Insert Categories
insert into public.categories (id, name, slug, description, display_order)
values
  ('11111111-1111-1111-1111-111111111111', 'Music & Audio', 'music', 'Instruments, ear training, rhythm, and acoustic fundamentals', 1),
  ('22222222-2222-2222-2222-222222222222', 'Languages & Scripts', 'languages', 'Alphabets, phonetic systems, and conversational fluency', 2),
  ('33333333-3333-3333-3333-333333333333', 'Everyday Craft & Life Skills', 'life-skills', 'Tactile micro-skills, culinary essentials, and daily mastery', 3),
  ('44444444-4444-4444-4444-444444444444', 'Tech & Creation', 'tech', 'Tools, command line speed, typing, and digital workflows', 4)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;

-- STEP 3: Insert All Skills
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
    'Recondition tactile muscle memory to eliminate keyboard glancing, master home row anchors, and build effortless typing velocity.',
    'beginner',
    10.0,
    '15 mins/day for 4 weeks',
    true
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333333',
    'Dialing In Specialty Espresso Extraction',
    'dialing-in-espresso',
    'Control grind size, dose, yield, and extraction time (1:2 ratio in 28-32s) to eliminate sour under-extraction and bitter astringency.',
    'all-levels',
    1.0,
    '45 minutes practice',
    false
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    'Solve the 3x3 Rubik''s Cube (CFOP Layer-by-Layer)',
    'solve-rubiks-cube',
    'Memorize 5 simple sequential algorithms to consistently solve any scrambled 3x3 puzzle in under two minutes.',
    'beginner',
    3.0,
    '45 mins/day for 4 days',
    false
  )
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  difficulty = excluded.difficulty,
  estimated_hours = excluded.estimated_hours,
  time_commitment_label = excluded.time_commitment_label,
  is_featured = excluded.is_featured;

-- STEP 4: Insert All Skill Steps
insert into public.skill_steps (id, skill_id, step_number, title, instructions, estimated_minutes)
values
  -- 1. Fingerstyle Guitar Steps
  ('b1111111-1111-1111-1111-111111111101', 'a1111111-1111-1111-1111-111111111111', 1, 'P-I-M-A Anchor & Finger Assignment', 'Rest thumb (P) on bass strings (E/A/D) and fingers Index (I), Middle (M), and Ring (A) on G, B, and high E strings. Practice isolated plucking without wrist movement.', 25),
  ('b1111111-1111-1111-1111-111111111102', 'a1111111-1111-1111-1111-111111111111', 2, 'Travis Picking Alternating Bass Pattern', 'Lock down a steady 4/4 bass pulse with your thumb alternating between strings 6 and 4, then insert syncopated index and middle finger pinches on the off-beats.', 30),
  ('b1111111-1111-1111-1111-111111111103', 'a1111111-1111-1111-1111-111111111111', 3, 'Chord Transitioning under Continuous Rhythm', 'Transition between C Major, G Major, and A Minor without allowing the thumb''s continuous quarter-note pulse to falter.', 35),

  -- 2. Cyrillic Alphabet Steps
  ('b2222222-2222-2222-2222-222222222201', 'a2222222-2222-2222-2222-222222222222', 1, 'The True Friends (A, K, M, O, T)', 'Identify letters that look and sound identical to the Latin alphabet. Build your first 5-letter vocabulary anchors (e.g., KOT = cat, TOM = volume).', 20),
  ('b2222222-2222-2222-2222-222222222202', 'a2222222-2222-2222-2222-222222222222', 2, 'The False Friends (B=V, H=N, P=R, C=S, Y=U, X=Kh)', 'Re-train optical conditioning: B sounds like V, P is rolled R, and H is N. Drill flashcard decoding of loanwords like PECTOPAH (Restaurant).', 40),
  ('b2222222-2222-2222-2222-222222222203', 'a2222222-2222-2222-2222-222222222222', 3, 'The Greek Siblings & Sibilants (Д, Г, П, Л, Ж, Ш, Щ)', 'Master delta and gamma derivatives alongside the distinctive buzzing consonants like Ж (zh). Practice reading subway station maps.', 45),

  -- 3. Knife Sharpening Steps
  ('b3333333-3333-3333-3333-333333333301', 'a3333333-3333-3333-3333-333333333333', 1, 'Stone Soaking & 15-Degree Muscle Memory', 'Submerge the whetstone in water for 15 minutes until air bubbles stop rising. Use a two-quarter coin stack underneath the knife spine to lock in a repeatable 15-degree angle.', 20),
  ('b3333333-3333-3333-3333-333333333302', 'a3333333-3333-3333-3333-333333333333', 2, 'Forming & Detecting the Burr (1000 Grit)', 'Execute overlapping sweeping passes from heel to tip with moderate pressure. Feel the reverse side of the edge with the pad of your thumb until a microscopic continuous burr is formed.', 40),
  ('b3333333-3333-3333-3333-333333333303', 'a3333333-3333-3333-3333-333333333333', 3, 'Polishing & Stropping (6000 Grit)', 'Flip to the finishing stone to polish out microscopic scratches. Conclude with alternating feather-light trailing passes on leather or newspaper to remove burr fragments.', 30),

  -- 4. Touch Typing Steps
  ('b4444444-4444-4444-4444-444444444401', 'a4444444-4444-4444-4444-444444444444', 1, 'Home Row Anchor & Spatial Orientation', 'Rest index fingers on the physical F and J notches. Drill A-S-D-F and J-K-L-; without lifting your wrists or looking down at keys.', 30),
  ('b4444444-4444-4444-4444-444444444402', 'a4444444-4444-4444-4444-444444444444', 2, 'Top & Bottom Row Muscle Expansion', 'Extend fingers diagonally to reach Q-W-E-R-T and Z-X-C-V-B, immediately snapping back to home row positions after each actuation.', 40),
  ('b4444444-4444-4444-4444-444444444403', 'a4444444-4444-4444-4444-444444444444', 3, 'Punctuation & 80 WPM Burst Training', 'Train shift key coordination with the opposite pinky and eliminate pause hesitations on punctuation (commas, apostrophes, quotation marks).', 40),

  -- 5. Espresso Dialing Steps
  ('b5555555-5555-5555-5555-555555555501', 'a5555555-5555-5555-5555-555555555555', 1, 'The Golden Extraction Compass: 1:2 in 30 Seconds', 'Weigh 18.0g of whole beans. Grind directly into portafilter, distribute evenly with a WDT needle tool, tamp level, and aim for 36.0g liquid output in 28-30 seconds.', 25),
  ('b5555555-5555-5555-5555-555555555502', 'a5555555-5555-5555-5555-555555555555', 2, 'Tasting Diagnosis: Sourness vs. Bitterness', 'If sour or hollow, grind finer to slow flow. If dry, astringent, or harsh, grind coarser or cut the shot slightly earlier.', 20),

  -- 6. Rubik's Cube Steps
  ('b6666666-6666-6666-6666-666666666601', 'a6666666-6666-6666-6666-666666666666', 1, 'The White Daisy and White Cross', 'Assemble 4 white edge pieces around the yellow center. Align side colors with matching center pieces, then rotate 180 degrees down to complete the white cross.', 25),
  ('b6666666-6666-6666-6666-666666666602', 'a6666666-6666-6666-6666-666666666666', 2, 'First Two Layers (F2L Beginners)', 'Insert the 4 white corner pieces using the right-hand trigger algorithm (R U R'' U''), then slot in middle-layer edge pieces using left and right pairing algorithms.', 35),
  ('b6666666-6666-6666-6666-666666666603', 'a6666666-6666-6666-6666-666666666666', 3, 'Yellow Cross & Last Layer Permutation', 'Execute F (R U R'' U'') F'' to achieve the yellow cross, followed by the Sune algorithm (R U R'' U R U2 R'') and T-Perm to orient and position final corners.', 40)
on conflict (skill_id, step_number) do update set
  title = excluded.title,
  instructions = excluded.instructions,
  estimated_minutes = excluded.estimated_minutes;

-- STEP 5: Insert All Curated Learning Resources
insert into public.learning_resources (id, step_id, platform_name, url, resource_type, is_free)
values
  -- Guitar Resources
  ('c1111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111101', 'JustinGuitar', 'https://www.justinguitar.com/classes/beginner-fingerstyle-guitar', 'course', true),
  ('c1111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111101', 'YouTube (Paul Davids)', 'https://www.youtube.com/watch?v=0hY7l3sMtzI', 'video', true),
  ('c1111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111102', 'Acoustic Life', 'https://tonypolecastro.com/travis-picking-guide', 'article', true),
  ('c1111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111103', 'Ultimate Guitar Tab Vault', 'https://www.ultimate-guitar.com', 'tool', true),

  -- Cyrillic Resources
  ('c2222222-2222-2222-2222-222222222201', 'b2222222-2222-2222-2222-222222222201', 'RussianPod101 Alphabet Chart', 'https://www.russianpod101.com/russian-alphabet/', 'article', true),
  ('c2222222-2222-2222-2222-222222222202', 'b2222222-2222-2222-2222-222222222202', 'Duolingo Cyrillic Drill', 'https://www.duolingo.com', 'interactive', true),
  ('c2222222-2222-2222-2222-222222222203', 'b2222222-2222-2222-2222-222222222203', 'AnkiWeb Shared Decks', 'https://ankiweb.net/shared/decks/cyrillic', 'tool', true),

  -- Knife Sharpening Resources
  ('c3333333-3333-3333-3333-333333333301', 'b3333333-3333-3333-3333-333333333301', 'Korin Knives Masterclass', 'https://www.korin.com/learn/sharpening', 'video', true),
  ('c3333333-3333-3333-3333-333333333302', 'b3333333-3333-3333-3333-333333333302', 'KnifePlanet Interactive Guide', 'https://www.knifeplanet.net/whetstone-knife-sharpening-guide/', 'article', true),
  ('c3333333-3333-3333-3333-333333333303', 'b3333333-3333-3333-3333-333333333303', 'YouTube (Burrfection)', 'https://www.youtube.com/c/Burrfection', 'video', true),

  -- Touch Typing Resources
  ('c4444444-4444-4444-4444-444444444401', 'b4444444-4444-4444-4444-444444444401', 'Keybr Ergonomic Trainer', 'https://www.keybr.com', 'interactive', true),
  ('c4444444-4444-4444-4444-444444444402', 'b4444444-4444-4444-4444-444444444401', 'TypingClub', 'https://www.typingclub.com', 'course', true),
  ('c4444444-4444-4444-4444-444444444403', 'b4444444-4444-4444-4444-444444444402', 'Monkeytype Smoothness Drill', 'https://monkeytype.com', 'interactive', true),
  ('c4444444-4444-4444-4444-444444444404', 'b4444444-4444-4444-4444-444444444403', 'NitroType Multiplayer', 'https://www.nitrotype.com', 'interactive', true),

  -- Espresso Dialing Resources
  ('c5555555-5555-5555-5555-555555555501', 'b5555555-5555-5555-5555-555555555501', 'James Hoffmann Espresso Compass', 'https://www.baristahustle.com/blog/the-espresso-compass/', 'article', true),
  ('c5555555-5555-5555-5555-555555555502', 'b5555555-5555-5555-5555-555555555502', 'YouTube (James Hoffmann)', 'https://www.youtube.com/watch?v=DFhuoxl3s4E', 'video', true),

  -- Rubik's Cube Resources
  ('c6666666-6666-6666-6666-666666666601', 'b6666666-6666-6666-6666-666666666601', 'Ruwix 3x3 Interactive Guide', 'https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/', 'interactive', true),
  ('c6666666-6666-6666-6666-666666666602', 'b6666666-6666-6666-6666-666666666602', 'J Perm Beginner Tutorial', 'https://www.youtube.com/watch?v=7Ron6MN45LY', 'video', true),
  ('c6666666-6666-6666-6666-666666666603', 'b6666666-6666-6666-6666-666666666603', 'CS Timer Practice Tool', 'https://cstimer.net', 'tool', true)
on conflict (id) do update set
  platform_name = excluded.platform_name,
  url = excluded.url,
  resource_type = excluded.resource_type,
  is_free = excluded.is_free;
