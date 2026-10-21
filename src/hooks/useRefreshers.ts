"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { getSpacedRepetitionStore, logRefresher, pushPracticeStatsToCloud } from "@/lib/spaced-repetition";

export function useRefreshers(userId: string | null, authReady: boolean, practiceDates: string[]) {
  const [refreshers, setRefreshers] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!authReady) return;
    setRefreshers(getSpacedRepetitionStore().refreshers || {});
  }, [authReady, practiceDates]);

  const markDone = useCallback(
    (skillId: string) => {
      const store = logRefresher(skillId);
      setRefreshers(store.refreshers || {});
      if (userId) pushPracticeStatsToCloud(getSupabase(), userId, store);
    },
    [userId]
  );

  return { refreshers, markDone };
}
