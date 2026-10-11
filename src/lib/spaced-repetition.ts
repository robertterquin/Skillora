// SM-2 Spaced Repetition Engine for Physical & Cognitive Deliberate Practice
// Calibrated for physical micro-mechanics, motor memory decay, and tactile drills.

import { Skill, SkillStep } from "@/types/database";

export type RecallQuality = 1 | 2 | 3; // 1 = Hard/Rusty, 2 = Solid/Fluid, 3 = Effortless/Cemented

export interface DrillRepetitionRecord {
  stepId: string;
  skillId: string;
  skillTitle: string;
  stepTitle: string;
  stepNumber: number;
  estimatedMinutes: number;
  repetitionCount: number;
  intervalDays: number;
  easeFactor: number; // default 2.5
  lastPracticedAt: string; // ISO date
  nextDueAt: string; // ISO date
  lastQuality?: RecallQuality;
}

export interface SpacedRepetitionStore {
  records: Record<string, DrillRepetitionRecord>;
  todayCompletedStepIds: string[];
  lastActiveDate: string; // YYYY-MM-DD
  totalPracticeSecondsToday: number;
}

export interface DocketItem {
  skill: Skill;
  step: SkillStep;
  record?: DrillRepetitionRecord;
  urgency: "overdue" | "due_today" | "recommended" | "new";
  daysOverdue: number;
  isCompletedToday: boolean;
}

const STORAGE_KEY = "skillora_spaced_repetition_v1";

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Loads the SM-2 spaced repetition state from localStorage,
 * automatically rolling over daily completions if a new calendar day has started.
 */
export function getSpacedRepetitionStore(): SpacedRepetitionStore {
  if (typeof window === "undefined") {
    return {
      records: {},
      todayCompletedStepIds: [],
      lastActiveDate: getTodayString(),
      totalPracticeSecondsToday: 0,
    };
  }

  const todayStr = getTodayString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        records: {},
        todayCompletedStepIds: [],
        lastActiveDate: todayStr,
        totalPracticeSecondsToday: 0,
      };
    }

    const parsed: SpacedRepetitionStore = JSON.parse(raw);

    // If day changed, roll over today's completed step tracker
    if (parsed.lastActiveDate !== todayStr) {
      parsed.lastActiveDate = todayStr;
      parsed.todayCompletedStepIds = [];
      parsed.totalPracticeSecondsToday = 0;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch (e) {
    console.error("Failed to parse spaced repetition store:", e);
    return {
      records: {},
      todayCompletedStepIds: [],
      lastActiveDate: todayStr,
      totalPracticeSecondsToday: 0,
    };
  }
}

/**
 * Persists the spaced repetition store to localStorage.
 */
export function saveSpacedRepetitionStore(store: SpacedRepetitionStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error("Failed to save spaced repetition store:", e);
  }
}

/**
 * Calculates the memory decay status relative to today.
 */
export function getDecayStatus(record?: DrillRepetitionRecord): {
  status: "overdue" | "due_today" | "fresh" | "new";
  daysDiff: number;
} {
  if (!record || !record.nextDueAt) {
    return { status: "new", daysDiff: 0 };
  }

  const now = new Date();
  const due = new Date(record.nextDueAt);
  const diffMs = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return { status: "overdue", daysDiff: diffDays };
  } else if (diffDays === 0) {
    return { status: "due_today", daysDiff: 0 };
  } else {
    return { status: "fresh", daysDiff: diffDays };
  }
}

/**
 * Records practice of a drill with a 1-3 quality score and updates SM-2 schedule.
 *
 * Quality ratings:
 * 1 = Hard / Rusty (re-test tomorrow)
 * 2 = Solid / Fluid (gradual progression)
 * 3 = Effortless / Mastered (accelerated interval)
 */
export function recordDrillPractice(
  stepId: string,
  quality: RecallQuality,
  practiceSeconds: number,
  skill: Skill,
  step: SkillStep
): DrillRepetitionRecord {
  const store = getSpacedRepetitionStore();
  const existing = store.records[stepId];

  let repetitionCount = existing ? existing.repetitionCount : 0;
  let intervalDays = existing ? existing.intervalDays : 1;
  let easeFactor = existing ? existing.easeFactor : 2.5;

  if (quality === 1) {
    // Hard / Stiff: reset interval to 1 day to reinforce motor memory
    repetitionCount = 1;
    intervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (quality === 2) {
    // Solid / Fluid: standard SM-2 progression
    repetitionCount += 1;
    if (repetitionCount === 1) {
      intervalDays = 1;
    } else if (repetitionCount === 2) {
      intervalDays = 3;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
  } else {
    // Effortless: boost ease factor and jump interval
    repetitionCount += 1;
    easeFactor = Math.min(3.0, easeFactor + 0.15);
    if (repetitionCount === 1) {
      intervalDays = 2;
    } else if (repetitionCount === 2) {
      intervalDays = 5;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor * 1.25);
    }
  }

  const now = new Date();
  const nextDueDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  const updatedRecord: DrillRepetitionRecord = {
    stepId,
    skillId: skill.id,
    skillTitle: skill.title,
    stepTitle: step.title,
    stepNumber: step.step_number,
    estimatedMinutes: step.estimated_minutes,
    repetitionCount,
    intervalDays,
    easeFactor,
    lastPracticedAt: now.toISOString(),
    nextDueAt: nextDueDate.toISOString(),
    lastQuality: quality,
  };

  store.records[stepId] = updatedRecord;

  if (!store.todayCompletedStepIds.includes(stepId)) {
    store.todayCompletedStepIds.push(stepId);
  }
  store.totalPracticeSecondsToday += practiceSeconds;

  saveSpacedRepetitionStore(store);
  return updatedRecord;
}

/**
 * Generates today's curated 3 to 4 drill Spaced Repetition Docket.
 * Prioritizes:
 * 1. Overdue drills (highest days overdue first)
 * 2. Drills due today
 * 3. Fresh unpracticed / new drills from active enrolled skills
 */
export function getDailyDocket(
  enrolledSkills: Skill[],
  completedStepIds: string[] = []
): {
  items: DocketItem[];
  isTodayComplete: boolean;
  todayCompletedCount: number;
  totalDueCount: number;
} {
  const store = getSpacedRepetitionStore();
  const candidateItems: DocketItem[] = [];

  for (const skill of enrolledSkills) {
    const steps = skill.steps || [];
    for (const step of steps) {
      const record = store.records[step.id];
      const isCompletedToday = store.todayCompletedStepIds.includes(step.id);
      const decay = getDecayStatus(record);

      let urgency: DocketItem["urgency"] = "recommended";
      if (decay.status === "overdue") {
        urgency = "overdue";
      } else if (decay.status === "due_today") {
        urgency = "due_today";
      } else if (decay.status === "new") {
        urgency = "new";
      }

      candidateItems.push({
        skill,
        step,
        record,
        urgency,
        daysOverdue: decay.daysDiff > 0 ? decay.daysDiff : 0,
        isCompletedToday,
      });
    }
  }

  // Sorting priority:
  // 1. Incomplete today first
  // 2. Overdue by highest days
  // 3. Due today
  // 4. New / unpracticed
  // 5. Recommended
  candidateItems.sort((a, b) => {
    if (a.isCompletedToday !== b.isCompletedToday) {
      return a.isCompletedToday ? 1 : -1;
    }
    const urgencyOrder = { overdue: 0, due_today: 1, new: 2, recommended: 3 };
    const uA = urgencyOrder[a.urgency];
    const uB = urgencyOrder[b.urgency];
    if (uA !== uB) return uA - uB;
    if (a.urgency === "overdue" && b.urgency === "overdue") {
      return b.daysOverdue - a.daysOverdue;
    }
    return 0;
  });

  // Take top 3 drills (or up to 4 if user is deeply enrolled)
  const targetCount = candidateItems.length >= 4 ? 4 : Math.min(3, candidateItems.length);
  const selectedItems = candidateItems.slice(0, targetCount);

  const totalDueCount = selectedItems.filter(
    (item) => item.urgency === "overdue" || item.urgency === "due_today" || item.urgency === "new"
  ).length;

  const todayCompletedCount = selectedItems.filter((item) => item.isCompletedToday).length;
  const isTodayComplete = selectedItems.length > 0 && todayCompletedCount === selectedItems.length;

  return {
    items: selectedItems,
    isTodayComplete,
    todayCompletedCount,
    totalDueCount,
  };
}
