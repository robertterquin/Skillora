"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Skill } from "@/types/database";
import { SolarIcon } from "@/components/ui/SolarIcon";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/Button";
import { playWoodenThud } from "@/lib/workbench-audio";

interface CurriculumCardProps {
  skill: Skill;
  isEnrolled: boolean;
  onEnroll: (skill: Skill) => Promise<boolean | void>;
}

export function CurriculumCard({ skill, isEnrolled, onEnroll }: CurriculumCardProps) {
  const [enrolling, setEnrolling] = useState(false);

  const handleEnrollClick = async () => {
    if (enrolling) return;
    setEnrolling(true);
    try {
      await onEnroll(skill);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="mt-3 w-full max-w-xl p-5 sm:p-6 rounded-3xl bg-white border border-surface-border shadow-md animate-fade-in text-left corner-ticks relative overflow-hidden">
      <div className="flex items-center justify-between text-xs text-ink-muted mb-3 pb-2.5 border-b border-surface-border/60">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="capitalize">{skill.difficulty}</span>
          <span className="text-ink-subtle">·</span>
          <span>{skill.time_commitment_label}</span>
          <span className="text-ink-subtle">·</span>
          <span>{skill.steps?.length || 0} steps</span>
        </div>
        {isEnrolled ? (
          <span className="inline-flex items-center gap-1 text-2xs font-semibold text-accent-emerald">
            <SolarIcon name="check-circle-linear" className="w-3.5 h-3.5" />
            <span>In My Studio</span>
          </span>
        ) : (
          <span className="text-2xs font-medium text-ink-subtle">
            Ready to practice
          </span>
        )}
      </div>

      <h3 className="font-display font-extrabold text-lg text-ink mb-1">
        {skill.title}
      </h3>
      <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
        {skill.summary}
      </p>

      {/* Sequential Micro-Drills */}
      <div className="space-y-2 mb-5">
        {skill.steps?.map((st) => (
          <div
            key={st.id}
            className="p-3 rounded-2xl bg-canvas/80 border border-surface-border text-xs flex items-center justify-between hover:border-ink/20 transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-white border border-surface-border/80 flex items-center justify-center font-mono text-3xs font-semibold text-ink-muted">
                {st.step_number < 10 ? `0${st.step_number}` : st.step_number}
              </span>
              <span className="font-medium text-ink">{st.title}</span>
            </div>
            <span className="text-2xs text-ink-subtle font-mono tabular-nums">
              ~{st.estimated_minutes}m
            </span>
          </div>
        ))}
      </div>

      {/* Action CTA: Either Practice or Add to My Studio */}
      <div className="pt-2 border-t border-surface-border flex items-center gap-2">
        {isEnrolled ? (
          <Link
            href="/dashboard"
            onClick={() => playWoodenThud()}
            className={buttonClasses({ block: true, className: "group" })}
          >
            <span>Practice in My Studio</span>
            <SolarIcon
              name="arrow-right-linear"
              className="w-4 h-4 group-hover:translate-x-0.5 transition"
            />
          </Link>
        ) : (
          <Button block disabled={enrolling} onClick={handleEnrollClick}>
            <SolarIcon
              name="check-circle-linear"
              className="w-4 h-4 text-accent-emerald"
            />
            <span>{enrolling ? "Enrolling…" : "Add to My Studio"}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
