"use client";

import React, { useState, useEffect, useId } from "react";
import { motion } from "motion/react";
import { Skill } from "@/types/database";
import { SolarIcon } from "../ui/SolarIcon";
import { Modal } from "../ui/Modal";
import { buttonClasses } from "../ui/Button";
import { playMechanicalClick, playChime, playWoodenThud, playStampThud } from "@/lib/workbench-audio";
import { GuildExamPayload, ExamQuestion } from "@/app/api/ai/guild-exam/route";
import { aiService } from "@/services/aiService";

export interface SkillAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: Skill | null;
  onPass: (skillId: string) => void;
  isAlreadyCertified?: boolean;
  userName?: string;
}

export type GuildExamModalProps = SkillAssessmentModalProps;

export function SkillAssessmentModal({
  isOpen,
  onClose,
  skill,
  onPass,
  isAlreadyCertified = false,
  userName = "Scholar",
}: SkillAssessmentModalProps) {
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
      const data = await aiService.getGuildExam({
        skillTitle: skill.title,
        skillSummary: skill.summary,
        skillSlug: skill.slug,
        steps: skill.steps || [],
      });

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
    <Modal onClose={onClose} labelledBy={titleId} className="max-w-2xl bg-white border border-surface-border flex flex-col max-h-[92vh] text-ink select-none print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none print:bg-white">
      {/* Modal Top Bar */}
      <div className="p-4 sm:p-5 bg-canvas border-b border-surface-border flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink shadow-2xs">
            <SolarIcon name="diploma-verified-linear" className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="spec-tag text-ink-muted">SKILL CERTIFICATION</span>
              <span className="text-3xs font-mono font-bold text-ink-muted">
                FINAL ASSESSMENT
              </span>
            </div>
            <h2 id={titleId} className="font-display font-bold text-base sm:text-lg text-ink leading-tight">
              Skill Certification Assessment
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stage === "exam" && (
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-white border border-surface-border text-ink-secondary">
              Question {currentQuestionIdx + 1} / {questions.length}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-muted transition"
            aria-label="Close assessment"
          >
            <SolarIcon name="close-circle-linear" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal Body */}
      <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
        {/* ============================================================ */}
        {/* 1. INTRO STAGE                                               */}
        {/* ============================================================ */}
        {stage === "intro" && (
          <div className="space-y-6 text-center max-w-lg mx-auto py-4">
            <div>
              <h3 className="font-display font-bold text-2xl text-ink">
                {skill.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                You have completed all practice steps in this skill. To earn your verified Certificate of Mastery, answer at least 2 of the 3 practical scenario questions correctly.
              </p>
            </div>

            {/* Protocol Spec Box */}
            <div className="p-4 rounded-2xl bg-white border border-stone-300 text-left space-y-2.5 text-xs font-mono shadow-2xs">
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">FORMAT:</span>
                <span className="font-bold text-ink">3 Practical Scenarios</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">PASSING CRITERIA:</span>
                <span className="font-bold text-ink">2 of 3 Correct</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-500">EVALUATOR:</span>
                <span className="font-bold text-ink">Archimedes (Skillora AI)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">REWARD:</span>
                <span className="font-bold text-amber-700">Certificate of Mastery</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs text-left">
                <strong>Notice:</strong> {error}
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
                    <span>Preparing Assessment...</span>
                  </>
                ) : (
                  <>
                    <span>Start Assessment</span>
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
                      ? "Next Question"
                      : "View Results"}
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
                  <div className="w-20 h-20 rounded-2xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink shadow-sm">
                    <SolarIcon name="diploma-verified-linear" className="w-10 h-10 text-ink" />
                  </div>
                </div>

                <div>
                  <span className="spec-tag text-ink bg-surface-muted border border-surface-border px-2.5 py-0.5 rounded-full text-3xs font-bold">
                    ASSESSMENT PASSED · CERTIFICATE UNLOCKED
                  </span>
                  <h3 className="font-display font-bold text-2xl text-ink mt-3">
                    Mastery Certified: {honorific}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                    You scored <strong className="text-ink font-bold">{score} of {questions.length}</strong> on your skill assessment. You have demonstrated practical competence and understanding in this discipline.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-muted/60 border border-surface-border text-xs text-ink font-mono text-left flex items-start gap-3">
                  <SolarIcon name="cup-first-linear" className="w-5 h-5 text-ink flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block uppercase tracking-wider text-2xs font-bold text-ink">
                      Certificate of Mastery Earned
                    </strong>
                    <p className="mt-0.5 text-ink-secondary font-sans text-xs">
                      You have demonstrated practical mastery in this skill. You can now view, download, or print your verified certificate.
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
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-ink hover:bg-ink/90 text-white font-mono text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <SolarIcon name="diploma-verified-linear" className="w-4 h-4" />
                    <span>View Certificate</span>
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
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 border-2 border-stone-300 flex items-center justify-center text-stone-600">
                    <SolarIcon name="restart-linear" className="w-8 h-8" />
                  </div>
                </div>

                <div>
                  <span className="spec-tag text-stone-600 bg-stone-100 border border-stone-300 px-2 py-0.5 rounded-full text-3xs">
                    ASSESSMENT NOT PASSED
                  </span>
                  <h3 className="font-display font-bold text-2xl text-ink mt-3">
                    Review Steps &amp; Try Again
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                    You answered <strong className="text-ink font-bold">{score} of {questions.length}</strong> correctly. Passing requires answering at least 2 of 3 scenarios correctly.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-300 text-xs text-stone-600 text-left font-mono">
                  <p>
                    TIP: Review the explanations above and practice the steps before taking the assessment again.
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
                    Return to Studio
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
              className="p-8 sm:p-12 rounded-3xl bg-paper border-4 border-double border-amber-800/40 shadow-inner relative overflow-hidden text-center print:p-8 print:border-amber-900"
            >
              {/* Top Crest & Monospace ID */}
              <div className="flex items-center justify-between text-3xs font-mono tracking-widest text-amber-900/70 uppercase pb-4 border-b border-amber-900/20">
                <span>SKILLORA CERTIFICATION</span>
                <span>CREDENTIAL ID · SK-{skill.id.slice(0, 6).toUpperCase()}</span>
              </div>

              {/* Diploma Main Title */}
              <div className="mt-8">
                <span className="text-2xs font-mono tracking-[0.25em] text-amber-900 uppercase font-bold block mb-2">
                  OFFICIAL CREDENTIAL
                </span>
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink tracking-tight">
                  Certificate of Mastery
                </h1>
              </div>

              {/* Conferral Text */}
              <div className="my-8 space-y-4 max-w-lg mx-auto">
                <p className="text-xs font-mono uppercase tracking-widest text-stone-500">
                  THIS IS TO CERTIFY THAT
                </p>
                <div className="font-serif font-bold text-2xl sm:text-3xl text-ink border-b-2 border-stone-400 pb-2 inline-block px-8">
                  {userName}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-serif italic pt-1">
                  has successfully completed the structured curriculum steps and demonstrated practical proficiency in
                </p>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-ink uppercase tracking-wide">
                  {skill.title}
                </h2>
                <p className="text-xs font-mono uppercase tracking-widest text-stone-500 pt-2">
                  AND HAS EARNED THE DESIGNATION OF
                </p>
                <div className="text-base sm:text-lg font-mono font-bold text-ink tracking-wider uppercase bg-surface-muted border border-surface-border py-1.5 px-4 rounded-xl inline-block">
                  {honorific}
                </div>
              </div>

              {/* Bottom Seals & Signatures */}
              <div className="mt-12 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Left: Proctor Signature */}
                <div className="text-left font-mono">
                  <div className="font-serif italic text-base text-ink mb-1">
                    Archimedes of Syracuse
                  </div>
                  <div className="text-3xs uppercase tracking-wider text-stone-500 border-t border-stone-300 pt-1">
                    Master Instructor · Skillora
                  </div>
                </div>

                {/* Center: Golden Verified Stamp */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border border-surface-border bg-white flex flex-col items-center justify-center shadow-xs">
                    <SolarIcon name="diploma-verified-linear" className="w-7 h-7 text-ink mb-0.5" />
                    <span className="text-[7px] font-mono font-bold tracking-widest uppercase text-ink">
                      VERIFIED
                    </span>
                  </div>
                  <span className="text-3xs font-mono tracking-widest uppercase text-ink-muted mt-1 font-bold">
                    OFFICIAL SEAL
                  </span>
                </div>

                {/* Right: Date of Conferral */}
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-ink mb-1">
                    {certifiedDate || "OCTOBER 11, 2026"}
                  </div>
                  <div className="text-3xs uppercase tracking-wider text-stone-500 border-t border-stone-300 pt-1">
                    Date Issued
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

// Backward-compatibility alias for existing references
export const GuildExamModal = SkillAssessmentModal;

