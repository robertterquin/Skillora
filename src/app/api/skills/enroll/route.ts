import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase";
import { getRequestUser } from "@/lib/server-auth";
import { writeOwnedSkill } from "@/lib/skill-writer";
import { normalizeSkillId, isValidUuid } from "@/lib/catalog-data";
import { Skill } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const { skill } = (await req.json()) as { skill?: Skill };
    if (!skill || !skill.title) {
      return NextResponse.json({ error: "Skill payload is required" }, { status: 400 });
    }

    const user = await getRequestUser(req);
    if (!user) {
      return NextResponse.json({ success: true, enrolled: false, storedIn: "browser" });
    }

    const admin = createAdminClient();
    const rawId = normalizeSkillId(skill.id || "");
    const skillId = isValidUuid(rawId) ? rawId : crypto.randomUUID();

    const { data: existing, error: lookupError } = await admin
      .from("skills")
      .select("id, owner_id")
      .eq("id", skillId)
      .maybeSingle();
    if (lookupError) throw lookupError;

    const ownedByUser = existing?.owner_id === user.id;
    if (!existing || ownedByUser) {
      const { error } = await writeOwnedSkill(admin, skill, skillId, user.id, { replaceSteps: ownedByUser });
      if (error) return NextResponse.json({ error }, { status: 500 });
    }

    const { error: enrollError } = await admin
      .from("user_enrollments")
      .upsert({ user_id: user.id, skill_id: skillId, status: "active" }, { onConflict: "user_id,skill_id" });
    if (enrollError) {
      console.warn("Enrollment upsert note:", enrollError.message);
      return NextResponse.json({ success: true, skillId, enrolled: false });
    }

    return NextResponse.json({ success: true, skillId, enrolled: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to add skill";
    console.error("API enroll error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { skillId } = (await req.json()) as { skillId?: string };
    if (!skillId) return NextResponse.json({ error: "skillId is required" }, { status: 400 });

    const user = await getRequestUser(req);
    if (!user) return NextResponse.json({ success: true, removedLocally: true });

    const normId = normalizeSkillId(skillId);
    if (!isValidUuid(normId)) return NextResponse.json({ success: true, removedLocally: true });

    const { error } = await createAdminClient()
      .from("user_enrollments")
      .delete()
      .eq("user_id", user.id)
      .eq("skill_id", normId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to remove skill";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
