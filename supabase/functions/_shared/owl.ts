// Archimedes (owl-chat) shared contract.
//
// Imported by BOTH the Supabase Edge Function (supabase/functions/ai) and the
// Next.js fallback route (src/app/api/ai/owl-chat), so the prompt, request
// sanitizing and reply shape can never drift between cloud and local.
// Keep this file free of Deno- or Node-specific APIs.

export type OwlMode = "chat" | "suggestions" | "curriculum";
export type OwlDifficulty = "beginner" | "intermediate" | "advanced";

export interface OwlSuggestion {
  title: string;
  pitch: string;
  whyForYou: string;
  difficulty: OwlDifficulty;
  timeToBasics: string;
  category_id: string;
}

/** Learner preferences Archimedes picks up during discovery. */
export interface OwlProfile {
  interests?: string;
  dailyMinutes?: string;
  goal?: string;
}

export interface OwlHistoryTurn {
  role: "user" | "owl";
  text: string;
  /** Titles suggested in that owl turn, so "build the first one" can resolve. */
  suggestionTitles?: string[];
  /** Title of the curriculum built in that owl turn. */
  skillTitle?: string;
}

export interface OwlContext {
  enrolledSkills?: string[];
  catalogSkills?: string[];
  profile?: OwlProfile;
}

export interface OwlRequest {
  message: string;
  history: OwlHistoryTurn[];
  context: OwlContext;
  /** Set when the user explicitly picks a skill (e.g. taps "Build this path"). */
  forceMode?: "curriculum";
}

/** Normalized model output. `skillData` is raw and gets formatted server-side. */
export interface OwlParsedReply {
  mode: OwlMode;
  owlMessage: string;
  quickReplies: string[];
  suggestions: OwlSuggestion[];
  profile?: OwlProfile;
  skillData: any | null;
}

/** What the client receives. */
export interface OwlReply<TSkill = unknown> {
  mode: OwlMode;
  owlMessage: string;
  quickReplies: string[];
  suggestions: OwlSuggestion[];
  profile?: OwlProfile;
  skill: TSkill | null;
}

const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_TURNS = 10;
const MAX_TURN_CHARS = 1200;
const MAX_LIST_ITEMS = 30;
const CATEGORY_IDS = ["cat-music", "cat-language", "cat-life", "cat-tech"];
const DIFFICULTIES: OwlDifficulty[] = ["beginner", "intermediate", "advanced"];

export const OWL_SYSTEM_PROMPT = `You are Archimedes, the Skillora Learning Owl: a calm, warm, patient mentor who helps people discover and learn practical skills. Speak with quiet warmth and intellectual curiosity. No corporate filler, at most one exclamation mark per reply. NEVER use emojis in your responses, quick replies, suggestion pitches, or curriculum steps. Keep all communication strictly typographic, clean, and minimal.

Each turn, choose exactly ONE response mode:

1. "chat": the user is vague, undecided, greeting you, asking a general question, or you need more information to advise well. Reply conversationally in 1-3 sentences and ask at most ONE focused question.

2. "suggestions": the user asks for ideas, options, recommendations, "what should I learn", trending or in-demand skills, or has shared enough about their interests. Offer 3-5 distinct, concrete, learnable skills. Prefer specific skills over broad fields ("SQL for Data Analysis", not "Data Science"). Tailor them to everything known about the user. Never suggest a skill the user is already enrolled in. When a catalog skill fits, use its exact title. If the user asks about in-demand or trending skills, briefly mention that your knowledge comes from training data, not live job-market data.

3. "curriculum": ONLY when the user clearly commits to one specific skill (e.g. "teach me latte art", "build the first one", "let's do SQL"). Resolve references like "the first one" using the skills you suggested earlier in the conversation.

GUIDED DISCOVERY: if the user wants help finding a skill, interview them one question at a time in this order: interests, daily time available, goal (career, hobby, or practical life skill). Skip anything already answered in the conversation or known profile. After at most 3 questions, switch to "suggestions".

quickReplies: 0-3 short phrases (max 6 words each) written from the USER's point of view that they could tap as their next message, e.g. "I have 20 mins a day", "Build the first one", "Something more creative". Always include some in "chat" and "suggestions" modes.

profile: include ONLY fields the user revealed in their latest message (interests, dailyMinutes, goal), otherwise omit it.

Return STRICT JSON:
{
  "mode": "chat" | "suggestions" | "curriculum",
  "owlMessage": "Your conversational reply.",
  "quickReplies": ["..."],
  "profile": { "interests": "...", "dailyMinutes": "...", "goal": "..." },
  "suggestions": [
    {
      "title": "Skill title (max 6 words)",
      "pitch": "One sentence: what they will be able to do.",
      "whyForYou": "One short sentence tying it to this user.",
      "difficulty": "beginner" | "intermediate" | "advanced",
      "timeToBasics": "e.g. ~2 weeks at 20 min/day",
      "category_id": "cat-music" | "cat-language" | "cat-life" | "cat-tech"
    }
  ],
  "skill": null
}
"suggestions" must be [] unless mode is "suggestions". "skill" must be null unless mode is "curriculum", in which case it is:
{
  "title": "Concise skill title (max 6 words)",
  "summary": "1-2 sentence high-signal summary of the mechanics, techniques, or mental models.",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimated_hours": 2.5,
  "time_commitment_label": "e.g. 20 mins/day for 2 weeks",
  "category_id": "cat-music" | "cat-language" | "cat-life" | "cat-tech",
  "steps": [
    {
      "step_number": 1,
      "title": "Clear step technique name",
      "instructions": "Specific, actionable drill (2-3 sentences).",
      "estimated_minutes": 20,
      "resources": [
        { "platform_name": "Best reputable site/tool/channel", "url": "https://www.youtube.com", "resource_type": "video" | "interactive" | "article" | "tool", "is_free": true }
      ]
    }
  ]
}

CURRICULUM RULES (mode "curriculum" only). ALWAYS generate exactly 4 sequential steps following this deliberate practice progression:
1. DISCIPLINE-SPECIFIC DRILLS:
   - Coding & tech: strictly technical and actionable (syntax patterns, REPL/terminal commands, test assertions). Never give bodily-sensation advice for software.
   - Music & audio: finger/hand anchors, fretboard geometry, tone production, metronome BPM, transition loops.
   - Languages & scripts: phonetic approximations, glyph mnemonics, high-frequency cognates, real reading/pronunciation drills.
   - Tactile crafts & sports: body mechanics, tool angles, sensory cues (sound, feel, resistance, sight), observable benchmarks.
2. PROGRESSION:
   - Step 1: Foundation (mental model, setup, primary building block)
   - Step 2: Core Mechanism (primary mechanical drill or technique)
   - Step 3: Integration & Flow (combining patterns, transition loops, smooth tempo)
   - Step 4: Real-World Milestone (standalone mini-project, performance endurance, or objective verification benchmark)
3. ACTIONABILITY: every step states the technique, the exact drill, and an objective test of success.
4. TIME: "estimated_minutes" is a focused 15-25 minute sprint.`;

const EMOJI_CLEAN_REGEX = /[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2600-\u27BF]+/g;

const clip = (value: unknown, max: number): string =>
  typeof value === "string"
    ? value
        .replace(EMOJI_CLEAN_REGEX, "")
        .replace(/\s{2,}/g, " ")
        .trim()
        .slice(0, max)
    : "";

const clipList = (value: unknown, maxItems: number, maxChars: number): string[] =>
  Array.isArray(value)
    ? value.map((v) => clip(v, maxChars)).filter(Boolean).slice(0, maxItems)
    : [];

function sanitizeProfile(value: unknown): OwlProfile | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const profile: OwlProfile = {};
  const interests = clip(raw.interests, 160);
  const dailyMinutes = clip(raw.dailyMinutes, 60);
  const goal = clip(raw.goal, 120);
  if (interests) profile.interests = interests;
  if (dailyMinutes) profile.dailyMinutes = dailyMinutes;
  if (goal) profile.goal = goal;
  return Object.keys(profile).length > 0 ? profile : undefined;
}

/**
 * Validates an incoming request body. Returns null when `message` is missing.
 * Requests without a `history` array come from older clients that expect a
 * curriculum on every message, so they are forced into curriculum mode.
 */
export function sanitizeOwlRequest(body: Record<string, any>): OwlRequest | null {
  const message = clip(body?.message, MAX_MESSAGE_CHARS);
  if (!message) return null;

  const isLegacyClient = !Array.isArray(body.history);

  const history: OwlHistoryTurn[] = isLegacyClient
    ? []
    : (body.history as any[])
        .filter((t) => t && (t.role === "user" || t.role === "owl") && typeof t.text === "string")
        .slice(-MAX_HISTORY_TURNS)
        .map((t) => ({
          role: t.role,
          text: clip(t.text, MAX_TURN_CHARS),
          suggestionTitles: clipList(t.suggestionTitles, 5, 80),
          skillTitle: clip(t.skillTitle, 80) || undefined,
        }));

  const rawContext = body.context && typeof body.context === "object" ? body.context : {};
  const context: OwlContext = {
    enrolledSkills: clipList(rawContext.enrolledSkills, MAX_LIST_ITEMS, 80),
    catalogSkills: clipList(rawContext.catalogSkills, MAX_LIST_ITEMS, 80),
    profile: sanitizeProfile(rawContext.profile),
  };

  return {
    message,
    history,
    context,
    forceMode: isLegacyClient || body.forceMode === "curriculum" ? "curriculum" : undefined,
  };
}

/** Builds the chat-completion message list (system + history + latest turn). */
export function buildOwlMessages(
  req: OwlRequest
): { role: "system" | "user" | "assistant"; content: string }[] {
  const contextLines: string[] = [];
  const { enrolledSkills, catalogSkills, profile } = req.context;
  if (enrolledSkills?.length) {
    contextLines.push(`Already enrolled (never suggest these): ${enrolledSkills.join("; ")}`);
  }
  if (catalogSkills?.length) {
    contextLines.push(`Skillora catalog skills (use exact titles when relevant): ${catalogSkills.join("; ")}`);
  }
  if (profile) {
    const parts = [
      profile.interests && `interests: ${profile.interests}`,
      profile.dailyMinutes && `daily time: ${profile.dailyMinutes}`,
      profile.goal && `goal: ${profile.goal}`,
    ].filter(Boolean);
    if (parts.length) contextLines.push(`Known learner profile: ${parts.join(", ")}`);
  }

  const system = contextLines.length
    ? `${OWL_SYSTEM_PROMPT}\n\nLEARNER CONTEXT:\n${contextLines.join("\n")}`
    : OWL_SYSTEM_PROMPT;

  const historyMessages = req.history.map((turn) => {
    if (turn.role === "user") return { role: "user" as const, content: turn.text };
    let content = turn.text;
    if (turn.suggestionTitles?.length) {
      content += `\n[Suggested: ${turn.suggestionTitles.map((t, i) => `${i + 1}. ${t}`).join("; ")}]`;
    }
    if (turn.skillTitle) content += `\n[Built curriculum: ${turn.skillTitle}]`;
    return { role: "assistant" as const, content };
  });

  const latest = req.forceMode === "curriculum"
    ? `${req.message}\n\n(The user has chosen this skill. Respond with mode "curriculum" and build its full pathway.)`
    : req.message;

  return [{ role: "system", content: system }, ...historyMessages, { role: "user", content: latest }];
}

function sanitizeSuggestion(value: unknown): OwlSuggestion | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = clip(raw.title, 80);
  if (!title) return null;
  const difficulty = DIFFICULTIES.includes(raw.difficulty as OwlDifficulty)
    ? (raw.difficulty as OwlDifficulty)
    : "beginner";
  const category = clip(raw.category_id, 20);
  return {
    title,
    pitch: clip(raw.pitch, 240),
    whyForYou: clip(raw.whyForYou, 200),
    difficulty,
    timeToBasics: clip(raw.timeToBasics, 60),
    category_id: CATEGORY_IDS.includes(category) ? category : "cat-tech",
  };
}

const FALLBACK_MESSAGES: Record<OwlMode, string> = {
  chat: "Tell me a little more about what draws you in, and I'll point you somewhere worthwhile.",
  suggestions: "Here are a few paths worth considering.",
  curriculum: "I've laid out a pathway for you. Add it to My Studio when you're ready.",
};

/** Parses and validates raw model JSON into a safe, predictable reply. */
export function parseOwlReply(raw: string, forceMode?: "curriculum"): OwlParsedReply {
  let parsed: Record<string, any> = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const skillData =
    parsed.skill && typeof parsed.skill === "object" && Array.isArray(parsed.skill.steps) && parsed.skill.steps.length > 0
      ? parsed.skill
      : null;
  const suggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions.map(sanitizeSuggestion).filter((s): s is OwlSuggestion => s !== null).slice(0, 5)
    : [];

  let mode: OwlMode = (["chat", "suggestions", "curriculum"] as OwlMode[]).includes(parsed.mode)
    ? parsed.mode
    : "chat";
  if (forceMode === "curriculum" && skillData) mode = "curriculum";
  if (mode === "curriculum" && !skillData) mode = suggestions.length ? "suggestions" : "chat";
  if (mode === "suggestions" && suggestions.length === 0) mode = "chat";

  return {
    mode,
    owlMessage: clip(parsed.owlMessage, 800) || FALLBACK_MESSAGES[mode],
    quickReplies: clipList(parsed.quickReplies, 3, 60),
    suggestions: mode === "suggestions" ? suggestions : [],
    profile: sanitizeProfile(parsed.profile),
    skillData: mode === "curriculum" ? skillData : null,
  };
}

export function toOwlReply<TSkill>(reply: OwlParsedReply, skill: TSkill | null): OwlReply<TSkill> {
  return {
    mode: reply.mode,
    owlMessage: reply.owlMessage,
    quickReplies: reply.quickReplies,
    suggestions: reply.suggestions,
    profile: reply.profile,
    skill,
  };
}
