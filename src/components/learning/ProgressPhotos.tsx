"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Skill } from "@/types/database";
import type { PhotoKind, ProgressPhoto, ProgressPhotosApi } from "@/hooks/useProgressPhotos";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";

const COPY: Record<PhotoKind, { label: string; hint: string }> = {
  before: { label: "Before", hint: "Your first attempt, as it is today." },
  after: { label: "After", hint: "The same shot once you've finished." },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function Slot({
  skill,
  kind,
  photo,
  api,
  onOpen,
}: {
  skill: Skill;
  kind: PhotoKind;
  photo?: ProgressPhoto;
  api: ProgressPhotosApi;
  onOpen: () => void;
}) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const { label, hint } = COPY[kind];

  const choose = () => input.current?.click();
  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      await api.upload(skill.id, kind, file);
      toast({ message: `${label} photo saved` });
    } catch (err) {
      console.warn("Photo upload failed", err);
      toast({ message: "Couldn't save that photo. Try a JPEG or PNG.", tone: "danger" });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await api.remove(skill.id, kind);
      toast({ message: `${label} photo removed`, tone: "info" });
    } catch {
      toast({ message: "Couldn't remove the photo. Please try again.", tone: "danger" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {photo && <span className="text-xs text-ink-muted">{formatDate(photo.createdAt)}</span>}
      </div>
      <input
        ref={input}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={`Choose a ${label.toLowerCase()} photo`}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {photo ? (
        <div className="relative">
          <button
            type="button"
            onClick={onOpen}
            className="block w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-muted border border-surface-border cursor-zoom-in"
            aria-label={`View ${label.toLowerCase()} photo larger`}
          >
            {photo.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- private signed URL, not optimisable
              <img src={photo.url} alt={`${label}: ${skill.title}`} className="w-full h-full object-cover" />
            ) : (
              <span className="block w-full h-full animate-pulse" aria-hidden="true" />
            )}
          </button>
          <div className="mt-1.5 flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={choose} disabled={busy}>
              Replace
            </Button>
            <IconButton
              icon="trash-bin-trash-linear"
              label={`Remove ${label.toLowerCase()} photo`}
              variant="ghost"
              size="sm"
              className="hover:text-danger"
              disabled={busy}
              onClick={remove}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={choose}
          disabled={busy}
          className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-surface-border hover:border-ink/40 bg-canvas flex flex-col items-center justify-center gap-1.5 px-3 text-center transition cursor-pointer disabled:opacity-60"
        >
          <AppIcon name="camera-linear" className="w-5 h-5 text-ink-muted" />
          <span className="text-sm font-medium text-ink">{busy ? "Saving…" : `Add ${label.toLowerCase()} photo`}</span>
          <span className="text-xs text-ink-muted">{hint}</span>
        </button>
      )}
    </div>
  );
}

function PhotoViewer({
  skill,
  photos,
  focus,
  onClose,
}: {
  skill: Skill;
  photos: Partial<Record<PhotoKind, ProgressPhoto>>;
  focus: PhotoKind | "compare";
  onClose: () => void;
}) {
  const kinds: PhotoKind[] = focus === "compare" ? ["before", "after"] : [focus];
  return (
    <Modal onClose={onClose} label={`${skill.title} photos`} className="max-w-4xl bg-white border border-surface-border">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-surface-border">
        <h2 className="font-serif italic text-2xl text-ink truncate">{skill.title}</h2>
        <IconButton icon="close" label="Close" variant="ghost" onClick={onClose} />
      </div>
      <div className={kinds.length === 2 ? "grid sm:grid-cols-2 gap-4 p-5" : "p-5"}>
        {kinds.map((kind) => {
          const photo = photos[kind];
          if (!photo?.url) return null;
          return (
            <figure key={kind}>
              {/* eslint-disable-next-line @next/next/no-img-element -- private signed URL */}
              <img src={photo.url} alt={`${COPY[kind].label}: ${skill.title}`} className="w-full rounded-xl object-contain max-h-[70vh] bg-surface-muted" />
              <figcaption className="mt-2 text-sm text-ink-muted">
                <span className="font-semibold text-ink">{COPY[kind].label}</span> · {formatDate(photo.createdAt)}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </Modal>
  );
}

interface ProgressPhotosProps {
  skill: Skill;
  /** Null for guests: photos need an account. */
  api: ProgressPhotosApi | null;
}

/** "Before & after" photos for a skill, private to the learner. */
export function ProgressPhotos({ skill, api }: ProgressPhotosProps) {
  const [viewing, setViewing] = useState<PhotoKind | "compare" | null>(null);
  const photos = api?.get(skill.id) ?? {};
  const pathsKey = `${photos.before?.path ?? ""}|${photos.after?.path ?? ""}`;

  useEffect(() => {
    api?.loadUrls(skill.id);
    // Only refetch when the files change, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill.id, pathsKey]);

  return (
    <section aria-labelledby={`photos-${skill.id}`} className="mt-8 pt-6 border-t border-surface-border">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 id={`photos-${skill.id}`} className="font-display font-semibold text-base text-ink">
          Before &amp; after
        </h3>
        {photos.before?.url && photos.after?.url ? (
          <Button size="sm" variant="ghost" onClick={() => setViewing("compare")}>
            Compare
          </Button>
        ) : (
          <span className="text-xs text-ink-muted">Only you can see these</span>
        )}
      </div>
      {api ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Slot skill={skill} kind="before" photo={photos.before} api={api} onOpen={() => setViewing("before")} />
          <Slot skill={skill} kind="after" photo={photos.after} api={api} onOpen={() => setViewing("after")} />
        </div>
      ) : (
        <p className="text-sm text-ink-muted">
          <Link href="/signin" className="font-semibold text-ink underline underline-offset-2">
            Sign in
          </Link>{" "}
          to keep a before and after photo of your progress.
        </p>
      )}
      {viewing && <PhotoViewer skill={skill} photos={photos} focus={viewing} onClose={() => setViewing(null)} />}
    </section>
  );
}
