"use client";

import React, { useState, useEffect, useId } from "react";
import { motion } from "motion/react";
import { Skill } from "@/types/database";
import { AppIcon } from "../ui/AppIcon";
import { IconButton } from "../ui/IconButton";
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
      <div className="p-4 sm:p-5 bg-canvas border-b border-surface-border flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink shadow-2xs">
            <AppIcon name="diploma-verified-linear" className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="spec-tag text-ink-muted">CERTIFICATION</span>
            </div>
            <h2 id={titleId} className="font-display font-bold text-base sm:text-lg text-ink leading-tight">
              Final Assessment
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stage === "exam" && (
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-white border border-surface-border text-ink-secondary">
              Question {currentQuestionIdx + 1} / {questions.length}
            </span>
          )}
          <IconButton
            icon="close"
            label="Close assessment"
            variant="ghost"
            onClick={onClose}
          />
        </div>
      </div>

      <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
        {stage === "intro" && (
          <div className="space-y-6 text-center max-w-lg mx-auto py-4">
            <div>
              <h3 className="font-display font-bold text-2xl text-ink">
                {skill.title}
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary mt-2 leading-relaxed">
                You have completed all practice steps in this skill. To earn your verified Certificate of Mastery, answer at least 2 of the 3 practical scenario questions correctly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-brand-300 text-left space-y-2.5 text-xs font-mono shadow-2xs">
              <div className="flex justify-between border-b border-surface-border pb-1.5">
                <span className="text-ink-muted">FORMAT:</span>
                <span className="font-bold text-ink">3 Practical Scenarios</span>
              </div>
              <div className="flex justify-between border-b border-surface-border pb-1.5">
                <span className="text-ink-muted">PASSING CRITERIA:</span>
                <span className="font-bold text-ink">2 of 3 Correct</span>
              </div>
              <div className="flex justify-between border-b border-surface-border pb-1.5">
                <span className="text-ink-muted">EVALUATOR:</span>
                <span className="font-bold text-ink">Archimedes (Skillora AI)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">REWARD:</span>
                <span className="font-bold text-warning">Certificate of Mastery</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-danger-light border border-danger-border text-danger-strong text-xs text-left">
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
                    <AppIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
                    <span>Preparing Assessment...</span>
                  </>
                ) : (
                  <>
                    <span>Start Assessment</span>
                    <AppIcon name="arrow-right-linear" className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className={buttonClasses({ variant: "secondary", className: "w-full sm:w-auto" })}
              >
                Return to Studio
              </button>
            </div>
          </div>
        )}

        {stage === "exam" && currentQuestion && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-mono tracking-wider text-ink-muted uppercase mb-1.5">
                <span className="text-warning-strong font-bold">
                  DIAGNOSTIC CASE {currentQuestionIdx + 1} OF {questions.length}
                </span>
                <span>PASS BENCHMARK: 2/3</span>
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-surface-border text-ink-secondary text-xs font-mono font-semibold tracking-wider uppercase mb-3">
                {currentQuestion.practicalCue}
              </div>
              <h3 className="font-display font-semibold text-base sm:text-lg text-ink leading-relaxed">
                {currentQuestion.scenario}
              </h3>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = userAnswers[currentQuestionIdx] === opt.id;
                let cardStyle = "bg-white border-brand-300 hover:border-ink hover:bg-paper/50 cursor-pointer";
                let badgeStyle = "bg-surface-subtle text-ink-secondary border-brand-300";

                if (isAnswerRevealed) {
                  if (opt.isCorrect) {
                    cardStyle = "bg-success-light/80 border-success text-success-strong shadow-xs";
                    badgeStyle = "bg-success text-white border-success";
                  } else if (isSelected && !opt.isCorrect) {
                    cardStyle = "bg-danger-light/80 border-danger text-danger-strong";
                    badgeStyle = "bg-danger text-white border-danger";
                  } else {
                    cardStyle = "bg-white/50 border-surface-border opacity-60";
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

                        {isAnswerRevealed && (opt.isCorrect || isSelected) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className={`mt-2.5 pt-2 border-t text-xs ${
                              opt.isCorrect
                                ? "border-success-border/80 text-success-strong"
                                : "border-danger-border/80 text-danger-strong"
                            }`}
                          >
                            <strong className="font-mono text-xs uppercase tracking-wider block mb-0.5">
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
                  <AppIcon name="arrow-right-linear" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {stage === "result" && (
          <div className="text-center space-y-6 max-w-lg mx-auto py-4">
            {isPassed ? (
              <>
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink shadow-sm">
                    <AppIcon name="diploma-verified-linear" className="w-10 h-10 text-ink" />
                  </div>
                </div>

                <div>
                  <span className="spec-tag text-ink bg-surface-muted border border-surface-border px-2.5 py-0.5 rounded-full text-xs font-bold">
                    ASSESSMENT PASSED · CERTIFICATE UNLOCKED
                  </span>
                  <h3 className="font-display font-bold text-2xl text-ink mt-3">
                    Mastery Certified: {honorific}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-secondary mt-2 leading-relaxed">
                    You scored <strong className="text-ink font-bold">{score} of {questions.length}</strong> on your assessment and demonstrated practical competence in this discipline.
                  </p>
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
                    <AppIcon name="diploma-verified-linear" className="w-4 h-4" />
                    <span>View Certificate</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className={buttonClasses({ variant: "secondary", className: "w-full sm:w-auto" })}
                  >
                    Return to Studio
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-subtle border-2 border-brand-300 flex items-center justify-center text-ink-secondary">
                    <AppIcon name="restart-linear" className="w-8 h-8" />
                  </div>
                </div>

                <div>
                  <span className="spec-tag text-ink-secondary bg-surface-subtle border border-brand-300 px-2 py-0.5 rounded-full text-xs">
                    ASSESSMENT NOT PASSED
                  </span>
                  <h3 className="font-display font-bold text-2xl text-ink mt-3">
                    Review Steps &amp; Try Again
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-secondary mt-2 leading-relaxed">
                    You answered <strong className="text-ink font-bold">{score} of {questions.length}</strong> correctly. Passing requires answering at least 2 of 3 scenarios correctly.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-brand-300 text-xs text-ink-secondary text-left font-mono">
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
                    <AppIcon name="refresh-linear" className="w-4 h-4" />
                    <span>Retake Assessment</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className={buttonClasses({ variant: "secondary", className: "w-full sm:w-auto" })}
                  >
                    Return to Studio
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {stage === "diploma" && (
          <div className="space-y-6">
            <div
              id="guild-diploma-print-area"
              className="p-8 sm:p-12 rounded-3xl bg-paper border-4 border-double border-warning-strong/40 shadow-inner relative overflow-hidden text-center print:p-8 print:border-warning-strong"
            >
              <div className="flex items-center justify-between text-xs font-mono tracking-wider text-warning-strong/70 uppercase pb-4 border-b border-warning-strong/20">
                <span>SKILLORA CERTIFICATION</span>
                <span>CREDENTIAL ID · SK-{skill.id.slice(0, 6).toUpperCase()}</span>
              </div>

              <div className="mt-8">
                <span className="text-xs font-mono tracking-[0.25em] text-warning-strong uppercase font-bold block mb-2">
                  OFFICIAL CREDENTIAL
                </span>
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink tracking-tight">
                  Certificate of Mastery
                </h1>
              </div>

              <div className="my-8 space-y-4 max-w-lg mx-auto">
                <p className="text-xs font-mono uppercase tracking-wider text-ink-muted">
                  THIS IS TO CERTIFY THAT
                </p>
                <div className="font-serif font-bold text-2xl sm:text-3xl text-ink border-b-2 border-brand-400 pb-2 inline-block px-8">
                  {userName}
                </div>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed font-serif italic pt-1">
                  has successfully completed the structured curriculum steps and demonstrated practical proficiency in
                </p>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-ink uppercase tracking-wide">
                  {skill.title}
                </h2>
                <p className="text-xs font-mono uppercase tracking-wider text-ink-muted pt-2">
                  AND HAS EARNED THE DESIGNATION OF
                </p>
                <div className="text-base sm:text-lg font-mono font-bold text-ink tracking-wider uppercase bg-surface-muted border border-surface-border py-1.5 px-4 rounded-xl inline-block">
                  {honorific}
                </div>
              </div>

              <div className="mt-12 pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-left font-mono">
                  <div className="font-serif italic text-base text-ink mb-1">
                    Archimedes of Syracuse
                  </div>
                  <div className="text-xs uppercase tracking-wider text-ink-muted border-t border-brand-300 pt-1">
                    Master Instructor · Skillora
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div aria-hidden="true" className="w-16 h-16 rounded-full border border-surface-border bg-white flex flex-col items-center justify-center shadow-xs">
                    <AppIcon name="diploma-verified-linear" className="w-7 h-7 text-ink mb-0.5" />
                    <span className="text-[7px] font-mono font-bold tracking-wider uppercase text-ink">
                      VERIFIED
                    </span>
                  </div>
                  <span className="text-xs font-mono tracking-wider uppercase text-ink-muted mt-1 font-bold">
                    OFFICIAL SEAL
                  </span>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-ink mb-1">
                    {certifiedDate || "OCTOBER 11, 2026"}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-ink-muted border-t border-brand-300 pt-1">
                    Date Issued
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 print:hidden">
              <button
                type="button"
                onClick={() => {
                  playMechanicalClick();
                  setStage("intro");
                }}
                className="px-4 py-2 rounded-full border border-brand-300 bg-white text-ink-secondary font-mono text-xs hover:bg-surface-subtle transition"
              >
                &larr; Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrintDiploma}
                  className={buttonClasses({ variant: "primary" })}
                >
                  <AppIcon name="printer-linear" className="w-4 h-4" />
                  <span>Print Certificate</span>
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


