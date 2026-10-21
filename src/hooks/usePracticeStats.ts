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

  const recordPracticeDay = useCallback(() => {
    logPracticeDay();
    const store = getSpacedRepetitionStore();
    setPracticeDates(store.practiceDates);
    if (userId) pushPracticeStatsToCloud(getSupabase(), userId, store);
  }, [userId]);

  const refresh = useCallback(() => {
    const store = getSpacedRepetitionStore();
    setPracticeDates(store.practiceDates);
    if (userId) pushPracticeStatsToCloud(getSupabase(), userId, store);
  }, [userId]);

  const week = useMemo(() => getWeekActivity(practiceDates), [practiceDates]);

  return {
    practiceDates,
    week,
    daysThisWeek: week.filter((d) => d.practiced).length,
    recordPracticeDay,
    refresh,
  };
}
