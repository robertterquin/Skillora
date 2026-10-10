import { createClient } from "@supabase/supabase-js";

function getServiceRoleKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    ""
  ).trim();
}

function getSupabaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cvnzhafoxkdnadyrfpli.supabase.co";
  let url = rawUrl.trim();
  if (url.includes("supabase.com/dashboard/project/")) {
    const parts = url.split("supabase.com/dashboard/project/");
    const ref = parts[1]?.split("/")[0]?.split("?")[0];
    if (ref) return `https://${ref}.supabase.co`;
  }
  return url;
}

export function createAdminClient() {
  const serviceKey = getServiceRoleKey();
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured on server");
  }
  return createClient(getSupabaseUrl(), serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
