"use client";

import React, { useState, useEffect, useId } from "react";
import { motion } from "motion/react";
import { Skill } from "@/types/database";
import { SolarIcon } from "../ui/SolarIcon";
import { Modal } from "../ui/Modal";
import { buttonClasses } from "../ui/Button";
import { HankoSeal } from "../ui/HankoSeal";
import { playMechanicalClick, playChime, playWoodenThud, playStampThud } from "@/lib/workbench-audio";
import { GuildExamPayload, ExamQuestion } from "@/app/api/ai/guild-exam/route";

interface GuildExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: Skill | null;
  onPass: (skillId: string) => void;
  isAlreadyCertified?: boolean;
  userName?: string;
}

export function GuildExamModal({
  isOpen,
  onClose,
  skill,
  onPass,
  isAlreadyCertified = false,
  userName = "Journeyman Craftsman",
}: GuildExamModalProps) {
  const titleId = useId();
  const [stage, setStage] = useState<"intro" | "exam" | "result" | "diploma">("intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examData, setExamData] = useState<GuildExamPayload | null>(null);

  // Exam execution state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [certifiedDate, setCertifiedDate] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setCertifiedDate(today);

      if (isAlreadyCertified) {
        setStage("diploma");
      } else {
        setStage("intro");
      }
      setCurrentQuestionIdx(0);
      setUserAnswers({});
      setIsAnswerRevealed(false);
    }
  }, [isOpen, isAlreadyCertified]);

  // Fetch or prepare the exam
  const startExam = async () => {
    if (!skill) return;
    playMechanicalClick();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/guild-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillTitle: skill.title,
          skillSummary: skill.summary,
          skillSlug: skill.slug,
          steps: skill.steps || [],
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to retrieve examination docket from Proctor Archimedes.");
      }

      const data = await res.json();
      if (data.exam) {
        setExamData(data.exam);
        setStage("exam");
        setCurrentQuestionIdx(0);
        setUserAnswers({});
        setIsAnswerRevealed(false);
      } else {
        throw new Error("Invalid examination payload received.");
      }
    } catch (err: unknown) {
      console.error("Guild Exam Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load examination.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !skill) return null;

  const questions: ExamQuestion[] = examData?.questions || [];
  const currentQuestion: ExamQuestion | undefined = questions[currentQuestionIdx];

  // Calculate score
  const calculateScore = () => {
    if (!examData) return 0;
    let correct = 0;
    examData.questions.forEach((q, idx) => {
      const chosenId = userAnswers[idx];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (chosenId && correctOption && chosenId === correctOption.id) {
        correct++;
      }
    });
    return correct;
  };

  const handleSelectOption = (optionId: "A" | "B" | "C" | "D") => {
    if (isAnswerRevealed || !currentQuestion) return;

    setUserAnswers((prev) => ({ ...prev, [currentQuestionIdx]: optionId }));
    setIsAnswerRevealed(true);

    const chosen = currentQuestion.options.find((o) => o.id === optionId);
    if (chosen?.isCorrect) {
      playChime();
    } else {
      playWoodenThud();
    }
  };

  const handleNextQuestion = () => {
    playMechanicalClick();
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setIsAnswerRevealed(false);
    } else {
      // Completed all questions
      const finalScore = calculateScore();
      const passing = examData?.passingScore ?? 2;
      const passed = finalScore >= passing;

      if (passed) {
        playStampThud();
        onPass(skill.id);
      }
      setStage("result");
    }
  };

  const score = calculateScore();
  const passingScore = examData?.passingScore ?? 2;
  const isPassed = score >= passingScore;
  const honorific = examData?.craftHonorific || `Certified Master of ${skill.title}`;

  const handlePrintDiploma = () => {
    playStampThud();
    window.print();
  };

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="max-w-2xl bg-paper border-2 border-stone-300 flex flex-col max-h-[92vh] text-ink select-none corner-ticks print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none print:bg-white">
      {/* Modal Top Bar */}
      <div className="p-4 sm:p-5 bg-paper-deep border-b border-stone-300 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shadow-2xs">
            <SolarIcon name="diploma-verified-linear" className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="spec-tag text-stone-600">GUILD ATELIER // PROCTOR: ARCHIMEDES</span>
              <span className="text-3xs font-mono font-bold text-amber-700">
                DIAGNOSTIC EXAM
              </span>
            </div>
            <h2 id={titleId} className="font-display font-bold text-base sm:text-lg text-ink leading-tight">
              Craftsman&apos;s Guild Examination
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stage === "exam" && (
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-white border border-stone-300 text-stone-700">
              Question {currentQuestionIdx + 1} / {questions.length}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-ink hover:bg-stone-200 transition"
            aria-label="Close examination docket"
          >
            <SolarIcon name="close-circle-linear" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal Body */}
      <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
        {/* ============================================================ */}
        {/* 1. INTRO DOCKET STAGE                                        */}
        {/* ============================================================ */}
        {stage === "intro" && (
          <div className="space-y-6 text-center max-w-lg mx-auto py-4">
            <div className="flex justify-center">
              <HankoSeal
                label="匠"
                subtext="GUILD PROCTOR"
                size="lg"
                variant="copper"
              />
            </div>

            <div>
              <span className="spec-tag text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full text-3xs">
                PRACTICAL MASTERY PROTOCOL
              </span>
              <h3 className="font-display font-bold text-2xl text-ink mt-3">
                {skill.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                You have completed all step drills in the workbench. To receive the indelible{" "}
                <strong className="text-amber-800 font-semibold">Golden Hankō Seal (匠)</strong>{" "}
                in your Guild Passport, you must prove your physical intuition across 3 practical troubleshooting scenarios.
              </p>
            </div>

            {/* Protocol Spec Box */}
            <div className="p-4 rounded-2xl bg-white border border-stone-300 text-left space-y-2.5 text-xs font-mono shadow-2xs">
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">FORMAT:</span>
                <span className="font-bold text-ink">3 Practical Sensory Diagnostics</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">CRITERIA:</span>
                <span className="font-bold text-ink">2 of 3 Correct Required to Pass</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">PROCTOR:</span>
                <span className="font-bold text-ink">Archimedes of Syracuse (AI Proctor)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">ACCREDITATION:</span>
                <span className="font-bold text-amber-700">Official Craftsman&apos;s Guild Diploma</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs text-left">
                <strong>Proctor Notice:</strong> {error}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={startExam}
                disabled={loading}
                className={buttonClasses({ className: "w-full sm:w-auto font-mono" })}
              >
                {loading ? (
                  <>
                    <SolarIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
                    <span>Convening Guild Proctors...</span>
                  </>
                ) : (
                  <>
                    <span>Commence Examination</span>
                    <SolarIcon name="arrow-right-linear" className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-stone-300 bg-white text-stone-700 font-mono text-xs hover:bg-stone-100 transition"
              >
                Return to Studio
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. ACTIVE QUESTIONS STAGE                                    */}
        {/* ============================================================ */}
        {stage === "exam" && currentQuestion && (
          <div className="space-y-6">
            {/* Question Header & Cue */}
            <div>
              <div className="flex items-center justify-between text-3xs font-mono tracking-widest text-stone-500 uppercase mb-1.5">
                <span className="text-amber-800 font-bold">
                  DIAGNOSTIC CASE {currentQuestionIdx + 1} OF {questions.length}
                </span>
                <span>PASS BENCHMARK: 2/3</span>
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-stone-200 text-stone-700 text-3xs font-mono font-semibold tracking-wider uppercase mb-3">
                {currentQuestion.practicalCue}
              </div>
              <h3 className="font-display font-semibold text-base sm:text-lg text-ink leading-relaxed">
                {currentQuestion.scenario}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = userAnswers[currentQuestionIdx] === opt.id;
                let cardStyle = "bg-white border-stone-300 hover:border-ink hover:bg-stone-50/50 cursor-pointer";
                let badgeStyle = "bg-stone-100 text-stone-700 border-stone-300";

                if (isAnswerRevealed) {
                  if (opt.isCorrect) {
                    cardStyle = "bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-xs";
                    badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                  } else if (isSelected && !opt.isCorrect) {
                    cardStyle = "bg-rose-50/80 border-rose-400 text-rose-950";
                    badgeStyle = "bg-rose-600 text-white border-rose-600";
                  } else {
                    cardStyle = "bg-white/50 border-stone-200 opacity-60";
                  }
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${cardStyle}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg border font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${badgeStyle}`}
                      >
                        {opt.id}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium leading-relaxed">
                          {opt.text}
                        </p>

                        {/* Reveal Rationale */}
                        {isAnswerRevealed && (opt.isCorrect || isSelected) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className={`mt-2.5 pt-2 border-t text-xs ${
                              opt.isCorrect
                                ? "border-emerald-300/80 text-emerald-900"
                                : "border-rose-300/80 text-rose-900"
                            }`}
                          >
                            <strong className="font-mono text-3xs uppercase tracking-wider block mb-0.5">
                              {opt.isCorrect ? "✓ Master Diagnostic Rationale:" : "✗ Mechanical Flaw:"}
                            </strong>
                            <span>{opt.rationale}</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Button */}
            {isAnswerRevealed && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className={buttonClasses({ className: "font-mono" })}
                >
                  <span>
                    {currentQuestionIdx < questions.length - 1
                      ? "Next Scenario"
                      : "View Guild Evaluation"}
                  </span>
                  <SolarIcon name="arrow-right-linear" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. EVALUATION RESULT STAGE                                   */}
        {/* ============================================================ */}
        {stage === "result" && (
          <div className="text-center space-y-6 max-w-lg mx-auto py-4">
            {isPassed ? (
              <>
                <div className="flex justify-center">
                  <HankoSeal
                    label="匠"
                    subtext="GUILD CERTIFIED"
                    size="xl"
                    variant="gold"
                    animate={true}
                  />
                </div>

                <div>
                  <span className="spec-tag text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full text-3xs">
                    EXAMINATION PASSED // GOLDEN SEAL CONFERRED
                  </span>
                  <h3 className="font-display font-bold text-2xl text-ink mt-3">
                    Mastery Certified: {honorific}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                    You scored <strong className="text-ink font-bold">{score} of {questions.length}</strong> on the physical diagnostic evaluation. Archimedes and the Guild Council recognize your authentic tactile intuition.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 text-xs text-amber-950 font-mono text-left flex items-start gap-3">
                  <SolarIcon name="cup-first-linear" className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block uppercase tracking-wider text-2xs font-bold text-amber-900">
                      Indelible Golden Stamp Unlocked
                    </strong>
                    <p className="mt-0.5 text-amber-900/90 font-sans text-xs">
                      Your Mastery Passport now carries the Golden Hankō Seal. You can view or print your Guild diploma.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      setStage("diploma");
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <SolarIcon name="diploma-verified-linear" className="w-4 h-4" />
                    <span>Inspect Guild Diploma</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-stone-300 bg-white text-stone-700 font-mono text-xs hover:bg-stone-100 transition"
                  >
                    Return to Studio
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <HankoSeal
                    label="修"
                    subtext="FURTHER STUDY"
                    size="lg"
                    variant="copper"
                  />
                </div>

                <div>
                  <span className="spec-tag text-stone-600 bg-stone-100 border border-stone-300 px-2 py-0.5 rounded-full text-3xs">
                    DIAGNOSTIC BENCHMARK NOT MET
                  </span>
                  <h3 className="font-display font-bold text-2xl text-ink mt-3">
                    Review Physical Mechanics
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                    You answered <strong className="text-ink font-bold">{score} of {questions.length}</strong> correctly. Passing the Guild requires at least 2 of 3 diagnostic resolutions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-300 text-xs text-stone-600 text-left font-mono">
                  <p>
                    CRAFTSMAN ADVICE: Review the rationales above and return to the step drills. Tactile muscle memory strengthens through deliberate repetition.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={startExam}
                    className={buttonClasses({ className: "w-full sm:w-auto font-mono" })}
                  >
                    <SolarIcon name="refresh-linear" className="w-4 h-4" />
                    <span>Retake Diagnostic Assessment</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-stone-300 bg-white text-stone-700 font-mono text-xs hover:bg-stone-100 transition"
                  >
                    Return to Workbench
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. GUILD DIPLOMA / CERTIFICATE VIEW                          */}
        {/* ============================================================ */}
        {stage === "diploma" && (
          <div className="space-y-6">
            {/* Parchment Diploma Frame */}
            <div
              id="guild-diploma-print-area"
              className="p-8 sm:p-12 rounded-3xl bg-paper border-4 border-double border-amber-800/40 shadow-inner relative overflow-hidden text-center corner-ticks print:p-8 print:border-amber-900"
            >
              {/* Subtle Guilloche / Watermark */}
              <div className="absolute right-6 -bottom-10 opacity-5 pointer-events-none select-none">
                <span className="font-serif text-[240px] font-black">匠</span>
              </div>

              {/* Top Guild Crest & Monospace Folio */}
              <div className="flex items-center justify-between text-3xs font-mono tracking-widest text-amber-900/70 uppercase pb-4 border-b border-amber-900/20">
                <span>SKILLORA CRAFTSMAN&apos;S GUILD</span>
                <span>ARCHIVAL DOCKET // CERT-SK-{skill.id.slice(0, 6).toUpperCase()}</span>
              </div>

              {/* Diploma Main Title */}
              <div className="mt-8">
                <span className="text-2xs font-mono tracking-[0.25em] text-amber-900 uppercase font-bold block mb-2">
                  CERTIFICATE OF ATELIER MASTERY
                </span>
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink tracking-tight">
                  Craftsman&apos;s Guild Diploma
                </h1>
              </div>

              {/* Conferral Text */}
              <div className="my-8 space-y-4 max-w-lg mx-auto">
                <p className="text-xs font-mono uppercase tracking-widest text-stone-500">
                  BE IT KNOWN TO ALL ARTISANS AND SCHOLARS THAT
                </p>
                <div className="font-serif font-bold text-2xl sm:text-3xl text-ink border-b-2 border-stone-400 pb-2 inline-block px-8">
                  {userName}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-serif italic pt-1">
                  having completed deliberate practice drills and satisfied the empirical diagnostic requirements of the Grand Proctor in the discipline of
                </p>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-amber-950 uppercase tracking-wide">
                  {skill.title}
                </h2>
                <p className="text-xs font-mono uppercase tracking-widest text-stone-500 pt-2">
                  IS HEREBY INVESTED WITH THE GUILD TITLE OF
                </p>
                <div className="text-base sm:text-lg font-mono font-extrabold text-amber-900 tracking-wider uppercase bg-amber-100/60 border border-amber-300 py-1.5 px-4 rounded-xl inline-block">
                  {honorific}
                </div>
              </div>

              {/* Bottom Seals & Signatures */}
              <div className="mt-12 pt-6 border-t border-amber-900/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Left: Proctor Signature */}
                <div className="text-left font-mono">
                  <div className="font-serif italic text-base text-ink mb-1">
                    Archimedes of Syracuse
                  </div>
                  <div className="text-3xs uppercase tracking-wider text-stone-500 border-t border-stone-300 pt-1">
                    Grand Proctor // Archimedes Atelier
                  </div>
                </div>

                {/* Center: Golden Hanko Stamp */}
                <div className="flex flex-col items-center">
                  <HankoSeal
                    label="匠"
                    subtext="GUILD CERTIFIED"
                    size="lg"
                    variant="gold"
                    className="drop-shadow-sm"
                  />
                  <span className="text-3xs font-mono tracking-widest uppercase text-amber-900 mt-1 font-bold">
                    GOLDEN SEAL
                  </span>
                </div>

                {/* Right: Date of Conferral */}
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-ink mb-1">
                    {certifiedDate || "OCTOBER 11, 2026"}
                  </div>
                  <div className="text-3xs uppercase tracking-wider text-stone-500 border-t border-stone-300 pt-1">
                    Date of Guild Conformance
                  </div>
                </div>
              </div>
            </div>

            {/* Action Toolbar (Hidden in print) */}
            <div className="flex items-center justify-between pt-2 print:hidden">
              <button
                type="button"
                onClick={() => {
                  playMechanicalClick();
                  setStage("intro");
                }}
                className="px-4 py-2 rounded-full border border-stone-300 bg-white text-stone-700 font-mono text-xs hover:bg-stone-100 transition"
              >
                &larr; Exam Details
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrintDiploma}
                  className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <SolarIcon name="printer-linear" className="w-4 h-4" />
                  <span>Print Official Diploma</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className={buttonClasses({ className: "font-mono" })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
