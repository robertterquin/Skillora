"use client";

import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import {
  playMechanicalClick,
  playChime,
  playStampThud,
  playMetronomeClick,
} from "@/lib/workbench-audio";
import {
  DocketItem,
  RecallQuality,
  recordDrillPractice,
} from "@/lib/spaced-repetition";
import { getDisciplinePracticeProfile } from "@/lib/discipline-practice";
import { getCategoryStyle } from "@/lib/skill-progress";
import { PracticeShell, RecallRating, SessionSummary, SprintTimer, StepIndicator } from "../practice";

interface GuidedPracticeSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  docketItems: DocketItem[];
  initialIndex?: number;
  onDocketUpdated: () => void;
  onStepCompleted?: (stepId: string) => void;
}

export function GuidedPracticeSessionModal({
  isOpen,
  onClose,
  docketItems,
  initialIndex = 0,
  onDocketUpdated,
  onStepCompleted,
}: GuidedPracticeSessionModalProps) {
  const titleId = useId();
  const [sessionItems, setSessionItems] = useState<DocketItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [targetSeconds, setTargetSeconds] = useState(300);

  const [repCount, setRepCount] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const [metronomeActive, setMetronomeActive] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(60);

  const activeStepIdRef = useRef<string | null>(null);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      if (!wasOpenRef.current || sessionItems.length === 0) {
        if (docketItems && docketItems.length > 0) {
          setSessionItems([...docketItems]);
          const validIndex = Math.min(Math.max(0, initialIndex), docketItems.length - 1);
          setCurrentIndex(validIndex);
          setIsSessionComplete(false);
          activeStepIdRef.current = null;
        }
      }
    } else {
      activeStepIdRef.current = null;
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialIndex, docketItems, sessionItems.length]);

  const activeItem: DocketItem | undefined = sessionItems[currentIndex];
  const profile = getDisciplinePracticeProfile(activeItem?.skill, activeItem?.step);

  useEffect(() => {
    if (!activeItem) return;

    const stepId = activeItem.step.id;
    if (stepId !== activeStepIdRef.current) {
      activeStepIdRef.current = stepId;
      const stepMinutes = Number(activeItem.step.estimated_minutes) || 15;
      const sprintMinutes = stepMinutes > 25 ? profile.suggestedSprintMinutes : stepMinutes;
      const totalSec = Math.max(60, sprintMinutes * 60);
      setSecondsRemaining(totalSec);
      setTargetSeconds(totalSec);
      setIsRunning(false);
      setRepCount(0);
      setMetronomeActive(false);
      if (profile.defaultBpm) {
        setMetronomeBpm(profile.defaultBpm);
      }
    }
  }, [activeItem, profile]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          playChime();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (metronomeActive) {
      const intervalMs = (60 / Math.max(30, Math.min(240, metronomeBpm))) * 1000;
      metronomeIntervalRef.current = setInterval(() => {
        playMetronomeClick(false);
      }, intervalMs);
    } else {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
    }

    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    };
  }, [metronomeActive, metronomeBpm]);

  useEffect(() => {
    if (!isOpen) {
      setMetronomeActive(false);
      setIsRunning(false);
    }
  }, [isOpen]);

  const toggleTimer = useCallback(() => {
    playMechanicalClick();
    setIsRunning((prev) => !prev);
  }, []);

  const setSprintDuration = useCallback((minutes: number) => {
    playMechanicalClick();
    const totalSec = Math.max(60, minutes * 60);
    setSecondsRemaining(totalSec);
    setTargetSeconds(totalSec);
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    playMechanicalClick();
    setIsRunning(false);
    if (activeItem) {
      const stepMinutes = Number(activeItem.step.estimated_minutes) || 15;
      const sprintMinutes = stepMinutes > 25 ? profile.suggestedSprintMinutes : stepMinutes;
      const totalSec = Math.max(60, sprintMinutes * 60);
      setSecondsRemaining(totalSec);
      setTargetSeconds(totalSec);
    }
  }, [activeItem, profile]);

  const toggleMetronome = useCallback(() => {
    playMechanicalClick();
    setMetronomeActive((prev) => !prev);
  }, []);

  const changeBpm = useCallback((delta: number) => {
    playMechanicalClick();
    setMetronomeBpm((prev) => Math.max(40, Math.min(200, prev + delta)));
  }, []);

  const incrementRep = useCallback(() => {
    playMechanicalClick();
    setRepCount((prev) => prev + 1);
  }, []);

  const handleRateRecall = (quality: RecallQuality) => {
    if (!activeItem) return;
    playStampThud();

    const { skill, step } = activeItem;
    const elapsedSeconds = Math.max(10, targetSeconds - secondsRemaining);

    recordDrillPractice(step.id, quality, elapsedSeconds, skill, step);

    if (onStepCompleted) {
      onStepCompleted(step.id);
    }

    onDocketUpdated();

    if (currentIndex < sessionItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionComplete(true);
      setMetronomeActive(false);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!isOpen || isSessionComplete) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        toggleTimer();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        incrementRep();
      } else if (e.key === "1") {
        handleRateRecall(1);
      } else if (e.key === "2") {
        handleRateRecall(2);
      } else if (e.key === "3") {
        handleRateRecall(3);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSessionComplete, toggleTimer, incrementRep, activeItem]);

  if (!isOpen || sessionItems.length === 0) return null;

  const { skill, step, urgency, daysOverdue } = sessionItems[currentIndex] || sessionItems[0];
  const category = getCategoryStyle(skill);

  return (
    <PracticeShell
      titleId={titleId}
      icon="stopwatch-linear"
      title={isSessionComplete ? "Practice complete" : skill.title}
      eyebrow={
        <>
          <span>Daily practice</span>
          {!isSessionComplete && (
            <>
              <span aria-hidden="true">·</span>
              <span className={category.text}>{category.label}</span>
            </>
          )}
        </>
      }
      onClose={onClose}
      className="max-w-2xl select-none"
      headerActions={
        !isSessionComplete && (urgency === "overdue" || urgency === "due_today") ? (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-warning-light text-warning-strong border border-warning-border whitespace-nowrap">
            {urgency === "overdue" ? `Overdue ${daysOverdue}d` : "Due today"}
          </span>
        ) : undefined
      }
      indicator={
        <StepIndicator
          noun="Drill"
          total={sessionItems.length}
          current={isSessionComplete ? sessionItems.length - 1 : currentIndex}
          isDone={(i) => isSessionComplete || i < currentIndex}
        />
      }
    >
      {!isSessionComplete ? (
        <div className="space-y-6">
          <section className="p-5 rounded-2xl bg-white border border-surface-border shadow-2xs">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-2 flex-wrap gap-2">
              <span className="font-semibold text-ink bg-surface-muted px-2 py-0.5 rounded border border-surface-border">
                {profile.tagLabel}
              </span>
              <span>
                Step {step.step_number} · about {step.estimated_minutes} min
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-ink mb-2">{step.title}</h3>
            <p className="text-sm text-ink-secondary leading-relaxed">{step.instructions}</p>
          </section>

          <SprintTimer
            profile={profile}
            stepMinutes={Number(step.estimated_minutes) || 0}
            secondsRemaining={secondsRemaining}
            targetSeconds={targetSeconds}
            isRunning={isRunning}
            onToggle={toggleTimer}
            onReset={resetTimer}
            onSetDuration={setSprintDuration}
            metronome={{ active: metronomeActive, bpm: metronomeBpm, onToggle: toggleMetronome, onChangeBpm: changeBpm }}
            reps={{ count: repCount, onAdd: incrementRep }}
          />

          <RecallRating profile={profile} onRate={handleRateRecall} />
        </div>
      ) : (
        <SessionSummary drillCount={sessionItems.length} onClose={onClose} />
      )}
    </PracticeShell>
  );
}
