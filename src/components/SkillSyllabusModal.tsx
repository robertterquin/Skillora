"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Skill } from "@/types/database";
import { SolarIcon } from "@/components/SolarIcon";
import { VideoPlayerModal, extractYouTubeId } from "@/components/VideoPlayerModal";

interface SkillSyllabusModalProps {
  skill: Skill | null;
  completedStepIds?: string[];
  onToggleStep?: (stepId: string) => void;
  onClose: () => void;
  isViewOnly?: boolean;
  isGuildCertified?: boolean;
  onOpenGuildExam?: (skill: Skill) => void;
}

export function SkillSyllabusModal({
  skill,
  completedStepIds = [],
  onToggleStep,
  onClose,
  isViewOnly = false,
  isGuildCertified = false,
  onOpenGuildExam,
}: SkillSyllabusModalProps) {
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string; stepTitle?: string } | null>(null);

  if (!skill) return null;

  const steps = skill.steps || [];
  const totalSteps = steps.length;
  const completedCount = steps.filter((s) => completedStepIds.includes(s.id)).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isAllComplete = totalSteps > 0 && completedCount === totalSteps;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-ink/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
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

          {/* Unified Metadata Strip */}
          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted font-medium">
            <span className="capitalize">{skill.difficulty}</span>
            <span className="text-ink-subtle">·</span>
            <span>{skill.time_commitment_label}</span>
            <span className="text-ink-subtle">·</span>
            <span>{skill.estimated_hours}h estimated</span>
            <span className="text-ink-subtle">·</span>
            <span>{totalSteps} practice steps</span>
            {!isViewOnly && isAllComplete && (
              <>
                <span className="text-ink-subtle">·</span>
                <span className="text-accent-emerald font-semibold inline-flex items-center gap-1">
                  <SolarIcon name="cup-first-linear" className="w-3.5 h-3.5" />
                  <span>Mastered</span>
                </span>
              </>
            )}
          </div>

          {/* Progress Bar (Only shown for authenticated / tracked mode) */}
          {!isViewOnly && (
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-xs text-ink-muted">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-subtle">Path Progress</span>
                <span className="tabular-nums font-mono text-[11px] font-semibold text-ink">
                  {completedCount}/{totalSteps} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-1 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${
                    isAllComplete ? "bg-accent-emerald" : "bg-ink"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Guild Accreditation Banner */}
          {!isViewOnly && isAllComplete && (
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 flex-shrink-0 shadow-2xs">
                  <SolarIcon name={isGuildCertified ? "diploma-verified-linear" : "cup-first-linear"} className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{isGuildCertified ? "CRAFTSMAN'S GUILD ACCREDITED" : "100% COMPLETE // GUILD EXAM UNLOCKED"}</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-200/60 text-amber-900 text-[9px]">匠</span>
                  </div>
                  <div className="text-xs text-stone-700 mt-0.5">
                    {isGuildCertified
                      ? "You hold the Golden Hankō Seal and accredited diploma from Archimedes."
                      : "Prove your sensory intuition in Archimedes' diagnostic exam to earn your Golden Hankō Seal."}
                  </div>
                </div>
              </div>
              {onOpenGuildExam && (
                <button
                  type="button"
                  onClick={() => onOpenGuildExam(skill)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>{isGuildCertified ? "View Guild Diploma (匠)" : "Take Guild Exam (匠)"}</span>
                  <SolarIcon name="arrow-right-linear" className="w-3.5 h-3.5" />
                </button>
              )}
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
                    <div className="flex items-start gap-3">
                      {!isViewOnly ? (
                        <button
                          type="button"
                          onClick={() => onToggleStep && onToggleStep(step.id)}
                          className="mt-0.5 text-ink-subtle hover:text-ink transition cursor-pointer"
                          aria-label={isStepDone ? "Mark step incomplete" : "Mark step completed"}
                        >
                          {isStepDone ? (
                            <SolarIcon name="check-circle-linear" className="w-5 h-5 text-accent-emerald" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-surface-border hover:border-ink bg-white transition shadow-2xs" />
                          )}
                        </button>
                      ) : (
                        <div className="w-5 h-5 rounded-md bg-canvas border border-surface-border flex items-center justify-center font-mono text-[10px] font-semibold text-ink mt-0.5">
                          {step.step_number}
                        </div>
                      )}
                      <div>
                        <div className="text-[11px] font-mono text-ink-subtle mb-0.5">
                          Step {step.step_number} · ~{step.estimated_minutes} mins
                        </div>
                        <h4 className={`font-display font-semibold text-base ${isStepDone ? "line-through text-ink-muted" : "text-ink"}`}>
                          {step.title}
                        </h4>
                      </div>
                    </div>

                    {!isViewOnly ? (
                      <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full transition ${
                        isStepDone
                          ? "bg-accent-emerald/10 text-accent-emerald"
                          : "text-ink-subtle bg-surface-muted"
                      }`}>
                        {isStepDone ? "Done" : `${step.estimated_minutes}m`}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-ink-subtle">
                        ~{step.estimated_minutes}m
                      </span>
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
                        {step.resources.map((res) => {
                          const isYouTube = !!extractYouTubeId(res.url);

                          if (isYouTube) {
                            return (
                              <div
                                key={res.id}
                                className="inline-flex items-center rounded-xl overflow-hidden border border-rose-200 bg-rose-50 hover:bg-rose-100/80 transition shadow-2xs group"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveVideo({
                                      url: res.url,
                                      title: res.platform_name,
                                      stepTitle: step.title,
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-950 transition cursor-pointer"
                                  title="Watch tutorial inside workbench player"
                                >
                                  <SolarIcon name="play-linear" className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition" />
                                  <span>{res.platform_name}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-rose-600 font-semibold font-mono">
                                    Watch
                                  </span>
                                </button>

                                <a
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1.5 text-rose-700 hover:text-rose-950 hover:bg-rose-200/60 border-l border-rose-200 transition flex items-center"
                                  title="Open directly on YouTube (external link)"
                                >
                                  <SolarIcon name="square-arrow-right-up-linear" className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            );
                          }

                          return (
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
                          );
                        })}
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
            {!isViewOnly && isAllComplete && onOpenGuildExam && (
              <button
                type="button"
                onClick={() => onOpenGuildExam(skill)}
                className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-mono transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isGuildCertified ? "Guild Diploma (匠)" : "Guild Exam (匠)"}</span>
              </button>
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
      </motion.div>

      {/* Distraction-Free Video Modal */}
      {activeVideo && (
        <VideoPlayerModal
          isOpen={!!activeVideo}
          onClose={() => setActiveVideo(null)}
          videoUrl={activeVideo.url}
          title={activeVideo.title}
          stepTitle={activeVideo.stepTitle}
        />
      )}
    </motion.div>
  );
}
