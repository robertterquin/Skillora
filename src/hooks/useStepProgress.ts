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
  // When each step was finished (normalised id -> ISO time), for the weekly recap.
  const [completedAt, setCompletedAt] = useState<Record<string, string>>({});
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
      let dates = readJSON<Record<string, string>>(STORAGE_KEYS.stepCompletedAt, {});

      if (userId) {
        try {
          const { data } = await getSupabase()
            .from("user_step_completions")
            .select("step_id, completed_at")
            .eq("user_id", userId);
          if (data && data.length > 0) {
            const rows = data as { step_id: string; completed_at: string }[];
            ids = rows.map((row) => row.step_id);
            dates = { ...dates, ...Object.fromEntries(rows.map((row) => [row.step_id, row.completed_at])) };
            writeJSON(STORAGE_KEYS.completedSteps, ids);
            writeJSON(STORAGE_KEYS.stepCompletedAt, dates);
          }
        } catch (err) {
          console.error("Failed to fetch step completions", err);
        }
      }

      if (!cancelled) {
        setCompletedStepIds(ids);
        setCompletedAt(dates);
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
        ? // Compare normalised ids so a legacy id (e.g. "step-g1") is removed along with its UUID.
          current.filter((id) => normalizeStepId(id) !== normId)
        : Array.from(new Set([...current, stepId, normId]));

      completedRef.current = next;
      setCompletedStepIds(next);
      writeJSON(STORAGE_KEYS.completedSteps, next);
      setCompletedAt((prev) => {
        const dates = { ...prev };
        if (wasDone) delete dates[normId];
        else dates[normId] = new Date().toISOString();
        writeJSON(STORAGE_KEYS.stepCompletedAt, dates);
        return dates;
      });

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

  /**
   * Marks the new steps of a personal copy done wherever the original step was
   * done (old -> new id map), keeping the completion dates. No celebration or
   * practice-day logging: nothing was practised just now.
   */
  const carryOverSteps = useCallback(
    (stepIdMap: Record<string, string>) => {
      const current = completedRef.current;
      const additions = Object.entries(stepIdMap)
        .filter(([oldId]) => isStepCompleted(oldId, current))
        .map(([, newId]) => newId);
      if (additions.length === 0) return;

      const next = Array.from(new Set([...current, ...additions]));
      completedRef.current = next;
      setCompletedStepIds(next);
      writeJSON(STORAGE_KEYS.completedSteps, next);
      setCompletedAt((prev) => {
        const dates = { ...prev };
        for (const [oldId, newId] of Object.entries(stepIdMap)) {
          if (additions.includes(newId)) dates[newId] = prev[oldId] ?? new Date().toISOString();
        }
        writeJSON(STORAGE_KEYS.stepCompletedAt, dates);
        return dates;
      });

      if (userId) {
        const rows = additions.filter(isValidUuid).map((step_id) => ({ user_id: userId, step_id }));
        Promise.resolve(getSupabase().from("user_step_completions").insert(rows)).then(({ error }) => {
          if (error) console.warn("Could not carry over step progress", error.message);
        });
      }
    },
    [userId]
  );

  return { completedStepIds, completedAt, isLoaded, toggleStep, carryOverSteps };
}
