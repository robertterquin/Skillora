"use client";

import React, { useState, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Skill } from "@/types/database";
import { SolarIcon } from "../ui/SolarIcon";
import { Modal } from "../ui/Modal";
import { buttonClasses } from "../ui/Button";
import { playMechanicalClick, playWoodenThud, playStampThud } from "@/lib/workbench-audio";
import { User } from "@supabase/supabase-js";
import { isStepCompleted, normalizeSkillId } from "@/lib/catalog-data";

interface MasteryPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  enrolledSkills: Skill[];
  completedStepIds: string[];
  userStreak?: number;
  certifiedSkillIds?: string[];
  onOpenExam?: (skill: Skill) => void;
}

export function MasteryPassportModal({
  isOpen,
  onClose,
  user,
  enrolledSkills,
  completedStepIds,
  userStreak = 0,
  certifiedSkillIds = [],
  onOpenExam,
}: MasteryPassportModalProps) {
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<"credential" | "visas">("credential");

  if (!isOpen) return null;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Explorer";

  const masteredSkills = enrolledSkills.filter((s) => {
    const steps = s.steps || [];
    return steps.length > 0 && steps.every((st) => isStepCompleted(st.id, completedStepIds));
  });

  const inProgressSkills = enrolledSkills.filter((s) => !masteredSkills.includes(s));

  const totalHours = enrolledSkills.reduce((acc, s) => {
    const steps = s.steps || [];
    const doneSteps = steps.filter((st) => isStepCompleted(st.id, completedStepIds));
    const stepHours = doneSteps.reduce((sub, st) => sub + st.estimated_minutes / 60, 0);
    return acc + stepHours;
  }, 0);

  const certifiedCount = enrolledSkills.filter((s) =>
    certifiedSkillIds.includes(normalizeSkillId(s.id))
  ).length;

  const rank =
    certifiedCount >= 3 || masteredSkills.length >= 3
      ? "ADVANCED PRACTITIONER"
      : certifiedCount >= 1 || masteredSkills.length >= 1
      ? "INTERMEDIATE PRACTITIONER"
      : "ACTIVE LEARNER";

  const rankTier =
    certifiedCount >= 3 || masteredSkills.length >= 3 ? "TIER III" : certifiedCount >= 1 || masteredSkills.length >= 1 ? "TIER II" : "TIER I";

  const handlePrint = () => {
    playStampThud();
    window.print();
  };

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="max-w-3xl bg-white border border-surface-border flex flex-col max-h-[92vh] text-ink select-none">
      <div className="p-4 sm:p-5 bg-canvas border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink">
            <SolarIcon name="diploma-verified-linear" className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="spec-tag text-ink-muted">VERIFIED CREDENTIALS</span>
              <span className="text-3xs font-mono font-bold text-ink-subtle">
                NO. SK-{user?.id ? user.id.slice(0, 6).toUpperCase() : "882190"}
              </span>
            </div>
            <h2 id={titleId} className="font-display font-bold text-base sm:text-lg text-ink leading-tight">
              Skill Certifications
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-surface-muted border border-surface-border rounded-xl text-xs font-mono font-medium">
            <button
              type="button"
              onClick={() => {
                playMechanicalClick();
                setActiveTab("credential");
              }}
              className={`relative px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === "credential"
                  ? "text-ink font-bold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {activeTab === "credential" && (
                <motion.span
                  layoutId="passportActiveTab"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-white rounded-lg shadow-xs"
                />
              )}
              <span className="relative z-10">Overview</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playMechanicalClick();
                setActiveTab("visas");
              }}
              className={`relative px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === "visas"
                  ? "text-ink font-bold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {activeTab === "visas" && (
                <motion.span
                  layoutId="passportActiveTab"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-white rounded-lg shadow-xs"
                />
              )}
              <span className="relative z-10">Certificates ({certifiedCount})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-muted transition"
            aria-label="Close"
          >
            <SolarIcon name="close-circle-linear" className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 flex-1 overflow-y-auto bg-white">
        {activeTab === "credential" ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-300 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-stone-200">
                <div>
                  <span className="spec-tag text-stone-500 block mb-1">
                    VERIFIED LEARNER CREDENTIAL
                  </span>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
                    {displayName}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 font-mono">
                    Member ID: {user?.email || "Guest"}
                  </p>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-3xs font-mono font-bold tracking-wider uppercase self-start ${
                    certifiedCount > 0
                      ? "border-surface-border bg-surface-muted text-ink"
                      : "border-stone-200 bg-stone-50 text-stone-600"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      certifiedCount > 0 ? "bg-ink" : "bg-stone-400"
                    }`}
                  />
                  <span>{certifiedCount > 0 ? "Verified Scholar" : "Active Member"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-6 text-center">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs text-center flex flex-col justify-between">
                  <div className="w-7 h-7 mx-auto rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-700 mb-2">
                    <SolarIcon name="stars-minimalistic-linear" className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-3xs font-mono font-semibold text-stone-500 block uppercase tracking-wider">Rank Tier</span>
                    <span className="font-bold text-xs text-ink mt-0.5 block font-sans truncate">{rankTier}</span>
                    <span className="text-3xs text-stone-500 block mt-0.5 font-mono">{rank}</span>
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs text-center flex flex-col justify-between">
                  <div className="w-7 h-7 mx-auto rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink-muted mb-2">
                    <SolarIcon name="clock-circle-linear" className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-3xs font-mono font-semibold text-stone-500 block uppercase tracking-wider">Total Hours</span>
                    <div className="mt-0.5 flex items-baseline justify-center gap-0.5">
                      <span className="font-display font-bold text-base sm:text-lg text-ink tabular-nums leading-none">
                        {totalHours.toFixed(1)}
                      </span>
                      <span className="text-3xs text-stone-500 font-sans font-normal">hrs</span>
                    </div>
                    <span className="text-3xs text-stone-500 block mt-0.5 font-mono">total</span>
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs text-center flex flex-col justify-between">
                  <div className="w-7 h-7 mx-auto rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink-muted mb-2">
                    <SolarIcon name="diploma-verified-linear" className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-3xs font-mono font-semibold text-stone-500 block uppercase tracking-wider">Certificates</span>
                    <div className="mt-0.5 flex items-baseline justify-center gap-0.5">
                      <span className="font-display font-bold text-base sm:text-lg text-ink tabular-nums leading-none">
                        {certifiedCount}
                      </span>
                      <span className="text-3xs text-stone-500 font-sans font-medium">earned</span>
                    </div>
                    <span className="text-3xs text-stone-500 block mt-0.5 font-mono">verified</span>
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs text-center flex flex-col justify-between">
                  <div className="w-7 h-7 mx-auto rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink-muted mb-2">
                    <SolarIcon name="cup-first-linear" className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-3xs font-mono font-semibold text-stone-500 block uppercase tracking-wider">Completed</span>
                    <div className="mt-0.5 flex items-baseline justify-center gap-0.5">
                      <span className="font-display font-bold text-base sm:text-lg text-ink tabular-nums leading-none">
                        {masteredSkills.length}
                      </span>
                      <span className="text-3xs text-stone-500 font-sans font-medium">
                        {masteredSkills.length === 1 ? "skill" : "skills"}
                      </span>
                    </div>
                    <span className="text-3xs text-stone-500 block mt-0.5 font-mono">mastered</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-ink text-xs font-semibold text-ink transition shadow-2xs cursor-pointer"
              >
                <SolarIcon name="printer-2-linear" className="w-4 h-4 text-stone-600" />
                <span>Print Certificates</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playWoodenThud();
                  setActiveTab("visas");
                }}
                className={buttonClasses()}
              >
                <span>View Certificates ({certifiedCount}) &rarr;</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-300 text-xs">
              <div>
                <span className="spec-tag text-stone-500 block">CERTIFICATES &amp; ACHIEVEMENTS</span>
                <p className="text-stone-600 text-2xs mt-0.5">
                  Skills become eligible for official certification upon completing all curriculum steps.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-stone-700">
                {certifiedCount} of {enrolledSkills.length} Certified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledSkills.map((skill, idx) => {
                const steps = skill.steps || [];
                const doneCount = steps.filter((s) => isStepCompleted(s.id, completedStepIds)).length;
                const isDone = steps.length > 0 && doneCount === steps.length;
                const isCertified = certifiedSkillIds.includes(normalizeSkillId(skill.id));

                return (
                  <div
                    key={skill.id}
                    className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between min-h-[185px] ${
                      isCertified
                        ? "bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 border-amber-400 shadow-md ring-1 ring-amber-400/30"
                        : isDone
                        ? "bg-white border-stone-400 shadow-sm"
                        : "bg-paper/60 border-dashed border-stone-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-3xs font-mono tracking-widest text-stone-500 uppercase mb-2">
                        <span className={isCertified ? "text-amber-800 font-bold" : ""}>
                          {isCertified ? "OFFICIAL CERTIFICATE ISSUED" : `TRACK #${idx + 1 < 10 ? `0${idx + 1}` : idx + 1}`}
                        </span>
                        <span>EST. {skill.estimated_hours}.0H</span>
                      </div>
                      <h4 className="font-display font-bold text-base text-ink mb-1">
                        {skill.title}
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-2">
                        {skill.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                      {isCertified ? (
                        <>
                          <div className="flex flex-col">
                            <span className="text-3xs font-mono font-bold text-ink uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-ink" />
                              <span>OFFICIALLY CERTIFIED</span>
                            </span>
                            <span className="text-3xs font-mono text-ink-muted">
                              PASSED ASSESSMENT
                            </span>
                            {onOpenExam && (
                              <button
                                type="button"
                                onClick={() => onOpenExam(skill)}
                                className="mt-1 text-3xs font-mono font-bold text-ink hover:underline text-left cursor-pointer"
                              >
                                View Certificate &rarr;
                              </button>
                            )}
                          </div>
                          <div className="w-10 h-10 rounded-full border border-surface-border bg-surface-muted flex items-center justify-center text-ink shadow-xs">
                            <SolarIcon name="diploma-verified-linear" className="w-5 h-5" />
                          </div>
                        </>
                      ) : isDone ? (
                        <>
                          <div className="flex flex-col">
                            <span className="text-3xs font-mono font-bold text-ink-secondary uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-ink" />
                              <span>ALL STEPS COMPLETED</span>
                            </span>
                            <span className="text-3xs font-mono text-stone-400">
                              READY FOR CERTIFICATION
                            </span>
                            {onOpenExam && (
                              <button
                                type="button"
                                onClick={() => onOpenExam(skill)}
                                className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-muted border border-surface-border text-3xs font-mono font-bold text-ink hover:bg-surface transition cursor-pointer"
                              >
                                <span>Take Assessment</span>
                                <SolarIcon name="arrow-right-linear" className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                          <div className="w-10 h-10 rounded-full border border-surface-border bg-surface-muted flex items-center justify-center text-ink shadow-xs">
                            <SolarIcon name="check-circle-bold" className="w-5 h-5 text-ink" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <span className="text-3xs font-mono font-semibold text-stone-500 uppercase">
                              IN PROGRESS · {doneCount}/{steps.length} STEPS
                            </span>
                            <span className="text-3xs font-mono text-stone-400">
                              Assessment unlocked at 100%
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-full border border-dashed border-stone-400 flex items-center justify-center text-3xs font-mono text-stone-400 rotate-[-6deg]">
                            PENDING
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {enrolledSkills.length === 0 && (
              <div className="p-12 text-center text-stone-500 text-xs">
                No skills yet. Add a skill from the Library to start tracking your certifications.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
