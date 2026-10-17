"use client";

import React from "react";
import { LearningResource } from "@/types/database";
import { AppIcon } from "../ui/AppIcon";
import { extractYouTubeId } from "../modals/VideoPlayerModal";

export interface WatchRequest {
  url: string;
  title: string;
  stepTitle?: string;
}

interface StepResourcesProps {
  resources: LearningResource[];
  stepTitle: string;
  /** Opens YouTube links in the in-app player. */
  onWatch: (video: WatchRequest) => void;
}

/** Links for a step: YouTube opens in the in-app player, everything else in a new tab. */
export function StepResources({ resources, stepTitle, onWatch }: StepResourcesProps) {
  if (resources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {resources.map((res) => {
        if (extractYouTubeId(res.url)) {
          return (
            <div
              key={res.id}
              className="inline-flex items-center rounded-xl overflow-hidden border border-accent-vermilion-border bg-accent-vermilion-light hover:bg-accent-vermilion-border/80 transition shadow-2xs group"
            >
              <button
                type="button"
                onClick={() => onWatch({ url: res.url, title: res.platform_name, stepTitle })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-ink transition cursor-pointer"
                title="Watch in the Skillora player"
              >
                <AppIcon name="play-linear" className="w-3.5 h-3.5 text-accent-vermilion group-hover:scale-110 transition" />
                <span>{res.platform_name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-white text-accent-vermilion font-semibold">Watch</span>
              </button>
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1.5 text-accent-vermilion hover:text-ink hover:bg-accent-vermilion-border/60 border-l border-accent-vermilion-border transition flex items-center"
                title="Open on YouTube"
                aria-label={`Open ${res.platform_name} on YouTube`}
              >
                <AppIcon name="square-arrow-right-up-linear" className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        }

        return (
          <a
            key={res.id}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-subtle border border-surface-border text-xs font-medium text-ink transition"
          >
            <span>{res.platform_name}</span>
            <span className="text-xs px-1 py-px rounded bg-white text-ink-muted">{res.is_free ? "Free" : "Course"}</span>
            <AppIcon name="square-arrow-right-up-linear" className="w-3.5 h-3.5 text-ink-subtle" />
          </a>
        );
      })}
    </div>
  );
}
