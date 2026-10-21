import OpenAI from "npm:openai@^4.68.0";
import { createClient } from "npm:@supabase/supabase-js@^2.45.6";
import { sanitizeOwlRequest, buildOwlMessages, parseOwlReply, toOwlReply } from "../_shared/owl.ts";
import { sanitizeReworkRequest, buildReworkMessages, parseReworkReply } from "../_shared/rework.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const CURATED_EXAMS: Record<string, any> = {
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
        scenario: "When transitioning from an open C major to a G major chord, treble strings buzz or sound dead because your fretting hand knuckles collapse against neighboring strings. What physical alignment restores clear string resonance?",
        options: [
          {
            id: "A",
            text: "Drop the fretting wrist downward and bring the thumb lower behind the center midline of the guitar neck, arching the first knuckle perpendicular to the fretboard.",
            isCorrect: true,
            rationale: "Lowering the thumb behind the neck elevates the palm away from the fretboard, creating the required clearance arch for fingertips.",
          },
          {
            id: "B",
            text: "Wrap your fretting thumb completely over the top of the neck to clamp the fretboard tightly.",
            isCorrect: false,
            rationale: "Thumb wrapping pulls the palm flat against the high E and B strings, causing inadvertent muting.",
          },
          {
            id: "C",
            text: "Fret directly on top of the metal fret wire rather than just behind it.",
            isCorrect: false,
            rationale: "Placing the fingertip directly on the metal wire dampens harmonic sustain.",
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

function getOpenAI(): OpenAI {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured in Supabase Secrets.");
  }
  return new OpenAI({ apiKey });
}

const PRIMARY_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-6-luna";
const FALLBACK_MODEL = "gpt-4o-mini";

async function createChatCompletionWithFallback(
  openai: OpenAI,
  params: any
) {
  const modelToUse = params.model || PRIMARY_MODEL;
  try {
    return await openai.chat.completions.create({
      ...params,
      model: modelToUse,
    });
  } catch (err: any) {
    const isModelUnavailable =
      err?.status === 404 ||
      err?.code === "model_not_found" ||
      (typeof err?.message === "string" && err.message.toLowerCase().includes("model"));

    if (isModelUnavailable && modelToUse !== FALLBACK_MODEL) {
      console.warn(`[AI Edge] Model "${modelToUse}" unavailable. Falling back to "${FALLBACK_MODEL}".`);
      return await openai.chat.completions.create({
        ...params,
        model: FALLBACK_MODEL,
      });
    }
    throw err;
  }
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const key =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_ANON_KEY") ||
    "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function normalizeCategoryId(cat?: string): string {
  if (!cat) return "cat-tech";
  const lower = cat.toLowerCase();
  if (lower.includes("music") || lower.includes("instrument") || lower.includes("sound")) return "cat-music";
  if (lower.includes("lang") || lower.includes("speak") || lower.includes("script")) return "cat-language";
  if (lower.includes("life") || lower.includes("craft") || lower.includes("food") || lower.includes("coffee") || lower.includes("bread")) return "cat-life";
  return "cat-tech";
}

async function searchTopYouTube(query: string): Promise<{ channel: string; url: string } | null> {
  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const data = await res.text();
    const match = data.match(/"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (match && match[1]) {
      return {
        channel: "YouTube",
        url: `https://www.youtube.com/watch?v=${match[1]}`,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}

const CHARGED_ACTIONS = new Set(["owl-chat", "coach", "mnemonic", "rework-step", "tts", "grade-voice", "daily-routine"]);

const AI_DAILY_LIMIT = Number(Deno.env.get("AI_DAILY_LIMIT")) || 100;

async function chargeAiRequest(userId: string): Promise<Response | null> {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) return null;
    const { data, error } = await admin.rpc("consume_ai_quota", { p_user: userId, p_limit: AI_DAILY_LIMIT });
    if (error) {
      console.error("AI quota check failed:", error.message);
      return null;
    }
    if (data === false) {
      return jsonResponse(
        {
          error: `You've used today's ${AI_DAILY_LIMIT} Archimedes requests. They reset tomorrow.`,
          code: "ai_limit",
        },
        429
      );
    }
    return null;
  } catch (err) {
    console.error("AI quota check failed:", err);
    return null;
  }
}

async function handleOwlChat(body: Record<string, any>): Promise<Response> {
  const request = sanitizeOwlRequest(body);
  if (!request) {
    return errorResponse("Message is required", 400);
  }

  const openai = getOpenAI();
  const response = await createChatCompletionWithFallback(openai, {
    messages: buildOwlMessages(request),
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return errorResponse("No response from AI", 500);

  const reply = parseOwlReply(content, request.forceMode);

  if (reply.mode !== "curriculum" || !reply.skillData) {
    return jsonResponse(toOwlReply(reply, null));
  }

  const skillData = reply.skillData;
  const skillId = crypto.randomUUID();
  const slug = (skillData.title || "craft").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const formattedSkill = {
    id: skillId,
    category_id: normalizeCategoryId(skillData.category_id),
    title: skillData.title || "Skillora Practice Discipline",
    slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
    summary: skillData.summary || "Deliberate practice curriculum.",
    difficulty: skillData.difficulty || "beginner",
    estimated_hours: Number(skillData.estimated_hours) || 2.0,
    time_commitment_label: skillData.time_commitment_label || "20 mins/day for 1 week",
    is_featured: false,
    steps_count: skillData.steps?.length || 4,
    steps: [] as any[],
  };

  const initialSteps = (skillData.steps || []).map((st: any, idx: number) => {
    const searchQuery = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${formattedSkill.title} ${st.title || `Step ${idx + 1}`} tutorial`)}`;
    return {
      id: crypto.randomUUID(),
      skill_id: skillId,
      step_number: st.step_number || idx + 1,
      title: st.title || `Step ${idx + 1}`,
      instructions: st.instructions || "Focus on form and slow deliberate repetitions.",
      estimated_minutes: Math.min(25, Math.max(10, Number(st.estimated_minutes) || 20)),
      resources: (st.resources || []).map((r: any) => ({
        id: crypto.randomUUID(),
        platform_name: r.platform_name || "YouTube Tutorial",
        url: r.url && r.url !== "https://www.youtube.com" ? r.url : searchQuery,
        resource_type: r.resource_type || "video",
        is_free: r.is_free !== false,
      })),
    };
  });

  const enrichedSteps = await Promise.all(
    initialSteps.map(async (st: any) => {
      const yt = await searchTopYouTube(`${formattedSkill.title} ${st.title} tutorial`);
      if (yt) {
        return {
          ...st,
          resources: [
            { id: crypto.randomUUID(), platform_name: `YouTube (${yt.channel})`, url: yt.url, resource_type: "video", is_free: true },
            ...st.resources,
          ],
        };
      }
      return st;
    })
  );

  formattedSkill.steps = enrichedSteps;

  try {
    const admin = getSupabaseAdmin();
    if (admin) {
      await admin.from("skills").upsert({
        id: formattedSkill.id,
        category_id: formattedSkill.category_id,
        title: formattedSkill.title,
        slug: formattedSkill.slug,
        summary: formattedSkill.summary,
        difficulty: formattedSkill.difficulty,
        estimated_hours: formattedSkill.estimated_hours,
        time_commitment_label: formattedSkill.time_commitment_label,
        is_featured: false,
      });

      await admin.from("skill_steps").upsert(
        enrichedSteps.map((st: any) => ({
          id: st.id,
          skill_id: formattedSkill.id,
          step_number: st.step_number,
          title: st.title,
          instructions: st.instructions,
          estimated_minutes: st.estimated_minutes,
        }))
      );
    }
  } catch (err) {
    console.warn("Auto-persist warning:", err);
  }

  return jsonResponse(toOwlReply(reply, formattedSkill));
}

async function handleCoach(body: Record<string, any>): Promise<Response> {
  const { skillTitle, stepTitle, stepInstructions, userQuestion } = body;
  if (!userQuestion) return errorResponse("Question is required", 400);
  const learnerNote = typeof body.learnerNote === "string" ? body.learnerNote.trim().slice(0, 2000) : "";

  const openai = getOpenAI();
  const systemPrompt = `You are the master technique coach for Skillora.
Provide concise, actionable advice (max 3 short paragraphs).
Format response as STRICT JSON:
{
  "diagnosis": "1-2 sentence breakdown of why this hurdle is happening.",
  "muscleMemoryCue": "One memorable tactile/mental cue to lock in.",
  "actionableDrill": "A 3-minute physical or mental drill to fix it."
}`;

  const response = await createChatCompletionWithFallback(openai, {
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content:
          `Discipline: ${skillTitle}\nStep: ${stepTitle}\nContext: ${stepInstructions}\nLearner Question: ${userQuestion}` +
          (learnerNote
            ? `\nThe learner's own notes from practising this step (use them to make the advice specific): ${learnerNote}`
            : ""),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return errorResponse("Coaching generation failed", 500);
  return jsonResponse(JSON.parse(content));
}

async function handleReworkStep(body: Record<string, any>): Promise<Response> {
  const request = sanitizeReworkRequest(body);
  if (!request) return errorResponse("stepTitle and direction (easier|harder) are required", 400);
  const response = await createChatCompletionWithFallback(getOpenAI(), {
    messages: buildReworkMessages(request),
    response_format: { type: "json_object" },
    temperature: 0.6,
  });
  const content = response.choices[0]?.message?.content;
  if (!content) return errorResponse("Rework generation failed", 500);
  return jsonResponse(parseReworkReply(content, request));
}

async function handleMnemonic(body: Record<string, any>): Promise<Response> {
  const { skillTitle, stepTitle, stepInstructions } = body;
  const openai = getOpenAI();
  const systemPrompt = `You are a memory grandmaster and cognitive coach for Skillora.
Create a vivid, memorable mental model and physical mnemonic.
Format JSON:
{
  "visualMnemonic": "A vivid 1-2 sentence visual mental image.",
  "physicalAnchor": "A tactile feeling or physical sensation.",
  "ruleOfThumb": "A 1-liner rhyme or catchy rule of thumb (max 8 words)."
}`;

  const response = await createChatCompletionWithFallback(openai, {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Discipline: ${skillTitle}\nStep: ${stepTitle}\nInstructions: ${stepInstructions}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return errorResponse("Mnemonic generation failed", 500);
  return jsonResponse(JSON.parse(content));
}

async function handleGuildExam(body: Record<string, any>, userId: string | null): Promise<Response> {
  const { skillTitle, skillSummary, steps, skillSlug } = body;
  const cleanSlug = (skillSlug || (skillTitle || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")).toLowerCase();

  for (const [key, exam] of Object.entries(CURATED_EXAMS)) {
    if (cleanSlug.includes(key) || key.includes(cleanSlug)) {
      return jsonResponse({ exam });
    }
  }

  if (!userId) return errorResponse("Sign in to take the assessment for this skill.", 401);
  const limited = await chargeAiRequest(userId);
  if (limited) return limited;

  const openai = getOpenAI();
  const prompt = `You are Archimedes, Master Polymath and Grand Proctor of the Skillora Craftsman's Guild.
Construct an official 3-question Diagnostic Guild Certification Exam for: "${skillTitle}".
Summary: "${skillSummary || ""}"

Ask REAL-WORLD PHYSICAL SCENARIOS, SENSORY DIAGNOSTICS, AND MUSCLE-MEMORY TROUBLESHOOTING.
Output STRICT JSON:
{
  "examTitle": "Official Craftsman's Guild Certification Exam",
  "craftTitle": "${skillTitle}",
  "craftHonorific": "Certified Master",
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

  const completion = await createChatCompletionWithFallback(openai, {
    messages: [
      { role: "system", content: "You are the Grand Proctor of Skillora. Respond only with valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return errorResponse("Exam generation failed", 500);
  return jsonResponse({ exam: JSON.parse(content) });
}

async function handleTts(body: Record<string, any>): Promise<Response> {
  const { text, voice = "onyx", speed = 0.92 } = body;
  if (!text) return errorResponse("Text is required", 400);

  const openai = getOpenAI();
  const mp3 = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: voice || "onyx",
    input: text.slice(0, 600),
    speed: typeof speed === "number" ? Math.max(0.85, Math.min(1.1, speed)) : 0.92,
  });

  const arrayBuffer = await mp3.arrayBuffer();
  return new Response(arrayBuffer, {
    headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
  });
}

async function handleGradeVoice(req: Request, body?: Record<string, any>): Promise<Response> {
  const openai = getOpenAI();
  let audioFile: File | null = null;
  let expectedText = "";
  let language = "ru";

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    audioFile = formData.get("audio") as File | null;
    expectedText = (formData.get("expectedText") as string) || "";
    language = (formData.get("language") as string) || "ru";
  } else if (body) {
    expectedText = body.expectedText || "";
    language = body.language || "ru";
  }

  let transcribedText = expectedText;
  if (audioFile) {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: language === "ru" ? "ru" : undefined,
      });
      transcribedText = transcription.text.trim();
    } catch {
      transcribedText = expectedText;
    }
  }

  const gradingPrompt = `Expected: "${expectedText}" Spoken: "${transcribedText}".
Evaluate pronunciation. Output JSON:
{
  "transcribedText": "${transcribedText}",
  "matchScore": 92,
  "verdict": "Mastered" | "Near Native" | "Practicing",
  "feedback": "1 sentence congratulating or pointing out what was heard.",
  "phoneticTip": "1 practical mouth/tongue/vowel placement tip."
}`;

  const completion = await createChatCompletionWithFallback(openai, {
    messages: [
      { role: "system", content: "You are an expert linguistic speech grader. Respond only with valid JSON." },
      { role: "user", content: gradingPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return jsonResponse({
      transcribedText,
      matchScore: 90,
      verdict: "Near Native",
      feedback: "Sounded clear and recognizable!",
      phoneticTip: "Keep practicing the vowel length.",
    });
  }
  return jsonResponse(JSON.parse(content));
}

async function handleDailyRoutine(body: Record<string, any>): Promise<Response> {
  const { enrolledSkills = [] } = body;
  const openai = getOpenAI();
  const summary = enrolledSkills.map((s: any) => `- ${s.title} (${s.difficulty || "general"})`).join("\n");

  const systemPrompt = `You are the master athletic and deliberate practice coach for Skillora.
Design a cohesive 15-minute daily workout routine that cross-trains the learner.
Return JSON:
{
  "headline": "15-Minute Mastery Workout",
  "totalMinutes": 15,
  "blocks": [
    { "minutes": 5, "skillTitle": "Skill 1", "drillTitle": "Warmup Drill", "action": "Step instructions" },
    { "minutes": 10, "skillTitle": "Skill 2", "drillTitle": "Focus Drill", "action": "Step instructions" }
  ],
  "dailyMantra": "1-sentence inspirational reminder."
}`;

  const response = await createChatCompletionWithFallback(openai, {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Enrolled Skills:\n${summary}\nCreate today's session.` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return errorResponse("Daily routine generation failed", 500);
  return jsonResponse(JSON.parse(content));
}

async function signedInUserId(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  try {
    const auth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { persistSession: false },
    });
    const { data, error } = await auth.auth.getUser(token);
    return !error && data.user ? data.user.id : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const contentType = req.headers.get("content-type") || "";

    const pathParts = url.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    let action = url.searchParams.get("action") || "";

    if (!action && lastPart && lastPart !== "ai" && lastPart !== "v1") {
      action = lastPart;
    }

    const userId = await signedInUserId(req);

    let body: Record<string, any> = {};
    if (contentType.includes("multipart/form-data")) {
      if (!userId) return errorResponse("Sign in to use Archimedes.", 401);
      const limited = await chargeAiRequest(userId);
      if (limited) return limited;
      return await handleGradeVoice(req);
    } else if (contentType.includes("application/json")) {
      try {
        body = await req.json();
        if (!action && body.action) {
          action = body.action;
        }
      } catch {
      }
    }

    if (action !== "guild-exam") {
      if (!userId) return errorResponse("Sign in to use Archimedes.", 401);
      if (CHARGED_ACTIONS.has(action)) {
        const limited = await chargeAiRequest(userId);
        if (limited) return limited;
      }
    }

    switch (action) {
      case "owl-chat":
        return await handleOwlChat(body);
      case "coach":
        return await handleCoach(body);
      case "mnemonic":
        return await handleMnemonic(body);
      case "rework-step":
        return await handleReworkStep(body);
      case "guild-exam":
        return await handleGuildExam(body, userId);
      case "tts":
        return await handleTts(body);
      case "grade-voice":
        return await handleGradeVoice(req, body);
      case "daily-routine":
        return await handleDailyRoutine(body);
      default:
        return errorResponse(`Action "${action}" is invalid. Supported: owl-chat, coach, mnemonic, guild-exam, tts, grade-voice, daily-routine`, 400);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Skillora AI Edge Function Error:", message);
    return errorResponse(message, 500);
  }
});
