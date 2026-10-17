"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  getSpacedRepetitionStore,
  getWeekActivity,
  logPracticeDay,
  pushPracticeStatsToCloud,
  syncPracticeStatsWithCloud,
} from "@/lib/spaced-repetition";

/** Days the learner practised, synced with the cloud for signed-in users. */
export function usePracticeStats(userId: string | null, authReady: boolean) {
  const [practiceDates, setPracticeDates] = useState<string[]>([]);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    setPracticeDates(getSpacedRepetitionStore().practiceDates);

    if (userId) {
      syncPracticeStatsWithCloud(getSupabase(), userId).then((store) => {
        if (!cancelled && store?.practiceDates) setPracticeDates(store.practiceDates);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [userId, authReady]);

  /** Marks today as a practice day and syncs it. */
  const recordPracticeDay = useCallback(() => {
    logPracticeDay();
    const store = getSpacedRepetitionStore();
    setPracticeDates(store.practiceDates);
    if (userId) pushPracticeStatsToCloud(getSupabase(), userId, store);
  }, [userId]);

  /** Re-reads local stats, e.g. after a practice session modal records drills. */
  const refresh = useCallback(() => {
    const store = getSpacedRepetitionStore();
    setPracticeDates(store.practiceDates);
    if (userId) pushPracticeStatsToCloud(getSupabase(), userId, store);
  }, [userId]);

  // Recomputed when dates change; a missed day only affects this week, unlike a streak.
  const week = useMemo(() => getWeekActivity(practiceDates), [practiceDates]);

  return {
    practiceDates,
    week,
    daysThisWeek: week.filter((d) => d.practiced).length,
    recordPracticeDay,
    refresh,
  };
}
