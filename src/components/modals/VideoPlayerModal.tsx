"use client";

import React, { useId } from "react";
import { AnimatePresence } from "motion/react";
import { AppIcon } from "../ui/AppIcon";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/i;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  stepTitle?: string;
}

export function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  stepTitle,
}: VideoPlayerModalProps) {
  const titleId = useId();
  const videoId = extractYouTubeId(videoUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          onClose={onClose}
          labelledBy={titleId}
          overlayClassName="bg-night/80 backdrop-blur-md"
          className="max-w-4xl bg-night text-night-bright border border-night-line flex flex-col"
        >
          <div className="p-4 sm:p-5 bg-night-raised/90 border-b border-night-line flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-night-muted uppercase mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-night-red/25 animate-pulse" />
                <span>Video tutorial</span>
              </div>
              <h3 id={titleId} className="font-display font-semibold text-sm sm:text-base text-night-text truncate">
                {stepTitle ? `${stepTitle} · ` : ""}
                {title}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-night-line hover:bg-night-hover text-xs font-medium text-night-text hover:text-night-bright transition flex items-center gap-1.5"
                title="Open video in external tab"
              >
                <AppIcon name="square-arrow-right-up-linear" className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open in YouTube</span>
              </a>

              <IconButton
            icon="close"
            label="Close video player"
            variant="ghost"
            className="bg-night-line hover:bg-night-hover text-night-muted hover:text-night-bright"
            onClick={onClose}
          />
            </div>
          </div>

          <div className="relative w-full aspect-video bg-night flex items-center justify-center">
            {videoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white&playsinline=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="p-8 text-center text-night-muted text-sm space-y-3">
                <p>Could not extract video player for this URL.</p>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${stepTitle ? stepTitle + " " : ""}${title} tutorial`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-night-line hover:bg-night-hover text-xs font-semibold text-night-bright transition"
                >
                  <span>Search Tutorials on YouTube</span>
                  <AppIcon name="square-arrow-right-up-linear" className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          <div className="p-3.5 sm:p-4 bg-night-raised/60 border-t border-night-line/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-night-muted font-medium">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${stepTitle ? stepTitle + " " : ""}${title} tutorial`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-300 hover:text-night-bright underline underline-offset-4 flex items-center gap-1 transition"
                title="Search curated YouTube tutorials for this step"
              >
                <span>Video not working? Search YouTube</span>
                <AppIcon name="square-arrow-right-up-linear" className="w-3 h-3" />
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-night-bright text-night font-semibold text-xs hover:bg-night-text transition cursor-pointer shadow-xs shrink-0"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
