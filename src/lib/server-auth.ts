import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase";

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
