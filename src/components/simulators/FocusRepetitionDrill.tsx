"use client";

import React, { useEffect, useRef, useState } from "react";
import { playChime, playMechanicalClick } from "@/lib/workbench-audio";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { Readout, SimulatorFrame } from "./SimulatorFrame";

export function FocusRepetitionDrill({
  stepTitle: _stepTitle,
  targetReps = 10,
  metricHeading = "Completed drills",
  metricNoun = "clean repetitions",
  actionLabel = "Tap + after each clean repetition",
  guidanceTip,
  accentClass,
}: {
  stepTitle: string;
  targetReps?: number;
  metricHeading?: string;
  metricNoun?: string;
  actionLabel?: string;
  guidanceTip?: string;
  accentClass?: string;
}) {
  const [reps, setReps] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
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

  const handleAddRep = () => {
    playMechanicalClick();
    setReps((prev) => {
      const next = prev + 1;
      if (next === targetReps) {
        playChime();
      }
      return next;
    });
  };

  const handleMinusRep = () => {
    playMechanicalClick();
    setReps((prev) => Math.max(0, prev - 1));
  };

  return (
    <SimulatorFrame
      icon="stopwatch-linear"
      title={metricHeading}
      meta={`Goal: ${targetReps} ${metricNoun}`}
      accentClass={accentClass}
    >
      <div className="grid grid-cols-2 gap-3">
        <Readout
          label={metricHeading}
          value={`${reps} / ${targetReps}`}
          hint={reps >= targetReps ? "Goal reached" : actionLabel}
          valueClassName={reps >= targetReps ? "text-success" : undefined}
        >
          <div className="flex items-center gap-2 mt-1">
            <Button size="sm" variant="secondary" className="w-9 px-0" aria-label="Remove a repetition" onClick={handleMinusRep}>
              −
            </Button>
            <Button size="sm" className="w-9 px-0" aria-label="Add a repetition" onClick={handleAddRep}>
              +
            </Button>
          </div>
        </Readout>

        <Readout label="60-second drill clock" value={`${timerSeconds}s`}>
          <Button
            size="sm"
            variant={timerActive ? "secondary" : "primary"}
            className="mt-1"
            onClick={() => {
              playMechanicalClick();
              if (timerSeconds === 0) setTimerSeconds(60);
              setTimerActive(!timerActive);
            }}
          >
            <AppIcon name={timerActive ? "pause-linear" : "play-linear"} className="w-3.5 h-3.5" />
            <span>{timerActive ? "Pause" : timerSeconds === 0 ? "Reset to 60s" : "Start"}</span>
          </Button>
        </Readout>
      </div>

      {guidanceTip && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-ink-secondary">
          <AppIcon name="info-circle-linear" className="w-4 h-4 mt-0.5 shrink-0 text-ink-subtle" />
          <span>{guidanceTip}</span>
        </p>
      )}
    </SimulatorFrame>
  );
}
