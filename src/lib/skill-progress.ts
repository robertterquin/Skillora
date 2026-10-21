import { Skill, SkillStep } from "@/types/database";
import { CATEGORIES, isStepCompleted, normalizeCategoryId } from "@/lib/catalog-data";

export interface CategoryStyle {
  label: string;
  text: string;
  fill: string;
  soft: string;
  border: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "11111111-1111-1111-1111-111111111111": {
    label: "Music",
    text: "text-deck-music",
    fill: "bg-deck-music",
    soft: "bg-deck-music/10",
    border: "border-deck-music",
  },
  "22222222-2222-2222-2222-222222222222": {
    label: "Languages",
    text: "text-deck-languages",
    fill: "bg-deck-languages",
    soft: "bg-deck-languages/10",
    border: "border-deck-languages",
  },
  "33333333-3333-3333-3333-333333333333": {
    label: "Crafts & life",
    text: "text-deck-life",
    fill: "bg-deck-life",
    soft: "bg-deck-life/10",
    border: "border-deck-life",
  },
  "44444444-4444-4444-4444-444444444444": {
    label: "Tech",
    text: "text-deck-tech",
    fill: "bg-deck-tech",
    soft: "bg-deck-tech/10",
    border: "border-deck-tech",
  },
};

export function getCategoryStyle(skill: Skill): CategoryStyle {
  return getCategoryStyleById(skill.category_id, skill.category?.name);
}

export function getCategoryStyleById(categoryId: string, fallbackName?: string): CategoryStyle {
  const id = normalizeCategoryId(categoryId);
  return (
    CATEGORY_STYLES[id] ?? {
      label: fallbackName || CATEGORIES.find((c) => c.id === id)?.name || "Craft",
      text: "text-ink-secondary",
      fill: "bg-ink",
      soft: "bg-surface-muted",
      border: "border-ink",
    }
  );
}

export interface SkillProgress {
  steps: SkillStep[];
  doneCount: number;
  totalCount: number;
  percent: number;
  isComplete: boolean;
  nextStep?: SkillStep;
}

export function getSkillProgress(skill: Skill, completedStepIds: string[]): SkillProgress {
  const steps = skill.steps || [];
  const doneCount = steps.filter((s) => isStepCompleted(s.id, completedStepIds)).length;
  const totalCount = steps.length;
  return {
    steps,
    doneCount,
    totalCount,
    percent: totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0,
    isComplete: totalCount > 0 && doneCount === totalCount,
    nextStep: steps.find((s) => !isStepCompleted(s.id, completedStepIds)),
  };
}

export function pickFocusSkill(skills: Skill[], completedStepIds: string[]): Skill | undefined {
  const withProgress = skills.map((skill) => ({ skill, p: getSkillProgress(skill, completedStepIds) }));
  return (
    withProgress.find(({ p }) => p.doneCount > 0 && !p.isComplete)?.skill ??
    withProgress.find(({ p }) => !p.isComplete)?.skill
  );
}

export type DurationFilter = "all" | "quick" | "sprint" | "deep";

export interface StudioFilters {
  categoryId: string;
  duration: DurationFilter;
  query: string;
}

export function filterSkills(skills: Skill[], { categoryId, duration, query }: StudioFilters): Skill[] {
  const q = query.trim().toLowerCase();
  return skills.filter((skill) => {
    if (categoryId !== "cat-all" && normalizeCategoryId(skill.category_id) !== normalizeCategoryId(categoryId)) {
      return false;
    }
    const hours = skill.estimated_hours;
    if (duration === "quick" && hours > 2) return false;
    if (duration === "sprint" && (hours <= 2 || hours > 6)) return false;
    if (duration === "deep" && hours <= 6) return false;
    if (q) {
      return [skill.title, skill.summary, skill.time_commitment_label].some((text) =>
        (text || "").toLowerCase().includes(q)
      );
    }
    return true;
  });
}
