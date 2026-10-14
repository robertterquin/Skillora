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
    <div className="mt-3 w-full max-w-xl p-5 sm:p-6 rounded-2xl bg-surface border border-surface-border shadow-card animate-fade-in text-left corner-ticks relative overflow-hidden">
      <div className="flex items-center justify-between text-3xs font-mono text-ink-muted uppercase tracking-widest mb-3 pb-2.5 border-b border-surface-border">
        <div className="flex items-center gap-2 font-medium">
          <span className="capitalize">{skill.difficulty}</span>
          <span className="text-surface-border">|</span>
          <span>{skill.time_commitment_label}</span>
          <span className="text-surface-border">|</span>
          <span>{skill.steps?.length || 0} steps</span>
        </div>
        {isEnrolled ? (
          <span className="inline-flex items-center gap-1 text-3xs font-mono font-semibold text-accent-emerald bg-accent-emerald-light/60 px-2 py-0.5 rounded-full border border-accent-emerald/30">
            <SolarIcon name="check-circle-linear" className="w-3 h-3" />
            <span>IN STUDIO</span>
          </span>
        ) : (
          <span className="text-3xs font-mono text-ink-muted">
            READY TO PRACTICE
          </span>
        )}
      </div>

      <h3 className="font-serif italic font-normal text-xl sm:text-2xl text-ink mb-1.5 leading-snug">
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
            className="p-3 rounded-xl bg-surface-subtle border border-surface-border text-xs flex items-center justify-between hover:border-brand-300 transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded bg-surface border border-surface-border flex items-center justify-center font-mono text-3xs font-semibold text-ink-muted">
                {st.step_number < 10 ? `0${st.step_number}` : st.step_number}
              </span>
              <span className="font-medium text-ink">{st.title}</span>
            </div>
            <span className="text-3xs text-ink-muted font-mono tabular-nums">
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
