"use client";

import React from "react";
import { DueRefresher, REFRESHER_INTERVALS } from "@/lib/refreshers";
import { getCategoryStyle } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";

interface RefresherCardProps {
  refresher: DueRefresher;
  onPractise: () => void;
  onDone: () => void;
  onLater: () => void;
}

/** "Keep it sharp": a short revisit of a finished skill, at 7, 21 and 60 days. */
export function RefresherCard({ refresher, onPractise, onDone, onLater }: RefresherCardProps) {
  const { skill, step, stage, daysSinceFinished } = refresher;
  const category = getCategoryStyle(skill);

  return (
    <section
      aria-labelledby="refresher-heading"
      className="relative overflow-hidden rounded-2xl bg-white border border-surface-border p-5 sm:p-6 pl-6 sm:pl-7"
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", category.fill)} aria-hidden="true" />
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-xs">
            <span className="font-semibold text-ink-muted">Keep it sharp</span>
            <span className="text-ink-subtle" aria-hidden="true">·</span>
            <span className="text-ink-muted">
              Refresher {stage + 1} of {REFRESHER_INTERVALS.length}
            </span>
          </p>
          <h2 id="refresher-heading" className="mt-1 font-serif italic text-2xl text-ink leading-tight">
            {skill.title}
          </h2>
          <p className="mt-1 text-[15px] text-ink-secondary">
            {daysSinceFinished} days since you finished it. Spend 10 minutes on{" "}
            <strong className="font-semibold text-ink">{step.title}</strong>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button onClick={onPractise}>
            <AppIcon name="play-linear" className="w-4 h-4" />
            <span>Practise</span>
          </Button>
          <Button variant="secondary" onClick={onDone}>
            <AppIcon name="check-circle-linear" className="w-4 h-4" />
            <span>Done</span>
          </Button>
          <Button variant="ghost" onClick={onLater}>
            Later
          </Button>
        </div>
      </div>
    </section>
  );
}
