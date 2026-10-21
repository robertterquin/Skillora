"use client";

import React, { useState, useEffect } from "react";
import { Skill, SkillStep, LearningResource } from "@/types/database";
import { playMechanicalClick, playChime } from "@/lib/workbench-audio";
import { getCategoryStyle } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { formatMinutes } from "../learning/LearningPath";
import { SimulatorFrame } from "./SimulatorFrame";
import { deriveStepBlueprint } from "./blueprints";

export * from "./blueprints";

export function StepActionBlueprint({
  step,
  skill,
  onOpenVideo,
  onCheckpointsComplete,
}: {
  step: SkillStep;
  skill: Skill;
  onOpenVideo?: (video: { url: string; title: string; stepTitle: string }) => void;
  onCheckpointsComplete?: (stepId: string) => void;
}) {
  const blueprint = deriveStepBlueprint(step, skill);
  const category = getCategoryStyle(skill);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCheckedMap({});
  }, [step.id]);

  const total = blueprint.checkpoints.length;
  const checkedCount = blueprint.checkpoints.filter((c) => checkedMap[c.id]).length;
  const isAllComplete = checkedCount === total && total > 0;

  const handleToggle = (checkpointId: string) => {
    playMechanicalClick();
    setCheckedMap((prev) => {
      const nextState = !prev[checkpointId];
      const updated = { ...prev, [checkpointId]: nextState };
      const newCount = blueprint.checkpoints.filter((c) => updated[c.id]).length;
      if (newCount === blueprint.checkpoints.length) {
        playChime();
        onCheckpointsComplete?.(step.id);
      }
      return updated;
    });
  };

  const videoResource: LearningResource | undefined = step.resources?.find(
    (r) => r.resource_type === "video" || r.url.includes("youtube.com") || r.url.includes("youtu.be")
  );

  return (
    <SimulatorFrame
      icon="clipboard-check-linear"
      title={blueprint.domainTag}
      accentClass={category.text}
      meta={
        <span className={cn(isAllComplete && "text-success font-semibold")}>
          {checkedCount} of {total} checked
        </span>
      }
    >
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted mb-1">
          <AppIcon name="target-linear" className={cn("w-3.5 h-3.5 shrink-0", category.text)} />
          <span>Objective</span>
        </div>
        <p className="text-[15px] text-ink leading-relaxed">{blueprint.focusObjective}</p>
      </div>

      <ul className="space-y-2 mb-4">
        {blueprint.checkpoints.map((chk, idx) => {
          const isChecked = Boolean(checkedMap[chk.id]);
          return (
            <li key={chk.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => handleToggle(chk.id)}
                className={cn(
                  "w-full p-3 rounded-xl border text-left transition-colors cursor-pointer flex items-start gap-3",
                  isChecked
                    ? "bg-success-light border-success-border"
                    : "bg-canvas border-surface-border hover:border-ink/25 hover:bg-surface-subtle"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-5 h-5 rounded-md mt-px shrink-0 flex items-center justify-center border transition-colors",
                    isChecked ? "bg-success border-success text-white" : "bg-surface border-surface-border"
                  )}
                >
                  {isChecked && <AppIcon name="check-linear" className="w-3.5 h-3.5" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className={cn("block text-sm font-semibold", isChecked ? "text-success" : "text-ink")}>
                    {idx + 1}. {chk.label}
                  </span>
                  <span className={cn("block text-sm leading-snug mt-0.5", isChecked ? "text-ink-muted" : "text-ink-secondary")}>
                    {chk.detail}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div
        className={cn(
          "p-3 rounded-xl border flex items-start gap-2 text-sm transition-colors",
          isAllComplete
            ? "bg-success-light border-success-border text-success"
            : "bg-surface-subtle border-surface-border text-ink-secondary"
        )}
      >
        <AppIcon
          name={isAllComplete ? "check-circle-bold" : "flag-2-linear"}
          className={cn("w-4 h-4 mt-0.5 shrink-0", isAllComplete ? "text-success" : category.text)}
        />
        <p className="leading-snug">
          <span className="font-semibold">Done when:</span> {blueprint.doneWhen}
        </p>
      </div>

      {videoResource && onOpenVideo && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              onOpenVideo({
                url: videoResource.url,
                title: videoResource.platform_name,
                stepTitle: step.title,
              })
            }
          >
            <AppIcon name="play-linear" className="w-3.5 h-3.5" />
            <span>Watch on {videoResource.platform_name}</span>
          </Button>
          {step.estimated_minutes > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
              <AppIcon name="clock-circle-linear" className="w-3.5 h-3.5" />
              {formatMinutes(step.estimated_minutes)}
            </span>
          )}
        </div>
      )}
    </SimulatorFrame>
  );
}
