"use client";

import React from "react";
import { Skill } from "@/types/database";
import { SolarIcon } from "@/components/SolarIcon";

interface SkillCardProps {
  skill: Skill;
  completedStepCount: number;
  onOpenSyllabus: (skill: Skill) => void;
}

export function SkillCard({ skill, completedStepCount, onOpenSyllabus }: SkillCardProps) {
  const totalSteps = skill.steps?.length || 0;
  const isCompleted = totalSteps > 0 && completedStepCount === totalSteps;
  const progressPercent = totalSteps > 0 ? Math.round((completedStepCount / totalSteps) * 100) : 0;

  return (
    <div className="group relative flex flex-col justify-between p-6 bg-white rounded-2xl border border-surface-border hover:border-ink/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200 ease-out">
      <div>
        {/* Unified Inline Metadata Header */}
        <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-3 font-medium">
          <span className="capitalize">{skill.difficulty}</span>
          <span className="text-ink-subtle">·</span>
          <span>{skill.time_commitment_label}</span>
          <span className="text-ink-subtle">·</span>
          <span>{totalSteps} steps</span>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-lg text-ink group-hover:text-brand-600 transition-colors mb-2 leading-snug">
          {skill.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-ink-secondary leading-relaxed line-clamp-3 mb-5">
          {skill.summary}
        </p>
      </div>

      <div>
        {/* Step and Progress Info */}
        <div className="pt-4 border-t border-surface-border flex items-center justify-between text-xs text-ink-muted mb-4">
          <div className="flex items-center gap-1.5">
            <SolarIcon name="layers-minimalistic-linear" className="w-3.5 h-3.5 text-ink-subtle" />
            <span>{totalSteps} Practical Steps</span>
          </div>

          {completedStepCount > 0 ? (
            <div className="flex items-center gap-1 text-accent-emerald font-medium tabular-nums">
              <SolarIcon name="check-circle-linear" className="w-3.5 h-3.5" />
              <span>{completedStepCount}/{totalSteps} Done ({progressPercent}%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-ink-subtle">
              <SolarIcon name="book-bookmark-linear" className="w-3.5 h-3.5" />
              <span>Curated Guides</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => onOpenSyllabus(skill)}
          className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            isCompleted
              ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30 hover:bg-accent-emerald/20"
              : "bg-canvas hover:bg-brand-600 hover:text-white text-ink border border-surface-border hover:border-brand-600"
          }`}
        >
          {isCompleted ? "Review Completed Syllabus" : "View Step-by-Step Pathway"}
        </button>
      </div>
    </div>
  );
}
