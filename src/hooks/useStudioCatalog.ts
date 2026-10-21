"use client";

import { useCallback, useEffect, useState } from "react";
import { Skill } from "@/types/database";
import { INITIAL_SKILLS, normalizeSkillId } from "@/lib/catalog-data";
import { getSupabase } from "@/lib/supabase";
import { fetchLiveSkills } from "@/services/skillsService";
import { readJSON, writeJSON, STORAGE_KEYS } from "@/lib/storage";

export function useStudioCatalog() {
  const [allSkills, setAllSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchLiveSkills(getSupabase()).then((live) => {
      if (cancelled) return;

      const custom = readJSON<Skill[]>(STORAGE_KEYS.customAiSkills, []);
      const base = live && live.length > 0 ? live : INITIAL_SKILLS;
      const byId = new Map<string, Skill>();

      for (const skill of [...base, ...custom]) {
        const id = normalizeSkillId(skill.id);
        byId.set(id, { ...skill, id });
      }

      setAllSkills(Array.from(byId.values()));
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const rememberSkill = useCallback((skill: Skill) => {
    const id = normalizeSkillId(skill.id);
    const saved = { ...skill, id };
    const custom = readJSON<Skill[]>(STORAGE_KEYS.customAiSkills, []);
    writeJSON(STORAGE_KEYS.customAiSkills, [saved, ...custom.filter((s) => normalizeSkillId(s.id) !== id)]);
    setAllSkills((prev) => [saved, ...prev.filter((s) => s.id !== id)]);
  }, []);

  return { allSkills, isLoaded, rememberSkill };
}
