"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeStepId } from "@/lib/catalog-data";
import { getSupabase } from "@/lib/supabase";
import { readJSON, writeJSON, STORAGE_KEYS } from "@/lib/storage";

export const MAX_NOTE_LENGTH = 2000;
const CLOUD_SAVE_DELAY_MS = 800;

type Notes = Record<string, string>;

export function useStepNotes(userId: string | null, authReady: boolean) {
  const [notes, setNotes] = useState<Notes>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    const local = readJSON<Notes>(STORAGE_KEYS.stepNotes, {});
    setNotes(local);

    if (userId) {
      Promise.resolve(getSupabase().from("user_step_notes").select("step_id, note").eq("user_id", userId)).then(
        ({ data, error }) => {
          if (cancelled || error || !data) return;
          const remote: Notes = {};
          for (const row of data as { step_id: string; note: string }[]) remote[row.step_id] = row.note;
          const merged = { ...local, ...remote };
          setNotes(merged);
          writeJSON(STORAGE_KEYS.stepNotes, merged);
        }
      );
    }

    return () => {
      cancelled = true;
    };
  }, [userId, authReady]);

  useEffect(() => {
    const pending = timers.current;
    return () => Object.values(pending).forEach(clearTimeout);
  }, []);

  const getNote = useCallback((stepId: string) => notes[normalizeStepId(stepId)] ?? "", [notes]);

  const saveNote = useCallback(
    (stepId: string, text: string) => {
      const id = normalizeStepId(stepId);
      const value = text.slice(0, MAX_NOTE_LENGTH);

      setNotes((prev) => {
        const next = { ...prev };
        if (value.trim()) next[id] = value;
        else delete next[id];
        writeJSON(STORAGE_KEYS.stepNotes, next);
        return next;
      });

      if (!userId) return;
      clearTimeout(timers.current[id]);
      timers.current[id] = setTimeout(() => {
        const table = getSupabase().from("user_step_notes");
        const request = value.trim()
          ? table.upsert(
              { user_id: userId, step_id: id, note: value, updated_at: new Date().toISOString() },
              { onConflict: "user_id,step_id" }
            )
          : table.delete().eq("user_id", userId).eq("step_id", id);
        Promise.resolve(request).then(({ error }) => {
          if (error) console.warn("Could not sync step note", error.message);
        });
      }, CLOUD_SAVE_DELAY_MS);
    },
    [userId]
  );

  const copyNotes = useCallback(
    (stepIdMap: Record<string, string>) => {
      for (const [oldId, newId] of Object.entries(stepIdMap)) {
        const note = notes[oldId];
        if (note) saveNote(newId, note);
      }
    },
    [notes, saveNote]
  );

  return { getNote, saveNote, copyNotes };
}
