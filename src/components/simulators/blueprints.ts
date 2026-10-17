import { Skill, SkillStep } from "@/types/database";

export interface BlueprintCheckpoint {
  id: string;
  label: string;
  detail: string;
}

export interface StepBlueprint {
  domainTag: string;
  focusObjective: string;
  checkpoints: BlueprintCheckpoint[];
  doneWhen: string;
  proTip: string;
}

export function deriveStepBlueprint(step: SkillStep, skill: Skill): StepBlueprint {
  const slug = `${skill.slug || ""} ${skill.title || ""} ${step.title || ""}`.toLowerCase();
  const stepNum = step.step_number || 1;
  const rawInstructions = step.instructions || "";

  if (slug.includes("guitar") || slug.includes("fingerstyle")) {
    if (stepNum === 1) {
      return {
        domainTag: "Acoustic technique · Thumb anchor",
        focusObjective: "Anchor thumb (P) on bass strings and isolate finger plucking with quiet, relaxed wrists.",
        checkpoints: [
          {
            id: "chk-g1-1",
            label: "Hand & Thumb Anchor",
            detail: "Rest right-hand thumb gently on low E/A/D strings; float palm without resting on soundboard.",
          },
          {
            id: "chk-g1-2",
            label: "Knuckle Stroke Isolation",
            detail: "Pluck Index (I), Middle (M), and Ring (A) using big knuckle joints with zero forearm jerk.",
          },
          {
            id: "chk-g1-3",
            label: "String Ring Clarity",
            detail: "Ensure each plucked treble string rings clearly without fret buzz or muting adjacent strings.",
          },
        ],
        doneWhen: "Pluck 10 clean isolated strokes across all 3 fingers with zero wrist movement.",
        proTip: "Keep knuckles curved like holding a tennis ball; force comes from the base knuckle, not finger tips.",
      };
    }
    if (stepNum === 2) {
      return {
        domainTag: "Travis picking · Thumb independence",
        focusObjective: "Establish a steady 4/4 alternating bass pulse while plucking syncopated treble pinches.",
        checkpoints: [
          {
            id: "chk-g2-1",
            label: "Metronomic Bass Pulse",
            detail: "Alternate thumb between strings 6 and 4 strictly on beats 1, 2, 3, and 4 with steady tempo.",
          },
          {
            id: "chk-g2-2",
            label: "Off-Beat Treble Pinch",
            detail: "Pinch index and middle fingers on syncopated off-beats without slowing the bass pulse.",
          },
          {
            id: "chk-g2-3",
            label: "Dynamic Volume Balance",
            detail: "Keep bass notes punchy and firm while keeping treble melody notes articulate and light.",
          },
        ],
        doneWhen: "Loop the alternating bass groove for 60 seconds without dropping a quarter-note beat.",
        proTip: "Practice the thumb pulse alone until your thumb operates completely on autopilot.",
      };
    }
    if (stepNum === 3) {
      return {
        domainTag: "Chord changes · Keep the rhythm going",
        focusObjective: "Transition between C Major, G Major, and Am seamlessly under continuous right-hand rhythm.",
        checkpoints: [
          {
            id: "chk-g3-1",
            label: "Anchor Finger Pivot",
            detail: "Identify common pivot fingers between chord shapes to minimize hand lift distance.",
          },
          {
            id: "chk-g3-2",
            label: "Bass Note Synchronization",
            detail: "Fretting fingers must lock on beat 1 exactly with the bass pluck with zero hesitation.",
          },
          {
            id: "chk-g3-3",
            label: "No Tempo Lag",
            detail: "Never pause right-hand groove during chord changes; keep the pulse moving forward.",
          },
        ],
        doneWhen: "Switch between C Major, G Major, and Am across 4 bars with zero pause in right-hand rhythm.",
        proTip: "Look ahead to the next chord shape one beat before the transition begins.",
      };
    }
    return {
      domainTag: "Performance · Full arpeggio",
      focusObjective: "Execute rolling P-I-M-A-M-I arpeggios with musical dynamics and expressive tone.",
      checkpoints: [
        {
          id: "chk-g4-1",
          label: "Rolling Arpeggio Stream",
          detail: "Maintain an even, flowing stream of notes with no accidental dynamic spikes.",
        },
        {
          id: "chk-g4-2",
          label: "Pinch Attack Control",
          detail: "Strike bass and melody simultaneously with crisp micro-timing and zero string drag.",
        },
        {
          id: "chk-g4-3",
          label: "Musical Voicing",
          detail: "Accent the melody notes slightly above the quiet bass accompaniment.",
        },
      ],
      doneWhen: "Perform the complete 4-chord rolling arpeggio progression smoothly twice from memory.",
      proTip: "Listen for balance: let the higher melody sing over a gentle, supportive bass floor.",
    };
  }

  if (slug.includes("cyrillic") || slug.includes("russian") || slug.includes("alphabet")) {
    if (stepNum === 1) {
      return {
        domainTag: "Phonetics · Familiar letters",
        focusObjective: "Identify identical Latin/Cyrillic glyphs and decode your first vocabulary anchors.",
        checkpoints: [
          {
            id: "chk-c1-1",
            label: "Visual Identification",
            detail: "Instantly recognize A, K, M, O, and T as exact equivalents to Latin letters.",
          },
          {
            id: "chk-c1-2",
            label: "Crisp Vocalization",
            detail: "Pronounce vowel and consonant combinations aloud with unhesitating phonetic sounds.",
          },
          {
            id: "chk-c1-3",
            label: "Word Decoding",
            detail: "Read 3-letter anchor words (e.g., KOT, TOM, AKT) immediately without mental hesitation.",
          },
        ],
        doneWhen: "Read 5 cognate vocabulary words aloud within 5 seconds without hesitation.",
        proTip: "Trust your eyes on these 5 letters; they sound identical to English.",
      };
    }
    if (stepNum === 2) {
      return {
        domainTag: "Retraining your eye · False friends",
        focusObjective: "Overcome optical interference by re-mapping familiar letter shapes to their true Cyrillic sounds.",
        checkpoints: [
          {
            id: "chk-c2-1",
            label: "Sound Remapping",
            detail: "Read B as 'V', P as rolled 'R', H as 'N', C as 'S', Y as 'U', and X as 'Kh'.",
          },
          {
            id: "chk-c2-2",
            label: "Vocal Drill",
            detail: "Speak loanwords like PECTOPAH ('Restoran') aloud, suppressing Latin reading habits.",
          },
          {
            id: "chk-c2-3",
            label: "Flashcard Test",
            detail: "Score 100% on identifying the false friends in mixed word cards without pausing.",
          },
        ],
        doneWhen: "Decode loanword signage (like PECTOPAH or METPO) correctly on the first attempt.",
        proTip: "When you see 'P', mentally think 'Pirate Arrr' to immediately trigger the rolled R sound.",
      };
    }
    if (stepNum === 3) {
      return {
        domainTag: "Letter shapes · Sibilant sounds",
        focusObjective: "Master Greek derivative letters and produce distinct buzzing consonant sibilants.",
        checkpoints: [
          {
            id: "chk-c3-1",
            label: "Geometric Recognition",
            detail: "Distinguish Д (D), Г (G), П (P), and Л (L) by their distinct geometric roof and feet.",
          },
          {
            id: "chk-c3-2",
            label: "Buzzing Tongue Position",
            detail: "Position tongue against palate for Ж (zh like measure) and teeth for Ш/Щ.",
          },
          {
            id: "chk-c3-3",
            label: "Transit Map Drill",
            detail: "Pronounce 3 real metro station names accurately using these characters.",
          },
        ],
        doneWhen: "Distinguish and pronounce all 7 geometric glyphs correctly without looking up the cheat sheet.",
        proTip: "Think of П as a Goal Post (P) and Л as a Ladder leg (L).",
      };
    }
    return {
      domainTag: "Fluency · Reading real signs",
      focusObjective: "Read authentic Cyrillic street signs, menus, and headlines in real time.",
      checkpoints: [
        {
          id: "chk-c4-1",
          label: "Unassisted Sight Reading",
          detail: "Read full Cyrillic words left-to-right without letter-by-letter stalling.",
        },
        {
          id: "chk-c4-2",
          label: "Soft/Hard Sign Awareness",
          detail: "Recognize Ь and Ъ and adjust preceding consonant pronunciation.",
        },
        {
          id: "chk-c4-3",
          label: "Real Sign Decoding",
          detail: "Decode 5 real airport or transit signs accurately from sight.",
        },
      ],
      doneWhen: "Decode and vocalize any unfamiliar 6-letter Cyrillic word smoothly in under 3 seconds.",
      proTip: "Sound words out phonetically out loud; many Russian words are direct international loanwords.",
    };
  }

  if (slug.includes("bread") || slug.includes("sourdough") || slug.includes("dough") || slug.includes("baking")) {
    if (stepNum === 1) {
      return {
        domainTag: "Baking · Autolyse and hydration",
        focusObjective: "Combine flour and water to initiate enzymatic gluten breakdown and full flour hydration.",
        checkpoints: [
          {
            id: "chk-b1-1",
            label: "Dry Pocket Inspection",
            detail: "Mix until zero dry flour remains at the bottom of the mixing bowl.",
          },
          {
            id: "chk-b1-2",
            label: "Rest Period",
            detail: "Cover bowl and let rest for 30-45 minutes undisturbed for autolyse development.",
          },
          {
            id: "chk-b1-3",
            label: "Salt & Starter Integration",
            detail: "Dimple in active starter and salt evenly without tearing nascent gluten strands.",
          },
        ],
        doneWhen: "Dough feels noticeably smoother and more cohesive after resting without extensive kneading.",
        proTip: "Wet your hands with warm water before handling dough to prevent sticking without adding extra flour.",
      };
    }
    if (stepNum === 2) {
      return {
        domainTag: "Fermentation · Stretch and fold",
        focusObjective: "Build gluten matrix strength through timed stretch-and-fold rotations during bulk fermentation.",
        checkpoints: [
          {
            id: "chk-b2-1",
            label: "Four-Quadrant Pull",
            detail: "Reach under dough, pull edge upward gently, and fold over center in 4 quadrants.",
          },
          {
            id: "chk-b2-2",
            label: "Surface Tension Check",
            detail: "Observe dough dome rounding upwards and holding tension after each set.",
          },
          {
            id: "chk-b2-3",
            label: "Interval Cadence",
            detail: "Repeat folds every 30 minutes for 3-4 cycles, allowing dough to relax between passes.",
          },
        ],
        doneWhen: "Dough holds a smooth rounded dome shape in the bowl instead of puddling flat.",
        proTip: "Stop stretching the instant you feel resistance; overstretching tears the gluten strands.",
      };
    }
    if (stepNum === 3) {
      return {
        domainTag: "Gluten · Windowpane test",
        focusObjective: "Confirm optimal gluten alignment using the translucent windowpane membrane test.",
        checkpoints: [
          {
            id: "chk-b3-1",
            label: "Relaxed Sample",
            detail: "Pinch a small, golf-ball-sized portion of dough gently from the edge.",
          },
          {
            id: "chk-b3-2",
            label: "Two-Handed Stretch",
            detail: "Rotate and stretch the dough outward slowly between your thumbs and index fingers.",
          },
          {
            id: "chk-b3-3",
            label: "Light Transmission",
            detail: "Membrane stretches thin enough to see light or newspaper print through without tearing.",
          },
        ],
        doneWhen: "Dough forms a thin, translucent membrane that holds for 5 seconds without tearing.",
        proTip: "If it tears right away, gluten needs another 20 minutes of rest and one more fold cycle.",
      };
    }
    return {
      domainTag: "Shaping · Boule tension",
      focusObjective: "Pre-shape and tension a taut outer skin for explosive oven spring and open crumb.",
      checkpoints: [
        {
          id: "chk-b4-1",
          label: "Bench Knife Cupping",
          detail: "Use bench knife and cupped hand to drag dough across un-floured counter, building skin tension.",
        },
        {
          id: "chk-b4-2",
          label: "Seam Sealing",
          detail: "Transfer into floured banneton basket with seam facing up, pinching bottom together.",
        },
        {
          id: "chk-b4-3",
          label: "Razor Score & Steam",
          detail: "Score 1/4 inch deep at 30° angle and bake in preheated Dutch oven with steam.",
        },
      ],
      doneWhen: "Loaf achieves a prominent ear, blistered crispy crust, and hollow sound when tapped on the base.",
      proTip: "Chilling shaped dough in the fridge overnight makes scoring crisp and ensures maximum oven spring.",
    };
  }

  if (slug.includes("rubik") || slug.includes("cube") || slug.includes("puzzle")) {
    if (stepNum === 1) {
      return {
        domainTag: "Speedcubing · Finger tricks",
        focusObjective: "Train index and ring finger flicks to turn U and F layers without wrist movement.",
        checkpoints: [
          {
            id: "chk-r1-1",
            label: "Home Grip Position",
            detail: "Thumbs rest on front center caps; middle and ring fingers grip back center caps.",
          },
          {
            id: "chk-r1-2",
            label: "Index Finger Flick (U)",
            detail: "Flick top layer clockwise with right index finger tip; avoid whole-hand turn.",
          },
          {
            id: "chk-r1-3",
            label: "Index Push (U')",
            detail: "Push top layer counter-clockwise using left index finger or right index knuckle.",
          },
        ],
        doneWhen: "Execute 10 consecutive U and U' turns in under 3 seconds without regripping.",
        proTip: "Never move your wrists when turning the top layer; keep your hands relaxed and still.",
      };
    }
    if (stepNum === 2) {
      return {
        domainTag: "CFOP · First two layers (F2L)",
        focusObjective: "Pair corner and edge pieces in the top layer and insert into target slot simultaneously.",
        checkpoints: [
          {
            id: "chk-r2-1",
            label: "Color Match Inspection",
            detail: "Locate matching corner-edge pair and evaluate top face colors.",
          },
          {
            id: "chk-r2-2",
            label: "Pair Formation",
            detail: "Position pieces into aligned pair without breaking solved cross edges.",
          },
          {
            id: "chk-r2-3",
            label: "Direct Slot Insertion",
            detail: "Insert pair into back or front slot using R U R' or L' U' L sequence.",
          },
        ],
        doneWhen: "Insert 4 F2L pairs smoothly without pausing for more than 2 seconds between slots.",
        proTip: "Insert into back slots first so front slots remain visible for faster lookahead.",
      };
    }
    if (stepNum === 3) {
      return {
        domainTag: "Orientation · 2-look OLL",
        focusObjective: "Orient all yellow top-face pieces using trigger algorithms (F R U R' U' F').",
        checkpoints: [
          {
            id: "chk-r3-1",
            label: "Top Cross Trigger",
            detail: "Recognize dot, L-shape, or bar and apply F (R U R' U') F' to form yellow cross.",
          },
          {
            id: "chk-r3-2",
            label: "Corner Orientation (Sune)",
            detail: "Recognize Sune / Anti-Sune pattern and execute R U R' U R U2 R'.",
          },
          {
            id: "chk-r3-3",
            label: "Algorithm Speed",
            detail: "Execute the entire sequence in one continuous flow without stopping mid-turn.",
          },
        ],
        doneWhen: "Orient entire top yellow face within 4 seconds of finishing F2L.",
        proTip: "Memorize the pattern of yellow stickers, not the cube rotations.",
      };
    }
    return {
      domainTag: "Permutation · PLL",
      focusObjective: "Permute top layer corners and edges to complete the full solve.",
      checkpoints: [
        {
          id: "chk-r4-1",
          label: "Headlight Recognition",
          detail: "Scan for matching corner colors (headlights) on side faces.",
        },
        {
          id: "chk-r4-2",
          label: "Corner Swap Trigger",
          detail: "Fire corner swap algorithm fluidly from finger memory.",
        },
        {
          id: "chk-r4-3",
          label: "Edge Cycle (U-Perm)",
          detail: "Execute U-Perm (R U' R U R U R U' R' U' R2) to complete the cube.",
        },
      ],
      doneWhen: "Solve the entire cube from a randomized scramble in under 60 seconds.",
      proTip: "Keep your eyes looking at the next pieces while your fingers finish the current algorithm.",
    };
  }

  if (slug.includes("juggle") || slug.includes("juggling")) {
    if (stepNum === 1) {
      return {
        domainTag: "Juggling · The scoop and eye-level arc",
        focusObjective: "Master single-ball scoop toss reaching exact eye-height and landing in opposite palm.",
        checkpoints: [
          {
            id: "chk-j1-1",
            label: "Elbow Anchor",
            detail: "Keep elbows bent at 90 degrees at your waist; hands move in gentle inward scoops.",
          },
          {
            id: "chk-j1-2",
            label: "Eye-Level Apex",
            detail: "Every toss peaks precisely at forehead/eye height without sailing too high or low.",
          },
          {
            id: "chk-j1-3",
            label: "Blind Catch",
            detail: "Catch the ball without lunging forward or moving your feet from shoulder-width stance.",
          },
        ],
        doneWhen: "Toss and catch a single ball back-and-forth 20 times with zero foot movement.",
        proTip: "Practice standing in front of a wall or bed so you are not tempted to walk forward to catch bad throws.",
      };
    }
    if (stepNum === 2) {
      return {
        domainTag: "Cascade · Two-ball exchange",
        focusObjective: "Execute 1-2 exchange: throw ball B at the exact moment ball A reaches its peak arc.",
        checkpoints: [
          {
            id: "chk-j2-1",
            label: "Rhythmic Counting",
            detail: "Count aloud 'Throw, Throw, Catch, Catch' with even musical cadence.",
          },
          {
            id: "chk-j2-2",
            label: "No Hand-Offs",
            detail: "Both balls must be thrown upward in arcs; never hand the second ball across horizontally.",
          },
          {
            id: "chk-j2-3",
            label: "Identical Peak Heights",
            detail: "Both throws must reach identical eye-level summits.",
          },
        ],
        doneWhen: "Perform 10 consecutive clean two-ball exchanges starting from both right and left hands.",
        proTip: "Throw when the first ball reaches its peak; gravity gives you the exact time window.",
      };
    }
    if (stepNum === 3) {
      return {
        domainTag: "Flash · Three-ball launch",
        focusObjective: "Launch all 3 balls sequentially and catch all three (the 3-ball flash).",
        checkpoints: [
          {
            id: "chk-j3-1",
            label: "Dominant Hand Double Hold",
            detail: "Hold 2 balls in dominant hand (fingers vs palm) and 1 ball in non-dominant.",
          },
          {
            id: "chk-j3-2",
            label: "Continuous Throws",
            detail: "Throw 1, 2, 3 sequentially on the peak of each preceding ball before catching.",
          },
          {
            id: "chk-j3-3",
            label: "Complete Catches",
            detail: "Catch 1, 2, and 3 cleanly without dropping or lunging.",
          },
        ],
        doneWhen: "Execute the 3-ball flash and secure all 3 catches cleanly 5 times in a row.",
        proTip: "Focus entirely on accurate throws; good catches are simply the automatic result of good throws.",
      };
    }
    return {
      domainTag: "Cascade · 20 catches",
      focusObjective: "Maintain an uninterrupted 3-ball cascade with relaxed breathing and steady posture.",
      checkpoints: [
        {
          id: "chk-j4-1",
          label: "Relaxed Shoulders",
          detail: "Keep shoulders dropped and breathe naturally without tensing neck muscles.",
        },
        {
          id: "chk-j4-2",
          label: "Planar Control",
          detail: "Balls stay in a flat vertical plane in front of your chest without drifting forward.",
        },
        {
          id: "chk-j4-3",
          label: "Continuous Rhythm",
          detail: "Maintain an even, metronomic left-right rhythm across 20+ catches.",
        },
      ],
      doneWhen: "Sustain a continuous 3-ball cascade for 20 clean catches and catch all balls to a full stop.",
      proTip: "If you feel rushed, throw slightly higher to give your hands more reaction time.",
    };
  }

  if (
    slug.includes("code") ||
    slug.includes("coding") ||
    slug.includes("program") ||
    slug.includes("software") ||
    slug.includes("python") ||
    slug.includes("javascript") ||
    slug.includes("typescript") ||
    slug.includes("react") ||
    slug.includes("web")
  ) {
    return {
      domainTag: "Software · What done looks like",
      focusObjective: rawInstructions.slice(0, 120) || "Implement clean modular logic and verify test assertions.",
      checkpoints: [
        {
          id: `chk-code-${stepNum}-1`,
          label: "Interface & Signature Setup",
          detail: "Define parameters, return types, and variables with clear, self-documenting naming.",
        },
        {
          id: `chk-code-${stepNum}-2`,
          label: "Logic & Boundary Checks",
          detail: "Implement core algorithmic flow and guard against empty, null, or out-of-range edge cases.",
        },
        {
          id: `chk-code-${stepNum}-3`,
          label: "Terminal & Test Verification",
          detail: "Execute code in terminal or test suite and assert expected outputs match actual return values.",
        },
      ],
      doneWhen: "Code executes cleanly and passes all assertions without runtime exceptions or warnings.",
      proTip: "Write test assertions for edge cases before verifying the primary happy path.",
    };
  }

  const sentences = rawInstructions
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const primaryObj = sentences[0] || `${step.title}: Execute deliberate practice drill.`;
  const detailA = sentences[1] || "Set up posture, equipment, or baseline mental model cleanly.";
  const detailB = sentences[2] || "Execute core mechanical motion or drill deliberately without rushing.";

  return {
    domainTag: `Deliberate practice · Drill ${stepNum}`,
    focusObjective: primaryObj,
    checkpoints: [
      {
        id: `chk-gen-${stepNum}-1`,
        label: "Setup & Alignment",
        detail: detailA,
      },
      {
        id: `chk-gen-${stepNum}-2`,
        label: "Form & Execution Control",
        detail: detailB,
      },
      {
        id: `chk-gen-${stepNum}-3`,
        label: "Quality Self-Check",
        detail: "Inspect result against the standard and verify zero strain or hesitation before advancing.",
      },
    ],
    doneWhen: `Execute ${step.title.toLowerCase()} smoothly with consistent precision and no hesitation.`,
    proTip: "Perform the drill at half-speed first to engrain clean form before increasing pace.",
  };
}
