
import { SupabaseClient } from "@supabase/supabase-js";

export type RecallQuality = 1 | 2 | 3;

export interface DrillRepetitionRecord {
  stepId: string;
  skillId: string;
  skillTitle: string;
  stepTitle: string;
  stepNumber: number;
  estimatedMinutes: number;
  repetitionCount: number;
  intervalDays: number;
  easeFactor: number;
  lastPracticedAt: string;
  nextDueAt: string;
  lastQuality?: RecallQuality;
}

export interface SpacedRepetitionStore {
  records: Record<string, DrillRepetitionRecord>;
  todayCompletedStepIds: string[];
  lastActiveDate: string;
  totalPracticeSecondsToday: number;
  practiceDates: string[];
  /** "Keep it sharp" refreshers: skill id -> dates (YYYY-MM-DD) a refresher was done. */
  refreshers?: Record<string, string[]>;
}

// Refreshers ride along in the sm2_records cloud column under this reserved key.
const REFRESHERS_KEY = "__refreshers";

export interface WeekDayActivity {
  date: string;
  label: string;
  practiced: boolean;
  isToday: boolean;
  isFuture: boolean;
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

function backfillPracticeDates(store: SpacedRepetitionStore): string[] {
  const dates = new Set<string>();
  for (const record of Object.values(store.records)) {
    if (record.lastPracticedAt) dates.add(toDateKey(new Date(record.lastPracticedAt)));
  }
  return Array.from(dates).sort();
}

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

export function logPracticeDay(): void {
  const store = getSpacedRepetitionStore();
  addPracticeDate(store, getTodayString());
  saveSpacedRepetitionStore(store);
}

/** Records a finished refresher for a skill (and counts today as practised). */
export function logRefresher(skillId: string): SpacedRepetitionStore {
  const store = getSpacedRepetitionStore();
  const today = getTodayString();
  const done = store.refreshers?.[skillId] ?? [];
  if (!done.includes(today)) {
    store.refreshers = { ...(store.refreshers || {}), [skillId]: [...done, today].sort() };
  }
  addPracticeDate(store, today);
  saveSpacedRepetitionStore(store);
  return store;
}

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

export function saveSpacedRepetitionStore(store: SpacedRepetitionStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error("Failed to save spaced repetition store:", e);
  }
}

export function mergeSpacedRepetitionStores(
  local: SpacedRepetitionStore,
  remoteDates: string[] = [],
  remoteRecordsWithExtras: Record<string, unknown> = {},
  remoteTotalSeconds: number = 0
): SpacedRepetitionStore {
  const mergedDates = Array.from(new Set([...(local.practiceDates || []), ...remoteDates])).sort();

  const { [REFRESHERS_KEY]: remoteRefreshersRaw, ...remoteRest } = remoteRecordsWithExtras;
  const remoteRecords = remoteRest as Record<string, DrillRepetitionRecord>;
  const remoteRefreshers = (remoteRefreshersRaw && typeof remoteRefreshersRaw === "object"
    ? remoteRefreshersRaw
    : {}) as Record<string, string[]>;
  const mergedRefreshers: Record<string, string[]> = { ...(local.refreshers || {}) };
  for (const [skillId, dates] of Object.entries(remoteRefreshers)) {
    if (!Array.isArray(dates)) continue;
    mergedRefreshers[skillId] = Array.from(new Set([...(mergedRefreshers[skillId] || []), ...dates])).sort();
  }

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
    refreshers: mergedRefreshers,
    totalPracticeSecondsToday: Math.max(local.totalPracticeSecondsToday || 0, remoteTotalSeconds || 0),
  };
}

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
      return localStore;
    }

    if (data) {
      const remoteDates = Array.isArray(data.practice_dates) ? data.practice_dates : [];
      const remoteRecords =
        typeof data.sm2_records === "object" && data.sm2_records !== null ? data.sm2_records : {};
      const remoteSeconds = Number(data.total_practice_seconds) || 0;

      const mergedStore = mergeSpacedRepetitionStores(localStore, remoteDates, remoteRecords, remoteSeconds);
      saveSpacedRepetitionStore(mergedStore);

      const hasNewDates = (localStore.practiceDates || []).some((d) => !remoteDates.includes(d));
      const hasNewRefreshers =
        JSON.stringify(mergedStore.refreshers || {}) !== JSON.stringify(remoteRecords[REFRESHERS_KEY] || {});
      if (hasNewDates || hasNewRefreshers) {
        await pushPracticeStatsToCloud(supabase, userId, mergedStore);
      }

      return mergedStore;
    } else {
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
        sm2_records: { ...(currentStore.records || {}), [REFRESHERS_KEY]: currentStore.refreshers || {} },
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
