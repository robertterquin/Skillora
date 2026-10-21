import { Skill } from "@/types/database";
import { normalizeStepId } from "@/lib/catalog-data";

export const GUEST_OWNER = "guest";

export function isOwnSkill(skill: Skill, userId: string | null): boolean {
  if (!skill.owner_id) return false;
  return userId ? skill.owner_id === userId : skill.owner_id === GUEST_OWNER;
}

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
