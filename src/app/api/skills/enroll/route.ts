import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeSkillId, normalizeCategoryId, normalizeStepId, isValidUuid } from "@/lib/mock-data";
import { Skill } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { skill, userId } = body as { skill: Skill; userId?: string };

    if (!skill || !skill.title) {
      return NextResponse.json({ error: "Skill payload is required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const rawNormId = normalizeSkillId(skill.id || "");
    const normId = isValidUuid(rawNormId) ? rawNormId : crypto.randomUUID();
    const normCatId = normalizeCategoryId(skill.category_id);

    // 1. Ensure category exists or fallback
    let validCatId = normCatId;
    const { data: catExists } = await admin
      .from("categories")
      .select("id")
      .eq("id", validCatId)
      .maybeSingle();

    if (!catExists) {
      // Fallback to Everyday Craft & Life Skills category
      validCatId = "33333333-3333-3333-3333-333333333333";
    }

    // 2. Upsert skill in public.skills table (bypassing RLS with service role)
    const slug = skill.slug || skill.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error: skillError } = await admin.from("skills").upsert(
      {
        id: normId,
        category_id: validCatId,
        title: skill.title,
        slug: `${slug}-${normId.slice(0, 4)}`,
        summary: skill.summary || "",
        difficulty: skill.difficulty || "beginner",
        estimated_hours: Number(skill.estimated_hours) || 2.0,
        time_commitment_label: skill.time_commitment_label || "20 mins/day",
        is_featured: skill.is_featured ?? false,
      },
      { onConflict: "id" }
    );

    if (skillError) {
      console.error("Supabase admin skill upsert error:", skillError);
      return NextResponse.json({ error: skillError.message }, { status: 500 });
    }

    // 3. Upsert steps if provided
    if (skill.steps && Array.isArray(skill.steps) && skill.steps.length > 0) {
      const stepsToUpsert = skill.steps.map((st, idx) => {
        const rawStepId = st.id ? normalizeStepId(st.id) : "";
        const validStepId = isValidUuid(rawStepId) ? rawStepId : crypto.randomUUID();
        return {
          id: validStepId,
          skill_id: normId,
          step_number: st.step_number || idx + 1,
          title: st.title,
          instructions: st.instructions || "",
          estimated_minutes: st.estimated_minutes || 20,
        };
      });

      const { error: stepsError } = await admin.from("skill_steps").upsert(stepsToUpsert, {
        onConflict: "id",
      });

      if (stepsError) {
        console.warn("Supabase admin skill_steps upsert note:", stepsError.message);
      }

      // Upsert resources
      const resourcesToUpsert: {
        id: string;
        step_id: string;
        platform_name: string;
        url: string;
        resource_type: string;
        is_free: boolean;
      }[] = [];

      skill.steps.forEach((st, idx) => {
        const stepId = stepsToUpsert[idx]?.id;
        if (stepId && st.resources && Array.isArray(st.resources)) {
          st.resources.forEach((r) => {
            resourcesToUpsert.push({
              id: r.id && r.id.length > 20 ? r.id : crypto.randomUUID(),
              step_id: stepId,
              platform_name: r.platform_name || "Online Tutorial",
              url: r.url || "https://google.com",
              resource_type: r.resource_type || "interactive",
              is_free: r.is_free !== false,
            });
          });
        }
      });

      if (resourcesToUpsert.length > 0) {
        const { error: resError } = await admin
          .from("learning_resources")
          .upsert(resourcesToUpsert, { onConflict: "id" });
        if (resError) {
          console.warn("Supabase admin learning_resources upsert note:", resError.message);
        }
      }
    }

    // 4. Upsert user enrollment if user ID is present
    let enrolledInSupabase = false;
    if (userId) {
      const { error: enrollError } = await admin.from("user_enrollments").upsert(
        {
          user_id: userId,
          skill_id: normId,
          status: "active",
        },
        { onConflict: "user_id,skill_id" }
      );

      if (enrollError) {
        console.warn("Supabase admin user_enrollments note:", enrollError.message);
      } else {
        enrolledInSupabase = true;
      }
    }

    return NextResponse.json({
      success: true,
      skillId: normId,
      enrolled: enrolledInSupabase,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to process skill enrollment";
    console.error("API enroll error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { skillId, userId } = await req.json();
    if (!skillId || !userId) {
      return NextResponse.json({ error: "skillId and userId are required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const normId = normalizeSkillId(skillId);

    if (!isValidUuid(normId)) {
      return NextResponse.json({ success: true, removedLocally: true });
    }

    const { error } = await admin
      .from("user_enrollments")
      .delete()
      .eq("user_id", userId)
      .eq("skill_id", normId);

    if (error) {
      console.warn("Supabase admin delete enrollment note:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to unenroll skill";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

