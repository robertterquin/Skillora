"use client";

import React, { useEffect, useRef, useState } from "react";
import { playChime, playMechanicalClick, playWaterDrop, playWoodenThud } from "@/lib/workbench-audio";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { Readout, SimulatorFrame, SimulatorStatus } from "./SimulatorFrame";

export function EspressoExtractionSimulator({ accentClass }: { accentClass?: string }) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = Math.round((prev + 0.1) * 10) / 10;
        if (next <= 6 && Math.round(next * 10) % 15 === 0) {
          playWaterDrop();
        } else if (next > 6 && next <= 30 && Math.round(next * 10) % 8 === 0) {
          playWaterDrop();
        }
        return next;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleToggle = () => {
    playMechanicalClick();
    if (isRunning) {
      setIsRunning(false);
      if (seconds >= 26 && seconds <= 30) {
        playChime();
      }
    } else {
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    playWoodenThud();
    setIsRunning(false);
    setSeconds(0);
  };

  const calcYield = () => {
    if (seconds <= 4) return 0;
    if (seconds <= 7) return Math.min(3, (seconds - 4) * 1.0);
    const flow = (seconds - 7) * 1.5 + 3;
    return Math.min(50, Math.round(flow * 10) / 10);
  };

  const currentYield = calcYield();
  const isTargetWindow = seconds >= 26 && seconds <= 30;

  return (
    <SimulatorFrame
      icon="cup-hot-linear"
      title="Espresso shot"
      meta="18 g in → 36 g out"
      accentClass={accentClass}
    >
      <div className="grid grid-cols-2 gap-3">
        <Readout
          label="Shot time"
          value={`${seconds.toFixed(1)}s`}
          valueClassName={isTargetWindow ? "text-success" : seconds > 32 ? "text-danger" : undefined}
          hint={
            seconds < 6
              ? "Pre-infusion"
              : seconds <= 25
              ? "Crema flowing"
              : seconds <= 30
              ? "Stop the shot now"
              : "Over-extracted, bitter"
          }
        />
        <Readout
          label="In the cup"
          value={`${currentYield.toFixed(1)}g`}
          hint={`Ratio 1:${(currentYield / 18).toFixed(1)}, aim for 1:2`}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <div
          className="h-2 w-full bg-surface-muted rounded-full overflow-hidden"
          role="progressbar"
          aria-label="Shot progress"
          aria-valuemin={0}
          aria-valuemax={32}
          aria-valuenow={Math.min(32, seconds)}
        >
          <div
            className={cn("h-full rounded-full transition-all duration-100", isTargetWindow ? "bg-success" : "bg-warning")}
            style={{ width: `${Math.min(100, (seconds / 32) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-ink-muted tabular-nums">
          <span>0s pump on</span>
          <span>6s first drips</span>
          <span className="font-semibold text-ink">26–30s stop</span>
          <span>35s</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-surface-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant={isRunning ? "accent" : "primary"} onClick={handleToggle}>
            <AppIcon name={isRunning ? "pause-linear" : "play-linear"} className="w-4 h-4" />
            <span>{isRunning ? "Stop the shot" : "Start the pump"}</span>
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </div>

        {seconds > 0 && !isRunning && (
          <SimulatorStatus tone={isTargetWindow ? "success" : "warning"}>
            {isTargetWindow ? "Good extraction" : "Adjust the grind finer or coarser"}
          </SimulatorStatus>
        )}
      </div>
    </SimulatorFrame>
  );
}
