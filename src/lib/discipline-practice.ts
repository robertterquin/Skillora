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
  | "design"
  | "writing"
  | "communication"
  | "business"
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
 * Generates 3 contextual, high-value coach suggestion prompts
 * tailored to the exact course domain, skill title, and current step.
 */
export function generateCourseCoachSuggestions(
  category: DisciplineCategory,
  skill?: Skill | null,
  step?: SkillStep | null
): CoachSuggestion[] {
  const stepTitle = step?.title || "this step";
  const skillTitle = skill?.title || "this discipline";

  switch (category) {
    case "coding":
      return [
        {
          label: "Syntax or logic bug?",
          question: `My code is throwing errors or unexpected outputs during "${stepTitle}". How do I debug the root cause?`,
        },
        {
          label: "Clean code pattern?",
          question: `Can you break down a clean, idiomatic pattern and structure for "${stepTitle}"?`,
        },
        {
          label: "3-minute debugging drill",
          question: `Give me a 3-minute hands-on debugging or edge-case testing drill for "${stepTitle}".`,
        },
      ];

    case "language":
      return [
        {
          label: "Mouth shape & phonetics?",
          question: `How do I position my tongue, lips, and airflow to pronounce or read "${stepTitle}" accurately?`,
        },
        {
          label: "Memory & visual anchor?",
          question: `What is the most memorable mental anchor or visual mnemonic to recognize "${stepTitle}" instantly?`,
        },
        {
          label: "3-minute vocal drill",
          question: `Give me a 3-minute rapid vocalization and flashcard recall drill for "${stepTitle}".`,
        },
      ];

    case "music":
      return [
        {
          label: "String buzz or mute?",
          question: `My notes are buzzing or accidentally muting adjacent strings during "${stepTitle}". How do I correct my hand placement?`,
        },
        {
          label: "Tempo & rhythm pulse?",
          question: `My timing is speeding up or hesitating during "${stepTitle}". How do I lock in steady metronome time?`,
        },
        {
          label: "3-minute tempo drill",
          question: `Give me a 3-minute slow-tempo loop drill to cement muscle memory for "${stepTitle}".`,
        },
      ];

    case "culinary_knife":
      return [
        {
          label: "Angle wobbling (15°)?",
          question: `My wrist is wobbling on the stone pass. How do I lock my 15° bevel angle consistently for "${stepTitle}"?`,
        },
        {
          label: "Burr apex detection?",
          question: `How do I feel whether the micro-burr has fully apexed along the entire cutting edge in "${stepTitle}"?`,
        },
        {
          label: "3-minute stroke drill",
          question: `Give me a 3-minute alternating stroke consistency drill on the water stone for "${stepTitle}".`,
        },
      ];

    case "culinary_coffee":
      return [
        {
          label: "Channeling or sour flow?",
          question: `My shot is pulling unevenly or tasting sour/astringent during "${stepTitle}". What is causing the extraction issue?`,
        },
        {
          label: "Grind vs dose balance?",
          question: `Should I adjust grind size finer or tweak dose weight to balance extraction for "${stepTitle}"?`,
        },
        {
          label: "3-minute puck prep drill",
          question: `Give me a 3-minute puck distribution and level tamp consistency drill for "${stepTitle}".`,
        },
      ];

    case "culinary_general":
      return [
        {
          label: "Dough tearing or sticky?",
          question: `My dough is tearing and sticking to my hands during "${stepTitle}". How do I build gluten structure?`,
        },
        {
          label: "Windowpane & tension test?",
          question: `How do I test if gluten tension and fermentation are optimal for "${stepTitle}"?`,
        },
        {
          label: "3-minute folding drill",
          question: `Give me a 3-minute technique drill to build strong surface tension for "${stepTitle}".`,
        },
      ];

    case "puzzle":
      return [
        {
          label: "Turn pauses or regrips?",
          question: `I pause or regrip awkwardly mid-sequence during "${stepTitle}". How do I execute this fluidly?`,
        },
        {
          label: "Fingertrick pad trigger?",
          question: `Which exact finger pads should flick the layer turns for "${stepTitle}" without moving the whole hand?`,
        },
        {
          label: "3-minute algorithm drill",
          question: `Give me a 3-minute muscle memory repetition drill for "${stepTitle}".`,
        },
      ];

    case "typing":
      return [
        {
          label: "Pinky / ring hesitation?",
          question: `My pinky and ring fingers hesitate or search for keys during "${stepTitle}". How do I train them to actuate cleanly?`,
        },
        {
          label: "Home row touch bumps?",
          question: `How do I maintain tactile orientation on the F and J bumps without looking down during "${stepTitle}"?`,
        },
        {
          label: "3-minute speed burst",
          question: `Give me a 3-minute rhythm burst drill to lock in home-row muscle memory for "${stepTitle}".`,
        },
      ];

    case "juggling":
      return [
        {
          label: "Throws drifting forward?",
          question: `My throws are drifting forward away from my chest during "${stepTitle}". How do I fix my release angle?`,
        },
        {
          label: "Eye tracking & peak arc?",
          question: `Should I track individual balls or focus softly on the peak arc height for "${stepTitle}"?`,
        },
        {
          label: "3-minute scoop drill",
          question: `Give me a 3-minute scoop-and-toss timing drill to reset my cadence for "${stepTitle}".`,
        },
      ];

    case "design":
      return [
        {
          label: "Visual balance & hierarchy?",
          question: `How do I verify the visual hierarchy and alignment for "${stepTitle}" in ${skillTitle}?`,
        },
        {
          label: "Contrast & color harmony?",
          question: `How do I check if my contrast and color relationships work effectively for "${stepTitle}"?`,
        },
        {
          label: "3-minute design critique",
          question: `Give me a 3-minute visual critique exercise to spot flaws and polish "${stepTitle}".`,
        },
      ];

    case "writing":
      return [
        {
          label: "Opening hook & clarity?",
          question: `How do I make the opening hook punchier and eliminate fluff in "${stepTitle}"?`,
        },
        {
          label: "Narrative pacing & flow?",
          question: `How do I maintain momentum and smooth transitions between ideas in "${stepTitle}"?`,
        },
        {
          label: "3-minute editing drill",
          question: `Give me a 3-minute editing exercise to tighten and strengthen the writing in "${stepTitle}".`,
        },
      ];

    case "communication":
      return [
        {
          label: "Vocal delivery & fillers?",
          question: `How do I eliminate filler words and project calm confidence during "${stepTitle}"?`,
        },
        {
          label: "Body language & eye contact?",
          question: `What should my posture, eye contact, and hand gestures be focused on during "${stepTitle}"?`,
        },
        {
          label: "3-minute speaking drill",
          question: `Give me a 3-minute timed delivery drill to practice presenting "${stepTitle}".`,
        },
      ];

    case "business":
      return [
        {
          label: "Core numbers & assumptions?",
          question: `How do I validate the key assumptions and metrics behind "${stepTitle}" in ${skillTitle}?`,
        },
        {
          label: "Common beginner pitfall?",
          question: `What is the most expensive mistake people make when executing "${stepTitle}", and how do I prevent it?`,
        },
        {
          label: "3-minute scenario test",
          question: `Give me a 3-minute practical scenario to stress-test my understanding of "${stepTitle}".`,
        },
      ];

    default:
      return [
        {
          label: "Common mistake in step?",
          question: `What is the most common pitfall beginners run into during "${stepTitle}" in ${skillTitle}, and how do I avoid it?`,
        },
        {
          label: "Core rule of thumb?",
          question: `What is the single most critical principle or rule of thumb to master "${stepTitle}" in ${skillTitle}?`,
        },
        {
          label: "3-minute practice drill",
          question: `Give me a focused 3-minute deliberate practice exercise to test my mastery of "${stepTitle}".`,
        },
      ];
  }
}

/**
 * Intelligently analyzes any discipline, skill metadata, and current step
 * to return an accurate, contextual deliberate practice profile.
 */
export function getDisciplinePracticeProfile(
  skill?: Skill | null,
  step?: SkillStep | null
): DisciplinePracticeProfile {
  if (!skill) {
    return getDefaultProfile(null, step);
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
    /\b(code|coding|software|developer|programming|python|javascript|typescript|react|html|css|frontend|backend|web|git|terminal|api|sql|database|functions?|debug|component|calculator|app|scripting|algorithm|data structure|devops|cloud)\b/.test(
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
      coachTitle: `Code Coach — ${skill.title ? skill.title.slice(0, 24) : "Logic"} Diagnostic`,
      coachInputPlaceholder: "Ask about syntax errors, logic patterns, edge cases, or debugging...",
      coachDiagnosingLabel: "Analyzing code architecture & logic patterns...",
      coachSecondCardLabel: "Core Mental Model & Pattern:",
      coachSuggestions: generateCourseCoachSuggestions("coding", skill, step),
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
      coachSuggestions: generateCourseCoachSuggestions("typing", skill, step),
      mnemonicAnchorLabel: "Tactile Key Anchor:",
    };
  }

  // 3. Languages & Alphabets
  const isLanguage =
    skill.category_id === "22222222-2222-2222-2222-222222222222" ||
    skill.category_id === "cat-language" ||
    /\b(cyrillic|language|alphabet|script|russian|japanese|spanish|french|german|chinese|mandarin|hangul|korean|arabic|kana|vocab|grammar|phonetic|pronunciation|glyph|linguistics|fluency)\b/.test(
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
      coachTitle: `Linguistics Coach — ${skill.title ? skill.title.slice(0, 24) : "Phonetic"} Diagnostic`,
      coachInputPlaceholder: "Ask about pronunciation, phonetic mouth shapes, or alphabet rules...",
      coachDiagnosingLabel: "Diagnosing phonetics & articulation...",
      coachSecondCardLabel: "Phonetic / Tongue Anchor:",
      coachSuggestions: generateCourseCoachSuggestions("language", skill, step),
      mnemonicAnchorLabel: "Phonetic / Visual Anchor:",
    };
  }

  // 4. Espresso & Coffee
  const isCoffee = /\b(espresso|coffee|dialing|extraction|barista|latte|pour-over|grinder|crema)\b/.test(
    textToScan
  );

  if (isCoffee) {
    return {
      disciplineCategory: "culinary_coffee",
      tagLabel: "COFFEE // EXTRACTION DIAL",
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
      coachTitle: "Barista Coach — Extraction & Dial Diagnostic",
      coachInputPlaceholder: "Ask about puck prep, grind distribution, flow rate, or extraction...",
      coachDiagnosingLabel: "Analyzing extraction parameters...",
      coachSecondCardLabel: "Sensory & Tactile Cue:",
      coachSuggestions: generateCourseCoachSuggestions("culinary_coffee", skill, step),
      mnemonicAnchorLabel: "Tactile Sensory Anchor:",
    };
  }

  // 5. Knife Sharpening
  const isKnife = /\b(knife|sharpen|whetstone|blade|burr|apex|grit|water stone|bevel)\b/.test(
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
      coachTitle: "Bladesmith Coach — Blade Geometry & Angle Diagnostic",
      coachInputPlaceholder: "Ask about 15° water stone strokes, burr detection, or whetstone technique...",
      coachDiagnosingLabel: "Diagnosing edge angle & burr geometry...",
      coachSecondCardLabel: "Blade Angle & Apex Anchor:",
      coachSuggestions: generateCourseCoachSuggestions("culinary_knife", skill, step),
      mnemonicAnchorLabel: "Tactile Burr Anchor:",
    };
  }

  // 6. Sourdough & Baking / Culinary
  const isBaking = /\b(sourdough|bread|ferment|dough|baking|proofing|starter|cooking|culinary|chef|recipe|roasting|pan-sear)\b/.test(
    textToScan
  );

  if (isBaking) {
    return {
      disciplineCategory: "culinary_general",
      tagLabel: "CULINARY CRAFT // FERMENTATION & TECHNIQUE",
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
      coachButtonLabel: "Ask Culinary Coach",
      coachTitle: `Culinary Coach — ${skill.title ? skill.title.slice(0, 24) : "Kitchen"} Diagnostic`,
      coachInputPlaceholder: "Ask about fermentation timing, gluten windowpane, or dough hydration...",
      coachDiagnosingLabel: "Analyzing gluten elasticity & culinary technique...",
      coachSecondCardLabel: "Dough Feel & Surface Tension:",
      coachSuggestions: generateCourseCoachSuggestions("culinary_general", skill, step),
      mnemonicAnchorLabel: "Texture & Tension Anchor:",
    };
  }

  // 7. Rubik's Cube & Spatial Puzzles
  const isPuzzle = /\b(rubik|cube|puzzle|cfop|f2l|oll|pll|fingertrick|chess|sudoku)\b/.test(
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
      coachTitle: "Speedcube Coach — Fingertrick & Algorithm Diagnostic",
      coachInputPlaceholder: "Ask about fingertrick execution, algorithm notation, or cube regrips...",
      coachDiagnosingLabel: "Analyzing fingertrick ergonomics...",
      coachSecondCardLabel: "Fingertrick Trigger Anchor:",
      coachSuggestions: generateCourseCoachSuggestions("puzzle", skill, step),
      mnemonicAnchorLabel: "Spatial Fingertrick Anchor:",
    };
  }

  // 8. Guitar & Musical Instruments
  const isMusic =
    skill.category_id === "11111111-1111-1111-1111-111111111111" ||
    skill.category_id === "cat-music" ||
    /\b(guitar|fingerstyle|acoustic|piano|chords|music|travis|arpeggio|strum|violin|drums|plucking|tempo|rhythm|vocal|singing|bass|ukulele)\b/.test(
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
      coachTitle: `Musician Coach — ${skill.title ? skill.title.slice(0, 24) : "Acoustic"} Diagnostic`,
      coachInputPlaceholder: "Ask about chord transitions, picking angle, rhythm pulse, or fretting...",
      coachDiagnosingLabel: "Analyzing finger independence & tempo...",
      coachSecondCardLabel: "Soundboard & Hand Posture Anchor:",
      coachSuggestions: generateCourseCoachSuggestions("music", skill, step),
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
      coachTitle: "Juggling Coach — Throw Cadence & Arc Diagnostic",
      coachInputPlaceholder: "Ask about cascade arc, throw timing, hand scoops, or eye tracking...",
      coachDiagnosingLabel: "Analyzing throw geometry & cadence...",
      coachSecondCardLabel: "Throw Arc & Release Anchor:",
      coachSuggestions: generateCourseCoachSuggestions("juggling", skill, step),
      mnemonicAnchorLabel: "Visual Arc Anchor:",
    };
  }

  // 10. Design, UI/UX, & Photography
  const isDesign = /\b(design|ui|ux|figma|graphic|visual|layout|typography|photo|photography|camera|lens|lighting|sketch|drawing|illustration|render|color theory)\b/.test(
    textToScan
  );

  if (isDesign) {
    return {
      disciplineCategory: "design",
      tagLabel: "VISUAL CRAFT // COMPOSITION & HIERARCHY",
      isRhythmCadenceSupported: false,
      metricHeading: "DESIGN ITERATIONS & CRITIQUES",
      metricUnitNoun: "design iterations",
      actionButtonLabel: "Log Design Iteration (+1)",
      guidanceTip:
        "Log each layout pass, color balance adjustment, or visual critique milestone completed.",
      suggestedSprintMinutes: 20,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Cluttered / Unbalanced",
          desc: "Visual hierarchy felt muddy or focal point was unclear. Review contrast tomorrow.",
        },
        solid: {
          title: "[ 2 ] Clean Composition",
          desc: "Harmonious spacing, crisp hierarchy, and deliberate optical alignment. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Designer's Eye",
          desc: "Subconscious instinct for proportion, white space, and visual rhythm. Cemented.",
        },
      },
      coachButtonLabel: "Ask Design Coach",
      coachTitle: `Design Coach — ${skill.title ? skill.title.slice(0, 24) : "Visual"} Diagnostic`,
      coachInputPlaceholder: "Ask about layout hierarchy, spacing, color contrast, or visual balance...",
      coachDiagnosingLabel: "Analyzing visual composition & design hierarchy...",
      coachSecondCardLabel: "Visual Hierarchy & Alignment Anchor:",
      coachSuggestions: generateCourseCoachSuggestions("design", skill, step),
      mnemonicAnchorLabel: "Visual Composition Rule:",
    };
  }

  // 11. Writing, Copywriting, & Storytelling
  const isWriting = /\b(writing|writer|copywriting|story|storytelling|author|novel|blog|screenplay|essay|prose|editing|content creation|scriptwriting)\b/.test(
    textToScan
  );

  if (isWriting) {
    return {
      disciplineCategory: "writing",
      tagLabel: "NARRATIVE CRAFT // RHETORIC & PACING",
      isRhythmCadenceSupported: false,
      metricHeading: "WRITING SPRINTS & REVISIONS",
      metricUnitNoun: "writing sprints / drafts",
      actionButtonLabel: "Log Writing Sprint (+1)",
      guidanceTip:
        "Log each 15-minute focused writing sprint, hook revision, or editing pass.",
      suggestedSprintMinutes: 20,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Fluff / Hesitant Hook",
          desc: "Pacing lagged or opening lacked tension. Trim filler words tomorrow.",
        },
        solid: {
          title: "[ 2 ] Compelling Narrative",
          desc: "Clear voice, sharp rhythm, and punchy transitions. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Seamless Voice",
          desc: "Ideas translated into crisp, persuasive prose with effortless cadence. Cemented.",
        },
      },
      coachButtonLabel: "Ask Writing Coach",
      coachTitle: `Writing Coach — ${skill.title ? skill.title.slice(0, 24) : "Narrative"} Diagnostic`,
      coachInputPlaceholder: "Ask about opening hooks, narrative arc, cutting fluff, or cadence...",
      coachDiagnosingLabel: "Analyzing narrative pacing & prose structure...",
      coachSecondCardLabel: "Storytelling Anchor & Theme:",
      coachSuggestions: generateCourseCoachSuggestions("writing", skill, step),
      mnemonicAnchorLabel: "Narrative Arc Rule:",
    };
  }

  // 12. Public Speaking, Speech & Communication
  const isCommunication = /\b(speaking|speech|presentation|pitch|debate|public speaking|communication|negotiation|interview|conversation|charisma)\b/.test(
    textToScan
  );

  if (isCommunication) {
    return {
      disciplineCategory: "communication",
      tagLabel: "RHETORIC & DELIVERY // VOCAL CADENCE",
      isRhythmCadenceSupported: true,
      cadenceLabel: "Speaking Cadence",
      defaultBpm: 60,
      metricHeading: "SPEECH RUNS & REHEARSALS",
      metricUnitNoun: "rehearsal runs completed",
      actionButtonLabel: "Log Rehearsal Run (+1)",
      guidanceTip:
        "Log each timed speech pass, opening hook drill, or vocal projection rehearsal.",
      suggestedSprintMinutes: 15,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Rushed / Filler Words",
          desc: "Relied on verbal crutches or sped through key pauses. Review tomorrow.",
        },
        solid: {
          title: "[ 2 ] Poised Delivery",
          desc: "Deliberate pauses, grounded posture, and natural eye contact. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Magnetic Presence",
          desc: "Commands the room with authentic conviction and effortless poise. Cemented.",
        },
      },
      coachButtonLabel: "Ask Speaking Coach",
      coachTitle: `Speech Coach — ${skill.title ? skill.title.slice(0, 24) : "Delivery"} Diagnostic`,
      coachInputPlaceholder: "Ask about vocal delivery, eliminating filler words, pacing, or body language...",
      coachDiagnosingLabel: "Diagnosing vocal projection & delivery mechanics...",
      coachSecondCardLabel: "Stage Presence & Vocal Anchor:",
      coachSuggestions: generateCourseCoachSuggestions("communication", skill, step),
      mnemonicAnchorLabel: "Rhetorical Delivery Rule:",
    };
  }

  // 13. Business, Finance & Strategy
  const isBusiness = /\b(finance|investing|stocks|accounting|budget|business|product|marketing|seo|sales|startup|management|strategy|economics)\b/.test(
    textToScan
  );

  if (isBusiness) {
    return {
      disciplineCategory: "business",
      tagLabel: "DECISION ARCHITECTURE // STRATEGY & METRICS",
      isRhythmCadenceSupported: false,
      metricHeading: "CASE ANALYSES & SCENARIOS",
      metricUnitNoun: "model scenarios completed",
      actionButtonLabel: "Log Analysis Pass (+1)",
      guidanceTip:
        "Log each financial model run, hypothesis test, or strategic scenario analyzed.",
      suggestedSprintMinutes: 20,
      recallPrompts: {
        hard: {
          title: "[ 1 ] Faulty Assumptions",
          desc: "Overlooked key risk variables or miscalculated baseline metrics. Review tomorrow.",
        },
        solid: {
          title: "[ 2 ] Grounded Logic",
          desc: "Sound financial assumptions with clear downside protection. Review in 3-4 days.",
        },
        effortless: {
          title: "[ 3 ] Strategic Intuition",
          desc: "Instant clarity on leverage points, unit economics, and risk asymmetry. Cemented.",
        },
      },
      coachButtonLabel: "Ask Strategy Coach",
      coachTitle: `Strategy Coach — ${skill.title ? skill.title.slice(0, 24) : "Business"} Diagnostic`,
      coachInputPlaceholder: "Ask about unit economics, risk hedging, strategy frameworks, or metrics...",
      coachDiagnosingLabel: "Analyzing business model & strategic logic...",
      coachSecondCardLabel: "Core Financial / Strategic Model:",
      coachSuggestions: generateCourseCoachSuggestions("business", skill, step),
      mnemonicAnchorLabel: "Strategic Rule of Thumb:",
    };
  }

  return getDefaultProfile(skill, step);
}

function getDefaultProfile(
  skill?: Skill | null,
  step?: SkillStep | null
): DisciplinePracticeProfile {
  const shortTitle = skill?.title ? skill.title.split(" ").slice(0, 3).join(" ") : "Technique";
  const stepName = step?.title || "this step";

  return {
    disciplineCategory: "general",
    tagLabel: "SKILL PRACTICE // FOCUS SPRINT",
    isRhythmCadenceSupported: false,
    metricHeading: "PRACTICE CYCLES & DRILLS",
    metricUnitNoun: "practice cycles completed",
    actionButtonLabel: "Log Practice Cycle (+1)",
    guidanceTip:
      "Log each focused practice drill or technique milestone completed.",
    suggestedSprintMinutes: 15,
    recallPrompts: {
      hard: {
        title: "[ 1 ] Hesitant / Review Needed",
        desc: "Encountered friction or required active reference checking. Review tomorrow.",
      },
      solid: {
        title: "[ 2 ] Confident Execution",
        desc: "Good accuracy and steady deliberate control. Review in 3-4 days.",
      },
      effortless: {
        title: "[ 3 ] Second Nature",
        desc: "Automatic subconscious execution with zero hesitation. Cemented in memory.",
      },
    },
    coachButtonLabel: `Ask ${shortTitle} Coach`,
    coachTitle: `${shortTitle} Coach — Technique Diagnostic`,
    coachInputPlaceholder: `Ask about common mistakes, mental models, or drills for ${stepName}...`,
    coachDiagnosingLabel: `Analyzing technique & practice mechanics for ${shortTitle}...`,
    coachSecondCardLabel: "Core Principle & Practice Anchor:",
    coachSuggestions: generateCourseCoachSuggestions("general", skill, step),
    mnemonicAnchorLabel: "Core Rule of Thumb:",
  };
}
