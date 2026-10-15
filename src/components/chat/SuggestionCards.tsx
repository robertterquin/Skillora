"use client";

import React from "react";
import { OwlSuggestion } from "@/types/owl";
import { SolarIcon } from "@/components/ui/SolarIcon";
import { Button } from "@/components/ui/Button";

interface SuggestionCardsProps {
  suggestions?: OwlSuggestion[];
  catalogSkillTitles?: string[];
  enrolledSkillTitles?: string[];
  disabled?: boolean;
  onSelectSkill: (suggestion: OwlSuggestion) => void;
}

export function SuggestionCards({
  suggestions,
  catalogSkillTitles = [],
  enrolledSkillTitles = [],
  disabled,
  onSelectSkill,
}: SuggestionCardsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-3 w-full max-w-xl space-y-2.5 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <span className="text-3xs font-mono font-semibold text-ink-muted uppercase tracking-wider">
          Suggested Pathways ({suggestions.length})
        </span>
        <span className="text-3xs text-ink-subtle font-mono">
          Pick one to build your custom curriculum
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {suggestions.map((sugg, idx) => {
          const isCatalog = catalogSkillTitles.some(
            (t) => t.toLowerCase() === sugg.title.toLowerCase()
          );
          const isEnrolled = enrolledSkillTitles.some(
            (t) => t.toLowerCase() === sugg.title.toLowerCase()
          );

          return (
            <div
              key={`${sugg.title}-${idx}`}
              className="p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border hover:border-brand-300 hover:shadow-card transition-all text-left flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-3xs font-mono font-medium text-ink-muted capitalize">
                      {sugg.difficulty}
                    </span>
                    <span className="text-3xs text-ink-muted">·</span>
                    <span className="text-3xs text-ink-muted font-mono">
                      {sugg.timeToBasics}
                    </span>
                    {isCatalog && (
                      <span className="px-1.5 py-0.5 rounded-md bg-surface-subtle text-ink text-3xs font-mono font-medium border border-surface-border">
                        In Catalog
                      </span>
                    )}
                  </div>
                  {isEnrolled && (
                    <span className="inline-flex items-center gap-1 text-3xs font-mono font-semibold text-accent-emerald bg-accent-emerald-light/60 px-2 py-0.5 rounded-full border border-accent-emerald/30">
                      <SolarIcon name="check-circle-linear" className="w-3 h-3" />
                      <span>In Studio</span>
                    </span>
                  )}
                </div>

                <h4 className="font-serif italic font-normal text-base sm:text-lg text-ink group-hover:text-accent-vermilion transition">
                  {sugg.title}
                </h4>

                <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                  {sugg.pitch}
                </p>

                {sugg.whyForYou && (
                  <p className="text-2xs text-ink-secondary bg-surface-subtle rounded-lg px-2.5 py-1.5 mt-2 font-medium leading-normal flex items-center gap-1.5 border border-surface-border/60">
                    <SolarIcon name="lightbulb-minimalistic-linear" className="w-3 h-3 text-accent-vermilion shrink-0" />
                    <span>{sugg.whyForYou}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between">
                <span className="text-3xs font-mono text-ink-muted">
                  4-step practice plan
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={disabled}
                  onClick={() => onSelectSkill(sugg)}
                  className="gap-1.5 font-mono text-2xs hover:border-accent-vermilion/50 hover:text-accent-vermilion transition"
                >
                  <span>Build roadmap</span>
                  <SolarIcon
                    name="arrow-right-linear"
                    className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition"
                  />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
