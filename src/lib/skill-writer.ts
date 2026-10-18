import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Skill } from "@/types/database";
import { isValidUuid, normalizeCategoryId, normalizeStepId } from "@/lib/catalog-data";

const FALLBACK_CATEGORY = "33333333-3333-3333-3333-333333333333";

/**
 * Writes a learner-owned skill with its steps and resources (server only,
 * service role). When `replaceSteps` is set, steps no longer in the skill are
 * deleted, so removing a step from a personal plan sticks.
 */
export async function writeOwnedSkill(
  admin: SupabaseClient,
  skill: Skill,
  skillId: string,
  ownerId: string,
  { replaceSteps }: { replaceSteps: boolean }
): Promise<{ error?: string }> {
  let categoryId = normalizeCategoryId(skill.category_id);
  const { data: category } = await admin.from("categories").select("id").eq("id", categoryId).maybeSingle();
  if (!category) categoryId = FALLBACK_CATEGORY;

  const slugBase = (skill.slug || skill.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { error: skillError } = await admin.from("skills").upsert(
    {
      id: skillId,
      owner_id: ownerId,
      category_id: categoryId,
      title: skill.title.slice(0, 200),
      slug: `${slugBase.slice(0, 80)}-${skillId.slice(0, 8)}`,
      summary: (skill.summary || "").slice(0, 2000),
      difficulty: skill.difficulty || "beginner",
      estimated_hours: Number(skill.estimated_hours) || 2.0,
      time_commitment_label: (skill.time_commitment_label || "20 mins/day").slice(0, 100),
      is_featured: false,
    },
    { onConflict: "id" }
  );
  if (skillError) return { error: skillError.message };

  const steps = (skill.steps || []).slice(0, 12).map((st, idx) => {
    const rawId = st.id ? normalizeStepId(st.id) : "";
    return {
      id: isValidUuid(rawId) ? rawId : crypto.randomUUID(),
      skill_id: skillId,
      step_number: idx + 1,
      title: String(st.title || `Step ${idx + 1}`).slice(0, 200),
      instructions: String(st.instructions || "").slice(0, 4000),
      estimated_minutes: Math.min(60, Math.max(5, Number(st.estimated_minutes) || 20)),
    };
  });

  if (steps.length > 0) {
    const { error } = await admin.from("skill_steps").upsert(steps, { onConflict: "id" });
    if (error) return { error: error.message };
  }

  if (replaceSteps) {
    const keep = steps.map((s) => s.id);
    let query = admin.from("skill_steps").delete().eq("skill_id", skillId);
    if (keep.length > 0) query = query.not("id", "in", `(${keep.join(",")})`);
    const { error } = await query;
    if (error) return { error: error.message };
  }

  const resources = (skill.steps || []).slice(0, 12).flatMap((st, idx) =>
    (st.resources || []).slice(0, 10).map((r) => ({
      id: isValidUuid(r.id) ? r.id : crypto.randomUUID(),
      step_id: steps[idx].id,
      platform_name: String(r.platform_name || "Online tutorial").slice(0, 200),
      url: String(r.url || "").slice(0, 2000),
      resource_type: r.resource_type || "video",
      is_free: r.is_free !== false,
    }))
  ).filter((r) => /^https?:\/\//i.test(r.url));

  if (resources.length > 0) {
    const { error } = await admin.from("learning_resources").upsert(resources, { onConflict: "id" });
    if (error) console.warn("learning_resources upsert note:", error.message);
  }

  return {};
}
