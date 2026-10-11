"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SolarIcon } from "@/components/SolarIcon";
import { HankoSeal } from "@/components/HankoSeal";
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
  // Stable snapshot of docket items for this guided practice session
  const [sessionItems, setSessionItems] = useState<DocketItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [targetSeconds, setTargetSeconds] = useState(300);

  // Practice drill states
  const [repCount, setRepCount] = useState(0);
  const [isEvaluationReady, setIsEvaluationReady] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Metronome states
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(60);

  const activeStepIdRef = useRef<string | null>(null);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wasOpenRef = useRef(false);

  // Initialize sessionItems snapshot ONLY when modal transitions from closed to open
  useEffect(() => {
    if (isOpen) {
      if (!wasOpenRef.current || sessionItems.length === 0) {
        if (docketItems && docketItems.length > 0) {
          setSessionItems([...docketItems]);
          const validIndex = Math.min(Math.max(0, initialIndex), docketItems.length - 1);
          setCurrentIndex(validIndex);
          setIsSessionComplete(false);
          activeStepIdRef.current = null; // force drill setup for first step
        }
      }
    } else {
      activeStepIdRef.current = null;
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialIndex, docketItems, sessionItems.length]);

  const activeItem: DocketItem | undefined = sessionItems[currentIndex];

  // Configure timer and rep count ONLY when active drill step ID changes
  useEffect(() => {
    if (!activeItem) return;

    const stepId = activeItem.step.id;
    if (stepId !== activeStepIdRef.current) {
      activeStepIdRef.current = stepId;
      const minutes = Number(activeItem.step.estimated_minutes) || 5;
      const totalSec = Math.max(60, minutes * 60);
      setSecondsRemaining(totalSec);
      setTargetSeconds(totalSec);
      setIsRunning(false);
      setIsEvaluationReady(false);
      setRepCount(0);
    }
  }, [activeItem]);

  // Main countdown timer interval
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

  // Metronome beat interval
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

  // Clean up metronome on modal close
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

  const addOneMinute = useCallback(() => {
    playMechanicalClick();
    setSecondsRemaining((prev) => prev + 60);
    setTargetSeconds((prev) => prev + 60);
  }, []);

  const subtractOneMinute = useCallback(() => {
    playMechanicalClick();
    setSecondsRemaining((prev) => Math.max(30, prev - 60));
    setTargetSeconds((prev) => Math.max(30, prev - 60));
  }, []);

  const resetTimer = useCallback(() => {
    playMechanicalClick();
    setIsRunning(false);
    if (activeItem) {
      const minutes = Number(activeItem.step.estimated_minutes) || 5;
      const totalSec = Math.max(60, minutes * 60);
      setSecondsRemaining(totalSec);
      setTargetSeconds(totalSec);
    }
  }, [activeItem]);

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

  const decrementRep = useCallback(() => {
    playMechanicalClick();
    setRepCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Handle SM-2 recall rating
  const handleRateRecall = (quality: RecallQuality) => {
    if (!activeItem) return;
    playStampThud();

    const { skill, step } = activeItem;
    const elapsedSeconds = Math.max(10, targetSeconds - secondsRemaining);

    // Record to SM-2 spaced repetition engine
    recordDrillPractice(step.id, quality, elapsedSeconds, skill, step);

    if (onStepCompleted) {
      onStepCompleted(step.id);
    }

    onDocketUpdated();

    // Move to next drill or complete docket session
    if (currentIndex < sessionItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionComplete(true);
      setMetronomeActive(false);
      setIsRunning(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen || isSessionComplete) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if focus is in an input
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-ink/75 backdrop-blur-md select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FAF8F5] border-2 border-stone-300 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] text-ink corner-ticks"
      >
        {/* Top Folio Header */}
        <div className="p-4 sm:p-5 bg-[#F2EFE9] border-b border-stone-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-200 border border-stone-300 flex items-center justify-center text-ink flex-shrink-0">
              <SolarIcon name="stopwatch-linear" className="w-5 h-5 text-stone-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="spec-tag text-stone-600">DELIBERATE PRACTICE DOCKET</span>
                <span className="text-[10px] font-mono font-bold text-amber-800">
                  DRILL {currentIndex + 1} OF {sessionItems.length}
                </span>
              </div>
              <h2 className="font-display font-bold text-base text-ink leading-tight">
                {isSessionComplete ? "Docket Fulfilled" : skill.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isSessionComplete && (
              <span
                className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                  urgency === "overdue"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : urgency === "due_today"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-stone-200 text-stone-700 border border-stone-300"
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
              className="p-2 rounded-xl text-stone-500 hover:text-ink hover:bg-stone-200 transition cursor-pointer"
              aria-label="Close practice station"
            >
              <SolarIcon name="close-circle-linear" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {!isSessionComplete ? (
            <div className="space-y-6">
              {/* Drill Headline & Instructions */}
              <div className="p-5 rounded-2xl bg-white border border-stone-300 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-stone-500 font-mono mb-1">
                  <span>STEP {step.step_number} MICRO-MECHANIC</span>
                  <span>EST. {step.estimated_minutes} MINS</span>
                </div>
                <h3 className="font-display font-bold text-xl text-ink mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  {step.instructions}
                </p>
              </div>

              {/* Tactile Timer Gauge Block */}
              <div className="p-6 rounded-3xl bg-[#F4F1EB] border border-stone-300 text-center relative overflow-hidden">
                <div className="flex flex-col items-center justify-center">
                  {/* Digital Stopwatch Display */}
                  <div className="font-mono text-5xl sm:text-6xl font-black text-ink tracking-tight tabular-nums my-1">
                    {formatTime(secondsRemaining)}
                  </div>

                  {/* Progress Line */}
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

                  {/* Timer Controls Row */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    {/* Primary Start / Pause Toggle */}
                    <button
                      type="button"
                      onClick={toggleTimer}
                      className={`px-6 py-2.5 rounded-full font-mono text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer ${
                        isRunning
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "bg-ink hover:bg-neutral-800 text-white"
                      }`}
                    >
                      <SolarIcon
                        name={isRunning ? "pause-linear" : "play-linear"}
                        className="w-4 h-4"
                      />
                      <span>{isRunning ? "Pause Clock" : "Start Clock"}</span>
                    </button>

                    {/* Time Increment / Decrement */}
                    <button
                      type="button"
                      onClick={subtractOneMinute}
                      className="px-3 py-2 rounded-full bg-white border border-stone-300 text-stone-700 font-mono text-xs font-semibold hover:bg-stone-100 transition shadow-2xs cursor-pointer"
                      title="Subtract 1 minute"
                    >
                      -1m
                    </button>

                    <button
                      type="button"
                      onClick={addOneMinute}
                      className="px-3 py-2 rounded-full bg-white border border-stone-300 text-stone-700 font-mono text-xs font-semibold hover:bg-stone-100 transition shadow-2xs cursor-pointer"
                      title="Add 1 minute"
                    >
                      +1m
                    </button>

                    <button
                      type="button"
                      onClick={resetTimer}
                      className="px-3 py-2 rounded-full bg-white border border-stone-300 text-stone-600 font-mono text-xs font-semibold hover:bg-stone-100 transition shadow-2xs cursor-pointer"
                      title="Reset clock to drill duration"
                    >
                      <SolarIcon name="restart-linear" className="w-3.5 h-3.5" />
                    </button>

                    {/* Metronome Beat Module */}
                    <div className="inline-flex items-center rounded-full border border-stone-300 bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={toggleMetronome}
                        className={`px-3 py-2 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          metronomeActive
                            ? "bg-amber-500 text-white"
                            : "text-stone-700 hover:bg-stone-100"
                        }`}
                        title={metronomeActive ? "Metronome active (click to mute)" : "Activate rhythmic click metronome"}
                      >
                        <SolarIcon
                          name={metronomeActive ? "volume-loud-linear" : "tuning-2-linear"}
                          className={`w-3.5 h-3.5 ${metronomeActive ? "animate-pulse" : ""}`}
                        />
                        <span>{metronomeActive ? `Pulse: ${metronomeBpm}` : `${metronomeBpm} BPM`}</span>
                      </button>

                      <div className="flex border-l border-stone-200">
                        <button
                          type="button"
                          onClick={() => changeBpm(-10)}
                          className="px-2 py-2 text-[10px] font-mono text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                          title="Slow tempo (-10 BPM)"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => changeBpm(+10)}
                          className="px-2 py-2 text-[10px] font-mono text-stone-600 hover:bg-stone-100 border-l border-stone-200 transition cursor-pointer"
                          title="Increase tempo (+10 BPM)"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tactile Repetition Logger */}
                <div className="mt-6 pt-4 border-t border-stone-300/80 flex items-center justify-between text-xs font-mono">
                  <div className="text-left">
                    <span className="text-[10px] text-stone-500 uppercase block">REPETITIONS LOGGED</span>
                    <strong className="text-base text-ink font-bold tabular-nums">
                      {repCount} reps completed
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {repCount > 0 && (
                      <button
                        type="button"
                        onClick={decrementRep}
                        className="px-2.5 py-2 rounded-xl bg-white border border-stone-300 hover:border-ink text-stone-600 font-mono text-xs font-bold transition shadow-2xs cursor-pointer"
                        title="Subtract repetition"
                      >
                        -1
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={incrementRep}
                      className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-ink text-ink font-mono text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <SolarIcon name="add-circle-linear" className="w-4 h-4 text-brand-600" />
                      <span>Log Repetition (+1)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SM-2 Recall Self-Rating Section */}
              <div className="p-5 rounded-2xl bg-white border border-stone-300 shadow-2xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <HankoSeal label="評" subtext="EVAL" size="xs" variant="copper" />
                    <span className="font-display font-bold text-sm text-ink">
                      Rate Muscle Memory Fluidity
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase">
                    SM-2 ALGORITHM REVIEW
                  </span>
                </div>

                <p className="text-xs text-stone-600 mb-4 font-sans">
                  How did the biomechanics and recall feel during this drill? Select a rating to calibrate your next spaced review interval:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Rating 1: Hard */}
                  <button
                    type="button"
                    onClick={() => handleRateRecall(1)}
                    className="p-3.5 rounded-xl border-2 border-stone-300 hover:border-amber-600 bg-[#FAF8F5] hover:bg-amber-50/60 text-left transition group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between font-mono text-xs font-bold text-amber-800 mb-1">
                      <span>[ 1 ] Hard / Stiff</span>
                      <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded font-mono">1 Day</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-tight">
                      Felt rusty or required active cerebral effort. Review tomorrow.
                    </p>
                  </button>

                  {/* Rating 2: Solid */}
                  <button
                    type="button"
                    onClick={() => handleRateRecall(2)}
                    className="p-3.5 rounded-xl border-2 border-stone-300 hover:border-sky-600 bg-[#FAF8F5] hover:bg-sky-50/60 text-left transition group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between font-mono text-xs font-bold text-sky-800 mb-1">
                      <span>[ 2 ] Solid / Fluid</span>
                      <span className="text-[10px] bg-sky-100 px-1.5 py-0.5 rounded font-mono">3-4 Days</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-tight">
                      Good accuracy and steady motor rhythm. Review in a few days.
                    </p>
                  </button>

                  {/* Rating 3: Effortless */}
                  <button
                    type="button"
                    onClick={() => handleRateRecall(3)}
                    className="p-3.5 rounded-xl border-2 border-stone-300 hover:border-emerald-600 bg-[#FAF8F5] hover:bg-emerald-50/60 text-left transition group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between font-mono text-xs font-bold text-emerald-800 mb-1">
                      <span>[ 3 ] Effortless</span>
                      <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded font-mono">7-10 Days</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-tight">
                      Automatic subconscious execution. Cemented in memory.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* SESSION COMPLETION SUMMARY                                   */
            /* ============================================================ */
            <div className="text-center py-8 space-y-6 max-w-md mx-auto">
              <div className="flex justify-center">
                <HankoSeal
                  label="済"
                  subtext="DOCKET STAMPED"
                  size="xl"
                  variant="vermilion"
                  animate={true}
                />
              </div>

              <div>
                <span className="spec-tag text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px]">
                  DAILY DOCKET FULFILLED
                </span>
                <h3 className="font-display font-bold text-2xl text-ink mt-3">
                  Deliberate Practice Etched
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed font-sans">
                  You have completed all {sessionItems.length} spaced repetition drills for today. Your neuromuscular pathways have been reinforced.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-300 text-left font-mono text-xs space-y-2 shadow-2xs">
                <div className="flex justify-between border-b border-stone-200 pb-1.5">
                  <span className="text-stone-500">DRILLS STAMPED:</span>
                  <span className="font-bold text-ink">{sessionItems.length} Micro-Mechanics</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-1.5">
                  <span className="text-stone-500">NEXT DUE INTERVAL:</span>
                  <span className="font-bold text-ink">Tomorrow at 09:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">DAILY STREAK:</span>
                  <span className="font-bold text-rose-700">MOMENTUM ADVANCED (+1)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-6 rounded-full bg-ink text-white font-mono text-xs font-bold hover:bg-neutral-800 transition shadow-xs cursor-pointer"
              >
                Return to Studio Dashboard
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
