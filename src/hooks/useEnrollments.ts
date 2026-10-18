"use client";

import { useCallback, useEffect, useState } from "react";
import { Skill } from "@/types/database";
import { normalizeSkillId } from "@/lib/catalog-data";
import { getSupabase } from "@/lib/supabase";
import { readJSON, writeJSON, STORAGE_KEYS } from "@/lib/storage";
import { authedFetch } from "@/lib/authed-fetch";

/**
 * Which skills are in the learner's Studio. Signed-in users merge cloud and
 * local enrollments; guests use this browser only. New users start empty.
 *
 * @param userId  Supabase user id, or null for guests.
 * @param authReady  Pass false while auth is still resolving to avoid loading guest data first.
 */
export function useEnrollments(userId: string | null, authReady: boolean) {
  const [enrolledSkillIds, setEnrolledSkillIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    const load = async () => {
      const localIds = readJSON<string[]>(STORAGE_KEYS.enrolledSkills, []).map(normalizeSkillId);
      let ids = localIds;

      if (userId) {
        try {
          const { data } = await getSupabase()
            .from("user_enrollments")
            .select("skill_id")
            .eq("user_id", userId);
          const remoteIds = (data || []).map((row: { skill_id: string }) => normalizeSkillId(row.skill_id));
          ids = Array.from(new Set([...remoteIds, ...localIds]));
          writeJSON(STORAGE_KEYS.enrolledSkills, ids);
        } catch (err) {
          console.error("Failed to fetch enrollments", err);
        }
      }

      if (!cancelled) {
        setEnrolledSkillIds(ids);
        setIsLoaded(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, authReady]);

  const removeSkill = useCallback(
    async (skillId: string) => {
      const target = normalizeSkillId(skillId);
      setEnrolledSkillIds((prev) => {
        const next = prev.filter((id) => normalizeSkillId(id) !== target);
        writeJSON(STORAGE_KEYS.enrolledSkills, next);
        return next;
      });

      if (userId) {
        try {
          await authedFetch("/api/skills/enroll", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skillId: target }),
          });
        } catch (err) {
          console.error("Failed to remove enrollment from Supabase", err);
        }
      }
    },
    [userId]
  );

  /**
   * Adds a skill (catalog, AI-built or a personal copy) and syncs it to the
   * cloud. Resolves false if the cloud save failed (always true for guests).
   */
  const addSkill = useCallback(
    async (skill: Skill): Promise<boolean> => {
      const id = normalizeSkillId(skill.id);
      setEnrolledSkillIds((prev) => {
        const next = Array.from(new Set([...prev.map(normalizeSkillId), id]));
        writeJSON(STORAGE_KEYS.enrolledSkills, next);
        return next;
      });
      // Guests' Studios live in this browser only.
      if (!userId) return true;

      try {
        const res = await authedFetch("/api/skills/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill: { ...skill, id } }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.warn("Enrollment sync note:", errorData.error);
          return false;
        }
        return true;
      } catch (err) {
        console.warn("Enrollment network sync error:", err);
        return false;
      }
    },
    [userId]
  );

  const isEnrolled = useCallback(
    (skillId: string) => enrolledSkillIds.some((id) => normalizeSkillId(id) === normalizeSkillId(skillId)),
    [enrolledSkillIds]
  );

  return { enrolledSkillIds, isLoaded, addSkill, removeSkill, isEnrolled };
}
