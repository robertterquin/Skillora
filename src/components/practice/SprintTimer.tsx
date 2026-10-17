"use client";

import React from "react";
import { getDisciplinePracticeProfile } from "@/lib/discipline-practice";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";

type PracticeProfile = ReturnType<typeof getDisciplinePracticeProfile>;

function formatClock(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface SprintTimerProps {
  profile: PracticeProfile;
  stepMinutes: number;
  secondsRemaining: number;
  targetSeconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSetDuration: (minutes: number) => void;
  metronome: { active: boolean; bpm: number; onToggle: () => void; onChangeBpm: (delta: number) => void };
  reps: { count: number; onAdd: () => void };
}

/** Countdown clock with sprint presets, optional metronome and a rep counter. */
export function SprintTimer({
  profile,
  stepMinutes,
  secondsRemaining,
  targetSeconds,
  isRunning,
  onToggle,
  onReset,
  onSetDuration,
  metronome,
  reps,
}: SprintTimerProps) {
  const progress = targetSeconds > 0 ? Math.round(((targetSeconds - secondsRemaining) / targetSeconds) * 100) : 0;
  const presets = [
    { minutes: 15, label: "15 min" },
    { minutes: 20, label: "20 min" },
    ...(stepMinutes > 20 ? [{ minutes: stepMinutes, label: `Full step (${stepMinutes} min)` }] : []),
  ];

  return (
    <section className="p-6 rounded-3xl bg-paper-warm border border-surface-border text-center">
      <div className="font-mono text-5xl sm:text-6xl font-black text-ink tracking-tight tabular-nums my-1" aria-live="off">
        {formatClock(secondsRemaining)}
      </div>

      <div
        className="w-56 h-1.5 mx-auto bg-surface-border rounded-full overflow-hidden my-3"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Sprint progress"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300", secondsRemaining === 0 ? "bg-success" : "bg-ink")}
          style={{ width: `${progress}%` }}
        />
      </div>

      {secondsRemaining === 0 && (
        <p className="text-sm font-semibold text-success mb-2" role="status">
          Time&rsquo;s up. Rate how it went below.
        </p>
      )}

      <div className="flex items-center justify-center gap-1.5 mb-3 flex-wrap" role="group" aria-label="Sprint length">
        {presets.map((p) => (
          <button
            key={p.minutes}
            type="button"
            aria-pressed={targetSeconds === p.minutes * 60}
            onClick={() => onSetDuration(p.minutes)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer",
              targetSeconds === p.minutes * 60
                ? "bg-ink text-white"
                : "bg-white border border-surface-border text-ink-secondary hover:bg-surface-subtle"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
        <Button variant={isRunning ? "accent" : "primary"} onClick={onToggle}>
          <AppIcon name={isRunning ? "pause-linear" : "play-linear"} className="w-4 h-4" />
          <span>{isRunning ? "Pause" : "Start"}</span>
        </Button>
        <Button variant="secondary" onClick={onReset} title="Reset the clock">
          <AppIcon name="restart-linear" className="w-3.5 h-3.5" />
          <span>Reset</span>
        </Button>

        {profile.isRhythmCadenceSupported && (
          <div className="inline-flex items-center h-10 rounded-full border border-surface-border bg-white overflow-hidden">
            <button
              type="button"
              onClick={metronome.onToggle}
              aria-pressed={metronome.active}
              className={cn(
                "h-full px-3 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer",
                metronome.active ? "bg-ink text-white" : "text-ink-secondary hover:bg-surface-subtle"
              )}
            >
              <AppIcon name={metronome.active ? "volume-loud-linear" : "tuning-2-linear"} className="w-3.5 h-3.5" />
              <span>
                {metronome.active ? `${profile.cadenceLabel || "Pulse"}: ` : ""}
                {metronome.bpm} BPM
              </span>
            </button>
            <button
              type="button"
              onClick={() => metronome.onChangeBpm(-10)}
              aria-label="Slower (minus 10 BPM)"
              className="h-full px-2.5 text-xs text-ink-secondary hover:bg-surface-subtle border-l border-surface-border cursor-pointer"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => metronome.onChangeBpm(10)}
              aria-label="Faster (plus 10 BPM)"
              className="h-full px-2.5 text-xs text-ink-secondary hover:bg-surface-subtle border-l border-surface-border cursor-pointer"
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-surface-border space-y-2">
        <div className="flex items-center justify-between text-left">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">{profile.metricHeading}</span>
            <strong className="text-base text-ink font-bold tabular-nums">
              {reps.count} {profile.metricUnitNoun}
            </strong>
          </div>
          <Button size="sm" variant="secondary" onClick={reps.onAdd}>
            <AppIcon name="add-circle-linear" className="w-4 h-4" />
            <span>{profile.actionButtonLabel}</span>
          </Button>
        </div>
        <p className="flex items-start gap-1.5 text-xs text-ink-secondary bg-white/70 px-3 py-2 rounded-lg border border-surface-border/70 text-left">
          <AppIcon name="info-circle-linear" className="w-3.5 h-3.5 text-ink-subtle mt-0.5 shrink-0" />
          <span>{profile.guidanceTip}</span>
        </p>
      </div>
    </section>
  );
}
