import { Category, Skill } from "@/types/database";

export const LEGACY_SKILL_ID_MAP: Record<string, string> = {
  "skill-guitar-fingerstyle": "a1111111-1111-1111-1111-111111111111",
  "skill-fingerstyle-guitar": "a1111111-1111-1111-1111-111111111111",
  "skill-cyrillic-script": "a2222222-2222-2222-2222-222222222222",
  "skill-knife-sharpening": "a3333333-3333-3333-3333-333333333333",
  "skill-touch-typing": "a4444444-4444-4444-4444-444444444444",
  "skill-espresso": "a5555555-5555-5555-5555-555555555555",
  "skill-espresso-dialing": "a5555555-5555-5555-5555-555555555555",
  "skill-rubiks-cube": "a6666666-6666-6666-6666-666666666666",
  "skill-sourdough": "a7777777-7777-7777-7777-777777777777",
  "skill-juggling": "a8888888-8888-8888-8888-888888888888",
};

export const LEGACY_STEP_ID_MAP: Record<string, string> = {
  "step-g1": "b1111111-1111-1111-1111-111111111101",
  "step-g2": "b1111111-1111-1111-1111-111111111102",
  "step-g3": "b1111111-1111-1111-1111-111111111103",
  "step-g4": "b1111111-1111-1111-1111-111111111104",
  "step-c1": "b2222222-2222-2222-2222-222222222201",
  "step-c2": "b2222222-2222-2222-2222-222222222202",
  "step-c3": "b2222222-2222-2222-2222-222222222203",
  "step-c4": "b2222222-2222-2222-2222-222222222204",
  "step-k1": "b3333333-3333-3333-3333-333333333301",
  "step-k2": "b3333333-3333-3333-3333-333333333302",
  "step-k3": "b3333333-3333-3333-3333-333333333303",
  "step-k4": "b3333333-3333-3333-3333-333333333304",
  "step-t1": "b4444444-4444-4444-4444-444444444401",
  "step-t2": "b4444444-4444-4444-4444-444444444402",
  "step-t3": "b4444444-4444-4444-4444-444444444403",
  "step-t4": "b4444444-4444-4444-4444-444444444404",
  "step-e1": "b5555555-5555-5555-5555-555555555501",
  "step-e2": "b5555555-5555-5555-5555-555555555502",
  "step-e3": "b5555555-5555-5555-5555-555555555503",
  "step-e4": "b5555555-5555-5555-5555-555555555504",
  "step-r1": "b6666666-6666-6666-6666-666666666601",
  "step-r2": "b6666666-6666-6666-6666-666666666602",
  "step-r3": "b6666666-6666-6666-6666-666666666603",
  "step-r4": "b6666666-6666-6666-6666-666666666604",
  "step-s1": "b7777777-7777-7777-7777-777777777701",
  "step-s2": "b7777777-7777-7777-7777-777777777702",
  "step-s3": "b7777777-7777-7777-7777-777777777703",
  "step-s4": "b7777777-7777-7777-7777-777777777704",
  "step-j1": "b8888888-8888-8888-8888-888888888801",
  "step-j2": "b8888888-8888-8888-8888-888888888802",
  "step-j3": "b8888888-8888-8888-8888-888888888803",
  "step-j4": "b8888888-8888-8888-8888-888888888804",
};

export const UUID_TO_LEGACY_STEP_ID_MAP: Record<string, string> = Object.entries(LEGACY_STEP_ID_MAP).reduce(
  (acc, [legacy, uuid]) => {
    acc[uuid] = legacy;
    return acc;
  },
  {} as Record<string, string>
);

export const UUID_TO_LEGACY_SKILL_ID_MAP: Record<string, string> = Object.entries(LEGACY_SKILL_ID_MAP).reduce(
  (acc, [legacy, uuid]) => {
    acc[uuid] = legacy;
    return acc;
  },
  {} as Record<string, string>
);

export function normalizeSkillId(id: string): string {
  if (!id) return id;
  return LEGACY_SKILL_ID_MAP[id] || id;
}

export function normalizeStepId(id: string): string {
  if (!id) return id;
  return LEGACY_STEP_ID_MAP[id] || id;
}

export function isValidUuid(str: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function isStepCompleted(stepId: string, completedIds: string[]): boolean {
  if (!stepId || !completedIds || completedIds.length === 0) return false;
  const norm = normalizeStepId(stepId);
  const legacy = UUID_TO_LEGACY_STEP_ID_MAP[stepId] || UUID_TO_LEGACY_STEP_ID_MAP[norm];
  return (
    completedIds.includes(stepId) ||
    completedIds.includes(norm) ||
    (legacy ? completedIds.includes(legacy) : false)
  );
}

export function normalizeCategoryId(catId?: string): string {
  if (!catId) return "33333333-3333-3333-3333-333333333333";
  if (catId === "cat-music" || catId === "music") return "11111111-1111-1111-1111-111111111111";
  if (catId === "cat-language" || catId === "languages") return "22222222-2222-2222-2222-222222222222";
  if (catId === "cat-life" || catId === "life-skills") return "33333333-3333-3333-3333-333333333333";
  if (catId === "cat-tech" || catId === "tech") return "44444444-4444-4444-4444-444444444444";
  return catId;
}

export const CATEGORIES: Category[] = [
  { id: "cat-all", name: "All skills", slug: "all", description: "Explore all skill tracks" },
  { id: "11111111-1111-1111-1111-111111111111", name: "Music & Audio", slug: "music", description: "Instruments, ear training, rhythm, and acoustic fundamentals" },
  { id: "22222222-2222-2222-2222-222222222222", name: "Languages & Scripts", slug: "languages", description: "Alphabets, phonetic systems, and conversational fluency" },
  { id: "33333333-3333-3333-3333-333333333333", name: "Crafts & Life Skills", slug: "life-skills", description: "Tactile micro-skills, culinary essentials, and daily mastery" },
  { id: "44444444-4444-4444-4444-444444444444", name: "Tech & Creation", slug: "tech", description: "Tools, command line speed, typing, and digital workflows" },
];

export const INITIAL_SKILLS: Skill[] = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    category_id: "11111111-1111-1111-1111-111111111111",
    title: "Fingerstyle Acoustic Guitar Basics",
    slug: "fingerstyle-acoustic-guitar",
    summary: "Develop thumb independence, alternating bass lines, and fluid arpeggio picking patterns without relying on a plectrum.",
    difficulty: "beginner",
    estimated_hours: 8,
    time_commitment_label: "20 mins/day for 3 weeks",
    is_featured: true,
    steps_count: 4,
    steps: [
      {
        id: "step-g1",
        skill_id: "skill-guitar-fingerstyle",
        step_number: 1,
        title: "P-I-M-A Anchor & Finger Assignment",
        instructions: "Rest thumb (P) on bass strings (E/A/D) and fingers Index (I), Middle (M), and Ring (A) on G, B, and high E strings. Practice isolated plucking without wrist movement.",
        estimated_minutes: 25,
        resources: [
          {
            id: "res-g1",
            step_id: "step-g1",
            platform_name: "JustinGuitar",
            url: "https://www.justinguitar.com/classes/beginner-fingerstyle-guitar",
            resource_type: "course",
            is_free: true,
          },
          {
            id: "res-g2",
            step_id: "step-g1",
            platform_name: "JustinGuitar Beginner Tutorial",
            url: "https://www.youtube.com/watch?v=BBz-Jyr23M4",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-g2",
        skill_id: "skill-guitar-fingerstyle",
        step_number: 2,
        title: "Travis Picking Alternating Bass Pattern",
        instructions: "Lock down a steady 4/4 bass pulse with your thumb alternating between strings 6 and 4, then insert syncopated index and middle finger pinches on the off-beats.",
        estimated_minutes: 30,
        resources: [
          {
            id: "res-g3",
            step_id: "step-g2",
            platform_name: "Andy Guitar (Travis Picking Guide)",
            url: "https://www.youtube.com/watch?v=XQiaCSabQaE",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-g3",
        skill_id: "skill-guitar-fingerstyle",
        step_number: 3,
        title: "Chord Transitioning under Continuous Rhythm",
        instructions: "Transition between C Major, G Major, and A Minor without allowing the thumb's continuous quarter-note pulse to falter.",
        estimated_minutes: 35,
        resources: [
          {
            id: "res-g4",
            step_id: "step-g3",
            platform_name: "Ultimate Guitar Tab Vault",
            url: "https://www.ultimate-guitar.com",
            resource_type: "tool",
            is_free: true,
          },
          {
            id: "res-g4-vid",
            step_id: "step-g3",
            platform_name: "Andy Guitar (Chord Transitions)",
            url: "https://www.youtube.com/watch?v=OZh562SYyCo",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-g4",
        skill_id: "skill-guitar-fingerstyle",
        step_number: 4,
        title: "Arpeggio Rolling & Pinch Dynamics",
        instructions: "Execute rolling arpeggios (P-I-M-A-M-I) over an Em - C - G - D progression. Master pinch attacks where thumb and melody finger pluck simultaneously, accenting melody notes over quiet bass accompaniment.",
        estimated_minutes: 25,
        resources: [
          {
            id: "res-g5",
            step_id: "step-g4",
            platform_name: "YouTube (Paul Davids)",
            url: "https://www.youtube.com/watch?v=qls1HQ-FaGM",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
    ],
  },
  {
    id: "a2222222-2222-2222-2222-222222222222",
    category_id: "22222222-2222-2222-2222-222222222222",
    title: "Read the Cyrillic Alphabet in One Afternoon",
    slug: "read-cyrillic-alphabet",
    summary: "De-mystify Russian, Ukrainian, and Serbian signage and script by mapping false friends, Greek cognates, and unfamiliar phonetic glyphs.",
    difficulty: "beginner",
    estimated_hours: 2,
    time_commitment_label: "2 hours total",
    is_featured: true,
    steps_count: 4,
    steps: [
      {
        id: "step-c1",
        skill_id: "skill-cyrillic-script",
        step_number: 1,
        title: "The True Friends (A, K, M, O, T)",
        instructions: "Identify letters that look and sound identical to the Latin alphabet. Build your first 5-letter vocabulary anchors (e.g., KOT = cat, TOM = volume).",
        estimated_minutes: 20,
        resources: [
          {
            id: "res-c1",
            step_id: "step-c1",
            platform_name: "RussianPod101 Alphabet Chart",
            url: "https://www.russianpod101.com/russian-alphabet/",
            resource_type: "article",
            is_free: true,
          },
          {
            id: "res-c1-vid",
            step_id: "step-c1",
            platform_name: "RussianPod101 (Alphabet in 1 Hour)",
            url: "https://www.youtube.com/watch?v=KxLeECK0NbE",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-c2",
        skill_id: "skill-cyrillic-script",
        step_number: 2,
        title: "The False Friends (B=V, H=N, P=R, C=S, Y=U, X=Kh)",
        instructions: "Re-train optical conditioning: 'B' sounds like 'V', 'P' is rolled 'R', and 'H' is 'N'. Drill flashcard decoding of loanwords like PECTOPAH (Restaurant).",
        estimated_minutes: 30,
        resources: [
          {
            id: "res-c2",
            step_id: "step-c2",
            platform_name: "Duolingo Cyrillic Drill",
            url: "https://www.duolingo.com",
            resource_type: "interactive",
            is_free: true,
          },
          {
            id: "res-c2-vid",
            step_id: "step-c2",
            platform_name: "RussianPod101 (False Friends Breakdown)",
            url: "https://www.youtube.com/watch?v=KxLeECK0NbE",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-c3",
        skill_id: "skill-cyrillic-script",
        step_number: 3,
        title: "The Greek Siblings & Sibilants (Д, Г, П, Л, Ж, Ш, Щ)",
        instructions: "Master delta and gamma derivatives alongside the distinctive buzzing consonants like Ж (zh). Practice reading subway station maps.",
        estimated_minutes: 35,
        resources: [
          {
            id: "res-c3",
            step_id: "step-c3",
            platform_name: "AnkiWeb Shared Decks",
            url: "https://ankiweb.net/shared/decks/cyrillic",
            resource_type: "tool",
            is_free: true,
          },
          {
            id: "res-c3-vid",
            step_id: "step-c3",
            platform_name: "Natasha RusNow (Pronunciation Guide)",
            url: "https://www.youtube.com/watch?v=bJ-8juaraCs",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-c4",
        skill_id: "skill-cyrillic-script",
        step_number: 4,
        title: "Rapid Signage & Transit Map Decoding Milestone",
        instructions: "Real-world benchmark: Read real-world Moscow and Kyiv metro maps, airport terminal signs, and food labels in under 15 seconds per sign without consulting a cheat sheet.",
        estimated_minutes: 35,
        resources: [
          {
            id: "res-c4-vid",
            step_id: "step-c4",
            platform_name: "RussianPod101 (Street Sign Decoding)",
            url: "https://www.youtube.com/watch?v=KxLeECK0NbE",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
    ],
  },
  {
    id: "a3333333-3333-3333-3333-333333333333",
    category_id: "33333333-3333-3333-3333-333333333333",
    title: "Whetstone Knife Sharpening: Razor Edge",
    slug: "whetstone-knife-sharpening",
    summary: "Achieve paper-slicing sharpness on chef knives using a 1000/6000 grit water stone, consistent 15-degree angle control, and burr alignment.",
    difficulty: "beginner",
    estimated_hours: 1.5,
    time_commitment_label: "90 minutes total",
    is_featured: false,
    steps_count: 4,
    steps: [
      {
        id: "step-k1",
        skill_id: "skill-knife-sharpening",
        step_number: 1,
        title: "Stone Soaking & 15-Degree Muscle Memory",
        instructions: "Submerge the whetstone in water for 15 minutes until air bubbles stop rising. Use a two-quarter coin stack underneath the knife spine to lock in a repeatable 15-degree angle.",
        estimated_minutes: 20,
        resources: [
          {
            id: "res-k1",
            step_id: "step-k1",
            platform_name: "OUTDOORS55 (5-Minute Sharpening)",
            url: "https://www.youtube.com/watch?v=pagPuiuA9cY",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-k2",
        skill_id: "skill-knife-sharpening",
        step_number: 2,
        title: "Forming & Detecting the Burr (1000 Grit)",
        instructions: "Execute overlapping sweeping passes from heel to tip with moderate pressure. Feel the reverse side of the edge with the pad of your thumb until a microscopic continuous burr is formed.",
        estimated_minutes: 35,
        resources: [
          {
            id: "res-k2",
            step_id: "step-k2",
            platform_name: "The Spruce Eats Sharpening Guide",
            url: "https://www.thespruceeats.com/how-to-sharpen-a-knife-with-a-whetstone-4846747",
            resource_type: "article",
            is_free: true,
          },
          {
            id: "res-k2-vid",
            step_id: "step-k2",
            platform_name: "OUTDOORS55 (Burr Identification)",
            url: "https://www.youtube.com/watch?v=DX_39JMVUkk",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-k3",
        skill_id: "skill-knife-sharpening",
        step_number: 3,
        title: "Polishing & Stropping (6000 Grit)",
        instructions: "Flip to the finishing stone to polish out microscopic scratches. Conclude with alternating feather-light trailing passes on leather or newspaper to remove burr fragments.",
        estimated_minutes: 25,
        resources: [
          {
            id: "res-k3",
            step_id: "step-k3",
            platform_name: "Burrfection (How To Strop a Knife)",
            url: "https://www.youtube.com/watch?v=htZMcXphsXA",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-k4",
        skill_id: "skill-knife-sharpening",
        step_number: 4,
        title: "Push-Cut Sharpness Benchmark & Maintenance",
        instructions: "Execute the ultimate apex geometry test: cleanly slice free-hanging phonebook or receipt paper with zero tearing, and slice a soft ripe tomato under only the knife's own weight. Maintain apex with 5 light trailing strokes on leather.",
        estimated_minutes: 20,
        resources: [
          {
            id: "res-k4",
            step_id: "step-k4",
            platform_name: "OUTDOORS55 (Sharpness & Angle Control)",
            url: "https://www.youtube.com/watch?v=vUpLk9XLylA",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
    ],
  },
  {
    id: "a4444444-4444-4444-4444-444444444444",
    category_id: "44444444-4444-4444-4444-444444444444",
    title: "Touch Typing at 80+ Words Per Minute",
    slug: "touch-typing-speed",
    summary: "Recondition tactile muscle memory to eliminate keyboard glancing, master home row anchors, and build effortless typing velocity.",
    difficulty: "beginner",
    estimated_hours: 10,
    time_commitment_label: "15 mins/day for 4 weeks",
    is_featured: true,
    steps_count: 4,
    steps: [
      {
        id: "step-t1",
        skill_id: "skill-touch-typing",
        step_number: 1,
        title: "Home Row Anchor & Spatial Orientation",
        instructions: "Rest index fingers on the physical F and J notches. Drill A-S-D-F and J-K-L-; without lifting your wrists or looking down at keys.",
        estimated_minutes: 25,
        resources: [
          {
            id: "res-t1",
            step_id: "step-t1",
            platform_name: "Keybr Ergonomic Trainer",
            url: "https://www.keybr.com",
            resource_type: "interactive",
            is_free: true,
          },
          {
            id: "res-t1-vid",
            step_id: "step-t1",
            platform_name: "Anson Alexander (Home Row Essentials)",
            url: "https://www.youtube.com/watch?v=gfFHkqJZ7so",
            resource_type: "video",
            is_free: true,
          },
          {
            id: "res-t2",
            step_id: "step-t1",
            platform_name: "TypingClub",
            url: "https://www.typingclub.com",
            resource_type: "course",
            is_free: true,
          },
        ],
      },
      {
        id: "step-t2",
        skill_id: "skill-touch-typing",
        step_number: 2,
        title: "Top & Bottom Row Muscle Expansion",
        instructions: "Extend fingers diagonally to reach Q-W-E-R-T and Z-X-C-V-B, immediately snapping back to home row positions after each actuation.",
        estimated_minutes: 35,
        resources: [
          {
            id: "res-t3",
            step_id: "step-t2",
            platform_name: "Monkeytype Smoothness Drill",
            url: "https://monkeytype.com",
            resource_type: "interactive",
            is_free: true,
          },
          {
            id: "res-t2-vid",
            step_id: "step-t2",
            platform_name: "CreamyKeys (Keyboard Orientation)",
            url: "https://www.youtube.com/watch?v=kgAPl4mpTiI",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-t3",
        skill_id: "skill-touch-typing",
        step_number: 3,
        title: "Punctuation & 80 WPM Burst Training",
        instructions: "Train shift key coordination with the opposite pinky and eliminate pause hesitations on punctuation (commas, apostrophes, quotation marks).",
        estimated_minutes: 30,
        resources: [
          {
            id: "res-t4",
            step_id: "step-t3",
            platform_name: "NitroType Multiplayer",
            url: "https://www.nitrotype.com",
            resource_type: "interactive",
            is_free: true,
          },
          {
            id: "res-t3-vid",
            step_id: "step-t3",
            platform_name: "Mr Chops (Speed & Technique)",
            url: "https://www.youtube.com/watch?v=QAb3ATOpBpE",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-t4",
        skill_id: "skill-touch-typing",
        step_number: 4,
        title: "The 80 WPM Clean Rhythm Benchmark",
        instructions: "Complete three consecutive 60-second typing tests maintaining over 80 WPM with at least 98% accuracy. Prioritize relaxed shoulders and continuous rhythmic cadence over erratic sprint bursts.",
        estimated_minutes: 30,
        resources: [
          {
            id: "res-t5-vid",
            step_id: "step-t4",
            platform_name: "Mr Chops (0-100+ WPM Guide)",
            url: "https://www.youtube.com/watch?v=QAb3ATOpBpE",
            resource_type: "video",
            is_free: true,
          },
          {
            id: "res-t5",
            step_id: "step-t4",
            platform_name: "Monkeytype (Benchmark Sprint)",
            url: "https://monkeytype.com",
            resource_type: "interactive",
            is_free: true,
          },
        ],
      },
    ],
  },
  {
    id: "a5555555-5555-5555-5555-555555555555",
    category_id: "33333333-3333-3333-3333-333333333333",
    title: "Dialing In Specialty Espresso Extraction",
    slug: "dialing-in-espresso",
    summary: "Control grind size, dose, yield, and extraction time (1:2 ratio in 28–32s) to eliminate sour under-extraction and bitter astringency.",
    difficulty: "all-levels",
    estimated_hours: 1,
    time_commitment_label: "45 minutes practice",
    is_featured: false,
    steps_count: 4,
    steps: [
      {
        id: "step-e1",
        skill_id: "skill-espresso-dialing",
        step_number: 1,
        title: "The Golden Extraction Recipe: 18g Dose, 36g Yield in 28-30s",
        instructions: "Weigh exactly 18.0g of freshly roasted whole beans. Grind directly into portafilter, distribute evenly, tamp level with 20 lbs pressure, and aim for 36.0g liquid output in 28-30 seconds.",
        estimated_minutes: 20,
        resources: [
          {
            id: "res-e1",
            step_id: "step-e1",
            platform_name: "James Hoffmann Espresso Compass",
            url: "https://www.baristahustle.com/blog/the-espresso-compass/",
            resource_type: "article",
            is_free: true,
          },
          {
            id: "res-e1-vid",
            step_id: "step-e1",
            platform_name: "James Hoffmann (Espresso Ratios)",
            url: "https://www.youtube.com/watch?v=F4wrUP4c5P4",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-e2",
        skill_id: "skill-espresso-dialing",
        step_number: 2,
        title: "Puck Preparation & Channeling Prevention (WDT & Level Tamp)",
        instructions: "Eliminate micro-channels: stir the coffee bed with a 0.3mm needle WDT tool to break clumps and equalize density from bottom to top. Tamp strictly perpendicular to the basket rim to prevent side-channeling.",
        estimated_minutes: 20,
        resources: [
          {
            id: "res-e2",
            step_id: "step-e2",
            platform_name: "James Hoffmann (Tools & Puck Prep)",
            url: "https://www.youtube.com/watch?v=xb3IxAr4RCo",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-e3",
        skill_id: "skill-espresso-dialing",
        step_number: 3,
        title: "Sensory Diagnosis: Correcting Sourness vs. Bitterness",
        instructions: "Taste critically with a pre-warmed spoon: Sour, grassy, or thin espresso with fast flow (<24s) means under-extracted—adjust grinder 1-2 steps finer. Bitter, harsh, drying espresso with slow drip (>35s) means over-extracted—adjust grinder coarser or reduce yield.",
        estimated_minutes: 25,
        resources: [
          {
            id: "res-e3",
            step_id: "step-e3",
            platform_name: "James Hoffmann (Dialing-In Part 1)",
            url: "https://www.youtube.com/watch?v=lFwJF-_SUr0",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-e4",
        skill_id: "skill-espresso-dialing",
        step_number: 4,
        title: "Roast Adaptation & Origin Profiling Milestone",
        instructions: "Dial in two contrasting coffees: adjust ratio to 1:2.5 (18g:45g) with higher grouphead temperature for light-roast washed origins, and 1:1.75 with slightly coarser grind for dense medium-dark chocolatey roasts.",
        estimated_minutes: 25,
        resources: [
          {
            id: "res-e4",
            step_id: "step-e4",
            platform_name: "James Hoffmann (Dialing In In-Depth)",
            url: "https://www.youtube.com/watch?v=lFwJF-_SUr0",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
    ],
  },
  {
    id: "a6666666-6666-6666-6666-666666666666",
    category_id: "44444444-4444-4444-4444-444444444444",
    title: "Solve the 3x3 Rubik's Cube (CFOP Layer-by-Layer)",
    slug: "solve-rubiks-cube",
    summary: "Memorize 5 simple sequential algorithms to consistently solve any scrambled 3x3 puzzle in under two minutes.",
    difficulty: "beginner",
    estimated_hours: 3,
    time_commitment_label: "45 mins/day for 4 days",
    is_featured: false,
    steps_count: 4,
    steps: [
      {
        id: "step-r1",
        skill_id: "skill-rubiks-cube",
        step_number: 1,
        title: "The White Daisy and White Cross",
        instructions: "Assemble 4 white edge pieces around the yellow center. Align side colors with matching center pieces, then rotate 180 degrees down to complete the white cross.",
        estimated_minutes: 20,
        resources: [
          {
            id: "res-r1",
            step_id: "step-r1",
            platform_name: "Ruwix 3x3 Interactive Guide",
            url: "https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/",
            resource_type: "interactive",
            is_free: true,
          },
          {
            id: "res-r1-vid",
            step_id: "step-r1",
            platform_name: "J Perm (Daisy & White Cross)",
            url: "https://www.youtube.com/watch?v=7Ron6MN45LY",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-r2",
        skill_id: "skill-rubiks-cube",
        step_number: 2,
        title: "First Two Layers (F2L Beginners)",
        instructions: "Insert the 4 white corner pieces using the right-hand trigger algorithm (R U R' U'), then slot in middle-layer edge pieces using left and right pairing algorithms.",
        estimated_minutes: 30,
        resources: [
          {
            id: "res-r2",
            step_id: "step-r2",
            platform_name: "J Perm (Beginner F2L)",
            url: "https://www.youtube.com/watch?v=7Ron6MN45LY",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "step-r3",
        skill_id: "skill-rubiks-cube",
        step_number: 3,
        title: "Yellow Cross & Top Layer Orientation",
        instructions: "Execute F (R U R' U') F' to achieve the yellow cross, followed by the Sune algorithm (R U R' U R U2 R') to orient and face all yellow corners upward.",
        estimated_minutes: 35,
        resources: [
          {
            id: "res-r3-vid",
            step_id: "step-r3",
            platform_name: "J Perm (Yellow Cross & Sune)",
            url: "https://www.youtube.com/watch?v=7Ron6MN45LY",
            resource_type: "video",
            is_free: true,
          },
          {
            id: "res-r3",
            step_id: "step-r3",
            platform_name: "CS Timer Practice Tool",
            url: "https://cstimer.net",
            resource_type: "tool",
            is_free: true,
          },
        ],
      },
      {
        id: "step-r4",
        skill_id: "skill-rubiks-cube",
        step_number: 4,
        title: "Last Layer Permutation & Sub-2 Minute Milestone",
        instructions: "Execute corner permutation (headlights / A-perm) and edge cycle (U-perm) algorithms to fully solve the scrambled cube. Complete 5 consecutive timed solves without stopping or consulting algorithm sheets, breaking the 2-minute barrier.",
        estimated_minutes: 35,
        resources: [
          {
            id: "res-r4-vid",
            step_id: "step-r4",
            platform_name: "J Perm (Beginner Method Full Solve)",
            url: "https://www.youtube.com/watch?v=7Ron6MN45LY",
            resource_type: "video",
            is_free: true,
          },
          {
            id: "res-r4",
            step_id: "step-r4",
            platform_name: "CS Timer (Speedcubing Stopwatch)",
            url: "https://cstimer.net",
            resource_type: "tool",
            is_free: true,
          },
        ],
      },
    ],
  },
  {
    id: "a7777777-7777-7777-7777-777777777777",
    category_id: "33333333-3333-3333-3333-333333333333",
    title: "Artisan Sourdough Bread from Scratch",
    slug: "artisan-sourdough-bread",
    summary: "Cultivate a wild yeast levain, master autolyse, coil folds, hydration control, banneton shaping, and Dutch oven steam baking.",
    difficulty: "intermediate",
    estimated_hours: 4,
    time_commitment_label: "Weekend project (4 hours active)",
    is_featured: false,
    steps_count: 4,
    steps: [
      {
        id: "b7777777-7777-7777-7777-777777777701",
        skill_id: "a7777777-7777-7777-7777-777777777777",
        step_number: 1,
        title: "Levain Build & Flour Autolyse",
        instructions: "Mix 50g active starter, 50g flour, and 50g water at 28°C until peaked. Separately combine 450g high-protein flour with 350g water for a 1-hour flour hydration autolyse.",
        estimated_minutes: 30,
        resources: [
          {
            id: "c7777777-7777-7777-7777-777777777701",
            step_id: "b7777777-7777-7777-7777-777777777701",
            platform_name: "The Perfect Loaf (Maurizio Leo)",
            url: "https://www.theperfectloaf.com/beginners-sourdough-bread/",
            resource_type: "article",
            is_free: true,
          },
          {
            id: "c7777777-7777-7777-7777-777777777701-vid",
            step_id: "b7777777-7777-7777-7777-777777777701",
            platform_name: "Bake With Jack (Starter & Autolyse)",
            url: "https://www.youtube.com/watch?v=vmb0wWKITBQ",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "b7777777-7777-7777-7777-777777777702",
        skill_id: "a7777777-7777-7777-7777-777777777777",
        step_number: 2,
        title: "Bulk Fermentation & Gentle Coil Folds",
        instructions: "Incorporate levain and 10g salt. Perform 4 sets of coil folds spaced 30 minutes apart to develop gluten matrix without degassing.",
        estimated_minutes: 45,
        resources: [
          {
            id: "c7777777-7777-7777-7777-777777777702",
            step_id: "b7777777-7777-7777-7777-777777777702",
            platform_name: "Bake With Jack (Sourdough 101)",
            url: "https://www.youtube.com/watch?v=vmb0wWKITBQ",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "b7777777-7777-7777-7777-777777777703",
        skill_id: "a7777777-7777-7777-7777-777777777777",
        step_number: 3,
        title: "Banneton Shaping & Cold Retardation",
        instructions: "Preshape into a tight boule, rest 20 mins, then stitch into a rice-floured banneton. Cold ferment in refrigerator for 12-16 hours.",
        estimated_minutes: 35,
        resources: [
          {
            id: "c7777777-7777-7777-7777-777777777703",
            step_id: "b7777777-7777-7777-7777-777777777703",
            platform_name: "Bake With Jack (Shaping & Banneton)",
            url: "https://www.youtube.com/watch?v=vmb0wWKITBQ",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "b7777777-7777-7777-7777-777777777704",
        skill_id: "a7777777-7777-7777-7777-777777777777",
        step_number: 4,
        title: "Dutch Oven Steam Bake & Blistering",
        instructions: "Preheat Dutch oven to 240°C (465°F). Turn dough out, score 30° expansion slash, bake covered 20 minutes with steam, then uncovered 20 minutes until deep mahogany crust.",
        estimated_minutes: 40,
        resources: [
          {
            id: "c7777777-7777-7777-7777-777777777704",
            step_id: "b7777777-7777-7777-7777-777777777704",
            platform_name: "The Perfect Loaf (Dutch Oven Baking)",
            url: "https://www.theperfectloaf.com/baking-sourdough-bread-in-a-dutch-oven/",
            resource_type: "article",
            is_free: true,
          },
          {
            id: "c7777777-7777-7777-7777-777777777704-vid",
            step_id: "b7777777-7777-7777-7777-777777777704",
            platform_name: "Natasha's Kitchen (Dutch Oven Sourdough)",
            url: "https://www.youtube.com/watch?v=4gEoh3sk2AE",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
    ],
  },
  {
    id: "a8888888-8888-8888-8888-888888888888",
    category_id: "33333333-3333-3333-3333-333333333333",
    title: "Three-Ball Cascade Juggling",
    slug: "three-ball-juggling",
    summary: "Unlock rhythmic hand-eye coordination with scooping arc throws, dwell time management, and drop-prevention conditioning.",
    difficulty: "beginner",
    estimated_hours: 2.5,
    time_commitment_label: "20 mins/day for 1 week",
    is_featured: false,
    steps_count: 4,
    steps: [
      {
        id: "b8888888-8888-8888-8888-888888888801",
        skill_id: "a8888888-8888-8888-8888-888888888888",
        step_number: 1,
        title: "The One-Ball Scooping Arc",
        instructions: "Stand relaxed. Throw one ball in an eye-level scoop trajectory from dominant hand to non-dominant hand, peaking at forehead height.",
        estimated_minutes: 20,
        resources: [
          {
            id: "c8888888-8888-8888-8888-888888888801",
            step_id: "b8888888-8888-8888-8888-888888888801",
            platform_name: "Library of Juggling",
            url: "https://www.juggle.org",
            resource_type: "interactive",
            is_free: true,
          },
          {
            id: "c8888888-8888-8888-8888-888888888801-vid",
            step_id: "b8888888-8888-8888-8888-888888888801",
            platform_name: "Taylor Tries (One-Ball Fundamentals)",
            url: "https://www.youtube.com/watch?v=dCYDZDlcO6g",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "b8888888-8888-8888-8888-888888888802",
        skill_id: "a8888888-8888-8888-8888-888888888888",
        step_number: 2,
        title: "Two-Ball Exchange (Throw-Throw-Catch-Catch)",
        instructions: "Hold one ball per hand. Throw first ball; at peak, launch second ball underneath before catching both in rhythm. Avoid handing across.",
        estimated_minutes: 30,
        resources: [
          {
            id: "c8888888-8888-8888-8888-888888888802",
            step_id: "b8888888-8888-8888-8888-888888888802",
            platform_name: "Taylor Tries (3-Ball Cascade)",
            url: "https://www.youtube.com/watch?v=dCYDZDlcO6g",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "b8888888-8888-8888-8888-888888888803",
        skill_id: "a8888888-8888-8888-8888-888888888888",
        step_number: 3,
        title: "The Three-Ball Flash & Continuous Cascade",
        instructions: "Hold two balls in dominant hand, one in off-hand. Launch in 1-2-3 rhythm and catch all three (the Flash). Progressively link consecutive throws into an unbroken cascade.",
        estimated_minutes: 40,
        resources: [
          {
            id: "c8888888-8888-8888-8888-888888888803",
            step_id: "b8888888-8888-8888-8888-888888888803",
            platform_name: "Taylor Tries (Continuous 3-Ball Cascade)",
            url: "https://www.youtube.com/watch?v=dCYDZDlcO6g",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
      {
        id: "b8888888-8888-8888-8888-888888888804",
        skill_id: "a8888888-8888-8888-8888-888888888888",
        step_number: 4,
        title: "100-Catch Cascade Endurance & Wall Drill",
        instructions: "Practice facing 6 inches away from a wall to eliminate forward-stepping drift. Build rhythmic stamina until you can execute an uninterrupted 100-catch cascade with steady breathing and low dwell time.",
        estimated_minutes: 35,
        resources: [
          {
            id: "c8888888-8888-8888-8888-888888888804",
            step_id: "b8888888-8888-8888-8888-888888888804",
            platform_name: "Taylor Tries (Cascade Endurance & Form)",
            url: "https://www.youtube.com/watch?v=dCYDZDlcO6g",
            resource_type: "video",
            is_free: true,
          },
        ],
      },
    ],
  },
];

