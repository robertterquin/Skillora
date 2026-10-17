"use client";

import React from "react";
import { Skill } from "@/types/database";
import { CategoryStyle } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";

interface AssessmentIntroProps {
  skill: Skill;
  category: CategoryStyle;
  loading: boolean;
  error: string | null;
  onStart: () => void;
  onClose: () => void;
}

const FACTS = [
  { label: "Format", value: "3 practical scenarios" },
  { label: "To pass", value: "2 of 3 correct" },
  { label: "Marked by", value: "Archimedes, Skillora's AI tutor" },
  { label: "You earn", value: "A certificate of mastery" },
];

/** What the assessment is, before it starts. */
export function AssessmentIntro({ skill, category, loading, error, onStart, onClose }: AssessmentIntroProps) {
  return (
    <div className="max-w-lg mx-auto py-2 space-y-6">
      <div className="text-center">
        <p className={cn("text-xs font-semibold", category.text)}>{category.label}</p>
        <h3 className="mt-1 font-serif italic text-3xl text-ink leading-tight">{skill.title}</h3>
        <p className="mt-3 text-[15px] text-ink-secondary leading-relaxed">
          You&rsquo;ve finished every step. Answer at least 2 of these 3 practical questions correctly to earn your
          certificate.
        </p>
      </div>

      <dl className="rounded-2xl border border-surface-border bg-canvas divide-y divide-surface-border">
        {FACTS.map((fact) => (
          <div key={fact.label} className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="text-xs font-semibold text-ink-muted">{fact.label}</dt>
            <dd className="text-sm font-medium text-ink text-right">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {error && (
        <p role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-danger-light border border-danger-border text-sm text-danger-strong">
          <AppIcon name="danger-circle-linear" className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        <Button size="lg" variant="accent" onClick={onStart} disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <AppIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
              <span>Preparing the questions…</span>
            </>
          ) : (
            <>
              <span>Start the assessment</span>
              <AppIcon name="arrow-right-linear" className="w-4 h-4" />
            </>
          )}
        </Button>
        <Button size="lg" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
          Back to Studio
        </Button>
      </div>
    </div>
  );
}
