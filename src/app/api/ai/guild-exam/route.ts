import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export interface ExamOption {
  id: "A" | "B" | "C" | "D";
  text: string;
  isCorrect: boolean;
  rationale: string;
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  scenario: string;
  practicalCue: string;
  options: ExamOption[];
}

export interface GuildExamPayload {
  examTitle: string;
  craftTitle: string;
  craftHonorific: string;
  passingScore: number;
  questions: ExamQuestion[];
}

// Canonical curated fallback exams for instant zero-latency loading & offline resilience
const CURATED_EXAMS: Record<string, GuildExamPayload> = {
  "fingerstyle-acoustic-guitar": {
    examTitle: "Craftsman's Guild Acoustic Guild Examination",
    craftTitle: "Fingerstyle Acoustic Guitar Basics",
    craftHonorific: "Journeyman Fingerstyle Guitarist",
    passingScore: 2,
    questions: [
      {
        id: "g-q1",
        questionNumber: 1,
        practicalCue: "PHYSICAL MECHANIC // INDEPENDENT MOTOR PULSE",
        scenario: "While executing an alternating Travis picking pattern over a C major chord, your thumb unconsciously speeds up whenever your index or middle finger pinches an off-beat treble string. What mechanical cue resolves this sympathetic contraction?",
        options: [
          {
            id: "A",
            text: "Isolate the thumb to a metronome at 50 BPM until the quarter-note downbeat pulse operates as an autonomous subconscious clock, then gently reintroduce off-beat pinches.",
            isCorrect: true,
            rationale: "Travis picking relies on decoupled motor pathways. The alternating thumb must become an involuntary pendulum before the cerebral cortex coordinates syncopation.",
          },
          {
            id: "B",
            text: "Press harder with your fretting hand fingers to stabilize neck vibration and counteract the hand wobble.",
            isCorrect: false,
            rationale: "Fretting hand tension transfers directly across the neck into the picking arm, increasing sympathetic contraction.",
          },
          {
            id: "C",
            text: "Switch to using a rigid plastic thumbpick to mechanically force the thumb to strike harder than the fingers.",
            isCorrect: false,
            rationale: "A thumbpick changes tone timbre but does not fix the neuromuscular synchronization imbalance between thumb and fingers.",
          },
          {
            id: "D",
            text: "Rest your pinky finger firmly glued onto the guitar soundboard directly under the high E string.",
            isCorrect: false,
            rationale: "While light anchoring is acceptable for some, firmly gluing the pinky dampens the soundboard and restricts wrist flexure.",
          },
        ],
      },
      {
        id: "g-q2",
        questionNumber: 2,
        practicalCue: "TONAL CONTACT // P-I-M-A STRIKE ANGLE",
        scenario: "Your index and middle finger up-strokes produce a thin, papery scratching sound against the bronze wound strings rather than a full, rounded acoustic tone. How do you adjust your hand orientation?",
        options: [
          {
            id: "A",
            text: "Angle the right wrist inward so the fingertips strike perpendicular (90°) with pure flesh only.",
            isCorrect: false,
            rationale: "A 90° flesh-only angle lacks projection and prevents fingernail ramp articulation.",
          },
          {
            id: "B",
            text: "Arch the right wrist slightly, allowing strings to glide across the left ramp of the nail-flesh boundary at approximately 45 degrees.",
            isCorrect: true,
            rationale: "The classical and acoustic tone 'sweet spot' engages both the flesh pad for fundamental body and the left ramp of the nail for clean harmonic brightness.",
          },
          {
            id: "C",
            text: "Pull the string vertically away from the soundboard so it snaps back against the fretboard.",
            isCorrect: false,
            rationale: "This produces a harsh slap/buzz (Bartók snap) rather than warm acoustic legato.",
          },
          {
            id: "D",
            text: "Shift your picking hand all the way adjacent to the wooden bridge saddle.",
            isCorrect: false,
            rationale: "Playing near the bridge (sul ponticello) naturally increases nasal, tinny high frequencies.",
          },
        ],
      },
      {
        id: "g-q3",
        questionNumber: 3,
        practicalCue: "FRETTING ERGONOMICS // CHORD TRANSITION EFFICIENCY",
        scenario: "When transitioning between an open G major and an open C major chord during continuous fingerpicking, the treble strings mute momentarily because your ring finger collapses flat. What postural adjustment rectifies this?",
        options: [
          {
            id: "A",
            text: "Drop your left wrist down and forward, arching the proximal finger joints so only fingertip crowns make perpendicular fretboard contact.",
            isCorrect: true,
            rationale: "Dropping the wrist forward creates the natural arc needed to avoid dampening adjacent strings.",
          },
          {
            id: "B",
            text: "Wrap your left thumb over the top edge of the fretboard to squeeze the neck from above.",
            isCorrect: false,
            rationale: "Thumb-over clamps the palm against the neck underside, flattening the finger pads against open strings.",
          },
          {
            id: "C",
            text: "Angle the guitar body flat against your chest to decrease the reach angle.",
            isCorrect: false,
            rationale: "Tilting the guitar upward crimps the wrist into an awkward supinated angle.",
          },
          {
            id: "D",
            text: "Use lighter gauge electric guitar strings to reduce required finger tension.",
            isCorrect: false,
            rationale: "String gauge does not solve finger arching or spatial joint alignment.",
          },
        ],
      },
    ],
  },
  "dialing-in-espresso": {
    examTitle: "Craftsman's Guild Extraction Guild Examination",
    craftTitle: "Dialing In Specialty Espresso Extraction",
    craftHonorific: "Certified Atelier Barista",
    passingScore: 2,
    questions: [
      {
        id: "e-q1",
        questionNumber: 1,
        practicalCue: "SENSORY DIAGNOSIS // YIELD KINETICS",
        scenario: "Your espresso recipe calls for 18g dose to 36g yield in 28-30 seconds. Your actual extraction yields 36g in only 16 seconds. The liquid streams violently pale, and the cup tastes aggressively sour, hollow, and sharp on the sides of the tongue. What diagnosis is correct?",
        options: [
          {
            id: "A",
            text: "Severe under-extraction due to excessive flow rate; coarsen the grind size by 2 notches.",
            isCorrect: false,
            rationale: "Coarsening the grind would increase flow rate and make the shot even faster and more under-extracted.",
          },
          {
            id: "B",
            text: "Severe under-extraction; the water encountered insufficient puck resistance. Adjust the grinder finer to increase contact time and extraction yield.",
            isCorrect: true,
            rationale: "Under-extracted coffee tastes sour and salty because acids extract first; sugars and balance require finer grind and sufficient dwell time.",
          },
          {
            id: "C",
            text: "Severe over-extraction; the water burned the organic acids in the coffee puck.",
            isCorrect: false,
            rationale: "Over-extraction results in slow shots (35s+) and astringent, bitter, drying sensations.",
          },
          {
            id: "D",
            text: "Puck over-compaction; decrease tamping force from 30 lbs to 10 lbs.",
            isCorrect: false,
            rationale: "Tamp pressure beyond full mechanical bed compression does not significantly change shot flow time.",
          },
        ],
      },
      {
        id: "e-q2",
        questionNumber: 2,
        practicalCue: "PUCK ARCHITECTURE // CHANNELING RECOGNITION",
        scenario: "Using a bottomless (naked) portafilter, you observe three bright, high-pressure jet streams spraying outward at second 8 of extraction, while the surrounding basket surface remains dark. What puck preparation flaw occurred?",
        options: [
          {
            id: "A",
            text: "Uneven grind distribution or puck fracturing causing localized channeling; water found paths of least resistance through puck cracks.",
            isCorrect: true,
            rationale: "Channeling occurs when micro-fissures or clumping allow water to bypass the coffee bed, leading to simultaneous over-extraction along the channel and under-extraction elsewhere.",
          },
          {
            id: "B",
            text: "The brew water temperature was set 1.5°C too high, causing thermal flash steam bubbles.",
            isCorrect: false,
            rationale: "High temperature alters flavor balance but does not cause jet spraying from the basket base.",
          },
          {
            id: "C",
            text: "The coffee was roasted too dark, creating excessive carbon dioxide gas.",
            isCorrect: false,
            rationale: "Excessive CO2 causes thick crema bloom, not localized high-pressure spritzing.",
          },
          {
            id: "D",
            text: "The portafilter basket holes are too large for commercial espresso machines.",
            isCorrect: false,
            rationale: "Standard precision baskets (VST/IMS) are calibrated for 9-bar extraction.",
          },
        ],
      },
      {
        id: "e-q3",
        questionNumber: 3,
        practicalCue: "TASTING COMPASS // RATIO FINE-TUNING",
        scenario: "A light-roast Ethiopian coffee pulls in 29 seconds with clean flow, but the resulting cup has overpowering lingering dry bitterness and an astringent finish resembling over-steeped black tea. How do you adjust using the Barista Compass?",
        options: [
          {
            id: "A",
            text: "Shorten the brew ratio (e.g. from 1:2.2 to 1:1.8) or grind slightly coarser to cut off the tail-end extraction of astringent tannins.",
            isCorrect: true,
            rationale: "Astringency and harsh bitterness emerge during the final third of extraction. Shortening the yield or slightly coarsening the grind protects sweetness.",
          },
          {
            id: "B",
            text: "Increase total yield to 1:3 ratio to dilute the heavy bitter compounds.",
            isCorrect: false,
            rationale: "Extracting more water pushes deeper into bitter lignin and polyphenol territory.",
          },
          {
            id: "C",
            text: "Grind finer to increase extraction and mask bitterness with higher acidity.",
            isCorrect: false,
            rationale: "Grinding finer will exacerbate over-extraction and increase astringency.",
          },
          {
            id: "D",
            text: "Tamp the coffee twice with maximum shoulder bodyweight.",
            isCorrect: false,
            rationale: "Double tamping can break the puck seal against the basket walls without improving balance.",
          },
        ],
      },
    ],
  },
  "artisan-sourdough-bread": {
    examTitle: "Craftsman's Guild Fermentation Guild Examination",
    craftTitle: "Artisan Sourdough Bread from Scratch",
    craftHonorific: "Master Artisan Baker",
    passingScore: 2,
    questions: [
      {
        id: "s-q1",
        questionNumber: 1,
        practicalCue: "FERMENTATION KINETICS // DOUGH VOLUMETRICS",
        scenario: "During bulk fermentation at 26°C, your dough shows tiny bubbles on the surface, but when gently shaken in its glass bowl, the dough is dense and flat with no rounded domed perimeter. What is the state of the dough?",
        options: [
          {
            id: "A",
            text: "Under-fermented; the yeast has begun activity but the gluten matrix has not trapped sufficient carbon dioxide gas. Continue bulk fermentation until dough is domed and jiggly.",
            isCorrect: true,
            rationale: "A dome-shaped top and aerated jiggle indicate full aeration and gluten extensibility.",
          },
          {
            id: "B",
            text: "Over-fermented; the acidity has broken down all gluten proteins and the dough must be shaped immediately.",
            isCorrect: false,
            rationale: "Over-fermented dough looks concave, soupy, and tears upon touch.",
          },
          {
            id: "C",
            text: "The flour had zero enzymatic amylase; add commercial dry yeast immediately.",
            isCorrect: false,
            rationale: "Natural sourdough starters take 3-6 hours to develop volume; adding commercial yeast ruins wild sourdough character.",
          },
          {
            id: "D",
            text: "The dough is fully ready for oven baking; turn directly into the preheated Dutch oven.",
            isCorrect: false,
            rationale: "Baking dense, un-aerated dough yields a gummy, flat 'flying crust' bread with dense leaden crumb.",
          },
        ],
      },
      {
        id: "s-q2",
        questionNumber: 2,
        practicalCue: "SHAPING & SURFACE TENSION // BENCH MECHANICS",
        scenario: "When tipping your proofed dough onto the wooden bench to shape a boule, the dough spreads outward into a puddle like pancake batter, tearing when you attempt a bench knife cupping pull. What structural flaw occurred?",
        options: [
          {
            id: "A",
            text: "Over-proteolysis from over-proofing, or insufficient gluten development during coil folds, causing the protein network to liquefy under acid buildup.",
            isCorrect: true,
            rationale: "Excess lactic/acetic acid from prolonged bulk fermentation breaks down gluten bonds, robbing the dough of its elastic holding tension.",
          },
          {
            id: "B",
            text: "The baker used unbleached organic bread flour instead of self-rising flour.",
            isCorrect: false,
            rationale: "Artisan sourdough strictly requires unbleached high-protein flour, never chemical self-rising flour.",
          },
          {
            id: "C",
            text: "The Dutch oven was not preheated for at least 45 minutes.",
            isCorrect: false,
            rationale: "Dutch oven temperature affects oven spring and crust blister, not pre-bake bench dough elasticity.",
          },
          {
            id: "D",
            text: "Too much rice flour was applied to the proofing banneton basket.",
            isCorrect: false,
            rationale: "Rice flour prevents sticking to rattan cane; it does not degrade internal dough matrix.",
          },
        ],
      },
      {
        id: "s-q3",
        questionNumber: 3,
        practicalCue: "OVEN SPRING & STEAM // SCORING ANGLE",
        scenario: "To achieve a dramatic, upright 'ear' and open belly expansion, at what angle should the razor lame slash the cold dough skin prior to loading into the 240°C Dutch oven?",
        options: [
          {
            id: "A",
            text: "A low 30-degree shallow angle relative to the dough surface, cutting 0.5 inches deep to create a lifting flap.",
            isCorrect: true,
            rationale: "A shallow 30° undercut creates an upper lip that curls upward as expanding steam forces the belly open into a crisp, pronounced ear.",
          },
          {
            id: "B",
            text: "A vertical 90-degree straight downward cut right along the center meridian.",
            isCorrect: false,
            rationale: "A 90° cut opens symmetrically sideways like a trench, without lifting an ear.",
          },
          {
            id: "C",
            text: "Small superficial crosshatch pricks on the top skin with a fork.",
            isCorrect: false,
            rationale: "Fork pricks prevent expansion and cause blowout tears along the loaf bottom.",
          },
          {
            id: "D",
            text: "Do not score at all; allow natural volcanic fissures to open randomly.",
            isCorrect: false,
            rationale: "Unscored high-gluten sourdough traps steam until it ruptures unevenly at the crust base.",
          },
        ],
      },
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const { skillTitle, skillSummary, steps, skillSlug } = await req.json();

    if (!skillTitle || typeof skillTitle !== "string") {
      return NextResponse.json({ error: "skillTitle is required" }, { status: 400 });
    }

    // Check curated library first for instantaneous, handcrafted perfection
    const cleanSlug = (skillSlug || skillTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")).toLowerCase();
    for (const [key, exam] of Object.entries(CURATED_EXAMS)) {
      if (cleanSlug.includes(key) || key.includes(cleanSlug)) {
        return NextResponse.json({ exam });
      }
    }

    // Dynamic generation with GPT-4o-mini for all custom user-prompted crafts
    if (!process.env.OPENAI_API_KEY) {
      // Fallback generic physical diagnostic
      return NextResponse.json({
        exam: {
          examTitle: "Craftsman's Guild Practical Examination",
          craftTitle: skillTitle,
          craftHonorific: `Certified Master of ${skillTitle}`,
          passingScore: 2,
          questions: [
            {
              id: "fallback-q1",
              questionNumber: 1,
              practicalCue: "SENSORY DIAGNOSIS // DRILL EXECUTION",
              scenario: `While executing the core techniques of ${skillTitle}, you notice your execution feels rushed and errors compound under fatigue. What is the fundamental deliberate practice correction?`,
              options: [
                {
                  id: "A",
                  text: "Slow down the mechanic to half-speed with zero errors, cementing correct neural pathways before gradually accelerating tempo.",
                  isCorrect: true,
                  rationale: "Deliberate practice proves that muscle memory encodes accuracy, not speed. Slowing down isolates error points.",
                },
                {
                  id: "B",
                  text: "Push through fatigue at double speed to build brute muscular endurance.",
                  isCorrect: false,
                  rationale: "Practicing through sloppy fatigue reinforces faulty motor patterns.",
                },
                {
                  id: "C",
                  text: "Skip foundational drills and proceed immediately to the most complex performance pieces.",
                  isCorrect: false,
                  rationale: "Advanced drills collapse without stable foundational micro-mechanics.",
                },
                {
                  id: "D",
                  text: "Discontinue all practice for 30 days to reset mental fatigue.",
                  isCorrect: false,
                  rationale: "Prolonged inactivity induces motor decay rather than refined habituation.",
                },
              ],
            },
          ],
        },
      });
    }

    const stepsList = Array.isArray(steps)
      ? steps.map((s: { title?: string; instructions?: string }, idx: number) => `Step ${idx + 1} (${s.title || "Drill"}): ${s.instructions || ""}`).join("\n")
      : "";

    const prompt = `You are Archimedes, Master Polymath and Grand Proctor of the Skillora Craftsman's Guild.
A journeyman learner has completed all physical drills for the discipline: "${skillTitle}".
Summary of Craft: "${skillSummary || ""}"
Curriculum Steps:
${stepsList}

Construct an official 3-question Diagnostic Guild Certification Exam for this discipline.

CRITICAL CRAFTSMANSHIP RULES:
1. NEVER ask superficial book trivia, history, or multiple-choice definitions.
2. Ask REAL-WORLD PHYSICAL SCENARIOS, SENSORY DIAGNOSTICS, AND MUSCLE-MEMORY TROUBLESHOOTING.
   The questions must test practical tactile mastery, troubleshooting subtle errors, and sensory cues (visual, tactile, auditory, or timing).
3. Generate EXACTLY 3 questions. Each question must have 4 options (A, B, C, D) with exactly ONE correct answer and detailed rationales for each option.
4. Output STRICT JSON matching this schema:
{
  "examTitle": "Official Craftsman's Guild Certification Exam",
  "craftTitle": "${skillTitle}",
  "craftHonorific": "e.g. Master Barista, Artisan Baker, Classical Guitarist, Polyglot, Sourdough Artisan",
  "passingScore": 2,
  "questions": [
    {
      "id": "q1",
      "questionNumber": 1,
      "scenario": "A 2-3 sentence physical problem, error symptom, or practical troubleshooting situation.",
      "practicalCue": "SENSORY DIAGNOSIS // PHYSICAL PHENOMENON",
      "options": [
        { "id": "A", "text": "...", "isCorrect": false, "rationale": "..." },
        { "id": "B", "text": "...", "isCorrect": true, "rationale": "..." },
        { "id": "C", "text": "...", "isCorrect": false, "rationale": "..." },
        { "id": "D", "text": "...", "isCorrect": false, "rationale": "..." }
      ]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are the Grand Proctor of the Skillora Craftsman's Guild. Respond only with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from proctor AI");
    }

    const exam = JSON.parse(content);
    return NextResponse.json({ exam });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate guild exam";
    console.error("Guild Exam API error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
