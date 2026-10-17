"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Skill } from "@/types/database";
import { getCategoryStyle } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button, buttonClasses } from "@/components/ui/Button";
import { formatMinutes } from "@/components/learning/LearningPath";
import { playWoodenThud } from "@/lib/workbench-audio";

interface CurriculumCardProps {
  skill: Skill;
  isEnrolled: boolean;
  /** False once a newer draft appears further down the chat. */
  isLatest?: boolean;
  /** True while Archimedes is working, so the draft can't be changed mid-reply. */
  isBusy?: boolean;
  onEnroll: (skill: Skill) => Promise<boolean | void>;
  onResize?: (skill: Skill, direction: "shorter" | "longer") => void;
}

/**
 * The plan Archimedes drafts before anything is added: an outline with total
 * time, which the learner can shorten, lengthen or add to their Studio.
 */
export function CurriculumCard({
  skill,
  isEnrolled,
  isLatest = true,
  isBusy = false,
  onEnroll,
  onResize,
}: CurriculumCardProps) {
  const [enrolling, setEnrolling] = useState(false);
  const category = getCategoryStyle(skill);
  const steps = skill.steps || [];
  const totalMinutes = steps.reduce((sum, s) => sum + (Number(s.estimated_minutes) || 0), 0);

  const handleEnroll = async () => {
    if (enrolling) return;
    setEnrolling(true);
    try {
      await onEnroll(skill);
    } finally {
      setEnrolling(false);
    }
  };

  const status = isEnrolled ? "In your Studio" : isLatest ? "Draft plan" : "Earlier draft";

  return (
    <article
      className={cn(
        "w-full max-w-xl rounded-2xl bg-surface border shadow-card animate-fade-in text-left overflow-hidden",
        isLatest || isEnrolled ? "border-surface-border" : "border-surface-border/60 opacity-70"
      )}
      aria-label={`${status}: ${skill.title}`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-3 text-xs">
          <span className={cn("inline-flex items-center gap-1.5 font-semibold", category.text)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", category.fill)} aria-hidden="true" />
            {category.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border",
              isEnrolled
                ? "text-success bg-success-light border-success-border"
                : "text-ink-muted bg-surface-muted border-surface-border"
            )}
          >
            <AppIcon name={isEnrolled ? "check-circle-linear" : "pen-new-square-linear"} className="w-3 h-3" />
            {status}
          </span>
        </div>

        <h3 className="font-serif italic font-normal text-2xl text-ink leading-snug">{skill.title}</h3>
        <p className="mt-1.5 text-[15px] text-ink-secondary leading-relaxed">{skill.summary}</p>

        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
          <span className="font-semibold text-ink">{steps.length} steps</span>
          {totalMinutes > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>about {formatMinutes(totalMinutes)} in total</span>
            </>
          )}
          {skill.time_commitment_label && (
            <>
              <span aria-hidden="true">·</span>
              <span>{skill.time_commitment_label}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="capitalize">{skill.difficulty}</span>
        </p>

        <ol className="mt-3 divide-y divide-surface-border border-y border-surface-border">
          {steps.map((st) => (
            <li key={st.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 shrink-0 rounded-full border border-surface-border bg-white flex items-center justify-center text-xs font-semibold text-ink-muted tabular-nums">
                  {st.step_number}
                </span>
                <span className="text-ink truncate">{st.title}</span>
              </span>
              {st.estimated_minutes > 0 && (
                <span className="shrink-0 text-xs text-ink-muted tabular-nums">{st.estimated_minutes} min</span>
              )}
            </li>
          ))}
        </ol>
      </div>

      {(isEnrolled || isLatest) && (
        <div className="px-5 sm:px-6 py-4 bg-canvas border-t border-surface-border flex flex-wrap items-center gap-2">
          {isEnrolled ? (
            <Link href="/dashboard" onClick={() => playWoodenThud()} className={buttonClasses({ className: "group" })}>
              <span>Open in Studio</span>
              <AppIcon name="arrow-right-linear" className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
          ) : (
            <>
              <Button disabled={enrolling || isBusy} onClick={handleEnroll}>
                <AppIcon name="add-circle-linear" className="w-4 h-4" />
                <span>{enrolling ? "Adding…" : "Add to Studio"}</span>
              </Button>
              {onResize && (
                <div className="flex items-center gap-2 sm:ml-auto" role="group" aria-label="Adjust plan length">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isBusy || enrolling || steps.length <= 3}
                    onClick={() => onResize(skill, "shorter")}
                  >
                    Shorter
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isBusy || enrolling || steps.length >= 6}
                    onClick={() => onResize(skill, "longer")}
                  >
                    Longer
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}
