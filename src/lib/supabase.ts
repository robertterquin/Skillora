import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

export function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return "https://placeholder.supabase.co";
  const url = rawUrl.trim();
  if (url.includes("supabase.com/dashboard/project/")) {
    const parts = url.split("supabase.com/dashboard/project/");
    const ref = parts[1]?.split("/")[0]?.split("?")[0];
    if (ref) return `https://${ref}.supabase.co`;
  }
  return url;
}

export function createClient(): SupabaseClient {
  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export function createAdminClient(): SupabaseClient {
  const serviceKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    ""
  ).trim();

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured on server");
  }

  const supabaseUrl = normalizeSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cvnzhafoxkdnadyrfpli.supabase.co"
  );

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let clientInstance: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient {
  if (typeof window === "undefined") {
    return createClient();
  }
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

export const supabase = typeof window !== "undefined" ? getSupabase() : (null as unknown as SupabaseClient);

export interface EdgeFunctionResult<T = any> {
  data: T | null;
  error: Error | null;
  fromEdgeFunction: boolean;
}

export async function invokeEdgeFunction<T = any>(
  action: string,
  payload: Record<string, any>
): Promise<EdgeFunctionResult<T>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

  if (!supabaseUrl || !serviceKey) {
    return {
      data: null,
      error: new Error("Supabase credentials not configured"),
      fromEdgeFunction: false,
    };
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/ai?action=${encodeURIComponent(action)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ action, ...payload }),
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("audio/")) {
        const arrayBuffer = await res.arrayBuffer();
        return {
          data: Buffer.from(arrayBuffer) as unknown as T,
          error: null,
          fromEdgeFunction: true,
        };
      }
      const data = await res.json();
      return { data, error: null, fromEdgeFunction: true };
    }

    const errText = await res.text();
    return {
      data: null,
      error: new Error(`Edge Function returned ${res.status}: ${errText}`),
      fromEdgeFunction: false,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
      fromEdgeFunction: false,
    };
  }
}
