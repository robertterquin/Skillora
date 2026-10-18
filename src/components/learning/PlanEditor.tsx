"use client";

import React from "react";
import { SkillStep } from "@/types/database";
import { cn } from "@/lib/cn";
import { IconButton } from "../ui/IconButton";
import { Button } from "../ui/Button";
import { AppIcon } from "../ui/AppIcon";

export type ReworkDirection = "easier" | "harder";

interface PlanEditorProps {
  steps: SkillStep[];
  onChange: (steps: SkillStep[]) => void;
  /** Asks Archimedes to rewrite one step; omit to hide the buttons. */
  onRework?: (step: SkillStep, direction: ReworkDirection) => void;
  /** Step currently being rewritten by Archimedes. */
  busyStepId?: string | null;
}

const renumber = (steps: SkillStep[]) => steps.map((s, i) => ({ ...s, step_number: i + 1 }));

/** Edit a personal plan: rename, reorder and remove steps, or have Archimedes rewrite one. */
export function PlanEditor({ steps, onChange, onRework, busyStepId }: PlanEditorProps) {
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(renumber(next));
  };
  const remove = (index: number) => onChange(renumber(steps.filter((_, i) => i !== index)));
  const rename = (index: number, title: string) =>
    onChange(steps.map((s, i) => (i === index ? { ...s, title } : s)));

  return (
    <ol className="space-y-2" aria-label="Edit steps">
      {steps.map((step, index) => {
        const busy = busyStepId === step.id;
        return (
          <li
            key={step.id}
            className={cn(
              "p-3 sm:p-4 rounded-2xl border bg-white transition-opacity",
              busy ? "border-ink/30 opacity-60" : "border-surface-border"
            )}
            aria-busy={busy}
          >
            <div className="flex items-start gap-3">
              <span className="mt-1.5 flex w-7 h-7 shrink-0 items-center justify-center rounded-full border border-surface-border text-xs font-semibold text-ink-muted tabular-nums">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <input
                  value={step.title}
                  onChange={(e) => rename(index, e.target.value)}
                  aria-label={`Step ${index + 1} title`}
                  maxLength={200}
                  disabled={busy}
                  className="w-full h-10 px-3 rounded-xl bg-canvas border border-surface-border text-base sm:text-[15px] text-ink focus:outline-none focus:border-ink"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-ink-muted tabular-nums">{step.estimated_minutes} min</span>
                  {onRework && (
                    <span className="flex items-center gap-1.5">
                      {busy ? (
                        <span className="text-xs text-ink-muted" role="status">
                          Archimedes is rewriting this step…
                        </span>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => onRework(step, "easier")}>
                            <AppIcon name="arrow-down-linear" className="w-3.5 h-3.5" />
                            <span>Easier</span>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onRework(step, "harder")}>
                            <AppIcon name="arrow-up-linear" className="w-3.5 h-3.5" />
                            <span>Harder</span>
                          </Button>
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-0.5 shrink-0">
                <IconButton
                  icon="arrow-up-linear"
                  label={`Move step ${index + 1} up`}
                  variant="ghost"
                  size="sm"
                  disabled={index === 0 || busy}
                  onClick={() => move(index, -1)}
                />
                <IconButton
                  icon="arrow-down-linear"
                  label={`Move step ${index + 1} down`}
                  variant="ghost"
                  size="sm"
                  disabled={index === steps.length - 1 || busy}
                  onClick={() => move(index, 1)}
                />
                <IconButton
                  icon="trash-bin-trash-linear"
                  label={`Remove step ${index + 1}`}
                  variant="ghost"
                  size="sm"
                  disabled={steps.length <= 1 || busy}
                  className="hover:text-danger"
                  onClick={() => remove(index)}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
