"use client";

import React, { useState, useId } from "react";
import { Skill } from "@/types/database";
import { SolarIcon } from "../ui/SolarIcon";
import { Modal } from "../ui/Modal";
import { buttonClasses } from "../ui/Button";
import { HankoSeal } from "../ui/HankoSeal";
import { playMechanicalClick, playWoodenThud, playStampThud } from "@/lib/workbench-audio";
import { User } from "@supabase/supabase-js";
import { isStepCompleted, normalizeSkillId } from "@/lib/mock-data";

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

  // Calculate mastered skills
  const masteredSkills = enrolledSkills.filter((s) => {
    const steps = s.steps || [];
    return steps.length > 0 && steps.every((st) => isStepCompleted(st.id, completedStepIds));
  });

  const inProgressSkills = enrolledSkills.filter((s) => !masteredSkills.includes(s));

  // Calculate total accumulated practice hours
  const totalHours = enrolledSkills.reduce((acc, s) => {
    const steps = s.steps || [];
    const doneSteps = steps.filter((st) => isStepCompleted(st.id, completedStepIds));
    const stepHours = doneSteps.reduce((sub, st) => sub + st.estimated_minutes / 60, 0);
    return acc + stepHours;
  }, 0);

  // Calculate certified skills
  const certifiedCount = enrolledSkills.filter((s) =>
    certifiedSkillIds.includes(normalizeSkillId(s.id))
  ).length;

  // Guild Rank Calculation
  const rank =
    certifiedCount >= 3 || masteredSkills.length >= 3
      ? "MASTER ATELIER ARTISAN"
      : certifiedCount >= 1 || masteredSkills.length >= 1
      ? "JOURNEYMAN CRAFTSMAN"
      : "STUDIO APPRENTICE";

  const rankTier =
    certifiedCount >= 3 || masteredSkills.length >= 3 ? "TIER III" : certifiedCount >= 1 || masteredSkills.length >= 1 ? "TIER II" : "TIER I";

  const handlePrint = () => {
    playStampThud();
    window.print();
  };

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="max-w-3xl bg-paper border-2 border-stone-300 flex flex-col max-h-[92vh] text-ink select-none corner-ticks">
      {/* Passport Spine Header & Folio Tab Bar */}
      <div className="p-4 sm:p-5 bg-paper-deep border-b border-stone-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-200 border border-stone-300 flex items-center justify-center text-ink">
            <SolarIcon name="book-bookmark-linear" className="w-5 h-5 text-stone-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="spec-tag text-stone-600">PASSPORT // ARCHIVAL FOLIO</span>
              <span className="text-3xs font-mono font-bold text-stone-500">
                NO. SK-{user?.id ? user.id.slice(0, 6).toUpperCase() : "882190"}
              </span>
            </div>
            <h2 id={titleId} className="font-display font-bold text-base sm:text-lg text-ink leading-tight">
              Mastery Passport
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center p-1 bg-stone-200 border border-stone-300 rounded-xl text-xs font-mono font-medium">
            <button
              type="button"
              onClick={() => {
                playMechanicalClick();
                setActiveTab("credential");
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "credential"
                  ? "bg-white text-ink shadow-xs font-bold"
                  : "text-stone-600 hover:text-ink"
              }`}
            >
              Credential
            </button>
            <button
              type="button"
              onClick={() => {
                playMechanicalClick();
                setActiveTab("visas");
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "visas"
                  ? "bg-white text-ink shadow-xs font-bold"
                  : "text-stone-600 hover:text-ink"
              }`}
            >
              Hankō Stamps ({masteredSkills.length})
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-ink hover:bg-stone-200 transition"
            aria-label="Close"
          >
            <SolarIcon name="close-circle-linear" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Passport Notebook Body */}
      <div className="p-6 sm:p-8 flex-1 overflow-y-auto bg-paper">
        {activeTab === "credential" ? (
          /* ============================================================ */
          /* 1. ARCHIVAL CREDENTIAL PAGE                                  */
          /* ============================================================ */
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Guild Citizen Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-300 shadow-xs relative overflow-hidden">
              {/* Background Watermark Crest */}
              <div className="absolute right-4 -bottom-6 opacity-5 pointer-events-none select-none">
                <span className="font-serif text-[180px] font-bold">済</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-stone-200">
                <div>
                  <span className="spec-tag text-stone-500 block mb-1">
                    DELIBERATE PRACTICE GUILD MEMBER
                  </span>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
                    {displayName}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 font-mono">
                    Member ID: {user?.email || "Studio Guest Explorer"}
                  </p>
                </div>

                {/* Official Stamped Hankō Seal on Citizen Card (Gold if Certified!) */}
                <div className="flex flex-col items-center">
                  <HankoSeal
                    label={certifiedCount > 0 ? "匠" : "済"}
                    subtext={certifiedCount > 0 ? "GUILD CERTIFIED" : "VERIFIED"}
                    size="lg"
                    variant={certifiedCount > 0 ? "gold" : "vermilion"}
                    className="shadow-sm"
                  />
                  <span className="text-3xs font-mono text-stone-400 mt-1 uppercase tracking-widest">
                    {certifiedCount > 0 ? "Golden Guild Mark" : "Official Seal"}
                  </span>
                </div>
              </div>

              {/* Metrics Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-center font-mono">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-3xs text-stone-500 block uppercase">GUILD RANK</span>
                  <span className="font-bold text-xs text-ink mt-0.5 block">{rankTier}</span>
                  <span className="text-3xs text-stone-600 block">{rank}</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-3xs text-stone-500 block uppercase">TOTAL HOURS</span>
                  <span className="font-bold text-lg text-ink mt-0.5 block tabular-nums">
                    {totalHours.toFixed(1)}h
                  </span>
                  <span className="text-3xs text-stone-600 block">Accumulated</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-3xs text-stone-500 block uppercase">GOLDEN SEALS</span>
                  <span className="font-bold text-lg text-amber-700 mt-0.5 block tabular-nums">
                    {certifiedCount}
                  </span>
                  <span className="text-3xs text-amber-800 font-semibold block">匠 Certified</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-3xs text-stone-500 block uppercase">DRILLS MASTERED</span>
                  <span className="font-bold text-lg text-rose-700 mt-0.5 block tabular-nums">
                    {masteredSkills.length}
                  </span>
                  <span className="text-3xs text-stone-600 block">Stamped</span>
                </div>
              </div>
            </div>

            {/* Guild Oath / Craft Philosophy */}
            <div className="p-5 rounded-2xl bg-paper-warm border border-stone-300 text-xs text-stone-700 leading-relaxed font-serif italic text-center">
              &ldquo;Mastery is not an accident of genius, but the disciplined accumulation of micro-mechanics. Each Hankō seal represents twenty deliberate hours etched into the hands and mind.&rdquo;
            </div>

            {/* Actions: Print & Jump to Stamp Registry */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-ink text-xs font-semibold text-ink transition shadow-2xs cursor-pointer"
              >
                <SolarIcon name="printer-2-linear" className="w-4 h-4 text-stone-600" />
                <span>Export & Print Passport</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playWoodenThud();
                  setActiveTab("visas");
                }}
                className={buttonClasses()}
              >
                <span>Inspect Hankō Visa Stamps ({masteredSkills.length}) &rarr;</span>
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* 2. VISA STAMP REGISTRY PAGE                                  */
          /* ============================================================ */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-300 text-xs">
              <div>
                <span className="spec-tag text-stone-500 block">ARCHIVAL STAMP REGISTRY</span>
                <p className="text-stone-600 text-2xs mt-0.5">
                  Disciplines receive an indelible scarlet Hankō seal upon completion of all step drills.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-stone-700">
                {masteredSkills.length} of {enrolledSkills.length} Certified
              </span>
            </div>

            {/* Grid of Visa Stamp Boxes */}
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
                    {/* Top Spec Info */}
                    <div>
                      <div className="flex items-center justify-between text-3xs font-mono tracking-widest text-stone-500 uppercase mb-2">
                        <span className={isCertified ? "text-amber-800 font-bold" : ""}>
                          {isCertified ? "GUILD DIPLOMA CONFERRED" : `REGISTRY ENTRY #${idx + 1 < 10 ? `0${idx + 1}` : idx + 1}`}
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

                    {/* Bottom Status / Stamp */}
                    <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                      {isCertified ? (
                        <>
                          <div className="flex flex-col">
                            <span className="text-3xs font-mono font-bold text-amber-800 uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>GUILD CERTIFIED CRAFTSMAN</span>
                            </span>
                            <span className="text-3xs font-mono text-amber-700/80">
                              GOLDEN SEAL CONFERRED (匠)
                            </span>
                            {onOpenExam && (
                              <button
                                type="button"
                                onClick={() => onOpenExam(skill)}
                                className="mt-1 text-3xs font-mono font-bold text-amber-800 hover:text-amber-950 underline text-left cursor-pointer"
                              >
                                View Guild Diploma &rarr;
                              </button>
                            )}
                          </div>
                          <HankoSeal
                            label="匠"
                            subtext="GUILD CERTIFIED"
                            size="md"
                            variant="gold"
                          />
                        </>
                      ) : isDone ? (
                        <>
                          <div className="flex flex-col">
                            <span className="text-3xs font-mono font-bold text-rose-800 uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              <span>DRILLS VERIFIED (100%)</span>
                            </span>
                            <span className="text-3xs font-mono text-stone-400">
                              COMPLETED // VERMILION SEAL
                            </span>
                            {onOpenExam && (
                              <button
                                type="button"
                                onClick={() => onOpenExam(skill)}
                                className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-3xs font-mono font-bold text-amber-800 hover:bg-amber-500/20 transition cursor-pointer"
                              >
                                <span>Take Guild Exam (匠)</span>
                                <SolarIcon name="arrow-right-linear" className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                          <HankoSeal
                            label="済"
                            subtext="VERIFIED"
                            size="md"
                            variant="vermilion"
                          />
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <span className="text-3xs font-mono font-semibold text-stone-500 uppercase">
                              IN TRAINING // {doneCount}/{steps.length} DRILLS
                            </span>
                            <span className="text-3xs font-mono text-stone-400">
                              Pending final mastery seal
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
                No skills yet. Add one from the Skill Library to start your passport.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
