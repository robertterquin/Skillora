import { Skill } from "@/types/database";
import { normalizeStepId } from "@/lib/catalog-data";

/** owner_id for a guest's personal copy, which only lives in their browser. */
export const GUEST_OWNER = "guest";

/** Whether the learner can edit this skill directly (it's their own copy). */
export function isOwnSkill(skill: Skill, userId: string | null): boolean {
  if (!skill.owner_id) return false;
  return userId ? skill.owner_id === userId : skill.owner_id === GUEST_OWNER;
}

/**
 * A personal copy of a skill: new ids for the skill, its steps and their
 * resources, owned by the learner. `stepIdMap` maps old (normalised) step ids
 * to the new ones so progress and notes can move across.
 */
export function makePersonalCopy(skill: Skill, ownerId: string): { copy: Skill; stepIdMap: Record<string, string> } {
  const skillId = crypto.randomUUID();
  const stepIdMap: Record<string, string> = {};
  const steps = (skill.steps || []).map((step, idx) => {
    const id = crypto.randomUUID();
    stepIdMap[normalizeStepId(step.id)] = id;
    return {
      ...step,
      id,
      skill_id: skillId,
      step_number: idx + 1,
      resources: (step.resources || []).map((r) => ({ ...r, id: crypto.randomUUID(), step_id: id })),
    };
  });
  return {
    copy: { ...skill, id: skillId, owner_id: ownerId, is_featured: false, steps, steps_count: steps.length },
    stepIdMap,
  };
}
