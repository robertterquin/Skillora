import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase";

/** 401 response for AI features that need an account. */
export function authRequired(message = "Sign in to use Archimedes.") {
  return NextResponse.json({ error: message, code: "auth_required" }, { status: 401 });
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
