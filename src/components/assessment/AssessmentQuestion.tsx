"use client";

import React from "react";
import { motion } from "motion/react";
import type { ExamOption, ExamQuestion } from "@/app/api/ai/guild-exam/route";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";

export function formatCue(cue: string): string {
  if (cue !== cue.toUpperCase()) return cue.replace(/\s*\/\/\s*/g, " · ");
  return cue
    .split(/\s*\/\/\s*/)
    .map((part) => {
      const lower = part.toLowerCase().trim();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" · ");
}

interface AssessmentQuestionProps {
  question: ExamQuestion;
  selectedId?: ExamOption["id"];
  isRevealed: boolean;
  onSelect: (optionId: ExamOption["id"]) => void;
}

function OptionCard({
  option,
  isSelected,
  isRevealed,
  onSelect,
}: {
  option: ExamOption;
  isSelected: boolean;
  isRevealed: boolean;
  onSelect: () => void;
}) {
  const showCorrect = isRevealed && option.isCorrect;
  const showWrong = isRevealed && isSelected && !option.isCorrect;
  const isFaded = isRevealed && !showCorrect && !showWrong;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-disabled={isRevealed}
      aria-pressed={isSelected}
      className={cn(
        "w-full p-4 rounded-2xl border text-left transition-colors flex items-start gap-3",
        !isRevealed && "bg-surface border-surface-border hover:border-ink/30 hover:bg-surface-subtle cursor-pointer",
        showCorrect && "bg-success-light border-success-border",
        showWrong && "bg-danger-light border-danger-border",
        isFaded && "bg-surface border-surface-border opacity-60 cursor-default"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "w-7 h-7 shrink-0 rounded-lg border text-xs font-semibold flex items-center justify-center",
          showCorrect
            ? "bg-success border-success text-white"
            : showWrong
            ? "bg-danger border-danger text-white"
            : "bg-canvas border-surface-border text-ink-secondary"
        )}
      >
        {showCorrect ? <AppIcon name="check-linear" className="w-3.5 h-3.5" /> : option.id}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] text-ink leading-relaxed">{option.text}</span>
        {(showCorrect || showWrong) && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={cn(
              "block mt-3 pt-3 border-t text-sm leading-relaxed",
              showCorrect ? "border-success-border text-success-strong" : "border-danger-border text-danger-strong"
            )}
          >
            <span className="block text-xs font-semibold mb-0.5">{showCorrect ? "Why this works" : "Why not"}</span>
            {option.rationale}
          </motion.span>
        )}
      </span>
    </button>
  );
}

export function AssessmentQuestion({ question, selectedId, isRevealed, onSelect }: AssessmentQuestionProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-ink-muted">{formatCue(question.practicalCue)}</p>
        <h3 className="mt-2 font-display font-semibold text-lg sm:text-xl text-ink leading-snug">{question.scenario}</h3>
      </div>

      <div className="space-y-2.5" role="group" aria-label="Answers">
        {question.options.map((opt) => (
          <OptionCard
            key={opt.id}
            option={opt}
            isSelected={selectedId === opt.id}
            isRevealed={isRevealed}
            onSelect={() => onSelect(opt.id)}
          />
        ))}
      </div>
    </div>
  );
}
