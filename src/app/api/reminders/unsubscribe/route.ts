import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { isValidUuid } from "@/lib/catalog-data";

/**
 * Turns off reminders and the weekly recap for the owner of an unsubscribe
 * token. Handles both the unsubscribe page and mail apps' one-click
 * unsubscribe (RFC 8058), which POSTs to the List-Unsubscribe URL.
 */
export async function POST(req: NextRequest) {
  let token = req.nextUrl.searchParams.get("token");
  if (!token) {
    const body = await req.json().catch(() => ({}));
    token = typeof body.token === "string" ? body.token : null;
  }
  if (!token || !isValidUuid(token)) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }

  try {
    const { data, error } = await createAdminClient()
      .from("reminder_preferences")
      .update({ reminders_enabled: false, weekly_recap_enabled: false, updated_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .select("user_id");
    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "This unsubscribe link isn't valid any more" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unsubscribe failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
