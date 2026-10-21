"use client";

import { useCallback, useEffect, useState } from "react";
import { isValidUuid, normalizeSkillId } from "@/lib/catalog-data";
import { getSupabase } from "@/lib/supabase";
import { readJSON, writeJSON, STORAGE_KEYS } from "@/lib/storage";

export interface CertificateShare {
  token: string;
  isPublic: boolean;
  certifiedAt: string;
}

export function useCertificates(userId: string | null, authReady: boolean) {
  const [certifiedSkillIds, setCertifiedSkillIds] = useState<string[]>([]);
  const [shares, setShares] = useState<Record<string, CertificateShare>>({});

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    const localIds = readJSON<string[]>(STORAGE_KEYS.certifiedSkills, []).map(normalizeSkillId);
    setCertifiedSkillIds(localIds);

    if (!userId) return;

    const supabase = getSupabase();
    const table = () => supabase.from("user_certifications");
    Promise.resolve(table().select("skill_id, share_token, is_public, certified_at").eq("user_id", userId))
      .then((res) => (res.error ? table().select("skill_id").eq("user_id", userId) : res))
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;

        const nextShares: Record<string, CertificateShare> = {};
        for (const row of data as { skill_id: string; share_token?: string; is_public?: boolean; certified_at?: string }[]) {
          if (row.share_token) {
            nextShares[normalizeSkillId(row.skill_id)] = {
              token: row.share_token,
              isPublic: !!row.is_public,
              certifiedAt: row.certified_at || "",
            };
          }
        }
        setShares(nextShares);

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
        Promise.resolve(
          getSupabase()
            .from("user_certifications")
            .upsert({ user_id: userId, skill_id: target }, { onConflict: "user_id,skill_id" })
            .select("share_token, is_public, certified_at")
            .maybeSingle()
        ).then(({ data, error }) => {
          if (error) {
            console.warn("Note: user_certifications sync:", error.message);
            return;
          }
          if (data?.share_token) {
            setShares((prev) => ({
              ...prev,
              [target]: { token: data.share_token, isPublic: !!data.is_public, certifiedAt: data.certified_at || "" },
            }));
          }
        });
      }
    },
    [userId]
  );

  const isCertified = useCallback(
    (skillId: string) => certifiedSkillIds.includes(normalizeSkillId(skillId)),
    [certifiedSkillIds]
  );

  const getShare = useCallback((skillId: string) => shares[normalizeSkillId(skillId)], [shares]);

  const setShared = useCallback(
    async (skillId: string, isPublic: boolean): Promise<boolean> => {
      const target = normalizeSkillId(skillId);
      if (!userId || !shares[target]) return false;
      const previous = shares[target];
      setShares((prev) => ({ ...prev, [target]: { ...previous, isPublic } }));
      const { error } = await getSupabase()
        .from("user_certifications")
        .update({ is_public: isPublic })
        .eq("user_id", userId)
        .eq("skill_id", target);
      if (error) {
        setShares((prev) => ({ ...prev, [target]: previous }));
        return false;
      }
      return true;
    },
    [userId, shares]
  );

  return { certifiedSkillIds, isCertified, markCertified, getShare, setShared };
}
