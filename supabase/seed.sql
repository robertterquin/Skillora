-- ==============================================================================
-- Skillora Complete Master Seed Script
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
    'Control dose, grind size, distribution, and yield (1:2 ratio in 28-32s) to eliminate sour under-extraction and bitter astringency.',
    'all-levels',
    1.0,
    '45 minutes practice',
    false
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    'Solve the 3x3 Rubik''s Cube (CFOP Layer-by-Layer)',
    'solve-rubiks-cube',
    'Memorize 5 simple sequential algorithms to consistently solve any scrambled 3x3 puzzle in under two minutes.',
    'beginner',
    3.0,
    '45 mins/day for 4 days',
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
  ('b1111111-1111-1111-1111-111111111104', 'a1111111-1111-1111-1111-111111111111', 4, 'Arpeggio Rolling & Pinch Dynamics', 'Execute rolling arpeggios (P-I-M-A-M-I) over an Em - C - G - D progression. Master pinch attacks where thumb and melody finger pluck simultaneously, accenting melody notes over quiet bass accompaniment.', 25),

  -- 2. Cyrillic Alphabet Steps
  ('b2222222-2222-2222-2222-222222222201', 'a2222222-2222-2222-2222-222222222202', 1, 'The True Friends (A, K, M, O, T)', 'Identify letters that look and sound identical to the Latin alphabet. Build your first 5-letter vocabulary anchors (e.g., KOT = cat, TOM = volume).', 20),
  ('b2222222-2222-2222-2222-222222222202', 'a2222222-2222-2222-2222-222222222202', 2, 'The False Friends (B=V, H=N, P=R, C=S, Y=U, X=Kh)', 'Re-train optical conditioning: B sounds like V, P is rolled R, and H is N. Drill flashcard decoding of loanwords like PECTOPAH (Restaurant).', 30),
  ('b2222222-2222-2222-2222-222222222203', 'a2222222-2222-2222-2222-222222222202', 3, 'The Greek Siblings & Sibilants (Д, Г, П, Л, Ж, Ш, Щ)', 'Master delta and gamma derivatives alongside the distinctive buzzing consonants like Ж (zh). Practice reading subway station maps.', 35),
  ('b2222222-2222-2222-2222-222222222204', 'a2222222-2222-2222-2222-222222222202', 4, 'Rapid Signage & Transit Map Decoding Milestone', 'Real-world benchmark: Read real-world Moscow and Kyiv metro maps, airport terminal signs, and food labels in under 15 seconds per sign without consulting a cheat sheet.', 35),

  -- 3. Knife Sharpening Steps
  ('b3333333-3333-3333-3333-333333333301', 'a3333333-3333-3333-3333-333333333303', 1, 'Stone Soaking & 15-Degree Muscle Memory', 'Submerge the whetstone in water for 15 minutes until air bubbles stop rising. Use a two-quarter coin stack underneath the knife spine to lock in a repeatable 15-degree angle.', 20),
  ('b3333333-3333-3333-3333-333333333302', 'a3333333-3333-3333-3333-333333333303', 2, 'Forming & Detecting the Burr (1000 Grit)', 'Execute overlapping sweeping passes from heel to tip with moderate pressure. Feel the reverse side of the edge with the pad of your thumb until a microscopic continuous burr is formed.', 35),
  ('b3333333-3333-3333-3333-333333333303', 'a3333333-3333-3333-3333-333333333303', 3, 'Polishing & Stropping (6000 Grit)', 'Flip to the finishing stone to polish out microscopic scratches. Conclude with alternating feather-light trailing passes on leather or newspaper to remove burr fragments.', 25),
  ('b3333333-3333-3333-3333-333333333304', 'a3333333-3333-3333-3333-333333333303', 4, 'Push-Cut Sharpness Benchmark & Maintenance', 'Execute the ultimate apex geometry test: cleanly slice free-hanging phonebook or receipt paper with zero tearing, and slice a soft ripe tomato under only the knife''s own weight. Maintain apex with 5 light trailing strokes on leather.', 20),

  -- 4. Touch Typing Steps
  ('b4444444-4444-4444-4444-444444444401', 'a4444444-4444-4444-4444-444444444444', 1, 'Home Row Anchor & Spatial Orientation', 'Rest index fingers on the physical F and J notches. Drill A-S-D-F and J-K-L-; without lifting your wrists or looking down at keys.', 25),
  ('b4444444-4444-4444-4444-444444444402', 'a4444444-4444-4444-4444-444444444444', 2, 'Top & Bottom Row Muscle Expansion', 'Extend fingers diagonally to reach Q-W-E-R-T and Z-X-C-V-B, immediately snapping back to home row positions after each actuation.', 35),
  ('b4444444-4444-4444-4444-444444444403', 'a4444444-4444-4444-4444-444444444444', 3, 'Punctuation & 80 WPM Burst Training', 'Train shift key coordination with the opposite pinky and eliminate pause hesitations on punctuation (commas, apostrophes, quotation marks).', 30),
  ('b4444444-4444-4444-4444-444444444404', 'a4444444-4444-4444-4444-444444444444', 4, 'The 80 WPM Clean Rhythm Benchmark', 'Complete three consecutive 60-second typing tests maintaining over 80 WPM with at least 98% accuracy. Prioritize relaxed shoulders and continuous rhythmic cadence over erratic sprint bursts.', 30),

  -- 5. Espresso Dialing Steps
  ('b5555555-5555-5555-5555-555555555501', 'a5555555-5555-5555-5555-555555555555', 1, 'The Golden Extraction Recipe: 18g Dose, 36g Yield in 28-30s', 'Weigh exactly 18.0g of freshly roasted whole beans. Grind directly into portafilter, distribute evenly, tamp level with 20 lbs pressure, and aim for 36.0g liquid output in 28-30 seconds.', 20),
  ('b5555555-5555-5555-5555-555555555502', 'a5555555-5555-5555-5555-555555555555', 2, 'Puck Preparation & Channeling Prevention (WDT & Level Tamp)', 'Eliminate micro-channels: stir the coffee bed with a 0.3mm needle WDT tool to break clumps and equalize density from bottom to top. Tamp strictly perpendicular to the basket rim to prevent side-channeling.', 20),
  ('b5555555-5555-5555-5555-555555555503', 'a5555555-5555-5555-5555-555555555555', 3, 'Sensory Diagnosis: Correcting Sourness vs. Bitterness', 'Taste critically with a pre-warmed spoon: Sour, grassy, or thin espresso with fast flow (<24s) means under-extracted—adjust grinder 1-2 steps finer. Bitter, harsh, drying espresso with slow drip (>35s) means over-extracted—adjust grinder coarser or reduce yield.', 25),
  ('b5555555-5555-5555-5555-555555555504', 'a5555555-5555-5555-5555-555555555555', 4, 'Roast Adaptation & Origin Profiling Milestone', 'Dial in two contrasting coffees: adjust ratio to 1:2.5 (18g:45g) with higher grouphead temperature for light-roast washed origins, and 1:1.75 with slightly coarser grind for dense medium-dark chocolatey roasts.', 25),

  -- 6. Rubik's Cube Steps
  ('b6666666-6666-6666-6666-666666666601', 'a6666666-6666-6666-6666-666666666666', 1, 'The White Daisy and White Cross', 'Assemble 4 white edge pieces around the yellow center. Align side colors with matching center pieces, then rotate 180 degrees down to complete the white cross.', 20),
  ('b6666666-6666-6666-6666-666666666602', 'a6666666-6666-6666-6666-666666666666', 2, 'First Two Layers (F2L Beginners)', 'Insert the 4 white corner pieces using the right-hand trigger algorithm (R U R'' U''), then slot in middle-layer edge pieces using left and right pairing algorithms.', 30),
  ('b6666666-6666-6666-6666-666666666603', 'a6666666-6666-6666-6666-666666666666', 3, 'Yellow Cross & Top Layer Orientation', 'Execute F (R U R'' U'') F'' to achieve the yellow cross, followed by the Sune algorithm (R U R'' U R U2 R'') to orient and face all yellow corners upward.', 35),
  ('b6666666-6666-6666-6666-666666666604', 'a6666666-6666-6666-6666-666666666666', 4, 'Last Layer Permutation & Sub-2 Minute Milestone', 'Execute corner permutation (headlights / A-perm) and edge cycle (U-perm) algorithms to fully solve the scrambled cube. Complete 5 consecutive timed solves without stopping or consulting algorithm sheets, breaking the 2-minute barrier.', 35),

  -- 7. Sourdough Bread Steps
  ('b7777777-7777-7777-7777-777777777701', 'a7777777-7777-7777-7777-777777777777', 1, 'Levain Build & Flour Autolyse', 'Mix 50g active starter, 50g flour, and 50g water at 28°C until peaked. Separately combine 450g high-protein flour with 350g water for a 1-hour flour hydration autolyse.', 30),
  ('b7777777-7777-7777-7777-777777777702', 'a7777777-7777-7777-7777-777777777777', 2, 'Bulk Fermentation & Gentle Coil Folds', 'Incorporate levain and 10g salt. Perform 4 sets of coil folds spaced 30 minutes apart to develop gluten matrix without degassing.', 45),
  ('b7777777-7777-7777-7777-777777777703', 'a7777777-7777-7777-7777-777777777777', 3, 'Banneton Shaping & Cold Retardation', 'Preshape into a tight boule, rest 20 mins, then stitch into a rice-floured banneton. Cold ferment in refrigerator for 12-16 hours.', 35),
  ('b7777777-7777-7777-7777-777777777704', 'a7777777-7777-7777-7777-777777777777', 4, 'Dutch Oven Steam Bake & Blistering', 'Preheat Dutch oven to 240°C (465°F). Turn dough out, score 30° expansion slash, bake covered 20 minutes with steam, then uncovered 20 minutes until deep mahogany crust.', 40),

  -- 8. Juggling Steps
  ('b8888888-8888-8888-8888-888888888801', 'a8888888-8888-8888-8888-888888888888', 1, 'The One-Ball Scooping Arc', 'Stand relaxed. Throw one ball in an eye-level scoop trajectory from dominant hand to non-dominant hand, peaking at forehead height.', 20),
  ('b8888888-8888-8888-8888-888888888802', 'a8888888-8888-8888-8888-888888888888', 2, 'Two-Ball Exchange (Throw-Throw-Catch-Catch)', 'Hold one ball per hand. Throw first ball; at peak, launch second ball underneath before catching both in rhythm. Avoid handing across.', 30),
  ('b8888888-8888-8888-8888-888888888803', 'a8888888-8888-8888-8888-888888888888', 3, 'The Three-Ball Flash & Continuous Cascade', 'Hold two balls in dominant hand, one in off-hand. Launch in 1-2-3 rhythm and catch all three (the Flash). Progressively link consecutive throws into an unbroken cascade.', 40),
  ('b8888888-8888-8888-8888-888888888804', 'a8888888-8888-8888-8888-888888888888', 4, '100-Catch Cascade Endurance & Wall Drill', 'Practice facing 6 inches away from a wall to eliminate forward-stepping drift. Build rhythmic stamina until you can execute an uninterrupted 100-catch cascade with steady breathing and low dwell time.', 35)
on conflict (skill_id, step_number) do update set
  title = excluded.title,
  instructions = excluded.instructions,
  estimated_minutes = excluded.estimated_minutes;

-- STEP 5: Insert All Curated Learning Resources
insert into public.learning_resources (id, step_id, platform_name, url, resource_type, is_free)
values
  -- Guitar Resources
  ('c1111111-1111-1111-1111-111111111101', 'b1111111-1111-1111-1111-111111111101', 'JustinGuitar', 'https://www.justinguitar.com/classes/beginner-fingerstyle-guitar', 'course', true),
  ('c1111111-1111-1111-1111-111111111102', 'b1111111-1111-1111-1111-111111111101', 'Andy Guitar (Beginner Starter)', 'https://www.youtube.com/watch?v=BBz-Jyr23M4', 'video', true),
  ('c1111111-1111-1111-1111-111111111103', 'b1111111-1111-1111-1111-111111111102', 'Andy Guitar (Travis Picking Guide)', 'https://www.youtube.com/watch?v=XQiaCSabQaE', 'video', true),
  ('c1111111-1111-1111-1111-111111111104', 'b1111111-1111-1111-1111-111111111103', 'Ultimate Guitar Tab Vault', 'https://www.ultimate-guitar.com', 'tool', true),
  ('c1111111-1111-1111-1111-111111111105', 'b1111111-1111-1111-1111-111111111103', 'Andy Guitar (Chord Transitions)', 'https://www.youtube.com/watch?v=OZh562SYyCo', 'video', true),
  ('c1111111-1111-1111-1111-111111111106', 'b1111111-1111-1111-1111-111111111104', 'Paul Davids (Arpeggios & Mechanics)', 'https://www.youtube.com/watch?v=qls1HQ-FaGM', 'video', true),

  -- Cyrillic Resources
  ('c2222222-2222-2222-2222-222222222201', 'b2222222-2222-2222-2222-222222222201', 'RussianPod101 Alphabet Chart', 'https://www.russianpod101.com/russian-alphabet/', 'article', true),
  ('c2222222-2222-2222-2222-222222222202', 'b2222222-2222-2222-2222-222222222201', 'RussianPod101 (Alphabet in 1 Hour)', 'https://www.youtube.com/watch?v=KxLeECK0NbE', 'video', true),
  ('c2222222-2222-2222-2222-222222222203', 'b2222222-2222-2222-2222-222222222202', 'Duolingo Cyrillic Drill', 'https://www.duolingo.com', 'interactive', true),
  ('c2222222-2222-2222-2222-222222222204', 'b2222222-2222-2222-2222-222222222202', 'RussianPod101 (False Friends)', 'https://www.youtube.com/watch?v=KxLeECK0NbE', 'video', true),
  ('c2222222-2222-2222-2222-222222222205', 'b2222222-2222-2222-2222-222222222203', 'AnkiWeb Shared Decks', 'https://ankiweb.net/shared/decks/cyrillic', 'tool', true),
  ('c2222222-2222-2222-2222-222222222206', 'b2222222-2222-2222-2222-222222222203', 'Natasha RusNow (Pronunciation Guide)', 'https://www.youtube.com/watch?v=bJ-8juaraCs', 'video', true),
  ('c2222222-2222-2222-2222-222222222207', 'b2222222-2222-2222-2222-222222222204', 'RussianPod101 (Street Sign Decoding)', 'https://www.youtube.com/watch?v=KxLeECK0NbE', 'video', true),

  -- Knife Sharpening Resources
  ('c3333333-3333-3333-3333-333333333301', 'b3333333-3333-3333-3333-333333333301', 'OUTDOORS55 (5-Minute Sharpening)', 'https://www.youtube.com/watch?v=pagPuiuA9cY', 'video', true),
  ('c3333333-3333-3333-3333-333333333302', 'b3333333-3333-3333-3333-333333333302', 'The Spruce Eats Sharpening Guide', 'https://www.thespruceeats.com/how-to-sharpen-a-knife-with-a-whetstone-4846747', 'article', true),
  ('c3333333-3333-3333-3333-333333333303', 'b3333333-3333-3333-3333-333333333302', 'OUTDOORS55 (Burr Identification)', 'https://www.youtube.com/watch?v=DX_39JMVUkk', 'video', true),
  ('c3333333-3333-3333-3333-333333333304', 'b3333333-3333-3333-3333-333333333303', 'Burrfection (How To Strop a Knife)', 'https://www.youtube.com/watch?v=htZMcXphsXA', 'video', true),
  ('c3333333-3333-3333-3333-333333333305', 'b3333333-3333-3333-3333-333333333304', 'OUTDOORS55 (Sharpness & Angle Control)', 'https://www.youtube.com/watch?v=vUpLk9XLylA', 'video', true),

  -- Touch Typing Resources
  ('c4444444-4444-4444-4444-444444444401', 'b4444444-4444-4444-4444-444444444401', 'Keybr Ergonomic Trainer', 'https://www.keybr.com', 'interactive', true),
  ('c4444444-4444-4444-4444-444444444402', 'b4444444-4444-4444-4444-444444444401', 'Anson Alexander (Home Row Essentials)', 'https://www.youtube.com/watch?v=gfFHkqJZ7so', 'video', true),
  ('c4444444-4444-4444-4444-444444444403', 'b4444444-4444-4444-4444-444444444401', 'TypingClub', 'https://www.typingclub.com', 'course', true),
  ('c4444444-4444-4444-4444-444444444404', 'b4444444-4444-4444-4444-444444444402', 'Monkeytype Smoothness Drill', 'https://monkeytype.com', 'interactive', true),
  ('c4444444-4444-4444-4444-444444444405', 'b4444444-4444-4444-4444-444444444402', 'CreamyKeys (Keyboard Orientation)', 'https://www.youtube.com/watch?v=kgAPl4mpTiI', 'video', true),
  ('c4444444-4444-4444-4444-444444444406', 'b4444444-4444-4444-4444-444444444403', 'NitroType Multiplayer', 'https://www.nitrotype.com', 'interactive', true),
  ('c4444444-4444-4444-4444-444444444407', 'b4444444-4444-4444-4444-444444444403', 'Mr Chops (Speed & Technique)', 'https://www.youtube.com/watch?v=QAb3ATOpBpE', 'video', true),
  ('c4444444-4444-4444-4444-444444444408', 'b4444444-4444-4444-4444-444444444404', 'Mr Chops (0-100+ WPM Guide)', 'https://www.youtube.com/watch?v=QAb3ATOpBpE', 'video', true),
  ('c4444444-4444-4444-4444-444444444409', 'b4444444-4444-4444-4444-444444444404', 'Monkeytype (Benchmark Sprint)', 'https://monkeytype.com', 'interactive', true),

  -- Espresso Dialing Resources
  ('c5555555-5555-5555-5555-555555555501', 'b5555555-5555-5555-5555-555555555501', 'James Hoffmann Espresso Compass', 'https://www.baristahustle.com/blog/the-espresso-compass/', 'article', true),
  ('c5555555-5555-5555-5555-555555555502', 'b5555555-5555-5555-5555-555555555501', 'James Hoffmann (Espresso Ratios)', 'https://www.youtube.com/watch?v=F4wrUP4c5P4', 'video', true),
  ('c5555555-5555-5555-5555-555555555503', 'b5555555-5555-5555-5555-555555555502', 'James Hoffmann (Tools & Puck Prep)', 'https://www.youtube.com/watch?v=xb3IxAr4RCo', 'video', true),
  ('c5555555-5555-5555-5555-555555555504', 'b5555555-5555-5555-5555-555555555503', 'James Hoffmann (Dialing-In Part 1)', 'https://www.youtube.com/watch?v=lFwJF-_SUr0', 'video', true),
  ('c5555555-5555-5555-5555-555555555505', 'b5555555-5555-5555-5555-555555555504', 'James Hoffmann (Dialing In In-Depth)', 'https://www.youtube.com/watch?v=lFwJF-_SUr0', 'video', true),

  -- Rubik's Cube Resources
  ('c6666666-6666-6666-6666-666666666601', 'b6666666-6666-6666-6666-666666666601', 'Ruwix 3x3 Interactive Guide', 'https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/', 'interactive', true),
  ('c6666666-6666-6666-6666-666666666602', 'b6666666-6666-6666-6666-666666666601', 'J Perm (Daisy & White Cross)', 'https://www.youtube.com/watch?v=7Ron6MN45LY', 'video', true),
  ('c6666666-6666-6666-6666-666666666603', 'b6666666-6666-6666-6666-666666666602', 'J Perm (Beginner F2L)', 'https://www.youtube.com/watch?v=7Ron6MN45LY', 'video', true),
  ('c6666666-6666-6666-6666-666666666604', 'b6666666-6666-6666-6666-666666666603', 'J Perm (Yellow Cross & Sune)', 'https://www.youtube.com/watch?v=7Ron6MN45LY', 'video', true),
  ('c6666666-6666-6666-6666-666666666605', 'b6666666-6666-6666-6666-666666666603', 'CS Timer Practice Tool', 'https://cstimer.net', 'tool', true),
  ('c6666666-6666-6666-6666-666666666606', 'b6666666-6666-6666-6666-666666666604', 'J Perm (Beginner Method Full Solve)', 'https://www.youtube.com/watch?v=7Ron6MN45LY', 'video', true),
  ('c6666666-6666-6666-6666-666666666607', 'b6666666-6666-6666-6666-666666666604', 'CS Timer (Speedcubing Stopwatch)', 'https://cstimer.net', 'tool', true),

  -- Sourdough Bread Resources
  ('c7777777-7777-7777-7777-777777777701', 'b7777777-7777-7777-7777-777777777701', 'The Perfect Loaf (Beginner Sourdough)', 'https://www.theperfectloaf.com/beginners-sourdough-bread/', 'article', true),
  ('c7777777-7777-7777-7777-777777777702', 'b7777777-7777-7777-7777-777777777701', 'Bake With Jack (Starter & Autolyse)', 'https://www.youtube.com/watch?v=vmb0wWKITBQ', 'video', true),
  ('c7777777-7777-7777-7777-777777777703', 'b7777777-7777-7777-7777-777777777702', 'Bake With Jack (Sourdough 101)', 'https://www.youtube.com/watch?v=vmb0wWKITBQ', 'video', true),
  ('c7777777-7777-7777-7777-777777777704', 'b7777777-7777-7777-7777-777777777703', 'Bake With Jack (Shaping & Banneton)', 'https://www.youtube.com/watch?v=vmb0wWKITBQ', 'video', true),
  ('c7777777-7777-7777-7777-777777777705', 'b7777777-7777-7777-7777-777777777704', 'The Perfect Loaf (Dutch Oven Baking)', 'https://www.theperfectloaf.com/baking-sourdough-bread-in-a-dutch-oven/', 'article', true),
  ('c7777777-7777-7777-7777-777777777706', 'b7777777-7777-7777-7777-777777777704', 'Natasha''s Kitchen (Dutch Oven Sourdough)', 'https://www.youtube.com/watch?v=4gEoh3sk2AE', 'video', true),

  -- Juggling Resources
  ('c8888888-8888-8888-8888-888888888801', 'b8888888-8888-8888-8888-888888888801', 'Library of Juggling', 'https://www.juggle.org', 'interactive', true),
  ('c8888888-8888-8888-8888-888888888802', 'b8888888-8888-8888-8888-888888888801', 'Taylor Tries (One-Ball Fundamentals)', 'https://www.youtube.com/watch?v=dCYDZDlcO6g', 'video', true),
  ('c8888888-8888-8888-8888-888888888803', 'b8888888-8888-8888-8888-888888888802', 'Taylor Tries (3-Ball Cascade)', 'https://www.youtube.com/watch?v=dCYDZDlcO6g', 'video', true),
  ('c8888888-8888-8888-8888-888888888804', 'b8888888-8888-8888-8888-888888888803', 'Taylor Tries (Continuous 3-Ball Cascade)', 'https://www.youtube.com/watch?v=dCYDZDlcO6g', 'video', true),
  ('c8888888-8888-8888-8888-888888888805', 'b8888888-8888-8888-8888-888888888804', 'Taylor Tries (Cascade Endurance & Form)', 'https://www.youtube.com/watch?v=dCYDZDlcO6g', 'video', true)
on conflict (id) do update set
  platform_name = excluded.platform_name,
  url = excluded.url,
  resource_type = excluded.resource_type,
  is_free = excluded.is_free;
