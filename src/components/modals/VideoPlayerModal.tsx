"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SolarIcon } from "../ui/SolarIcon";

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
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
  const videoId = extractYouTubeId(videoUrl);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-neutral-950 text-white rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden my-auto flex flex-col"
          >
            {/* Dark Cinema Header */}
            <div className="p-4 sm:p-5 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-neutral-400 uppercase mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>DISTRACTION-FREE WORKBENCH PLAYER</span>
                </div>
                <h3 className="font-display font-semibold text-sm sm:text-base text-neutral-100 truncate">
                  {stepTitle ? `${stepTitle} · ` : ""}
                  {title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-[11px] font-medium text-neutral-300 hover:text-white transition flex items-center gap-1.5"
                  title="Open video in external tab"
                >
                  <SolarIcon name="square-arrow-right-up-linear" className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open in YouTube</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
                  aria-label="Close video player"
                >
                  <SolarIcon name="close-circle-linear" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Iframe Container (16:9 Aspect Ratio) */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {videoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white&playsinline=1`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="p-8 text-center text-neutral-400 text-sm space-y-3">
                  <p>Could not extract video player for this URL.</p>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      `${stepTitle ? stepTitle + " " : ""}${title} tutorial`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition"
                  >
                    <span>Search Tutorials on YouTube</span>
                    <SolarIcon name="square-arrow-right-up-linear" className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Quiet Footer Note with Fallback */}
            <div className="p-3.5 sm:p-4 bg-neutral-900/60 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-400 font-medium">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-neutral-400 font-mono">
                  Distraction-free deliberate practice mode.
                </span>
                <span className="text-neutral-600 hidden sm:inline">·</span>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${stepTitle ? stepTitle + " " : ""}${title} tutorial`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-brand-300 hover:text-white underline underline-offset-4 flex items-center gap-1 transition"
                  title="Search curated YouTube tutorials for this step"
                >
                  <span>Video unavailable or need alternative? Search YouTube</span>
                  <SolarIcon name="square-arrow-right-up-linear" className="w-3 h-3" />
                </a>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-white text-neutral-950 font-semibold text-xs hover:bg-neutral-200 transition cursor-pointer shadow-xs shrink-0"
              >
                Return to Workshop
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
