"use client";

import { useCallback, useEffect, useState } from "react";
import { isValidUuid, normalizeSkillId } from "@/lib/catalog-data";
import { getSupabase } from "@/lib/supabase";
import { readJSON, writeJSON, STORAGE_KEYS } from "@/lib/storage";

/**
 * Skills the learner has earned a certificate for (passed the assessment).
 * Local certificates earned while signed out are uploaded once the user signs in.
 */
export function useCertificates(userId: string | null, authReady: boolean) {
  const [certifiedSkillIds, setCertifiedSkillIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    const localIds = readJSON<string[]>(STORAGE_KEYS.certifiedSkills, []).map(normalizeSkillId);
    setCertifiedSkillIds(localIds);

    if (!userId) return;

    const supabase = getSupabase();
    supabase
      .from("user_certifications")
      .select("skill_id")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;

        const remoteIds = data.map((row: { skill_id: string }) => normalizeSkillId(row.skill_id));
        const merged = Array.from(new Set([...remoteIds, ...localIds]));
        setCertifiedSkillIds(merged);
        writeJSON(STORAGE_KEYS.certifiedSkills, merged);

        const notUploaded = localIds.filter((id) => !remoteIds.includes(id) && isValidUuid(id));
        if (notUploaded.length > 0) {
          supabase
            .from("user_certifications")
            .upsert(
              notUploaded.map((skill_id) => ({ user_id: userId, skill_id })),
              { onConflict: "user_id,skill_id" }
            )
            .then();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, authReady]);

  const markCertified = useCallback(
    (skillId: string) => {
      const target = normalizeSkillId(skillId);
      setCertifiedSkillIds((prev) => {
        const next = Array.from(new Set([...prev, target]));
        writeJSON(STORAGE_KEYS.certifiedSkills, next);
        return next;
      });

      if (userId && isValidUuid(target)) {
        getSupabase()
          .from("user_certifications")
          .upsert({ user_id: userId, skill_id: target }, { onConflict: "user_id,skill_id" })
          .then(({ error }) => {
            if (error) console.warn("Note: user_certifications sync:", error.message);
          });
      }
    },
    [userId]
  );

  const isCertified = useCallback(
    (skillId: string) => certifiedSkillIds.includes(normalizeSkillId(skillId)),
    [certifiedSkillIds]
  );

  return { certifiedSkillIds, isCertified, markCertified };
}
