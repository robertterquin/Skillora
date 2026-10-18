// Shared by the "ai" edge function and the Next.js /api/ai/rework-step route.
// Rewrites one practice step to be easier or harder, keeping the same skill.

export type ReworkDirection = "easier" | "harder";

export interface ReworkRequest {
  skillTitle: string;
  stepTitle: string;
  stepInstructions: string;
  estimatedMinutes: number;
  direction: ReworkDirection;
}

export interface ReworkedStep {
  title: string;
  instructions: string;
  estimated_minutes: number;
}

const clip = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export function sanitizeReworkRequest(body: Record<string, unknown>): ReworkRequest | null {
  const direction = body.direction === "easier" || body.direction === "harder" ? body.direction : null;
  const stepTitle = clip(body.stepTitle, 200);
  if (!direction || !stepTitle) return null;
  return {
    skillTitle: clip(body.skillTitle, 200) || "this skill",
    stepTitle,
    stepInstructions: clip(body.stepInstructions, 4000),
    estimatedMinutes: Math.min(60, Math.max(5, Number(body.estimatedMinutes) || 20)),
    direction,
  };
}

export function buildReworkMessages(req: ReworkRequest) {
  const goal =
    req.direction === "easier"
      ? "Make this step EASIER: a smaller, gentler version of the same technique (slower tempo, fewer moving parts, a simpler target), usually a little shorter."
      : "Make this step HARDER: a more demanding version of the same technique (faster, more combined, a stricter success test), possibly a little longer.";
  return [
    {
      role: "system" as const,
      content: `You are Archimedes, Skillora's practice coach. You rewrite a single deliberate-practice step.
${goal}
Rules: keep it about the same skill and technique; one sitting of 5-60 minutes; state the exact drill and an objective test of success; plain sentences, no emojis, no markdown.
Return STRICT JSON: {"title": "short step name", "instructions": "2-4 sentences", "estimated_minutes": number}`,
    },
    {
      role: "user" as const,
      content: `Skill: ${req.skillTitle}\nCurrent step: ${req.stepTitle} (${req.estimatedMinutes} min)\nInstructions: ${req.stepInstructions}`,
    },
  ];
}

export function parseReworkReply(raw: string, req: ReworkRequest): ReworkedStep {
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    // fall through to defaults
  }
  return {
    title: clip(parsed.title, 200) || req.stepTitle,
    instructions: clip(parsed.instructions, 4000) || req.stepInstructions,
    estimated_minutes: Math.min(60, Math.max(5, Math.round(Number(parsed.estimated_minutes) || req.estimatedMinutes))),
  };
}
