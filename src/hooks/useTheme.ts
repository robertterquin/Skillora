"use client";

import { useCallback, useEffect, useState } from "react";
import { applyTheme, readThemePreference, saveThemePreference, ThemePreference } from "@/lib/theme";

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    setPreference(readThemePreference());
  }, []);

  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
    saveThemePreference(next);
  }, []);

  return { preference, setTheme };
}
