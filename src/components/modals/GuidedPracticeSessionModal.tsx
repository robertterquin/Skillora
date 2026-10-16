"use client";

import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import { SolarIcon } from "../ui/SolarIcon";
import { Modal } from "../ui/Modal";
import { buttonClasses } from "../ui/Button";
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
  const [isEvaluationReady, setIsEvaluationReady] = useState(false);
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
      setIsEvaluationReady(false);
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
          setIsEvaluationReady(true);
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

  const currentDisplayItem = sessionItems[currentIndex] || sessionItems[0];
  const { skill, step, urgency, daysOverdue } = currentDisplayItem;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progressPercent =
    targetSeconds > 0
      ? Math.round(((targetSeconds - secondsRemaining) / targetSeconds) * 100)
      : 0;

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="max-w-2xl bg-white border border-surface-border flex flex-col max-h-[92vh] text-ink select-none">
      <div className="p-4 sm:p-5 bg-canvas border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-surface-border flex items-center justify-center text-ink flex-shrink-0">
            <SolarIcon name="stopwatch-linear" className="w-5 h-5 text-ink" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="spec-tag text-ink-muted">DAILY PRACTICE SESSION</span>
              <span className="text-3xs font-mono font-bold text-amber-800">
                DRILL {currentIndex + 1} OF {sessionItems.length}
              </span>
            </div>
            <h2 id={titleId} className="font-display font-bold text-base text-ink leading-tight">
              {isSessionComplete ? "Practice Completed" : skill.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isSessionComplete && (
            <span
              className={`text-3xs font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                urgency === "overdue" || urgency === "due_today"
                  ? "bg-surface-muted text-ink border border-surface-border"
                  : "bg-surface-muted text-ink-secondary border border-surface-border"
              }`}
            >
              {urgency === "overdue"
                ? `OVERDUE (+${daysOverdue}d)`
                : urgency === "due_today"
                ? "DUE TODAY"
                : "ACTIVE DRILL"}
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-muted transition cursor-pointer"
            aria-label="Close practice station"
          >
            <SolarIcon name="close-circle-linear" className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
        {!isSessionComplete ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-stone-300 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-stone-500 font-mono mb-2 flex-wrap gap-2">
                <span className="text-3xs tracking-wider uppercase font-semibold text-ink bg-surface-muted px-2 py-0.5 rounded border border-surface-border">
                  {profile.tagLabel}
                </span>
                <div className="flex items-center gap-2">
                  <span>STEP {step.step_number}</span>
                  <span>·</span>
                  <span>EST. {step.estimated_minutes} MINS</span>
                </div>
              </div>
              <h3 className="font-display font-bold text-xl text-ink mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                {step.instructions}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-paper-warm border border-stone-300 text-center relative overflow-hidden">
              <div className="flex flex-col items-center justify-center">
                <div className="font-mono text-5xl sm:text-6xl font-black text-ink tracking-tight tabular-nums my-1">
                  {formatTime(secondsRemaining)}
                </div>

                <div className="w-56 h-1.5 bg-stone-300 rounded-full overflow-hidden my-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      secondsRemaining === 0 ? "bg-accent-emerald" : "bg-ink"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {secondsRemaining === 0 && (
                  <div className="text-xs font-mono font-bold text-accent-emerald mb-2 animate-bounce">
                    ✓ Time Completed! Rate your recall below.
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 mb-3 flex-wrap">
                  <span className="text-3xs font-mono text-stone-500 uppercase tracking-wider mr-1">
                    Sprint Mode:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSprintDuration(15)}
                    className={`px-2.5 py-1 rounded-md text-2xs font-mono font-bold transition cursor-pointer ${
                      targetSeconds === 15 * 60
                        ? "bg-ink text-white shadow-2xs"
                        : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    15m Sprint
                  </button>
                  <button
                    type="button"
                    onClick={() => setSprintDuration(20)}
                    className={`px-2.5 py-1 rounded-md text-2xs font-mono font-bold transition cursor-pointer ${
                      targetSeconds === 20 * 60
                        ? "bg-ink text-white shadow-2xs"
                        : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    20m Focus
                  </button>
                  {Number(step.estimated_minutes) > 20 && (
                    <button
                      type="button"
                      onClick={() => setSprintDuration(Number(step.estimated_minutes))}
                      className={`px-2.5 py-1 rounded-md text-2xs font-mono font-bold transition cursor-pointer ${
                        targetSeconds === Number(step.estimated_minutes) * 60
                          ? "bg-ink text-white shadow-2xs"
                          : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      Full Step ({step.estimated_minutes}m)
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={toggleTimer}
                    className={`px-6 py-2.5 rounded-full font-mono text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer ${
                      isRunning
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "bg-ink hover:bg-brand-500 text-white"
                    }`}
                  >
                    <SolarIcon
                      name={isRunning ? "pause-linear" : "play-linear"}
                      className="w-4 h-4"
                    />
                    <span>{isRunning ? "Pause Clock" : "Start Clock"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetTimer}
                    className="px-3.5 py-2.5 rounded-full bg-white border border-stone-300 text-stone-600 font-mono text-xs font-semibold hover:bg-stone-100 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                    title="Reset clock to drill duration"
                  >
                    <SolarIcon name="restart-linear" className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  {profile.isRhythmCadenceSupported ? (
                    <div className="inline-flex items-center rounded-full border border-stone-300 bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={toggleMetronome}
                        className={`px-3 py-2 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          metronomeActive
                            ? "bg-ink text-white"
                            : "text-stone-700 hover:bg-stone-100"
                        }`}
                        title={metronomeActive ? "Cadence active (click to mute)" : `Activate rhythmic ${profile.cadenceLabel || "metronome"}`}
                      >
                        <SolarIcon
                          name={metronomeActive ? "volume-loud-linear" : "tuning-2-linear"}
                          className={`w-3.5 h-3.5 ${metronomeActive ? "animate-pulse" : ""}`}
                        />
                        <span>{metronomeActive ? `${profile.cadenceLabel || "Pulse"}: ${metronomeBpm}` : `${metronomeBpm} BPM`}</span>
                      </button>

                      <div className="flex border-l border-stone-200">
                        <button
                          type="button"
                          onClick={() => changeBpm(-10)}
                          className="px-2 py-2 text-3xs font-mono text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                          title="Slow tempo (-10 BPM)"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => changeBpm(+10)}
                          className="px-2 py-2 text-3xs font-mono text-stone-600 hover:bg-stone-100 border-l border-stone-200 transition cursor-pointer"
                          title="Increase tempo (+10 BPM)"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-stone-300 text-stone-600 text-xs font-mono shadow-2xs">
                      <SolarIcon name="target-linear" className="w-3.5 h-3.5 text-stone-400" />
                      <span>Deep Focus Sprint</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-300/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="text-left">
                    <span className="text-3xs text-stone-500 uppercase block tracking-wider font-semibold">
                      {profile.metricHeading}
                    </span>
                    <strong className="text-base text-ink font-bold tabular-nums">
                      {repCount} {profile.metricUnitNoun}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={incrementRep}
                      className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-ink text-ink font-mono text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer hover:bg-stone-50"
                    >
                      <SolarIcon name="add-circle-linear" className="w-4 h-4 text-amber-700" />
                      <span>{profile.actionButtonLabel}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-2xs font-sans text-stone-600 bg-white/70 px-3 py-1.5 rounded-lg border border-stone-200/70 text-left">
                  <SolarIcon name="info-circle-linear" className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                  <span>{profile.guidanceTip}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-300 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-surface-muted border border-surface-border flex items-center justify-center text-ink">
                    <SolarIcon name="tuning-2-linear" className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-display font-bold text-sm text-ink">
                    Rate Recall & Understanding
                  </span>
                </div>
                <span className="text-3xs font-mono text-stone-500 uppercase">
                  SPACED REPETITION REVIEW
                </span>
              </div>

              <p className="text-xs text-stone-600 mb-4 font-sans">
                How comfortable did you feel during this drill? Select a rating to set your next review date:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleRateRecall(1)}
                  className="p-3.5 rounded-xl border border-surface-border hover:border-ink/50 bg-white hover:bg-stone-50/60 text-left transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-ink mb-1">
                    <span>{profile.recallPrompts.hard.title}</span>
                    <span className="text-3xs bg-surface-muted text-ink-muted border border-surface-border px-1.5 py-0.5 rounded font-mono">1 Day</span>
                  </div>
                  <p className="text-2xs text-stone-600 leading-tight">
                    {profile.recallPrompts.hard.desc}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRateRecall(2)}
                  className="p-3.5 rounded-xl border border-surface-border hover:border-ink/50 bg-white hover:bg-stone-50/60 text-left transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-ink mb-1">
                    <span>{profile.recallPrompts.solid.title}</span>
                    <span className="text-3xs bg-surface-muted text-ink-muted border border-surface-border px-1.5 py-0.5 rounded font-mono">3-4 Days</span>
                  </div>
                  <p className="text-2xs text-stone-600 leading-tight">
                    {profile.recallPrompts.solid.desc}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRateRecall(3)}
                  className="p-3.5 rounded-xl border border-surface-border hover:border-ink/50 bg-white hover:bg-stone-50/60 text-left transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-ink mb-1">
                    <span>{profile.recallPrompts.effortless.title}</span>
                    <span className="text-3xs bg-surface-muted text-ink-muted border border-surface-border px-1.5 py-0.5 rounded font-mono">7-10 Days</span>
                  </div>
                  <p className="text-2xs text-stone-600 leading-tight">
                    {profile.recallPrompts.effortless.desc}
                  </p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-6 max-w-md mx-auto">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink shadow-sm">
                <SolarIcon name="check-circle-bold" className="w-9 h-9" />
              </div>
            </div>

            <div>
              <span className="spec-tag text-ink bg-surface-muted border border-surface-border px-2.5 py-0.5 rounded-full text-3xs font-bold">
                PRACTICE SESSION COMPLETED
              </span>
              <h3 className="font-display font-bold text-2xl text-ink mt-3">
                Great Work Today!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed font-sans">
                You have completed all {sessionItems.length} practice drills scheduled for today. Keep building your consistency!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-left">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-surface-border shadow-2xs text-center flex flex-col justify-between">
                <div className="w-7 h-7 mx-auto rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink-muted mb-2">
                  <SolarIcon name="check-circle-linear" className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-3xs font-mono font-semibold uppercase tracking-wider text-ink-muted">
                    Completed
                  </div>
                  <div className="font-display font-bold text-base sm:text-lg text-ink mt-0.5 tabular-nums">
                    {sessionItems.length}
                  </div>
                  <div className="text-3xs text-ink-muted mt-0.5 font-sans">exercises</div>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-surface-border shadow-2xs text-center flex flex-col justify-between">
                <div className="w-7 h-7 mx-auto rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink-muted mb-2">
                  <SolarIcon name="fire-linear" className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-3xs font-mono font-semibold uppercase tracking-wider text-ink-muted">
                    Daily Streak
                  </div>
                  <div className="font-display font-bold text-base sm:text-lg text-ink mt-0.5 tabular-nums">
                    +1 Day
                  </div>
                  <div className="text-3xs text-ink-muted font-medium mt-0.5 font-sans">Extended</div>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-surface-border shadow-2xs text-center flex flex-col justify-between">
                <div className="w-7 h-7 mx-auto rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center text-ink-muted mb-2">
                  <SolarIcon name="clock-circle-linear" className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-3xs font-mono font-semibold uppercase tracking-wider text-ink-muted">
                    Next Review
                  </div>
                  <div className="font-display font-bold text-base sm:text-lg text-ink mt-0.5 font-sans">
                    Tomorrow
                  </div>
                  <div className="text-3xs text-ink-muted mt-0.5 font-sans">Scheduled</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={buttonClasses({ className: "w-full font-mono" })}
            >
              Back to My Studio
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
