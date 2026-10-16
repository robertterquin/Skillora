// SM-2 Spaced Repetition Engine for Physical & Cognitive Deliberate Practice
// Calibrated for physical micro-mechanics, motor memory decay, and tactile drills.

import { Skill, SkillStep } from "@/types/database";
import { normalizeStepId } from "@/lib/catalog-data";
import { SupabaseClient } from "@supabase/supabase-js";

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
  practiceDates: string[]; // YYYY-MM-DD, one entry per day with any practice
}

export interface WeekDayActivity {
  date: string; // YYYY-MM-DD
  label: string; // single-letter weekday
  practiced: boolean;
  isToday: boolean;
  isFuture: boolean;
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
const MAX_PRACTICE_DATES = 400;

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayString(): string {
  return toDateKey(new Date());
}

function emptyStore(): SpacedRepetitionStore {
  return {
    records: {},
    todayCompletedStepIds: [],
    lastActiveDate: getTodayString(),
    totalPracticeSecondsToday: 0,
    practiceDates: [],
  };
}

// Stores saved before practiceDates existed: seed it from each drill's last practice date.
function backfillPracticeDates(store: SpacedRepetitionStore): string[] {
  const dates = new Set<string>();
  for (const record of Object.values(store.records)) {
    if (record.lastPracticedAt) dates.add(toDateKey(new Date(record.lastPracticedAt)));
  }
  return Array.from(dates).sort();
}

/**
 * Loads the SM-2 spaced repetition state from localStorage,
 * automatically rolling over daily completions if a new calendar day has started.
 */
export function getSpacedRepetitionStore(): SpacedRepetitionStore {
  if (typeof window === "undefined") {
    return emptyStore();
  }

  const todayStr = getTodayString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyStore();
    }

    const parsed: SpacedRepetitionStore = JSON.parse(raw);
    if (!Array.isArray(parsed.practiceDates)) {
      parsed.practiceDates = backfillPracticeDates(parsed);
    }

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
    return emptyStore();
  }
}

function addPracticeDate(store: SpacedRepetitionStore, dateKey: string): void {
  if (store.practiceDates.includes(dateKey)) return;
  store.practiceDates = [...store.practiceDates, dateKey].sort().slice(-MAX_PRACTICE_DATES);
}

/**
 * Records that the learner practiced today (completing a step or a guided drill).
 */
export function logPracticeDay(): void {
  const store = getSpacedRepetitionStore();
  addPracticeDate(store, getTodayString());
  saveSpacedRepetitionStore(store);
}

/**
 * Consecutive days of practice ending today, or ending yesterday if today
 * hasn't been practiced yet (the streak is still alive until the day ends).
 */
export function getPracticeStreak(practiceDates: string[]): number {
  const practiced = new Set(practiceDates);
  const cursor = new Date();
  if (!practiced.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (practiced.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Practice activity for the current Monday–Sunday week.
 */
export function getWeekActivity(practiceDates: string[]): WeekDayActivity[] {
  const practiced = new Set(practiceDates);
  const today = new Date();
  const todayKey = toDateKey(today);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return ["M", "T", "W", "T", "F", "S", "S"].map((label, idx) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + idx);
    const key = toDateKey(day);
    return {
      date: key,
      label,
      practiced: practiced.has(key),
      isToday: key === todayKey,
      isFuture: key > todayKey,
    };
  });
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
 * Merges local and remote SpacedRepetitionStores, uniting practice dates and keeping newer drill records.
 */
export function mergeSpacedRepetitionStores(
  local: SpacedRepetitionStore,
  remoteDates: string[] = [],
  remoteRecords: Record<string, DrillRepetitionRecord> = {},
  remoteTotalSeconds: number = 0
): SpacedRepetitionStore {
  const mergedDates = Array.from(new Set([...(local.practiceDates || []), ...remoteDates])).sort();

  const mergedRecords: Record<string, DrillRepetitionRecord> = { ...(local.records || {}) };
  for (const [key, remRec] of Object.entries(remoteRecords)) {
    const locRec = mergedRecords[key];
    if (!locRec) {
      mergedRecords[key] = remRec;
    } else {
      const locTime = locRec.lastPracticedAt ? new Date(locRec.lastPracticedAt).getTime() : 0;
      const remTime = remRec.lastPracticedAt ? new Date(remRec.lastPracticedAt).getTime() : 0;
      if (remTime > locTime) {
        mergedRecords[key] = remRec;
      }
    }
  }

  return {
    ...local,
    practiceDates: mergedDates,
    records: mergedRecords,
    totalPracticeSecondsToday: Math.max(local.totalPracticeSecondsToday || 0, remoteTotalSeconds || 0),
  };
}

/**
 * Syncs the local spaced repetition store with the Supabase cloud table user_practice_stats.
 */
export async function syncPracticeStatsWithCloud(
  supabase: SupabaseClient,
  userId: string
): Promise<SpacedRepetitionStore> {
  const localStore = getSpacedRepetitionStore();
  if (!userId) return localStore;

  try {
    const { data, error } = await supabase
      .from("user_practice_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      // Table may not exist yet or offline; fallback to local
      return localStore;
    }

    if (data) {
      const remoteDates = Array.isArray(data.practice_dates) ? data.practice_dates : [];
      const remoteRecords =
        typeof data.sm2_records === "object" && data.sm2_records !== null ? data.sm2_records : {};
      const remoteSeconds = Number(data.total_practice_seconds) || 0;

      const mergedStore = mergeSpacedRepetitionStores(localStore, remoteDates, remoteRecords, remoteSeconds);
      saveSpacedRepetitionStore(mergedStore);

      // If local store has dates not in remote, push merged data back up
      const hasNewDates = (localStore.practiceDates || []).some((d) => !remoteDates.includes(d));
      if (hasNewDates) {
        await pushPracticeStatsToCloud(supabase, userId, mergedStore);
      }

      return mergedStore;
    } else {
      // No cloud record yet: push existing local store to cloud if user practiced previously
      if (
        (localStore.practiceDates && localStore.practiceDates.length > 0) ||
        Object.keys(localStore.records).length > 0
      ) {
        await pushPracticeStatsToCloud(supabase, userId, localStore);
      }
      return localStore;
    }
  } catch (err) {
    console.warn("Failed to sync practice stats with cloud:", err);
    return localStore;
  }
}

/**
 * Pushes the current spaced repetition store to Supabase user_practice_stats.
 */
export async function pushPracticeStatsToCloud(
  supabase: SupabaseClient,
  userId: string,
  store?: SpacedRepetitionStore
): Promise<boolean> {
  if (!userId) return false;
  const currentStore = store || getSpacedRepetitionStore();

  try {
    const { error } = await supabase.from("user_practice_stats").upsert(
      {
        user_id: userId,
        practice_dates: currentStore.practiceDates || [],
        sm2_records: currentStore.records || {},
        total_practice_seconds: currentStore.totalPracticeSecondsToday || 0,
        last_active_date: currentStore.lastActiveDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.warn("Failed to push practice stats to cloud:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Push practice stats error:", err);
    return false;
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

  const normStepId = normalizeStepId(stepId);
  store.records[stepId] = updatedRecord;
  store.records[normStepId] = updatedRecord;

  if (!store.todayCompletedStepIds.includes(stepId)) {
    store.todayCompletedStepIds.push(stepId);
  }
  if (!store.todayCompletedStepIds.includes(normStepId)) {
    store.todayCompletedStepIds.push(normStepId);
  }
  store.totalPracticeSecondsToday += practiceSeconds;
  addPracticeDate(store, getTodayString());

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
      const normStepId = normalizeStepId(step.id);
      const record = store.records[step.id] || store.records[normStepId];
      const isCompletedToday =
        store.todayCompletedStepIds.includes(step.id) ||
        store.todayCompletedStepIds.includes(normStepId);
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
