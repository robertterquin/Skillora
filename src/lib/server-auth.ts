import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createAdminClient, type EdgeFunctionResult } from "@/lib/supabase";

export function authRequired(message = "Sign in to use Archimedes.") {
  return NextResponse.json({ error: message, code: "auth_required" }, { status: 401 });
}

export const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 100;

export function aiLimitReached() {
  return NextResponse.json(
    { error: `You've used today's ${AI_DAILY_LIMIT} Archimedes requests. They reset tomorrow.`, code: "ai_limit" },
    { status: 429 }
  );
}

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

export async function chargeFallback(edgeStatus: number | undefined, userId: string) {
  if (edgeStatus === 429) return aiLimitReached();
  if (!(await consumeAiQuota(userId))) return aiLimitReached();
  return null;
}

export async function getRequestAuth(req: NextRequest): Promise<{ user: User; token: string } | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const { data, error } = await createAdminClient().auth.getUser(token);
  if (error || !data.user) return null;
  return { user: data.user, token };
}

export async function getRequestUser(req: NextRequest): Promise<User | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const { data, error } = await createAdminClient().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
