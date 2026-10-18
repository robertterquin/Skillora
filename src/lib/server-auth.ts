import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createAdminClient, type EdgeFunctionResult } from "@/lib/supabase";

/** 401 response for AI features that need an account. */
export function authRequired(message = "Sign in to use Archimedes.") {
  return NextResponse.json({ error: message, code: "auth_required" }, { status: 401 });
}

/** AI requests each signed-in learner may make per day (UTC). Must match the edge function's AI_DAILY_LIMIT. */
export const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 100;

/** 429 response once a learner has used today's AI requests. */
export function aiLimitReached() {
  return NextResponse.json(
    { error: `You've used today's ${AI_DAILY_LIMIT} Archimedes requests. They reset tomorrow.`, code: "ai_limit" },
    { status: 429 }
  );
}

/**
 * Counts one AI request for the learner. False once they've reached today's
 * limit. If the counter itself fails, the request is allowed.
 */
export async function consumeAiQuota(userId: string): Promise<boolean> {
  try {
    const { data, error } = await createAdminClient().rpc("consume_ai_quota", { p_user: userId, p_limit: AI_DAILY_LIMIT });
    if (error) {
      console.error("AI quota check failed:", error.message);
      return true;
    }
    return data !== false;
  } catch (err) {
    console.error("AI quota check failed:", err);
    return true;
  }
}

/**
 * Call before an AI route falls back to OpenAI directly. The edge function
 * already counts requests it handles, so only the fallback is counted here.
 * Returns the 429 response to send, or null to go ahead.
 */
export async function chargeFallback(edgeStatus: number | undefined, userId: string) {
  if (edgeStatus === 429) return aiLimitReached();
  if (!(await consumeAiQuota(userId))) return aiLimitReached();
  return null;
}

/** The verified user and their access token, or null for guests. */
export async function getRequestAuth(req: NextRequest): Promise<{ user: User; token: string } | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const { data, error } = await createAdminClient().auth.getUser(token);
  if (error || !data.user) return null;
  return { user: data.user, token };
}

/**
 * The signed-in user behind an API request, verified from the Supabase access
 * token in the Authorization header. Never trust a userId sent in the body.
 */
export async function getRequestUser(req: NextRequest): Promise<User | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const { data, error } = await createAdminClient().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
