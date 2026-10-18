"use client";

import React from "react";
import { Skill } from "@/types/database";
import { getCategoryStyle } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "@/components/ui/AppIcon";
import { formatMinutes } from "@/components/learning/LearningPath";

const STARTERS: { icon: string; label: string; prompt: string }[] = [
  {
    icon: "compass-linear",
    label: "Help me pick a skill",
    prompt: "Help me find a skill that fits me. Ask me a couple of questions first.",
  },
  {
    icon: "clock-circle-linear",
    label: "I have 15 minutes a day",
    prompt: "I have about 15 minutes a day. What could I get good at in a month?",
  },
  {
    icon: "cup-hot-linear",
    label: "Something hands-on, away from screens",
    prompt: "Suggest a hands-on skill I can practise away from screens.",
  },
  {
    icon: "target-linear",
    label: "A skill that helps at work",
    prompt: "Suggest in-demand skills that would help me at work right now.",
  },
];

interface ChatWelcomeProps {
  examples: Skill[];
  disabled?: boolean;
  /** Conversation starters need Archimedes, so they're hidden for guests. */
  showStarters?: boolean;
  onStarter: (prompt: string) => void;
  onExample: (skill: Skill) => void;
}

/** First screen of a new chat: conversation starters and example plans. */
export function ChatWelcome({ examples, disabled, showStarters = true, onStarter, onExample }: ChatWelcomeProps) {
  return (
    <div className="w-full space-y-10">
      {showStarters && (
      <section aria-labelledby="starters-heading">
        <h2 id="starters-heading" className="sr-only">
          Conversation starters
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {STARTERS.map((s) => (
            <li key={s.label}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onStarter(s.prompt)}
                className="w-full h-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-surface-border hover:border-ink/30 hover:shadow-xs text-left text-[15px] text-ink transition cursor-pointer disabled:opacity-50"
              >
                <AppIcon name={s.icon} className="w-4 h-4 shrink-0 text-ink-muted" />
                <span>{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      )}

      {examples.length > 0 && (
        <section aria-labelledby="examples-heading">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h2 id="examples-heading" className="font-display font-semibold text-base text-ink">
              Example plans
            </h2>
            <span className="text-xs text-ink-muted">Pick one to see the draft</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {examples.map((skill) => {
              const category = getCategoryStyle(skill);
              const steps = skill.steps || [];
              const minutes = steps.reduce((sum, st) => sum + (Number(st.estimated_minutes) || 0), 0);
              return (
                <li key={skill.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onExample(skill)}
                    className="group relative w-full h-full flex flex-col p-4 pl-5 rounded-2xl bg-white border border-surface-border hover:border-ink/30 hover:shadow-card text-left transition cursor-pointer overflow-hidden disabled:opacity-50"
                  >
                    <span className={cn("absolute inset-y-0 left-0 w-1", category.fill)} aria-hidden="true" />
                    <span className={cn("text-xs font-semibold", category.text)}>{category.label}</span>
                    <span className="mt-1 font-serif italic text-lg text-ink leading-snug group-hover:text-accent-vermilion transition-colors">
                      {skill.title}
                    </span>
                    <span className="mt-auto pt-3 text-xs text-ink-muted">
                      {steps.length} steps{minutes > 0 && ` · about ${formatMinutes(minutes)}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
