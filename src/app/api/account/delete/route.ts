import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getRequestUser } from "@/lib/server-auth";

const PHOTO_BUCKET = "progress-photos";

/**
 * Permanently deletes the signed-in learner's account.
 *
 * Deleting the auth user cascades to every table that holds their data
 * (profile, enrollments, progress, notes, chats, certificates, personal skill
 * copies, reminders, feedback, photos rows, AI usage). Photo files live in
 * Storage, which doesn't cascade, so they are removed first.
 */
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Sign in to delete your account." }, { status: 401 });

  const { confirm } = (await req.json().catch(() => ({}))) as { confirm?: string };
  if (confirm !== "DELETE") {
    return NextResponse.json({ error: 'Type DELETE to confirm.' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    // Photo files: everything under the learner's folder (<userId>/<skillId>/<file>).
    const storage = admin.storage.from(PHOTO_BUCKET);
    const paths = new Set<string>();
    const { data: rows } = await admin.from("progress_photos").select("storage_path").eq("user_id", user.id);
    for (const row of rows ?? []) if (row.storage_path) paths.add(row.storage_path);
    const { data: folders } = await storage.list(user.id, { limit: 1000 });
    for (const folder of folders ?? []) {
      const { data: files } = await storage.list(`${user.id}/${folder.name}`, { limit: 1000 });
      for (const file of files ?? []) paths.add(`${user.id}/${folder.name}/${file.name}`);
    }
    if (paths.size > 0) {
      const { error } = await storage.remove(Array.from(paths));
      if (error) throw new Error(`Couldn't remove photos: ${error.message}`);
    }

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Couldn't delete the account.";
    console.error("Account deletion failed:", message);
    return NextResponse.json({ error: "Couldn't delete your account. Please try again." }, { status: 500 });
  }
}
