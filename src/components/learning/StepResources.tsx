"use client";

import React, { createContext, useContext } from "react";
import { LearningResource } from "@/types/database";
import type { ResourceFeedbackApi } from "@/hooks/useResourceFeedback";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { useToast } from "../ui/Toast";
import { extractYouTubeId } from "../modals/VideoPlayerModal";

/** Provided by the Studio for signed-in learners; feedback buttons only show when set. */
export const ResourceFeedbackContext = createContext<ResourceFeedbackApi | null>(null);

function FeedbackButtons({ res, stepId }: { res: LearningResource; stepId: string }) {
  const feedback = useContext(ResourceFeedbackContext);
  const toast = useToast();
  if (!feedback) return null;

  const helpful = feedback.has(res.url, "helpful");
  const broken = feedback.has(res.url, "broken");
  const button =
    "inline-flex items-center justify-center w-7 h-7 rounded-lg transition cursor-pointer hover:bg-surface-subtle";

  return (
    <span className="inline-flex items-center">
      <button
        type="button"
        aria-pressed={helpful}
        aria-label={`${res.platform_name} helped`}
        title="This helped"
        onClick={() => feedback.toggle(res.url, "helpful", stepId)}
        className={cn(button, helpful ? "text-success" : "text-ink-subtle hover:text-ink")}
      >
        <AppIcon name="thumb-up-linear" className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        aria-pressed={broken}
        aria-label={`Report ${res.platform_name} as a broken link`}
        title={broken ? "Reported as broken" : "Report broken link"}
        onClick={() => {
          const nowOn = feedback.toggle(res.url, "broken", stepId);
          toast({ message: nowOn ? "Thanks, we'll check this link" : "Report removed", tone: "info" });
        }}
        className={cn(button, broken ? "text-danger" : "text-ink-subtle hover:text-ink")}
      >
        <AppIcon name="flag-2-linear" className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

export interface WatchRequest {
  url: string;
  title: string;
  stepTitle?: string;
}

interface StepResourcesProps {
  resources: LearningResource[];
  stepTitle: string;
  /** Lets feedback be tied to the step it was given on. */
  stepId?: string;
  /** Opens YouTube links in the in-app player. */
  onWatch: (video: WatchRequest) => void;
}

/** Links for a step: YouTube opens in the in-app player, everything else in a new tab. */
export function StepResources({ resources, stepTitle, stepId = "", onWatch }: StepResourcesProps) {
  if (resources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {resources.map((res) => (
        <span key={res.id} className="inline-flex items-center gap-0.5">
          <ResourceLink res={res} stepTitle={stepTitle} onWatch={onWatch} />
          <FeedbackButtons res={res} stepId={stepId} />
        </span>
      ))}
    </div>
  );
}

function ResourceLink({
  res,
  stepTitle,
  onWatch,
}: {
  res: LearningResource;
  stepTitle: string;
  onWatch: (video: WatchRequest) => void;
}) {
  if (extractYouTubeId(res.url)) {
    return (
      <div
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
}
