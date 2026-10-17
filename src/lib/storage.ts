/**
 * Safe localStorage helpers. Storage can be unavailable (private mode, SSR,
 * blocked site data), so every access is guarded and falls back quietly.
 */

export const STORAGE_KEYS = {
  enrolledSkills: "skillora_enrolled_skills",
  completedSteps: "skillora_completed_steps",
  certifiedSkills: "skillora_guild_certified_skills",
  customAiSkills: "skillora_custom_ai_skills",
  studioView: "skillora_repertoire_view",
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
    // Storage full or blocked: progress still lives in memory and in the cloud.
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
    // ignore
  }
}
