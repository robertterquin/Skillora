"use client";

import React, { useState, useEffect } from "react";
import { Skill, SkillStep, LearningResource } from "@/types/database";
import { SolarIcon } from "../ui/SolarIcon";
import { playMechanicalClick, playChime } from "@/lib/workbench-audio";

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

/**
 * Intelligently generates informative, actionable deliberate practice blueprints
 * and verifiable quality checkpoints for any skill step.
 */
export function deriveStepBlueprint(step: SkillStep, skill: Skill): StepBlueprint {
  const slug = `${skill.slug || ""} ${skill.title || ""} ${step.title || ""}`.toLowerCase();
  const stepNum = step.step_number || 1;
  const rawInstructions = step.instructions || "";

  // 1. Acoustic Fingerstyle Guitar
  if (slug.includes("guitar") || slug.includes("fingerstyle")) {
    if (stepNum === 1) {
      return {
        domainTag: "ACOUSTIC TECHNIQUE // MOTOR ANCHOR",
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
        domainTag: "TRAVIS PICKING // THUMB INDEPENDENCE",
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
        domainTag: "CHORD TRANSITIONS // CONTINUOUS CADENCE",
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
      domainTag: "PERFORMANCE BENCHMARK // FULL ARPEGGIO",
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

  // 2. Cyrillic / Language Script
  if (slug.includes("cyrillic") || slug.includes("russian") || slug.includes("alphabet")) {
    if (stepNum === 1) {
      return {
        domainTag: "PHONETICS // COGNATE RECOGNITION",
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
        domainTag: "OPTICAL RE-CONDITIONING // FALSE FRIENDS",
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
        domainTag: "GLYPH GEOMETRY // SIBILANT SOUNDS",
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
      domainTag: "FLUENCY BENCHMARK // REAL-WORLD DECODING",
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

  // 3. Sourdough & Artisan Baking
  if (slug.includes("bread") || slug.includes("sourdough") || slug.includes("dough") || slug.includes("baking")) {
    if (stepNum === 1) {
      return {
        domainTag: "ARTISAN BAKING // AUTOLYSE & HYDRATION",
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
        domainTag: "FERMENTATION // STRETCH-AND-FOLD",
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
        domainTag: "GLUTEN MATRIX // WINDOWPANE TEST",
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
      domainTag: "SHAPING & OVEN SPRING // BOULE TENSION",
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

  // 4. Rubik's Cube & Speedcubing
  if (slug.includes("rubik") || slug.includes("cube") || slug.includes("puzzle")) {
    if (stepNum === 1) {
      return {
        domainTag: "SPEEDCUBING // FINGERTRICK MECHANICS",
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
        domainTag: "CFOP // FIRST TWO LAYERS (F2L)",
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
        domainTag: "ORIENTATION // 2-LOOK OLL",
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
      domainTag: "PERMUTATION // PLL EXECUTION",
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

  // 5. Juggling
  if (slug.includes("juggle") || slug.includes("juggling")) {
    if (stepNum === 1) {
      return {
        domainTag: "JUGGLING // THE SCOOP & EYE-LEVEL ARC",
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
        domainTag: "CASCADE // TWO-BALL EXCHANGE",
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
        domainTag: "FLASH // THREE-BALL CASCADE LAUNCH",
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
      domainTag: "CASCADE // 20-CATCH ENDURANCE",
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

  // 6. Coding / Software Development
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
      domainTag: "SOFTWARE ENGINEERING // EXECUTION CRITERIA",
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

  // 7. Universal Dynamic Blueprint for any other skill
  const sentences = rawInstructions
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const primaryObj = sentences[0] || `${step.title}: Execute deliberate practice drill.`;
  const detailA = sentences[1] || "Set up posture, equipment, or baseline mental model cleanly.";
  const detailB = sentences[2] || "Execute core mechanical motion or drill deliberately without rushing.";

  return {
    domainTag: `DELIBERATE PRACTICE // DRILL 0${stepNum}`,
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

export function StepActionBlueprint({
  step,
  skill,
  onOpenVideo,
  onCheckpointsComplete,
}: {
  step: SkillStep;
  skill: Skill;
  onOpenVideo?: (video: { url: string; title: string; stepTitle: string }) => void;
  onCheckpointsComplete?: (stepId: string) => void;
}) {
  const blueprint = deriveStepBlueprint(step, skill);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  // Reset checked map when step changes
  useEffect(() => {
    setCheckedMap({});
  }, [step.id]);

  const checkedCount = blueprint.checkpoints.filter((c) => checkedMap[c.id]).length;
  const isAllComplete = checkedCount === blueprint.checkpoints.length && blueprint.checkpoints.length > 0;

  const handleToggle = (checkpointId: string) => {
    playMechanicalClick();
    setCheckedMap((prev) => {
      const nextState = !prev[checkpointId];
      const updated = { ...prev, [checkpointId]: nextState };
      const newCount = blueprint.checkpoints.filter((c) => updated[c.id]).length;
      if (newCount === blueprint.checkpoints.length) {
        playChime();
        onCheckpointsComplete?.(step.id);
      }
      return updated;
    });
  };

  // Find first video resource if available
  const videoResource: LearningResource | undefined = step.resources?.find(
    (r) => r.resource_type === "video" || r.url.includes("youtube.com") || r.url.includes("youtu.be")
  );

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full my-3 p-4 sm:p-5 bg-surface border border-surface-border rounded-2xl corner-ticks text-ink shadow-xs select-none transition-all"
    >
      {/* 1. TOP SPEC RIBBON */}
      <div className="flex items-center justify-between text-3xs font-mono tracking-widest text-ink-muted uppercase mb-3 pb-2.5 border-b border-surface-border">
        <span className="flex items-center gap-1.5 font-bold">
          <SolarIcon name="clipboard-check-linear" className="w-3.5 h-3.5 text-accent-vermilion" />
          <span>{blueprint.domainTag}</span>
        </span>
        <span
          className={`font-bold transition font-mono ${
            isAllComplete ? "text-accent-emerald" : "text-accent-vermilion"
          }`}
        >
          {isAllComplete ? "3/3 VERIFIED" : `${checkedCount}/${blueprint.checkpoints.length} CHECKPOINTS`}
        </span>
      </div>

      {/* 2. CORE OBJECTIVE (Recessed warm-stone plate) */}
      <div className="p-3 bg-surface-subtle border border-surface-border/80 rounded-xl text-left mb-3">
        <div className="flex items-center gap-1.5 text-3xs font-mono font-bold text-ink-muted uppercase mb-1">
          <SolarIcon name="target-linear" className="w-3 h-3 text-accent-vermilion shrink-0" />
          <span>Core Drill Objective</span>
        </div>
        <p className="text-xs text-ink leading-relaxed font-medium">
          {blueprint.focusObjective}
        </p>
      </div>

      {/* 3. INTERACTIVE CHECKPOINTS MATRIX */}
      <div className="space-y-2 mb-3">
        {blueprint.checkpoints.map((chk, idx) => {
          const isChecked = Boolean(checkedMap[chk.id]);
          return (
            <div
              key={chk.id}
              onClick={() => handleToggle(chk.id)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                isChecked
                  ? "bg-accent-emerald-light/40 border-accent-emerald/40 text-ink"
                  : "bg-surface hover:bg-surface-subtle/60 border-surface-border text-ink shadow-2xs"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md mt-0.5 shrink-0 flex items-center justify-center border transition ${
                  isChecked
                    ? "bg-accent-emerald border-accent-emerald text-white"
                    : "border-surface-border bg-surface hover:border-accent-vermilion"
                }`}
              >
                {isChecked && <SolarIcon name="check-linear" className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xs font-bold font-mono tracking-wide ${
                      isChecked ? "text-accent-emerald" : "text-ink"
                    }`}
                  >
                    0{idx + 1}. {chk.label}
                  </span>
                </div>
                <p
                  className={`text-2xs leading-snug mt-0.5 ${
                    isChecked ? "text-accent-emerald/90 line-through opacity-80" : "text-ink-secondary"
                  }`}
                >
                  {chk.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. UTILITY TIER: MASTERY BENCHMARK & VIDEO LAUNCHER */}
      <div className="space-y-2 pt-1 border-t border-surface-border/60">
        <div
          className={`p-2.5 rounded-xl border text-left flex items-start gap-2 text-2xs transition ${
            isAllComplete
              ? "bg-accent-emerald-light/60 border-accent-emerald/50 text-accent-emerald font-semibold"
              : "bg-surface-subtle border-surface-border text-ink-secondary"
          }`}
        >
          <SolarIcon
            name={isAllComplete ? "check-circle-bold" : "flag-2-linear"}
            className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
              isAllComplete ? "text-accent-emerald" : "text-accent-vermilion"
            }`}
          />
          <div className="leading-tight">
            <strong>Done when:</strong> {blueprint.doneWhen}
          </div>
        </div>

        {/* Video Tutorial Launcher Quick-Pill (if video exists) */}
        {videoResource && onOpenVideo && (
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() =>
                onOpenVideo({
                  url: videoResource.url,
                  title: videoResource.platform_name,
                  stepTitle: step.title,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-subtle border border-surface-border text-ink text-2xs font-medium transition cursor-pointer shadow-2xs group"
            >
              <SolarIcon name="play-linear" className="w-3 h-3 text-accent-vermilion group-hover:scale-110 transition" />
              <span>Watch Video Drill: {videoResource.platform_name}</span>
              <SolarIcon name="square-arrow-right-up-linear" className="w-2.5 h-2.5 text-ink-muted" />
            </button>

            <span className="text-3xs font-mono text-ink-muted">
              ~{step.estimated_minutes} min sprint
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
