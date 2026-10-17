"use client";

import React, { useState } from "react";
import { playChime, playMechanicalClick, playWhetstoneSound } from "@/lib/workbench-audio";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { SimulatorFrame, SimulatorStatus } from "./SimulatorFrame";

export function KnifeAngleGauge({ accentClass }: { accentClass?: string }) {
  const [angle, setAngle] = useState(15);
  const [strokesCompleted, setStrokesCompleted] = useState(0);
  const isOptimal = angle >= 14 && angle <= 16;
  const isClose = angle >= 12 && angle <= 18;

  const handleStroke = () => {
    playWhetstoneSound();
    setStrokesCompleted((prev) => prev + 1);
    if ((strokesCompleted + 1) % 10 === 0) {
      playChime();
    }
  };

  return (
    <SimulatorFrame
      icon="tuning-2-linear"
      title="Sharpening angle"
      accentClass={accentClass}
      meta={
        <SimulatorStatus tone={isOptimal ? "success" : isClose ? "warning" : "danger"}>
          {angle.toFixed(1)}° · {isOptimal ? "On target" : "Adjust the spine"}
        </SimulatorStatus>
      }
    >
      <div className="relative h-28 rounded-xl bg-canvas border border-surface-border overflow-hidden">
        <div className="relative w-full h-20 flex items-end justify-center">
          <svg className="w-64 h-20 overflow-visible" viewBox="0 0 200 60" aria-hidden="true">
            <line x1="10" y1="50" x2="190" y2="50" stroke="rgb(var(--c-ink-subtle))" strokeWidth="1.5" strokeDasharray="3 3" />

            <g transform={`rotate(-${angle}, 100, 50)`}>
              <polygon
                points="100,50 170,44 175,36 100,48"
                fill="rgb(var(--c-surface-border))"
                stroke="rgb(var(--c-ink-secondary))"
                strokeWidth="1.5"
              />
              <line x1="98" y1="50" x2="102" y2="50" stroke="rgb(var(--c-info))" strokeWidth="3" />
              <rect x="155" y="44" width="12" height="6" fill="rgb(var(--c-accent-amber))" rx="1" />
            </g>

            <path
              d={`M 130 50 A 30 30 0 0 0 ${100 + 30 * Math.cos((-angle * Math.PI) / 180)} ${
                50 + 30 * Math.sin((-angle * Math.PI) / 180)
              }`}
              fill="none"
              stroke={isOptimal ? "rgb(var(--c-success))" : "rgb(var(--c-accent-amber))"}
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-8 bg-surface-muted border-t border-surface-border flex items-center justify-between px-3 text-xs text-ink-muted">
          <span>#1000 grit whetstone</span>
          <span>Flat surface, 0°</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-ink-muted">
          <label htmlFor="knife-angle" className="font-semibold">
            Blade angle <span className="text-ink tabular-nums">{angle}°</span> (aim for 15°)
          </label>
          <span className="tabular-nums">Spine height about {(angle * 0.23).toFixed(1)} mm</span>
        </div>

        <input
          id="knife-angle"
          type="range"
          min="5"
          max="35"
          step="0.5"
          value={angle}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setAngle(val);
            if (val >= 14.5 && val <= 15.5) {
              playChime();
            } else {
              playMechanicalClick();
            }
          }}
          className="w-full accent-ink cursor-pointer h-2 bg-surface-muted rounded-lg"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                playChime();
                setAngle(15);
              }}
            >
              Snap to 15°
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                playMechanicalClick();
                setAngle(20);
              }}
            >
              20° (chef&rsquo;s knife)
            </Button>
          </div>

          <Button size="sm" onClick={handleStroke}>
            <AppIcon name="soundwave-linear" className="w-3.5 h-3.5" />
            <span>
              Stroke <span className="tabular-nums">({strokesCompleted})</span>
            </span>
          </Button>
        </div>

        <p className="text-sm text-ink-secondary leading-relaxed">
          {angle < 13
            ? "Too flat: the blade face scratches the stone without forming a cutting bevel."
            : angle > 17
            ? "Too steep: this makes a thick, blunt wedge that splits vegetables instead of slicing."
            : "Right at 15°: about two coins stacked under the spine gives a fine Japanese-style edge."}
        </p>
      </div>
    </SimulatorFrame>
  );
}
