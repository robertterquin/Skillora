"use client";

import React, { useEffect, useRef, useState } from "react";
import { playChime, playMechanicalClick } from "@/lib/workbench-audio";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { IconButton } from "../ui/IconButton";
import { formatMinutes } from "../learning";

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

type TimerState = { status: "idle" } | { status: "running"; endsAt: number } | { status: "paused"; leftMs: number } | { status: "finished" };

interface FocusTimerProps {
  minutes: number;
  isDone: boolean;
  /** Called once when the full time runs out. */
  onFinish: () => void;
  onMarkDone: () => void;
}

/**
 * An optional focus timer for one step, sized to the step's own estimate.
 * Counts against an end time, so it stays accurate in a background tab.
 */
export function FocusTimer({ minutes, isDone, onFinish, onMarkDone }: FocusTimerProps) {
  const total = Math.max(1, minutes) * 60_000;
  const [state, setState] = useState<TimerState>({ status: "idle" });
  const [now, setNow] = useState(() => Date.now());
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (state.status !== "running") return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= state.endsAt && !finishedRef.current) {
        finishedRef.current = true;
        playChime();
        setState({ status: "finished" });
        onFinishRef.current();
      }
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [state]);

  const start = () => {
    playMechanicalClick();
    finishedRef.current = false;
    setState({ status: "running", endsAt: Date.now() + total });
  };
  const pause = () => {
    if (state.status !== "running") return;
    playMechanicalClick();
    setState({ status: "paused", leftMs: state.endsAt - Date.now() });
  };
  const resume = () => {
    if (state.status !== "paused") return;
    playMechanicalClick();
    setState({ status: "running", endsAt: Date.now() + state.leftMs });
  };
  const reset = () => {
    playMechanicalClick();
    finishedRef.current = false;
    setState({ status: "idle" });
  };

  if (state.status === "idle") {
    return (
      <button
        type="button"
        onClick={start}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-surface-border text-xs font-medium text-ink-secondary whitespace-nowrap hover:border-ink/40 hover:text-ink transition cursor-pointer"
        title="Start a focus timer for this step"
      >
        <AppIcon name="stopwatch-linear" className="w-3.5 h-3.5" />
        <span>Focus {formatMinutes(minutes)}</span>
      </button>
    );
  }

  if (state.status === "finished") {
    return (
      <span className="inline-flex items-center gap-2" role="status">
        <span className="text-xs font-semibold text-success">Time&rsquo;s up</span>
        {!isDone && (
          <button
            type="button"
            onClick={onMarkDone}
            className="text-xs font-semibold text-ink underline underline-offset-2 cursor-pointer"
          >
            Mark as done?
          </button>
        )}
        <IconButton icon="restart-linear" label="Reset focus timer" variant="ghost" size="sm" onClick={reset} />
      </span>
    );
  }

  const left = state.status === "running" ? state.endsAt - now : state.leftMs;
  const progress = 1 - left / total;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "relative inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums overflow-hidden",
          state.status === "running" ? "bg-ink text-white" : "bg-surface-muted text-ink"
        )}
        role="timer"
        aria-label={`Focus timer, ${formatClock(left)} left${state.status === "paused" ? ", paused" : ""}`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-white/15"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
        <span className="relative">{formatClock(left)}</span>
      </span>
      <IconButton
        icon={state.status === "running" ? "pause-linear" : "play-linear"}
        label={state.status === "running" ? "Pause focus timer" : "Resume focus timer"}
        variant="ghost"
        size="sm"
        onClick={state.status === "running" ? pause : resume}
      />
      <IconButton icon="restart-linear" label="Reset focus timer" variant="ghost" size="sm" onClick={reset} />
    </span>
  );
}
