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
              className="p-4 sm:p-4.5 rounded-2xl bg-white border border-surface-border hover:border-brand-300 hover:shadow-xs transition-all text-left flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-surface-muted text-3xs font-medium text-ink-muted capitalize">
                      {sugg.difficulty}
                    </span>
                    <span className="text-3xs text-ink-subtle">·</span>
                    <span className="text-3xs text-ink-subtle font-mono">
                      {sugg.timeToBasics}
                    </span>
                    {isCatalog && (
                      <span className="px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700 text-3xs font-mono font-medium">
                        Catalog Craft
                      </span>
                    )}
                  </div>
                  {isEnrolled && (
                    <span className="inline-flex items-center gap-1 text-3xs font-semibold text-accent-emerald">
                      <SolarIcon name="check-circle-linear" className="w-3 h-3" />
                      <span>In My Studio</span>
                    </span>
                  )}
                </div>

                <h4 className="font-display font-bold text-sm sm:text-base text-ink group-hover:text-brand-600 transition">
                  {sugg.title}
                </h4>

                <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                  {sugg.pitch}
                </p>

                {sugg.whyForYou && (
                  <p className="text-2xs text-brand-700/80 bg-brand-50/50 rounded-lg px-2 py-1 mt-2 font-medium leading-normal">
                    💡 {sugg.whyForYou}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-surface-border/50 flex items-center justify-between">
                <span className="text-3xs text-ink-subtle">
                  Generates verified 4-step practice track
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={disabled}
                  onClick={() => onSelectSkill(sugg)}
                  className="gap-1.5 font-medium group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-200 transition"
                >
                  <span>Build this path</span>
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
