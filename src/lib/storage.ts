export const STORAGE_KEYS = {
  enrolledSkills: "skillora_enrolled_skills",
  completedSteps: "skillora_completed_steps",
  certifiedSkills: "skillora_guild_certified_skills",
  customAiSkills: "skillora_custom_ai_skills",
  studioView: "skillora_repertoire_view",
  interest: "skillora_interest",
  stepNotes: "skillora_step_notes",
  stepCompletedAt: "skillora_step_completed_at",
  recapDismissed: "skillora_recap_dismissed",
  refresherLater: "skillora_refresher_later",
} as const;

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}

export function readString(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
  }
}
