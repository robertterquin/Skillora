"use client";

import React from "react";
import { motion } from "motion/react";
import { Skill, SkillStep } from "@/types/database";
import { playWoodenThud } from "@/lib/workbench-audio";
import { useJustCompleted } from "@/hooks/useJustCompleted";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { StepResources, WatchRequest } from "../learning";
import { StepPracticeAid } from "./StepPracticeAid";
import { FocusTimer } from "./FocusTimer";

interface StepCardProps {
  skill: Skill;
  step: SkillStep;
  isDone: boolean;
  showNotes: boolean;
  onToggleNotes: () => void;
  onToggleDone: () => void;
  onSpeak: (text: string, lang?: string) => void;
  onWatch: (video: WatchRequest) => void;
  /** The learner's own note on this step, shown with the technique notes. */
  note?: string;
  /** Called when a focus timer runs to the end (counts as practice). */
  onFocusComplete?: () => void;
}

/** One step: the practice aid on the front, technique notes and resources on the back. */
export function StepCard({
  skill,
  step,
  isDone,
  showNotes,
  onToggleNotes,
  onToggleDone,
  onSpeak,
  onWatch,
  note,
  onFocusComplete,
}: StepCardProps) {
  const celebrate = useJustCompleted(isDone, 1400);

  return (
    <article
      className={cn(
        "w-full max-w-xl min-h-[380px] sm:min-h-[420px] p-5 sm:p-7 rounded-2xl border bg-surface flex flex-col shadow-card transition-colors duration-500",
        celebrate ? "border-success" : showNotes ? "border-ink/40" : "border-surface-border"
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-surface-border pb-3 mb-2">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          {step.estimated_minutes > 0 && (
            <FocusTimer
              key={step.id}
              minutes={step.estimated_minutes}
              isDone={isDone}
              onFinish={() => onFocusComplete?.()}
              onMarkDone={onToggleDone}
            />
          )}
          {isDone && (
            <span className="inline-flex items-center gap-1 text-success font-semibold">
              <AppIcon name="check-circle-bold" className="w-3.5 h-3.5" />
              Done
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={showNotes}
          onClick={() => {
            playWoodenThud();
            onToggleNotes();
          }}
        >
          <AppIcon name={showNotes ? "play-linear" : "document-text-linear"} className="w-3.5 h-3.5" />
          <span>{showNotes ? "Practice" : "Notes"}</span>
        </Button>
      </div>

      <div className="my-auto py-2">
        {!showNotes ? (
          <div className="text-center">
            <h3 className="font-serif italic text-2xl sm:text-3xl text-ink max-w-lg mx-auto leading-tight mb-1">
              {step.title}
            </h3>
            <StepPracticeAid
              step={step}
              skill={skill}
              onSpeak={onSpeak}
              onOpenVideo={(video) => onWatch(video)}
            />
          </div>
        ) : (
          <div className="text-left animate-fade-in space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Technique notes</h4>
              <p className="text-[15px] text-ink leading-relaxed">{step.instructions}</p>
            </div>
            {note && (
              <div className="pt-3 border-t border-surface-border">
                <h4 className="text-xs font-semibold text-ink-muted mb-1">Your note</h4>
                <p className="text-[15px] text-ink-secondary leading-relaxed whitespace-pre-wrap">{note}</p>
              </div>
            )}
            {step.resources && step.resources.length > 0 && (
              <div className="pt-3 border-t border-surface-border">
                <h4 className="text-xs font-semibold text-ink-muted mb-2">Resources</h4>
                <StepResources resources={step.resources} stepTitle={step.title} stepId={step.id} onWatch={onWatch} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
        {celebrate && (
          <motion.span
            role="status"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-semibold text-success"
          >
            Step {step.step_number} done
          </motion.span>
        )}
        <motion.div
          animate={celebrate ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Button size="sm" variant={isDone ? "secondary" : "primary"} onClick={onToggleDone} aria-pressed={isDone}>
            <AppIcon
              name={isDone ? "check-circle-bold" : "check-circle-linear"}
              className={cn("w-3.5 h-3.5", isDone && "text-success")}
            />
            <span>{isDone ? "Done" : "Mark as done"}</span>
          </Button>
        </motion.div>
      </div>
    </article>
  );
}
