import { Skill, SkillStep } from "@/types/database";

export type DisciplineCategory =
  | "coding"
  | "language"
  | "music"
  | "typing"
  | "culinary_coffee"
  | "culinary_knife"
  | "culinary_general"
  | "puzzle"
  | "juggling"
  | "general";

export interface CoachSuggestion {
  label: string;
  question: string;
}

export interface DisciplinePracticeProfile {
  disciplineCategory: DisciplineCategory;
  tagLabel: string;
  isRhythmCadenceSupported: boolean;
  cadenceLabel?: string;
  defaultBpm?: number;
  metricHeading: string;
  metricUnitNoun: string;
  actionButtonLabel: string;
  guidanceTip: string;
  suggestedSprintMinutes: number;
  recallPrompts: {
    hard: { title: string; desc: string };
    solid: { title: string; desc: string };
    effortless: { title: string; desc: string };
  };
  // Technique Coach Tray fields
  coachButtonLabel: string;
  coachTitle: string;
  coachInputPlaceholder: string;
  coachDiagnosingLabel: string;
  coachSecondCardLabel: string;
  coachSuggestions: CoachSuggestion[];
  mnemonicAnchorLabel: string;
}

/**
 * Intelligently analyzes any discipline, skill metadata, and current step
 * to return an accurate, contextual deliberate practice profile.
 *
 * Replaces generic "reps" with discipline-specific metrics:
 * - Coding: Code Milestones / Runs / Debug Cycles
 * - Languages: Flashcard Recall / Glyph Pronunciations
 * - Espresso: Shots Pulled & Weighed
 * - Knife Sharpening: 15° Water Stone Stroke Sets
 * - Touch Typing: Keystroke Speed Bursts
 * - Guitar / Music: Rhythmic Pattern Loops
 * - Rubik's Cube: Algorithm Triggers & Solves
 */
export function getDisciplinePracticeProfile(
  skill?: Skill | null,
  step?: SkillStep | null
): DisciplinePracticeProfile {
  if (!skill) {
    return getDefaultProfile();
  }

  const textToScan = [
    skill.title || "",
    skill.slug || "",
    skill.summary || "",
    skill.category_id || "",
    step?.title || "",
    step?.instructions || "",
  ]
    .join(" ")
    .toLowerCase();

  // 1. Coding / Tech / Software Engineering / Python / JS
  const isCoding =
    skill.category_id === "44444444-4444-4444-4444-444444444444" ||
    skill.category_id === "cat-tech" ||
    /\b(code|coding|software|developer|programming|python|javascript|typescript|react|html|css|frontend|backend|web|git|terminal|api|sql|database|functions?|debug|component|calculator|app|scripting)\b/.test(
      textToScan
    );

  if (isCoding) {
    return {
      disciplineCategory: "coding",
      tagLabel: "SOFTWARE ARCHITECTURE // CODE RUNS",
      isRhythmCadenceSupported: false,
      metricHeading: "CODE MILESTONES & ITERATIONS",
      metricUnitNoun: "code milestones / runs",
      actionButtonLabel: "Log Milestone / Code Run (+1)",
      guidanceTip:
        "Log each function written, test suite run, bug resolved, or project component verified in your editor.",
      suggestedSprintMinutes: 20,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Debugging Friction",
          desc: "Encountered frequent syntax hurdles or logic bugs. Review syntax and re-test tomorrow.",
        },
        solid: {
          title: "[ 2 ] Clean Flow",
          desc: "Implemented functionality cleanly with clear logic and minimal pauses. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Second Nature",
          desc: "Architecture and patterns flowed intuitively without consulting docs. Cemented in memory.",
        },
      },
      coachButtonLabel: "Ask Code Coach",
      coachTitle: "Technique Coach — Syntax & Logic Architecture",
      coachInputPlaceholder: "Ask about syntax errors, logic patterns, edge cases, or debugging...",
      coachDiagnosingLabel: "Analyzing code architecture & logic patterns...",
      coachSecondCardLabel: "Core Mental Model & Pattern:",
      coachSuggestions: [
        {
          label: "Syntax or Logic bug?",
          question: "My code is throwing errors or unexpected outputs. How do I debug the root cause?",
        },
        {
          label: "Step-by-step code pattern?",
          question: "Can you break down a clean, idiomatic code pattern for this step?",
        },
        {
          label: "3-minute debugging drill",
          question: "Give me a 3-minute hands-on debugging or edge-case testing drill for this step.",
        },
      ],
      mnemonicAnchorLabel: "Mental Model / Syntax Rule:",
    };
  }

  // 2. Touch Typing
  const isTyping =
    /\b(typing|touch type|touch-typing|keyboard|wpm|home row|keystroke)\b/.test(
      textToScan
    );

  if (isTyping) {
    return {
      disciplineCategory: "typing",
      tagLabel: "MOTOR CADENCE // KEYSTROKE SPEED",
      isRhythmCadenceSupported: true,
      cadenceLabel: "Keystroke Cadence",
      defaultBpm: 80,
      metricHeading: "TYPING SPRINTS & DRILLS",
      metricUnitNoun: "speed bursts completed",
      actionButtonLabel: "Log Typing Sprint (+1)",
      guidanceTip:
        "Log each 1-minute speed burst or paragraph test completed without looking at your keyboard.",
      suggestedSprintMinutes: 15,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Stiff / Mis-hits",
          desc: "Finger search pauses or frequent typos on ring/pinky fingers. Review tomorrow.",
        },
        solid: {
          title: "[ 2 ] Steady Cadence",
          desc: "Consistent rhythmic cadence across home row with 95%+ accuracy. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Subconscious Speed",
          desc: "Words flow straight from mind to screen without conscious keystroke thought. Cemented.",
        },
      },
      coachButtonLabel: "Ask Typing Coach",
      coachTitle: "Technique Coach — Home Row Cadence & Speed Diagnostic",
      coachInputPlaceholder: "Ask about home row bumps, ring/pinky reach, or typing rhythm...",
      coachDiagnosingLabel: "Analyzing keystroke mechanics & cadence...",
      coachSecondCardLabel: "Home Row Tactile Anchor:",
      coachSuggestions: [
        {
          label: "Pinky / Ring hesitation?",
          question: "My pinky and ring fingers hesitate or search for keys. How do I train them to actuate cleanly?",
        },
        {
          label: "Touch typing without looking?",
          question: "How do I maintain tactile touch on the F and J bumps without looking down?",
        },
        {
          label: "3-minute speed burst drill",
          question: "Give me a 3-minute metronome burst drill to lock in home-row muscle memory.",
        },
      ],
      mnemonicAnchorLabel: "Tactile Key Anchor:",
    };
  }

  // 3. Languages & Alphabets
  const isLanguage =
    skill.category_id === "22222222-2222-2222-2222-222222222222" ||
    skill.category_id === "cat-language" ||
    /\b(cyrillic|language|alphabet|script|russian|japanese|spanish|french|german|chinese|mandarin|hangul|korean|arabic|kana|vocab|grammar|phonetic|pronunciation|glyph)\b/.test(
      textToScan
    );

  if (isLanguage) {
    return {
      disciplineCategory: "language",
      tagLabel: "LINGUISTICS // PHONETIC RECALL",
      isRhythmCadenceSupported: false,
      metricHeading: "GLYPH & PHRASE DRILLS",
      metricUnitNoun: "glyphs / phrases practiced",
      actionButtonLabel: "Log Recall Drill (+1)",
      guidanceTip:
        "Log each character written, flashcard recognized without hesitation, or spoken sentence articulated.",
      suggestedSprintMinutes: 15,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Hesitant Recall",
          desc: "Required active conscious translation or mistook false friends. Review tomorrow.",
        },
        solid: {
          title: "[ 2 ] Fluid Recognition",
          desc: "Quick, confident phonetic recall with natural tongue and mouth shape. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Instant Cognition",
          desc: "Glyphs and sounds read as immediately as your native alphabet. Cemented.",
        },
      },
      coachButtonLabel: "Ask Linguistics Coach",
      coachTitle: "Technique Coach — Phonetic & Script Diagnostic",
      coachInputPlaceholder: "Ask about pronunciation, phonetic mouth shapes, or alphabet rules...",
      coachDiagnosingLabel: "Diagnosing phonetics & articulation...",
      coachSecondCardLabel: "Phonetic / Tongue Anchor:",
      coachSuggestions: [
        {
          label: "Mouth & Tongue position?",
          question: "How do I position my tongue, teeth, and lips to articulate this sound correctly?",
        },
        {
          label: "Confusing false friends?",
          question: "Why am I confusing these glyphs or words, and how do I distinguish them instantly?",
        },
        {
          label: "3-minute phonetic drill",
          question: "Give me a 3-minute rapid phonetic vocalization drill for this step.",
        },
      ],
      mnemonicAnchorLabel: "Phonetic / Visual Anchor:",
    };
  }

  // 4. Espresso & Coffee
  const isCoffee = /\b(espresso|coffee|dialing|extraction|barista|latte|pour-over|grinder)\b/.test(
    textToScan
  );

  if (isCoffee) {
    return {
      disciplineCategory: "culinary_coffee",
      tagLabel: "CRAFT ATELIER // EXTRACTION DIAL",
      isRhythmCadenceSupported: false,
      metricHeading: "SHOT EXTRACTIONS & TASTES",
      metricUnitNoun: "extraction tests dialed",
      actionButtonLabel: "Log Shot Pulled (+1)",
      guidanceTip:
        "Log each 1:2 extraction test, grind size distribution tweak, or sensory taste evaluation.",
      suggestedSprintMinutes: 15,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Channeling / Sour",
          desc: "Flow ran unevenly or tasted astringent/sour. Recalibrate dose & grind tomorrow.",
        },
        solid: {
          title: "[ 2 ] Balanced Sweetness",
          desc: "Steady 25-30s extraction with rich crema and balanced acidity. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Master Dial",
          desc: "Perfect visual puck preparation and textbook sweet, rounded body. Cemented.",
        },
      },
      coachButtonLabel: "Ask Barista Coach",
      coachTitle: "Technique Coach — Extraction & Dial Diagnostic",
      coachInputPlaceholder: "Ask about puck prep, grind distribution, flow rate, or extraction...",
      coachDiagnosingLabel: "Analyzing extraction parameters...",
      coachSecondCardLabel: "Sensory & Tactile Cue:",
      coachSuggestions: [
        {
          label: "Channeling / Sour flow?",
          question: "My shot is pulling unevenly, spraying, or tasting sour. What is causing the channeling?",
        },
        {
          label: "Grind vs Dose balance?",
          question: "Should I adjust grind size finer or tweak the dose weight to balance this extraction?",
        },
        {
          label: "3-minute puck prep drill",
          question: "Give me a 3-minute puck distribution and level tamp consistency drill.",
        },
      ],
      mnemonicAnchorLabel: "Tactile Sensory Anchor:",
    };
  }

  // 5. Knife Sharpening
  const isKnife = /\b(knife|sharpen|whetstone|blade|burr|apex|grit|water stone)\b/.test(
    textToScan
  );

  if (isKnife) {
    return {
      disciplineCategory: "culinary_knife",
      tagLabel: "TACTILE CRAFT // EDGE GEOMETRY",
      isRhythmCadenceSupported: false,
      metricHeading: "WATER STONE STROKE SETS",
      metricUnitNoun: "15° stroke sets",
      actionButtonLabel: "Log Stroke Set (+1)",
      guidanceTip:
        "Log each set of 10 alternating 15° strokes across the water stone or tactile burr checks.",
      suggestedSprintMinutes: 15,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Inconsistent Angle",
          desc: "Wrist wobbled or burr felt uneven along the belly. Review angle control tomorrow.",
        },
        solid: {
          title: "[ 2 ] Clean Burr Apex",
          desc: "Uniform angle maintained; micro-burr formed cleanly along whole edge. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Razor Legato",
          desc: "Effortless, steady pass geometry with paper-slicing sharpness. Cemented.",
        },
      },
      coachButtonLabel: "Ask Bladesmith Coach",
      coachTitle: "Technique Coach — Blade Geometry & Angle Diagnostic",
      coachInputPlaceholder: "Ask about 15° water stone strokes, burr detection, or whetstone technique...",
      coachDiagnosingLabel: "Diagnosing edge angle & burr geometry...",
      coachSecondCardLabel: "Blade Angle & Apex Anchor:",
      coachSuggestions: [
        {
          label: "Angle wobbling?",
          question: "My wrist is wobbling on the pass. How do I lock my bevel angle at consistent 15 degrees?",
        },
        {
          label: "Burr apex detection?",
          question: "How do I feel whether the micro-burr has fully apexed along the entire blade edge?",
        },
        {
          label: "3-minute stroke drill",
          question: "Give me a 3-minute alternating stroke consistency drill on the water stone.",
        },
      ],
      mnemonicAnchorLabel: "Tactile Burr Anchor:",
    };
  }

  // 6. Sourdough & Baking
  const isBaking = /\b(sourdough|bread|ferment|dough|baking|proofing|starter)\b/.test(
    textToScan
  );

  if (isBaking) {
    return {
      disciplineCategory: "culinary_general",
      tagLabel: "CULINARY CRAFT // FERMENTATION LOOPS",
      isRhythmCadenceSupported: false,
      metricHeading: "FOLD CYCLES & SHAPES",
      metricUnitNoun: "technique cycles completed",
      actionButtonLabel: "Log Technique Cycle (+1)",
      guidanceTip:
        "Log each stretch-and-fold interval, dough elasticity test, or loaf shaping pass.",
      suggestedSprintMinutes: 15,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Sticky / Weak Tension",
          desc: "Dough lacked gluten structure or tore during shaping. Review tomorrow.",
        },
        solid: {
          title: "[ 2 ] Taut Skin",
          desc: "Strong surface tension and buoyant air pockets developed cleanly. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Baker's Intuition",
          desc: "Subconscious feel for hydration and fermentation timing. Cemented.",
        },
      },
      coachButtonLabel: "Ask Artisan Baker Coach",
      coachTitle: "Technique Coach — Fermentation & Dough Diagnostic",
      coachInputPlaceholder: "Ask about fermentation timing, gluten windowpane, or dough hydration...",
      coachDiagnosingLabel: "Analyzing gluten elasticity & fermentation...",
      coachSecondCardLabel: "Dough Feel & Surface Tension:",
      coachSuggestions: [
        {
          label: "Dough tearing / sticky?",
          question: "My dough is tearing and sticking to my hands. How do I build gluten structure?",
        },
        {
          label: "Windowpane tension test?",
          question: "How do I perform the windowpane test to know the dough is ready for proofing?",
        },
        {
          label: "3-minute folding drill",
          question: "Give me a 3-minute stretch-and-fold technique drill to build strong surface tension.",
        },
      ],
      mnemonicAnchorLabel: "Texture & Tension Anchor:",
    };
  }

  // 7. Rubik's Cube & Spatial Puzzles
  const isPuzzle = /\b(rubik|cube|puzzle|cfop|f2l|oll|pll|fingertrick)\b/.test(
    textToScan
  );

  if (isPuzzle) {
    return {
      disciplineCategory: "puzzle",
      tagLabel: "SPATIAL MECHANIC // ALGORITHM EXECUTION",
      isRhythmCadenceSupported: false,
      metricHeading: "ALGORITHM DRILLS & SOLVES",
      metricUnitNoun: "algorithm triggers / solves",
      actionButtonLabel: "Log Solve / Algorithm (+1)",
      guidanceTip:
        "Log each clean execution of the finger-trick sequence or full cross/layer solve.",
      suggestedSprintMinutes: 15,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Pauses / Regrips",
          desc: "Stumbled on move sequence or required active eye-tracking of steps. Review tomorrow.",
        },
        solid: {
          title: "[ 2 ] Fluid Fingertricks",
          desc: "Executed sequence with minimal regrips and smooth layer turns. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Instant Muscle Memory",
          desc: "Fingers executed algorithm automatically upon visual pattern trigger. Cemented.",
        },
      },
      coachButtonLabel: "Ask Speedcube Coach",
      coachTitle: "Technique Coach — Fingertrick & Algorithm Diagnostic",
      coachInputPlaceholder: "Ask about fingertrick execution, algorithm notation, or cube regrips...",
      coachDiagnosingLabel: "Analyzing fingertrick ergonomics...",
      coachSecondCardLabel: "Fingertrick Trigger Anchor:",
      coachSuggestions: [
        {
          label: "Turn pauses / Regrips?",
          question: "I pause or regrip awkwardly mid-algorithm. How do I execute this sequence in one fluid motion?",
        },
        {
          label: "Index vs Ring triggers?",
          question: "Which exact finger pads should flick U, U', and F moves without moving the whole hand?",
        },
        {
          label: "3-minute algorithm drill",
          question: "Give me a 3-minute muscle memory repetition drill for this algorithm sequence.",
        },
      ],
      mnemonicAnchorLabel: "Spatial Fingertrick Anchor:",
    };
  }

  // 8. Guitar & Musical Instruments
  const isMusic =
    skill.category_id === "11111111-1111-1111-1111-111111111111" ||
    skill.category_id === "cat-music" ||
    /\b(guitar|fingerstyle|acoustic|piano|chords|music|travis|arpeggio|strum|violin|drums|plucking)\b/.test(
      textToScan
    );

  if (isMusic) {
    return {
      disciplineCategory: "music",
      tagLabel: "RHYTHMIC REPERTOIRE // MOTOR INDEPENDENCE",
      isRhythmCadenceSupported: true,
      cadenceLabel: "Metronome Pulse",
      defaultBpm: 60,
      metricHeading: "PATTERN REPETITIONS",
      metricUnitNoun: "rhythmic loops completed",
      actionButtonLabel: "Log Repetition (+1)",
      guidanceTip:
        "Log each clean 4-measure pattern loop or chord transition played without breaking tempo.",
      suggestedSprintMinutes: 15,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Stiff / Off-Beat",
          desc: "Thumb sped up or finger transitions hesitated off the pulse. Review tomorrow.",
        },
        solid: {
          title: "[ 2 ] Steady Groove",
          desc: "Locked in with the beat with relaxed forearm and clean tone. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Autonomous Pulse",
          desc: "Independent thumb and fingers moving without conscious thought. Cemented.",
        },
      },
      coachButtonLabel: "Ask Musician Coach",
      coachTitle: "Technique Coach — Fingerstyle & Rhythm Diagnostic",
      coachInputPlaceholder: "Ask about chord transitions, picking angle, rhythm pulse, or fretting...",
      coachDiagnosingLabel: "Analyzing finger independence & tempo...",
      coachSecondCardLabel: "Soundboard & Hand Posture Anchor:",
      coachSuggestions: [
        {
          label: "Thumb rushing the beat?",
          question: "My alternating bass thumb is speeding up and breaking time with the melody. How do I steady it?",
        },
        {
          label: "Fret buzz / Finger mute?",
          question: "My chords are buzzing or muting neighboring strings. What is the exact fretting fingertip angle?",
        },
        {
          label: "3-minute tempo loop drill",
          question: "Give me a 3-minute slow-tempo metronome loop drill to lock in this pattern.",
        },
      ],
      mnemonicAnchorLabel: "Rhythmic / Posture Anchor:",
    };
  }

  // 9. Juggling & Hand-Eye Coordination
  const isJuggling = /\b(juggle|juggling|cascade|toss|catch|coordination)\b/.test(
    textToScan
  );

  if (isJuggling) {
    return {
      disciplineCategory: "juggling",
      tagLabel: "MOTOR COORDINATION // THROW CADENCE",
      isRhythmCadenceSupported: true,
      cadenceLabel: "Throw Tempo",
      defaultBpm: 75,
      metricHeading: "CLEAN CATCH CYCLES",
      metricUnitNoun: "clean catch sequences",
      actionButtonLabel: "Log Catch Sequence (+1)",
      guidanceTip:
        "Log each consecutive 3-ball cascade run caught cleanly without dropped throws.",
      suggestedSprintMinutes: 15,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Rushed / Drops",
          desc: "Throws drifted forward or arms tensed up. Review throw height control tomorrow.",
        },
        solid: {
          title: "[ 2 ] Consistent Arc",
          desc: "Clean scoops and peak catches with relaxed shoulders. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Sightless Flow",
          desc: "Toss cadence felt automatic with effortless peripheral tracking. Cemented.",
        },
      },
      coachButtonLabel: "Ask Juggling Coach",
      coachTitle: "Technique Coach — Throw Cadence & Arc Diagnostic",
      coachInputPlaceholder: "Ask about cascade arc, throw timing, hand scoops, or eye tracking...",
      coachDiagnosingLabel: "Analyzing throw geometry & cadence...",
      coachSecondCardLabel: "Throw Arc & Release Anchor:",
      coachSuggestions: [
        {
          label: "Throws drifting forward?",
          question: "My throws are drifting forward away from my chest and making me run forward. How do I fix my release?",
        },
        {
          label: "Eye tracking & Vision?",
          question: "Should I look at the balls or look at the top peak of the arc?",
        },
        {
          label: "3-minute scoop drill",
          question: "Give me a 3-minute 2-ball scoop-and-toss timing drill to reset my cadence.",
        },
      ],
      mnemonicAnchorLabel: "Visual Arc Anchor:",
    };
  }

  return getDefaultProfile();
}

function getDefaultProfile(): DisciplinePracticeProfile {
  return {
    disciplineCategory: "general",
    tagLabel: "DELIBERATE PRACTICE // FOCUS SPRINT",
    isRhythmCadenceSupported: false,
    metricHeading: "PRACTICE CYCLES & DRILLS",
    metricUnitNoun: "practice cycles completed",
    actionButtonLabel: "Log Practice Cycle (+1)",
    guidanceTip:
      "Log each focused deliberate practice drill or technique milestone completed.",
    suggestedSprintMinutes: 15,
    recallPrompts: {
      hard: {
        title: "[ 1 ] Stiff / Unsure",
        desc: "Felt rusty or required active cerebral effort. Review tomorrow.",
      },
      solid: {
        title: "[ 2 ] Fluid Execution",
        desc: "Good accuracy and steady motor rhythm. Review in 3-4 days.",
      },
      effortless: {
        title: "[ 3 ] Second Nature",
        desc: "Automatic subconscious execution. Cemented in memory.",
      },
    },
    coachButtonLabel: "Ask Technique Coach",
    coachTitle: "Technique Coach — Deliberate Practice Diagnostic",
    coachInputPlaceholder: "Ask anything about this step's technique or practice drill...",
    coachDiagnosingLabel: "Diagnosing technique & mechanics...",
    coachSecondCardLabel: "Muscle Memory Anchor:",
    coachSuggestions: [
      {
        label: "Why does it feel stiff?",
        question: "My movement feels stiff or forced. How do I execute this smoothly?",
      },
      {
        label: "Core technique anchor?",
        question: "What is the single most critical physical or mental anchor for this step?",
      },
      {
        label: "3-minute corrective drill",
        question: "Give me a 3-minute deliberate practice corrective drill to lock in this step.",
      },
    ],
    mnemonicAnchorLabel: "Physical / Mental Anchor:",
  };
}
