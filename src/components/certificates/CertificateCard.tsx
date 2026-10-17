"use client";

import React from "react";
import { Skill } from "@/types/database";
import { getCategoryStyle } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { formatMinutes } from "../learning/LearningPath";

interface CertificateCardProps {
  skill: Skill;
  doneCount: number;
  totalCount: number;
  isCertified: boolean;
  onOpenExam?: (skill: Skill) => void;
}

/** One skill in the certificates list: certified, ready for the assessment, or still in progress. */
export function CertificateCard({ skill, doneCount, totalCount, isCertified, onOpenExam }: CertificateCardProps) {
  const category = getCategoryStyle(skill);
  const isDone = totalCount > 0 && doneCount === totalCount;
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const hours = Number(skill.estimated_hours) || 0;

  return (
    <article
      className={cn(
        "p-5 rounded-2xl border flex flex-col justify-between min-h-[180px] transition-colors",
        isCertified
          ? "bg-paper-warm border-surface-border shadow-card"
          : isDone
          ? "bg-surface border-surface-border shadow-2xs"
          : "bg-canvas border-dashed border-surface-border"
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className={cn("inline-flex items-center gap-1.5 font-semibold", category.text)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", category.fill)} />
            {category.label}
          </span>
          {hours > 0 && <span className="text-ink-muted">About {formatMinutes(Math.round(hours * 60))}</span>}
        </div>
        <h4 className="mt-2 font-display font-bold text-base text-ink leading-snug">{skill.title}</h4>
        {skill.summary && <p className="mt-1 text-sm text-ink-secondary line-clamp-2">{skill.summary}</p>}
      </div>

      <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between gap-3">
        {isCertified ? (
          <>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <AppIcon name="diploma-verified-linear" className={cn("w-4 h-4", category.text)} />
                Certified
              </p>
              <p className="text-xs text-ink-muted">Assessment passed</p>
            </div>
            {onOpenExam && (
              <Button size="sm" variant="secondary" onClick={() => onOpenExam(skill)}>
                <span>View certificate</span>
                <AppIcon name="arrow-right-linear" className="w-3.5 h-3.5" />
              </Button>
            )}
          </>
        ) : isDone ? (
          <>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <AppIcon name="check-circle-bold" className="w-4 h-4 text-success" />
                All steps done
              </p>
              <p className="text-xs text-ink-muted">Ready for the assessment</p>
            </div>
            {onOpenExam && (
              <Button size="sm" variant="accent" onClick={() => onOpenExam(skill)}>
                <span>Take assessment</span>
                <AppIcon name="arrow-right-linear" className="w-3.5 h-3.5" />
              </Button>
            )}
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold text-ink-secondary tabular-nums">
                {doneCount} of {totalCount} steps
              </span>
              <span className="text-ink-muted">Assessment opens at 100%</span>
            </div>
            <div
              className="mt-2 h-1.5 rounded-full bg-surface-muted overflow-hidden"
              role="progressbar"
              aria-label={`${skill.title} progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div className={cn("h-full rounded-full", category.fill)} style={{ width: `${percent}%` }} />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
