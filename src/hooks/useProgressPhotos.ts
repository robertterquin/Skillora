"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { normalizeSkillId } from "@/lib/catalog-data";
import { resizeImage } from "@/lib/resize-image";

export type PhotoKind = "before" | "after";
const BUCKET = "progress-photos";
const URL_TTL_SECONDS = 60 * 60;

export interface ProgressPhoto {
  path: string;
  createdAt: string;
  url?: string;
}

export interface ProgressPhotosApi {
  get: (skillId: string) => Partial<Record<PhotoKind, ProgressPhoto>>;
  loadUrls: (skillId: string) => void;
  upload: (skillId: string, kind: PhotoKind, file: File) => Promise<void>;
  remove: (skillId: string, kind: PhotoKind) => Promise<void>;
}

type Store = Record<string, Partial<Record<PhotoKind, ProgressPhoto>>>;

export function useProgressPhotos(userId: string | null): ProgressPhotosApi | null {
  const [photos, setPhotos] = useState<Store>({});

  useEffect(() => {
    setPhotos({});
    if (!userId) return;
    let cancelled = false;
    Promise.resolve(
      getSupabase().from("progress_photos").select("skill_id, kind, storage_path, created_at").eq("user_id", userId)
    ).then(({ data, error }) => {
      if (cancelled || error || !data) return;
      const next: Store = {};
      for (const row of data as { skill_id: string; kind: PhotoKind; storage_path: string; created_at: string }[]) {
        const id = normalizeSkillId(row.skill_id);
        next[id] = { ...next[id], [row.kind]: { path: row.storage_path, createdAt: row.created_at } };
      }
      setPhotos(next);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const get = useCallback((skillId: string) => photos[normalizeSkillId(skillId)] || {}, [photos]);

  const loadUrls = useCallback(
    (skillId: string) => {
      const id = normalizeSkillId(skillId);
      const entries = Object.entries(photos[id] || {}).filter(([, p]) => p && !p.url) as [PhotoKind, ProgressPhoto][];
      if (entries.length === 0) return;
      Promise.resolve(
        getSupabase().storage.from(BUCKET).createSignedUrls(entries.map(([, p]) => p.path), URL_TTL_SECONDS)
      ).then(({ data }) => {
        if (!data) return;
        setPhotos((prev) => {
          const current = { ...prev[id] };
          entries.forEach(([kind, p], i) => {
            const signed = data[i]?.signedUrl;
            if (signed && current[kind]?.path === p.path) current[kind] = { ...current[kind]!, url: signed };
          });
          return { ...prev, [id]: current };
        });
      });
    },
    [photos]
  );

  const upload = useCallback(
    async (skillId: string, kind: PhotoKind, file: File) => {
      if (!userId) throw new Error("Sign in to save photos");
      const id = normalizeSkillId(skillId);
      const blob = await resizeImage(file);
      const path = `${userId}/${id}/${kind}-${Date.now()}.jpg`;
      const storage = getSupabase().storage.from(BUCKET);

      const { error: uploadError } = await storage.upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (uploadError) throw uploadError;

      const { data: row, error: rowError } = await getSupabase()
        .from("progress_photos")
        .upsert({ user_id: userId, skill_id: id, kind, storage_path: path }, { onConflict: "user_id,skill_id,kind" })
        .select("created_at")
        .single();
      if (rowError) {
        await storage.remove([path]);
        throw rowError;
      }

      const old = photos[id]?.[kind]?.path;
      if (old && old !== path) storage.remove([old]).catch(() => undefined);

      setPhotos((prev) => ({
        ...prev,
        [id]: { ...prev[id], [kind]: { path, createdAt: row.created_at, url: URL.createObjectURL(blob) } },
      }));
    },
    [userId, photos]
  );

  const remove = useCallback(
    async (skillId: string, kind: PhotoKind) => {
      if (!userId) return;
      const id = normalizeSkillId(skillId);
      const photo = photos[id]?.[kind];
      if (!photo) return;
      const { error } = await getSupabase()
        .from("progress_photos")
        .delete()
        .eq("user_id", userId)
        .eq("skill_id", id)
        .eq("kind", kind);
      if (error) throw error;
      await getSupabase().storage.from(BUCKET).remove([photo.path]);
      setPhotos((prev) => {
        const current = { ...prev[id] };
        delete current[kind];
        return { ...prev, [id]: current };
      });
    },
    [userId, photos]
  );

  return userId ? { get, loadUrls, upload, remove } : null;
}
