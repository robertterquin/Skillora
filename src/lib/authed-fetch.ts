import { getSupabase } from "@/lib/supabase";

/** fetch() to our own API with the signed-in user's access token attached. */
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
