"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { playMechanicalClick, playMetronomeClick } from "@/lib/workbench-audio";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { SegmentedControl } from "../ui/SegmentedControl";
import { SimulatorFrame } from "./SimulatorFrame";

const PRESETS = [
  { label: "Slow", val: 55 },
  { label: "Steady", val: 75 },
  { label: "Flow", val: 105 },
];

function tempoName(bpm: number): string {
  if (bpm < 60) return "Largo";
  if (bpm < 76) return "Adagio";
  if (bpm < 108) return "Andante";
  if (bpm < 120) return "Moderato";
  if (bpm < 168) return "Allegro";
  return "Presto";
}

export function PracticeMetronome({
  initialBpm = 75,
  accentClass,
  fillClass = "bg-ink",
}: {
  initialBpm?: number;
  /** Category text colour for the header icon. */
  accentClass?: string;
  /** Category fill for the downbeat. */
  fillClass?: string;
}) {
  const layoutId = useId();
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentBeat(0);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    timerRef.current = setInterval(() => {
      setCurrentBeat((prev) => {
        const nextBeat = (prev + 1) % 4;
        playMetronomeClick(nextBeat === 0);
        return nextBeat;
      });
    }, intervalMs);

    playMetronomeClick(true);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm]);

  const adjustBpm = (delta: number) => {
    playMechanicalClick();
    setBpm((prev) => Math.max(40, Math.min(220, prev + delta)));
  };

  const stepButton = (delta: number) => (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => adjustBpm(delta)}
      aria-label={`${delta > 0 ? "Faster" : "Slower"} by ${Math.abs(delta)} BPM`}
      className="w-10 px-0 tabular-nums"
    >
      {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
    </Button>
  );

  return (
    <SimulatorFrame icon="soundwave-linear" title="Metronome" meta="4/4" accentClass={accentClass}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant={isPlaying ? "accent" : "primary"}
          onClick={() => {
            playMechanicalClick();
            setIsPlaying(!isPlaying);
          }}
        >
          <AppIcon name={isPlaying ? "pause-linear" : "play-linear"} className="w-4 h-4" />
          <span>{isPlaying ? "Stop" : "Start"}</span>
        </Button>

        <div className="flex items-center gap-1.5">
          {stepButton(-5)}
          {stepButton(-1)}
          <div className="min-w-[84px] px-2 text-center" aria-live="polite">
            <span className="block font-display font-bold text-2xl text-ink leading-none tabular-nums">{bpm}</span>
            <span className="block text-xs text-ink-muted mt-1">
              BPM · <span className="font-serif italic">{tempoName(bpm)}</span>
            </span>
          </div>
          {stepButton(1)}
          {stepButton(5)}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-surface-border flex flex-wrap items-center justify-between gap-3">
        <ol className="flex items-center gap-2" aria-label="Beats in the bar">
          {[0, 1, 2, 3].map((b) => {
            const isActive = isPlaying && currentBeat === b;
            return (
              <li
                key={b}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold tabular-nums transition-all duration-100",
                  isActive
                    ? cn("text-white scale-110", b === 0 ? fillClass : "bg-ink")
                    : "bg-surface-muted text-ink-muted"
                )}
              >
                {b + 1}
              </li>
            );
          })}
        </ol>

        <SegmentedControl
          size="sm"
          label="Tempo presets"
          layoutId={`metronome-${layoutId}`}
          value={String(bpm)}
          options={PRESETS.map((p) => ({ value: String(p.val), label: `${p.label} ${p.val}` }))}
          onChange={(v) => {
            playMechanicalClick();
            setBpm(Number(v));
          }}
        />
      </div>
    </SimulatorFrame>
  );
}
