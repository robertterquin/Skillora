"use client";

import React, { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Skill, SkillStep } from "@/types/database";
import { isStepCompleted } from "@/lib/catalog-data";
import { CategoryStyle, getCategoryStyle, getSkillProgress } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { StepResources, WatchRequest } from "./StepResources";

export type PathNodeState = "done" | "current" | "upcoming" | "locked";

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

interface LearningPathProps {
  skill: Skill;
  completedStepIds: string[];
  /** Preview for visitors: no progress, nothing to tick off. */
  isPreview?: boolean;
  onToggleStep?: (stepId: string) => void;
  /** Shows a "Practise this step" action on the open step. */
  onPractiseStep?: (stepIndex: number) => void;
  onWatch: (video: WatchRequest) => void;
  isCertified?: boolean;
  /** Opens the certificate assessment from the final node. */
  onOpenAssessment?: () => void;
}

function NodeMarker({
  state,
  category,
  label,
  icon,
}: {
  state: PathNodeState;
  category: CategoryStyle;
  label: React.ReactNode;
  icon?: string;
}) {
  return (
    <span className="relative flex w-8 h-8 shrink-0 items-center justify-center">
      {state === "current" && (
        <span className={cn("absolute -inset-1 rounded-full", category.soft)} aria-hidden="true" />
      )}
      <span
        className={cn(
          "relative flex w-8 h-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors",
          state === "done" && cn(category.fill, "text-white"),
          state === "current" && cn("bg-white border-2", category.border, category.text),
          state === "upcoming" && "bg-white border border-surface-border text-ink-muted",
          state === "locked" && "bg-surface-muted border border-surface-border text-ink-subtle"
        )}
      >
        {state === "done" ? (
          <AppIcon name={icon ?? "check-linear"} className="w-4 h-4" />
        ) : state === "locked" ? (
          <AppIcon name="lock-keyhole-linear" className="w-3.5 h-3.5" />
        ) : icon ? (
          <AppIcon name={icon} className="w-4 h-4" />
        ) : (
          label
        )}
      </span>
    </span>
  );
}

function Rail({ filled, category }: { filled: boolean; category: CategoryStyle }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute left-[15px] top-9 -bottom-1 w-0.5 rounded-full",
        filled ? category.fill : "bg-surface-border"
      )}
    />
  );
}

const STATE_LABEL: Record<PathNodeState, string> = {
  done: "Done",
  current: "Up next",
  upcoming: "",
  locked: "Locked",
};

/**
 * A skill's steps as a vertical path: done, current and upcoming steps, ending
 * in the certificate assessment.
 */
export function LearningPath({
  skill,
  completedStepIds,
  isPreview = false,
  onToggleStep,
  onPractiseStep,
  onWatch,
  isCertified = false,
  onOpenAssessment,
}: LearningPathProps) {
  const baseId = useId();
  const category = getCategoryStyle(skill);
  const { steps, isComplete, nextStep } = getSkillProgress(skill, isPreview ? [] : completedStepIds);
  const currentId = isPreview ? undefined : nextStep?.id;
  const [openId, setOpenId] = useState<string | undefined>(currentId);

  const stateOf = (step: SkillStep): PathNodeState => {
    if (isPreview) return "upcoming";
    if (isStepCompleted(step.id, completedStepIds)) return "done";
    return step.id === currentId ? "current" : "upcoming";
  };

  const assessmentState: PathNodeState = isPreview
    ? "locked"
    : isCertified
    ? "done"
    : isComplete
    ? "current"
    : "locked";

  return (
    <ol className="relative" aria-label={`${skill.title} learning path`}>
      {steps.map((step, index) => {
        const state = stateOf(step);
        const isOpen = openId === step.id;
        const panelId = `${baseId}-step-${index}`;

        return (
          <li key={step.id} className="relative pb-5">
            <Rail filled={state === "done"} category={category} />

            <div className="flex items-start gap-3.5">
              {onToggleStep && !isPreview ? (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={state === "done"}
                  aria-label={`Step ${step.step_number}: ${step.title}`}
                  onClick={() => onToggleStep(step.id)}
                  className="rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <NodeMarker state={state} category={category} label={step.step_number} />
                </button>
              ) : (
                <NodeMarker state={state} category={category} label={step.step_number} />
              )}

              <div className="min-w-0 flex-1 pt-1">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? undefined : step.id)}
                  className="group w-full flex items-start justify-between gap-3 text-left cursor-pointer"
                >
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-base leading-snug",
                        state === "current" ? "font-semibold text-ink" : "font-medium",
                        state === "done" ? "text-ink-muted" : "text-ink",
                        "group-hover:text-accent-vermilion transition-colors"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                      <span>Step {step.step_number}</span>
                      {STATE_LABEL[state] && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className={cn(state === "current" && cn("font-semibold", category.text))}>
                            {STATE_LABEL[state]}
                          </span>
                        </>
                      )}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0 pt-0.5">
                    {step.estimated_minutes > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-ink-muted tabular-nums">
                        <AppIcon name="clock-circle-linear" className="w-3.5 h-3.5" />
                        {formatMinutes(step.estimated_minutes)}
                      </span>
                    )}
                    <AppIcon
                      name="arrow-right-linear"
                      className={cn("w-3.5 h-3.5 text-ink-subtle transition-transform", isOpen && "rotate-90")}
                    />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-3">
                        <p className="text-sm text-ink-secondary leading-relaxed max-w-prose">{step.instructions}</p>
                        <StepResources resources={step.resources || []} stepTitle={step.title} onWatch={onWatch} />
                        {!isPreview && (onPractiseStep || onToggleStep) && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {onPractiseStep && (
                              <Button size="sm" onClick={() => onPractiseStep(index)}>
                                <AppIcon name="play-linear" className="w-3.5 h-3.5" />
                                <span>Practise this step</span>
                              </Button>
                            )}
                            {onToggleStep && (
                              <Button size="sm" variant="secondary" onClick={() => onToggleStep(step.id)}>
                                <AppIcon
                                  name={state === "done" ? "restart-linear" : "check-circle-linear"}
                                  className="w-3.5 h-3.5"
                                />
                                <span>{state === "done" ? "Mark not done" : "Mark as done"}</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </li>
        );
      })}

      <li className="relative">
        <div className="flex items-start gap-3.5">
          <NodeMarker
            state={assessmentState}
            category={category}
            label=""
            icon={assessmentState === "locked" ? undefined : "diploma-verified-linear"}
          />
          <div className="min-w-0 flex-1 pt-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <span
                className={cn(
                  "block text-base leading-snug",
                  assessmentState === "locked" ? "font-medium text-ink-muted" : "font-semibold text-ink"
                )}
              >
                Certificate assessment
              </span>
              <span className="mt-0.5 block text-xs text-ink-muted">
                {assessmentState === "done"
                  ? "Certified. Your certificate is ready."
                  : assessmentState === "current"
                  ? "All steps done. Take the assessment to earn your certificate."
                  : isPreview
                  ? "Finish every step to unlock the assessment."
                  : `Unlocks after the last step.`}
              </span>
            </div>
            {onOpenAssessment && assessmentState !== "locked" && (
              <Button
                size="sm"
                variant={assessmentState === "done" ? "secondary" : "accent"}
                onClick={onOpenAssessment}
                className="self-start"
              >
                <span>{assessmentState === "done" ? "View certificate" : "Take assessment"}</span>
                <AppIcon name="arrow-right-linear" className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </li>
    </ol>
  );
}
