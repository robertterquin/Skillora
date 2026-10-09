import { createBrowserClient } from "@supabase/ssr";

function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return "https://placeholder.supabase.co";
  let url = rawUrl.trim();
  // If user pasted dashboard link: https://supabase.com/dashboard/project/<ref>
  if (url.includes("supabase.com/dashboard/project/")) {
    const parts = url.split("supabase.com/dashboard/project/");
    const ref = parts[1]?.split("/")[0]?.split("?")[0];
    if (ref) {
      return `https://${ref}.supabase.co`;
    }
  }
  return url;
}

export function createClient() {
  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
