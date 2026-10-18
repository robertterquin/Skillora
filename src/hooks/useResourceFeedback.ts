"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export type FeedbackKind = "helpful" | "broken";

export interface ResourceFeedbackApi {
  has: (url: string, kind: FeedbackKind) => boolean;
  /** Adds or removes the learner's feedback; returns true if it is now on. */
  toggle: (url: string, kind: FeedbackKind, stepId?: string) => boolean;
}

const key = (url: string, kind: FeedbackKind) => `${kind}:${url}`;

/** The signed-in learner's own resource feedback. Returns null for guests. */
export function useResourceFeedback(userId: string | null): ResourceFeedbackApi | null {
  const [given, setGiven] = useState<Set<string>>(new Set());

  useEffect(() => {
    setGiven(new Set());
    if (!userId) return;
    let cancelled = false;
    Promise.resolve(
      getSupabase().from("resource_feedback").select("resource_url, kind").eq("user_id", userId)
    ).then(({ data, error }) => {
      if (cancelled || error || !data) return;
      setGiven(new Set((data as { resource_url: string; kind: FeedbackKind }[]).map((r) => key(r.resource_url, r.kind))));
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const has = useCallback((url: string, kind: FeedbackKind) => given.has(key(url, kind)), [given]);

  const toggle = useCallback(
    (url: string, kind: FeedbackKind, stepId?: string) => {
      if (!userId) return false;
      const k = key(url, kind);
      const isOn = !given.has(k);
      setGiven((prev) => {
        const next = new Set(prev);
        if (isOn) next.add(k);
        else next.delete(k);
        return next;
      });
      const table = getSupabase().from("resource_feedback");
      const request = isOn
        ? table.insert({ user_id: userId, resource_url: url, kind, step_id: stepId ?? null })
        : table.delete().eq("user_id", userId).eq("resource_url", url).eq("kind", kind);
      Promise.resolve(request).then(({ error }) => {
        if (error) console.warn("Could not save resource feedback", error.message);
      });
      return isOn;
    },
    [userId, given]
  );

  return userId ? { has, toggle } : null;
}
