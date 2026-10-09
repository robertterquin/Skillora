"use client";

import React from "react";
import Link from "next/link";
import { Skill } from "@/types/database";
import { SolarIcon } from "@/components/SolarIcon";

interface SkillSyllabusModalProps {
  skill: Skill | null;
  completedStepIds?: string[];
  onToggleStep?: (stepId: string) => void;
  onClose: () => void;
  isViewOnly?: boolean;
}

export function SkillSyllabusModal({
  skill,
  completedStepIds = [],
  onToggleStep,
  onClose,
  isViewOnly = false,
}: SkillSyllabusModalProps) {
  if (!skill) return null;

  const steps = skill.steps || [];
  const totalSteps = steps.length;
  const completedCount = steps.filter((s) => completedStepIds.includes(s.id)).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isAllComplete = totalSteps > 0 && completedCount === totalSteps;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl border border-surface-border shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-6 sm:p-8 bg-canvas border-b border-surface-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-brand-600 uppercase tracking-wider">
                <span>{isViewOnly ? "Curriculum Preview" : "Structured Pathway"}</span>
                <span>•</span>
                <span className="text-ink-muted">{skill.difficulty}</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
                {skill.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-muted transition"
              aria-label="Close modal"
            >
              <SolarIcon name="close-circle-linear" className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-3 text-sm text-ink-secondary leading-relaxed max-w-2xl">
            {skill.summary}
          </p>

          {/* Time & Metric Ribbon */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-surface-border text-ink">
              <SolarIcon name="clock-circle-linear" className="w-4 h-4 text-brand-600" />
              <span>Time Commitment: <strong className="tabular-nums font-semibold">{skill.time_commitment_label}</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-surface-border text-ink">
              <SolarIcon name="book-bookmark-linear" className="w-4 h-4 text-brand-600" />
              <span>Estimated Duration: <strong className="tabular-nums font-semibold">{skill.estimated_hours} hrs</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-surface-border text-ink">
              <SolarIcon name="layers-minimalistic-linear" className="w-4 h-4 text-brand-600" />
              <span>Modular Steps: <strong className="tabular-nums font-semibold">{totalSteps}</strong></span>
            </div>

            {!isViewOnly && isAllComplete && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald font-semibold">
                <SolarIcon name="cup-first-linear" className="w-4 h-4" />
                <span>Skill Fully Mastered!</span>
              </div>
            )}
          </div>

          {/* Progress Bar (Only shown for authenticated / tracked mode) */}
          {!isViewOnly && (
            <div className="mt-6">
              <div className="flex justify-between text-xs font-medium text-ink-muted mb-2">
                <span>Path Progress</span>
                <span className="tabular-nums font-semibold text-ink">{completedCount} of {totalSteps} steps completed ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Steps Content */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6">
          <h3 className="font-display font-semibold text-base text-ink mb-2">
            Step-by-Step Instructions & Verified Learning Sites
          </h3>

          <div className="space-y-4">
            {steps.map((step) => {
              const isStepDone = !isViewOnly && completedStepIds.includes(step.id);

              return (
                <div
                  key={step.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isStepDone
                      ? "bg-canvas border-accent-emerald/30 shadow-xs"
                      : "bg-white border-surface-border hover:border-ink-muted/30"
                  }`}
                >
                  {/* Step Top Bar */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {!isViewOnly ? (
                        <button
                          type="button"
                          onClick={() => onToggleStep && onToggleStep(step.id)}
                          className="mt-0.5 text-ink-subtle hover:text-brand-600 transition"
                        >
                          {isStepDone ? (
                            <SolarIcon name="check-circle-linear" className="w-6 h-6 text-accent-emerald" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-surface-border hover:border-ink-muted transition" />
                          )}
                        </button>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-canvas border border-surface-border flex items-center justify-center font-display font-bold text-xs text-ink mt-0.5">
                          {step.step_number}
                        </div>
                      )}
                      <div>
                        <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                          Step {step.step_number} • {step.estimated_minutes} Minutes
                        </div>
                        <h4 className={`font-display font-semibold text-base ${isStepDone ? "line-through text-ink-muted" : "text-ink"}`}>
                          {step.title}
                        </h4>
                      </div>
                    </div>

                    {!isViewOnly && (
                      <button
                        type="button"
                        onClick={() => onToggleStep && onToggleStep(step.id)}
                        className={`text-xs font-medium px-3 py-1 rounded-lg transition ${
                          isStepDone
                            ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20"
                            : "bg-canvas hover:bg-surface-muted text-ink border border-surface-border"
                        }`}
                      >
                        {isStepDone ? "Completed" : "Mark Done"}
                      </button>
                    )}
                  </div>

                  {/* Step Detailed Instructions */}
                  <div className={`mt-4 ${isViewOnly ? "pl-10" : "pl-9"} text-sm text-ink-secondary leading-relaxed`}>
                    <p>{step.instructions}</p>
                  </div>

                  {/* Recommended External Learning Sites */}
                  {step.resources && step.resources.length > 0 && (
                    <div className={`mt-4 ${isViewOnly ? "pl-10" : "pl-9"} pt-3 border-t border-surface-border/60`}>
                      <div className="text-xs font-semibold text-ink-muted mb-2">
                        Where to practice & learn this step:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((res) => (
                          <a
                            key={res.id}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-brand-50 border border-surface-border hover:border-brand-500/30 text-xs font-medium text-ink hover:text-brand-700 transition"
                          >
                            <span>{res.platform_name}</span>
                            <span className="text-[10px] px-1 py-0.2 rounded bg-white text-ink-muted font-normal">
                              {res.is_free ? "Free" : "Course"}
                            </span>
                            <SolarIcon name="square-arrow-right-up-linear" className="w-3.5 h-3.5 text-ink-subtle" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-6 bg-canvas border-t border-surface-border flex items-center justify-between">
          <span className="text-xs text-ink-muted">
            {isViewOnly
              ? "Sign in to track progress and unlock your personal streak."
              : "All progress automatically saves to your profile."}
          </span>
          <div className="flex items-center gap-3">
            {isViewOnly && (
              <Link
                href="/signup"
                className="px-4 py-2 rounded-full bg-ink text-white text-xs font-semibold hover:bg-neutral-800 transition"
              >
                Track This Skill
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-surface-border bg-white text-ink text-xs font-semibold hover:bg-surface-muted transition"
            >
              Close Pathway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
