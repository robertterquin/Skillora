"use client";

import React from "react";
import { Skill } from "@/types/database";
import { getCategoryStyle, getSkillProgress } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";

interface ContinueCardProps {
  skill: Skill;
  completedStepIds: string[];
  onResume: () => void;
  onViewSteps: () => void;
}

/** The one obvious next action at the top of the Studio. */
export function ContinueCard({ skill, completedStepIds, onResume, onViewSteps }: ContinueCardProps) {
  const category = getCategoryStyle(skill);
  const { doneCount, totalCount, percent, nextStep } = getSkillProgress(skill, completedStepIds);
  const hasStarted = doneCount > 0;

  return (
    <section
      aria-labelledby="continue-heading"
      className="relative overflow-hidden rounded-3xl bg-white border border-surface-border shadow-card"
    >
      <div className={cn("absolute inset-y-0 left-0 w-1.5", category.fill)} aria-hidden="true" />

      <div className="p-6 sm:p-8 pl-7 sm:pl-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-xs">
            <span className="font-medium text-ink-muted">
              {hasStarted ? "Continue where you left off" : "Up next"}
            </span>
            <span className={cn("inline-flex items-center gap-1.5 font-semibold", category.text)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", category.fill)} aria-hidden="true" />
              {category.label}
            </span>
          </div>

          <h2
            id="continue-heading"
            className="font-serif italic font-normal text-2xl sm:text-3xl text-ink leading-tight"
          >
            {skill.title}
          </h2>

          {nextStep ? (
            <p className="mt-2 text-sm text-ink-secondary">
              <span className="font-semibold text-ink">
                Step {nextStep.step_number} of {totalCount}
              </span>
              <span className="text-ink-subtle"> · </span>
              {nextStep.title}
              {nextStep.estimated_minutes > 0 && (
                <span className="inline-flex items-center gap-1 ml-2 text-ink-muted whitespace-nowrap">
                  <AppIcon name="clock-circle-linear" className="w-3.5 h-3.5" />
                  {nextStep.estimated_minutes} min
                </span>
              )}
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink-secondary line-clamp-2">{skill.summary}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={onResume}>
              <AppIcon name="play-linear" className="w-4 h-4" />
              <span>{hasStarted ? "Continue practice" : "Start practising"}</span>
            </Button>
            <Button size="lg" variant="ghost" onClick={onViewSteps}>
              <AppIcon name="layers-minimalistic-linear" className="w-4 h-4" />
              <span>View all steps</span>
            </Button>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="md:w-48 shrink-0">
            <span className="block mb-2 font-serif italic text-4xl text-ink tabular-nums">{percent}%</span>
            <div
              className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label={`${skill.title} progress`}
            >
              <div
                className={cn("h-full rounded-full transition-all duration-500", category.fill)}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
