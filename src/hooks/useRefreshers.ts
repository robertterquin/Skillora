"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { getSpacedRepetitionStore, logRefresher, pushPracticeStatsToCloud } from "@/lib/spaced-repetition";

/**
 * The learner's "Keep it sharp" refresher log (skill id -> dates done).
 * Lives in the practice store, so it syncs with practice days for signed-in users.
 */
export function useRefreshers(userId: string | null, authReady: boolean, practiceDates: string[]) {
  const [refreshers, setRefreshers] = useState<Record<string, string[]>>({});

  // Re-read after practice stats load or sync (they share the same store).
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
