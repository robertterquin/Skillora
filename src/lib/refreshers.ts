import { Skill, SkillStep } from "@/types/database";
import { isStepCompleted, normalizeStepId } from "@/lib/catalog-data";

/** Days until each refresher: 7 after finishing, then +14 (day 21), then +39 (day 60). */
export const REFRESHER_INTERVALS = [7, 14, 39];
const HARD_WORDS = /\b(hard|difficult|struggl\w*|tricky|trouble|drift\w*|slip\w*|can'?t|cannot|confus\w*|stuck|tense)\b/i;

export interface DueRefresher {
  skill: Skill;
  step: SkillStep;
  /** 0-based refresher number (0 = the first, at day 7). */
  stage: number;
  daysSinceFinished: number;
  dueOn: string;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return dateKey(new Date(y, m - 1, d + days));
}

function daysBetween(fromKey: string, toKey: string): number {
  const [y1, m1, d1] = fromKey.split("-").map(Number);
  const [y2, m2, d2] = toKey.split("-").map(Number);
  return Math.round((new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()) / 86_400_000);
}

/** The step to revisit: one the learner's note says was hard, otherwise the final step. */
export function pickRefresherStep(skill: Skill, getNote: (stepId: string) => string): SkillStep | undefined {
  const steps = skill.steps || [];
  return steps.find((s) => HARD_WORDS.test(getNote(s.id))) ?? steps[steps.length - 1];
}

/**
 * Refreshers due today or earlier for finished skills, most overdue first.
 * A skill counts as finished on the day its last step was completed.
 */
export function getDueRefreshers(
  skills: Skill[],
  completedStepIds: string[],
  completedAt: Record<string, string>,
  refreshers: Record<string, string[]>,
  getNote: (stepId: string) => string,
  today: Date = new Date()
): DueRefresher[] {
  const todayKey = dateKey(today);
  const due: DueRefresher[] = [];

  for (const skill of skills) {
    const steps = skill.steps || [];
    if (steps.length === 0 || !steps.every((s) => isStepCompleted(s.id, completedStepIds))) continue;

    const finishTimes = steps
      .map((s) => completedAt[normalizeStepId(s.id)] ?? completedAt[s.id])
      .filter((t): t is string => !!t);
    if (finishTimes.length === 0) continue; // finished before dates were recorded
    const finishedOn = dateKey(new Date(finishTimes.sort().at(-1)!));

    const done = (refreshers[skill.id] || []).filter((d) => d >= finishedOn).sort();
    const stage = done.length;
    if (stage >= REFRESHER_INTERVALS.length) continue;

    const anchor = stage === 0 ? finishedOn : done[stage - 1];
    const dueOn = addDays(anchor, REFRESHER_INTERVALS[stage]);
    if (dueOn > todayKey) continue;

    const step = pickRefresherStep(skill, getNote);
    if (!step) continue;
    due.push({ skill, step, stage, daysSinceFinished: daysBetween(finishedOn, todayKey), dueOn });
  }

  return due.sort((a, b) => a.dueOn.localeCompare(b.dueOn));
}
