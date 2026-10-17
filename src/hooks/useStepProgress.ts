"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isStepCompleted, isValidUuid, normalizeStepId } from "@/lib/catalog-data";
import { getSupabase } from "@/lib/supabase";
import { readJSON, writeJSON, STORAGE_KEYS } from "@/lib/storage";

interface UseStepProgressOptions {
  /** Called after a step is newly marked complete (not when it is un-marked). */
  onStepCompleted?: () => void;
}

/**
 * Completed curriculum steps. Signed-in users load from Supabase (falling back
 * to this browser); every change is saved locally and synced to the cloud.
 */
export function useStepProgress(
  userId: string | null,
  authReady: boolean,
  { onStepCompleted }: UseStepProgressOptions = {}
) {
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Keep the latest list in a ref so toggleStep stays stable and never reads stale state.
  const completedRef = useRef<string[]>([]);
  completedRef.current = completedStepIds;
  const onCompletedRef = useRef(onStepCompleted);
  onCompletedRef.current = onStepCompleted;

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    const load = async () => {
      let ids = readJSON<string[]>(STORAGE_KEYS.completedSteps, []);

      if (userId) {
        try {
          const { data } = await getSupabase()
            .from("user_step_completions")
            .select("step_id")
            .eq("user_id", userId);
          if (data && data.length > 0) {
            ids = data.map((row: { step_id: string }) => row.step_id);
            writeJSON(STORAGE_KEYS.completedSteps, ids);
          }
        } catch (err) {
          console.error("Failed to fetch step completions", err);
        }
      }

      if (!cancelled) {
        setCompletedStepIds(ids);
        setIsLoaded(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, authReady]);

  /** Toggles a step and returns true if it is now complete. */
  const toggleStep = useCallback(
    (stepId: string): boolean => {
      const normId = normalizeStepId(stepId);
      const current = completedRef.current;
      const wasDone = isStepCompleted(stepId, current);

      const next = wasDone
        ? current.filter((id) => id !== stepId && id !== normId)
        : Array.from(new Set([...current, stepId, normId]));

      completedRef.current = next;
      setCompletedStepIds(next);
      writeJSON(STORAGE_KEYS.completedSteps, next);

      if (!wasDone) onCompletedRef.current?.();

      if (userId && isValidUuid(normId)) {
        const table = getSupabase().from("user_step_completions");
        const request = wasDone
          ? table.delete().eq("user_id", userId).eq("step_id", normId)
          : table.insert({ user_id: userId, step_id: normId });
        Promise.resolve(request).catch((err: unknown) =>
          console.error("Failed to sync step completion to Supabase", err)
        );
      }

      return !wasDone;
    },
    [userId]
  );

  return { completedStepIds, isLoaded, toggleStep };
}
