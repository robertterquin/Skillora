"use client";

import React, { useEffect, useRef, useState } from "react";
import { playChime, playMechanicalClick } from "@/lib/workbench-audio";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";

const formatMinSec = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const nightButton =
  "inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50";

export function CodeMilestoneTerminalSimulator({
  stepTitle,
  targetMilestones = 5,
}: {
  stepTitle: string;
  targetMilestones?: number;
}) {
  const [milestones, setMilestones] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(1200);
  const [timerActive, setTimerActive] = useState(false);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `$ skillora init-step --focus "${stepTitle.slice(0, 32)}..."`,
    `> Ready. Work in your local IDE/editor. Log code runs below:`,
  ]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!timerActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          playChime();
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive]);

  const handleRunVerification = () => {
    if (isTestRunning) return;
    playMechanicalClick();
    setIsTestRunning(true);

    setTimeout(() => {
      playChime();
      setIsTestRunning(false);
      const nextCount = milestones + 1;
      setMilestones(nextCount);
      setTerminalLogs((prev) => [
        ...prev.slice(-3),
        `$ npm test --passWithNoTests`,
        `✓ PASS: Syntax validation passed (0 errors)`,
        `✓ Milestone [${nextCount}/${targetMilestones}] etched: ${stepTitle.slice(0, 24)}...`,
      ]);
    }, 450);
  };

  const handleManualMinus = () => {
    playMechanicalClick();
    setMilestones((prev) => Math.max(0, prev - 1));
  };

  const handleManualPlus = () => {
    playMechanicalClick();
    setMilestones((prev) => {
      const next = prev + 1;
      if (next === targetMilestones) {
        playChime();
      }
      return next;
    });
  };

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      className="w-full my-3 p-4 sm:p-5 rounded-2xl bg-night text-night-text border border-night-line shadow-2xs text-left select-none"
    >
      <header className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-night-line text-xs">
        <h4 className="flex items-center gap-2 font-semibold text-night-muted">
          <AppIcon name="code-linear" className="w-4 h-4 text-night-green" />
          <span>Test runner</span>
        </h4>
        <span className="font-medium text-night-muted tabular-nums">Goal: {targetMilestones} milestones</span>
      </header>

      <div className="p-3 rounded-xl bg-night-raised border border-night-line font-mono text-xs leading-relaxed mb-4 space-y-1 overflow-x-auto">
        {terminalLogs.map((log, i) => (
          <div
            key={i}
            className={
              log.startsWith("✓") ? "text-night-green" : log.startsWith("$") ? "text-night-blue" : "text-night-muted"
            }
          >
            {log}
          </div>
        ))}
        {isTestRunning && <div className="text-night-amber animate-pulse">&gt; Running tests…</div>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-night-raised border border-night-line text-center flex flex-col gap-2">
          <span className="text-xs font-semibold text-night-muted">Milestones</span>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleManualMinus}
              aria-label="Remove a milestone"
              className={cn(nightButton, "w-8 px-0 bg-night-line hover:bg-night-hover text-night-text")}
            >
              −
            </button>
            <span className="font-display font-bold text-2xl text-night-bright tabular-nums">
              {milestones} / {targetMilestones}
            </span>
            <button
              type="button"
              onClick={handleManualPlus}
              aria-label="Add a milestone"
              className={cn(nightButton, "w-8 px-0 bg-night-line hover:bg-night-hover text-night-green")}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleRunVerification}
            disabled={isTestRunning}
            className={cn(nightButton, "w-full bg-night-text text-night hover:bg-night-bright")}
          >
            <AppIcon name="play-linear" className="w-3.5 h-3.5" />
            <span>Run tests (+1)</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-night-raised border border-night-line text-center flex flex-col gap-2">
          <span className="text-xs font-semibold text-night-muted">20-minute focus sprint</span>
          <span className="font-display font-bold text-2xl text-night-amber tabular-nums">{formatMinSec(timerSeconds)}</span>
          <button
            type="button"
            onClick={() => {
              playMechanicalClick();
              if (timerSeconds === 0) setTimerSeconds(1200);
              setTimerActive(!timerActive);
            }}
            className={cn(
              nightButton,
              "w-full",
              timerActive
                ? "bg-night-line text-night-red hover:bg-night-hover"
                : "bg-night-line text-night-text hover:bg-night-hover"
            )}
          >
            {timerActive ? "Pause" : timerSeconds === 0 ? "Reset to 20 min" : "Start sprint"}
          </button>
        </div>
      </div>
    </section>
  );
}
