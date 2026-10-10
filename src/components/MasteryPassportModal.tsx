"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Skill } from "@/types/database";
import { SolarIcon } from "@/components/SolarIcon";
import { HankoSeal } from "@/components/HankoSeal";
import { playMechanicalClick, playWoodenThud, playStampThud } from "@/lib/workbench-audio";
import { User } from "@supabase/supabase-js";

interface MasteryPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  enrolledSkills: Skill[];
  completedStepIds: string[];
  userStreak?: number;
}

export function MasteryPassportModal({
  isOpen,
  onClose,
  user,
  enrolledSkills,
  completedStepIds,
  userStreak = 4,
}: MasteryPassportModalProps) {
  const [activeTab, setActiveTab] = useState<"credential" | "visas">("credential");

  if (!isOpen) return null;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Explorer";

  // Calculate mastered skills
  const masteredSkills = enrolledSkills.filter((s) => {
    const steps = s.steps || [];
    return steps.length > 0 && steps.every((st) => completedStepIds.includes(st.id));
  });

  const inProgressSkills = enrolledSkills.filter((s) => !masteredSkills.includes(s));

  // Calculate total accumulated practice hours
  const totalHours = enrolledSkills.reduce((acc, s) => {
    const steps = s.steps || [];
    const doneSteps = steps.filter((st) => completedStepIds.includes(st.id));
    const stepHours = doneSteps.reduce((sub, st) => sub + st.estimated_minutes / 60, 0);
    return acc + stepHours;
  }, 0);

  // Guild Rank Calculation
  const rank =
    masteredSkills.length >= 3
      ? "MASTER ATELIER ARTISAN"
      : masteredSkills.length >= 1
      ? "JOURNEYMAN CRAFTSMAN"
      : "STUDIO APPRENTICE";

  const rankTier =
    masteredSkills.length >= 3 ? "TIER III" : masteredSkills.length >= 1 ? "TIER II" : "TIER I";

  const handlePrint = () => {
    playStampThud();
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-ink/75 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] text-ink select-none corner-ticks"
      >
        {/* Passport Spine Header & Folio Tab Bar */}
        <div className="p-4 sm:p-5 bg-[#F2EFE9] border-b border-stone-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-200 border border-stone-300 flex items-center justify-center text-ink">
              <SolarIcon name="book-bookmark-linear" className="w-5 h-5 text-stone-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="spec-tag text-stone-600">PASSPORT // ARCHIVAL FOLIO</span>
                <span className="text-[10px] font-mono font-bold text-stone-500">
                  NO. SK-{user?.id ? user.id.slice(0, 6).toUpperCase() : "882190"}
                </span>
              </div>
              <h2 className="font-display font-bold text-base sm:text-lg text-ink leading-tight">
                Skillora Repertoire Passport
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
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto bg-[#FAF8F5]">
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

                  {/* Official Stamped Hankō Seal on Citizen Card */}
                  <div className="flex flex-col items-center">
                    <HankoSeal
                      label="済"
                      subtext="VERIFIED"
                      size="lg"
                      variant="vermilion"
                      className="shadow-sm"
                    />
                    <span className="text-[8px] font-mono text-stone-400 mt-1 uppercase tracking-widest">
                      Official Seal
                    </span>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-center font-mono">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9px] text-stone-500 block uppercase">GUILD RANK</span>
                    <span className="font-bold text-xs text-ink mt-0.5 block">{rankTier}</span>
                    <span className="text-[9px] text-stone-600 block">{rank}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9px] text-stone-500 block uppercase">TOTAL HOURS</span>
                    <span className="font-bold text-lg text-ink mt-0.5 block tabular-nums">
                      {totalHours.toFixed(1)}h
                    </span>
                    <span className="text-[9px] text-stone-600 block">Accumulated</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9px] text-stone-500 block uppercase">DAILY STREAK</span>
                    <span className="font-bold text-lg text-amber-700 mt-0.5 block tabular-nums">
                      {userStreak}d
                    </span>
                    <span className="text-[9px] text-stone-600 block">Consecutive</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9px] text-stone-500 block uppercase">MASTERED SEALS</span>
                    <span className="font-bold text-lg text-rose-700 mt-0.5 block tabular-nums">
                      {masteredSkills.length}
                    </span>
                    <span className="text-[9px] text-stone-600 block">Stamped</span>
                  </div>
                </div>
              </div>

              {/* Guild Oath / Craft Philosophy */}
              <div className="p-5 rounded-2xl bg-[#F4F1EB] border border-stone-300 text-xs text-stone-700 leading-relaxed font-serif italic text-center">
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink hover:bg-neutral-800 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
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
                  <p className="text-stone-600 text-[11px] mt-0.5">
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
                  const doneCount = steps.filter((s) => completedStepIds.includes(s.id)).length;
                  const isDone = steps.length > 0 && doneCount === steps.length;

                  return (
                    <div
                      key={skill.id}
                      className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between min-h-[170px] ${
                        isDone
                          ? "bg-white border-stone-400 shadow-sm"
                          : "bg-[#F7F5EE]/60 border-dashed border-stone-300"
                      }`}
                    >
                      {/* Top Spec Info */}
                      <div>
                        <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-stone-500 uppercase mb-2">
                          <span>REGISTRY ENTRY #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
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
                      <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                        {isDone ? (
                          <>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-mono font-bold text-rose-800 uppercase flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                <span>VERIFIED ATELIER APEX</span>
                              </span>
                              <span className="text-[9px] font-mono text-stone-400">
                                COMPLETED // ARCHIVE CERTIFIED
                              </span>
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
                              <span className="text-[10px] font-mono font-semibold text-stone-500 uppercase">
                                IN TRAINING // {doneCount}/{steps.length} DRILLS
                              </span>
                              <span className="text-[9px] font-mono text-stone-400">
                                Pending final mastery seal
                              </span>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-dashed border-stone-400 flex items-center justify-center text-[9px] font-mono text-stone-400 rotate-[-6deg]">
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
                  No disciplines currently enrolled. Visit Archimedes&apos; Library to begin your first study.
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
