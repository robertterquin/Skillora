"use client";

import React, { useState, useEffect, useId } from "react";
import { Skill } from "@/types/database";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { PracticeShell, StepIndicator } from "../practice/PracticeShell";
import { AssessmentIntro, AssessmentQuestion, AssessmentResult, CertificateDocument } from "../assessment";
import { getCategoryStyle } from "@/lib/skill-progress";
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
  credentialId?: string;
}

export function SkillAssessmentModal({
  isOpen,
  onClose,
  skill,
  onPass,
  isAlreadyCertified = false,
  userName = "Scholar",
  credentialId,
}: SkillAssessmentModalProps) {
  const titleId = useId();
  const [stage, setStage] = useState<"intro" | "exam" | "result" | "diploma">("intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examData, setExamData] = useState<GuildExamPayload | null>(null);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [certifiedDate, setCertifiedDate] = useState<string>(() =>
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  );

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

  const category = getCategoryStyle(skill);
  const questions: ExamQuestion[] = examData?.questions || [];
  const currentQuestion: ExamQuestion | undefined = questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx >= questions.length - 1;

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

  const footer =
    stage === "exam" ? (
      <>
        <span>
          Pass with {passingScore} of {questions.length} correct
        </span>
        <Button onClick={handleNextQuestion} disabled={!isAnswerRevealed}>
          <span>{isLastQuestion ? "See your result" : "Next question"}</span>
          <AppIcon name="arrow-right-linear" className="w-4 h-4" />
        </Button>
      </>
    ) : stage === "diploma" ? (
      <>
        <Button
          variant="ghost"
          onClick={() => {
            playMechanicalClick();
            setStage("intro");
          }}
        >
          <AppIcon name="arrow-left-linear" className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handlePrintDiploma}>
            <AppIcon name="printer-linear" className="w-4 h-4" />
            <span>Print</span>
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </>
    ) : undefined;

  return (
    <PracticeShell
      titleId={titleId}
      icon="diploma-verified-linear"
      eyebrow={
        <>
          <span className={category.text}>{category.label}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{skill.title}</span>
        </>
      }
      title={stage === "diploma" ? "Your certificate" : "Final assessment"}
      onClose={onClose}
      indicator={
        stage === "exam" && questions.length > 0 ? (
          <StepIndicator
            noun="Question"
            total={questions.length}
            current={currentQuestionIdx}
            isDone={(i) => i < currentQuestionIdx || (i === currentQuestionIdx && isAnswerRevealed)}
            fillClass={category.fill}
          />
        ) : undefined
      }
      footer={footer}
      className="text-ink select-none print:border-none print:shadow-none print:max-w-none print:w-full print:max-h-none print:rounded-none"
    >
      {stage === "intro" && (
        <AssessmentIntro
          skill={skill}
          category={category}
          loading={loading}
          error={error}
          onStart={startExam}
          onClose={onClose}
        />
      )}

      {stage === "exam" && currentQuestion && (
        <AssessmentQuestion
          key={currentQuestionIdx}
          question={currentQuestion}
          selectedId={userAnswers[currentQuestionIdx]}
          isRevealed={isAnswerRevealed}
          onSelect={handleSelectOption}
        />
      )}

      {stage === "result" && (
        <AssessmentResult
          isPassed={isPassed}
          score={score}
          total={questions.length}
          honorific={honorific}
          category={category}
          onViewCertificate={() => {
            playMechanicalClick();
            setStage("diploma");
          }}
          onRetake={startExam}
          onClose={onClose}
        />
      )}

      {stage === "diploma" && (
        <CertificateDocument
          skill={skill}
          category={category}
          userName={userName}
          honorific={honorific}
          issuedOn={certifiedDate}
          credentialId={credentialId}
        />
      )}
    </PracticeShell>
  );
}
