"use client";

import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Skill } from "@/types/database";
import { SkillCard, SkillRow } from "./SkillItem";

export type StudioView = "ledger" | "grid";

interface SkillListProps {
  skills: Skill[];
  view: StudioView;
  completedStepIds: string[];
  isCertified: (skillId: string) => boolean;
  onPractice: (skill: Skill) => void;
  onViewSteps: (skill: Skill) => void;
  onAssessment: (skill: Skill) => void;
  onRemove: (skill: Skill) => void;
}

export function SkillList({
  skills,
  view,
  completedStepIds,
  isCertified,
  onPractice,
  onViewSteps,
  onAssessment,
  onRemove,
}: SkillListProps) {
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null);

  const itemProps = (skill: Skill) => ({
    skill,
    completedStepIds,
    isCertified: isCertified(skill.id),
    isConfirmingRemove: confirmingRemoveId === skill.id,
    onPractice: () => onPractice(skill),
    onViewSteps: () => onViewSteps(skill),
    onAssessment: () => onAssessment(skill),
    onRequestRemove: () => setConfirmingRemoveId(skill.id),
    onConfirmRemove: () => {
      setConfirmingRemoveId(null);
      onRemove(skill);
    },
    onCancelRemove: () => setConfirmingRemoveId(null),
  });

  if (view === "ledger") {
    return (
      <div className="bg-white rounded-2xl border border-surface-border shadow-2xs divide-y divide-surface-border/70 px-5 sm:px-6">
        {skills.map((skill) => (
          <SkillRow key={skill.id} {...itemProps(skill)} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <AnimatePresence initial={false}>
        {skills.map((skill) => (
          <SkillCard key={skill.id} {...itemProps(skill)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Placeholder shown while Studio data loads, so the empty state never flashes. */
export function StudioSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      <div className="h-48 rounded-3xl bg-surface-muted/70" />
      <div className="h-20 rounded-2xl bg-surface-muted/60" />
      <div className="space-y-px rounded-2xl overflow-hidden">
        <div className="h-20 bg-surface-muted/50" />
        <div className="h-20 bg-surface-muted/40" />
        <div className="h-20 bg-surface-muted/30" />
      </div>
    </div>
  );
}
