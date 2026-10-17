"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppIcon } from "../ui/AppIcon";
import {
  playMechanicalClick,
  playChime,
  playWoodenThud,
  playMetronomeClick,
  playWhetstoneSound,
  playWaterDrop,
} from "@/lib/workbench-audio";

export function PracticeMetronome({ initialBpm = 75 }: { initialBpm?: number }) {
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

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full my-3 p-4 bg-canvas/90 border-2 border-surface-border rounded-2xl corner-ticks text-ink shadow-2xs select-none"
    >
      <div className="flex items-center justify-between text-xs font-mono tracking-wider text-ink-subtle uppercase mb-3 pb-1.5 border-b border-surface-border/60">
        <span className="flex items-center gap-1.5">
          <AppIcon name="soundwave-linear" className="w-3.5 h-3.5 text-brand-600" />
          <span>MICRO-SIMULATOR // AUDITORY METRONOME</span>
        </span>
        <span className="text-brand-600 font-bold">4/4 TIME</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            playMechanicalClick();
            setIsPlaying(!isPlaying);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isPlaying
              ? "bg-accent-vermilion hover:bg-accent-vermilion text-white"
              : "bg-brand-600 hover:bg-brand-700 text-white"
          }`}
        >
          <AppIcon
            name={isPlaying ? "pause-linear" : "play-linear"}
            className="w-4 h-4"
          />
          <span>{isPlaying ? "HALT" : "START TEMPO"}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => adjustBpm(-5)}
            className="w-8 h-8 rounded-lg bg-white border border-surface-border hover:border-brand-500 text-xs font-mono font-bold transition"
            title="-5 BPM"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => adjustBpm(-1)}
            className="w-8 h-8 rounded-lg bg-white border border-surface-border hover:border-brand-500 text-xs font-mono font-bold transition"
            title="-1 BPM"
          >
            -1
          </button>

          <div className="px-3 py-1 bg-white border border-surface-border rounded-xl text-center min-w-[76px]">
            <span className="font-mono font-extrabold text-base text-ink block leading-none">
              {bpm}
            </span>
            <span className="text-xs text-ink-muted uppercase font-bold tracking-wider font-mono">
              BPM
            </span>
            <span className="text-xs font-serif italic text-ink-secondary block -mt-0.5">
              {bpm < 60 ? "Largo" : bpm < 76 ? "Adagio" : bpm < 108 ? "Andante" : bpm < 120 ? "Moderato" : bpm < 168 ? "Allegro" : "Presto"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => adjustBpm(+1)}
            className="w-8 h-8 rounded-lg bg-white border border-surface-border hover:border-brand-500 text-xs font-mono font-bold transition"
            title="+1 BPM"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => adjustBpm(+5)}
            className="w-8 h-8 rounded-lg bg-white border border-surface-border hover:border-brand-500 text-xs font-mono font-bold transition"
            title="+5 BPM"
          >
            +5
          </button>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((b) => {
            const isDownbeat = b === 0;
            const isActive = isPlaying && currentBeat === b;
            return (
              <div
                key={b}
                className={`flex flex-col items-center gap-1 transition-all duration-100 ${
                  isActive ? "scale-110" : "scale-100 opacity-60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    isActive
                      ? isDownbeat
                        ? "bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-110"
                        : "bg-ink text-white shadow-xs"
                      : "bg-white border border-surface-border text-ink-muted"
                  }`}
                >
                  {b + 1}
                </div>
                <span className="text-xs font-mono text-ink-subtle">
                  {isDownbeat ? "BEAT 1" : `&`}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          {[
            { label: "Slow", val: 55 },
            { label: "Steady", val: 75 },
            { label: "Flow", val: 105 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                playMechanicalClick();
                setBpm(preset.val);
              }}
              className={`px-2 py-1 rounded-md text-xs font-mono font-semibold transition ${
                bpm === preset.val
                  ? "bg-brand-50 text-brand-700 border border-brand-300"
                  : "bg-white border border-surface-border text-ink-muted hover:text-ink"
              }`}
            >
              {preset.label} ({preset.val})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function KnifeAngleGauge() {
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
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full my-3 p-4 bg-canvas/90 border-2 border-surface-border rounded-2xl corner-ticks text-ink shadow-2xs select-none"
    >
      <div className="flex items-center justify-between text-xs font-mono tracking-wider text-ink-subtle uppercase mb-2 pb-1.5 border-b border-surface-border/60">
        <span className="flex items-center gap-1.5">
          <AppIcon name="tuning-2-linear" className="w-3.5 h-3.5 text-brand-600" />
          <span>MICRO-SIMULATOR // 15° APEX CALIPER</span>
        </span>
        <span className={isOptimal ? "text-accent-emerald font-bold" : "text-warning font-bold"}>
          {isOptimal ? "OPTIMAL 15° BEVEL" : "ADJUST SPINE"}
        </span>
      </div>

      <div className="relative h-28 bg-white border border-surface-border rounded-xl p-3 flex flex-col justify-between overflow-hidden">
        <div className="absolute bottom-0 inset-x-0 h-7 bg-surface-muted border-t border-surface-border flex items-center justify-between px-3 text-xs font-mono text-ink-secondary uppercase">
          <span>#1000 GRIT WATERSTONE SURFACE</span>
          <span>FLAT HORIZONTAL PLANE (0°)</span>
        </div>

        <div className="relative w-full h-16 flex items-end justify-center">
          <svg className="w-64 h-20 overflow-visible" viewBox="0 0 200 60">
            <line x1="10" y1="50" x2="190" y2="50" stroke="rgb(var(--c-brand-400))" strokeWidth="2" strokeDasharray="3 3" />

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

        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <div
            className={`px-2.5 py-0.5 rounded-lg border text-xs font-mono font-bold ${
              isOptimal
                ? "bg-accent-emerald/10 border-accent-emerald/40 text-accent-emerald"
                : isClose
                ? "bg-warning-light border-warning-border text-warning"
                : "bg-danger-light border-danger-border text-danger"
            }`}
          >
            {angle.toFixed(1)}° APEX
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-xs text-ink-muted">
            Tilt Blade Spine: <strong>{angle}°</strong> (Target: 15.0°)
          </span>
          <span className="text-xs text-ink-subtle font-mono">
            Spine Clearance: ~{(angle * 0.23).toFixed(1)}mm
          </span>
        </div>

        <input
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
          className="w-full accent-brand-600 cursor-pointer h-2 bg-surface-muted rounded-lg"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                playChime();
                setAngle(15);
              }}
              className="px-2 py-0.5 rounded bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold hover:bg-brand-100 transition"
            >
              Snap to 15.0° (2 Coins)
            </button>
            <button
              type="button"
              onClick={() => {
                playMechanicalClick();
                setAngle(20);
              }}
              className="px-2 py-0.5 rounded bg-white border border-surface-border text-ink-muted text-xs hover:text-ink transition"
            >
              20.0° (Chef Knife)
            </button>
          </div>

          <button
            type="button"
            onClick={handleStroke}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-ink hover:bg-brand-500 text-white text-xs font-semibold transition active:scale-95 shadow-xs cursor-pointer"
          >
            <AppIcon name="soundwave-linear" className="w-3.5 h-3.5 text-brand-300" />
            <span>Simulate Stroke ({strokesCompleted})</span>
          </button>
        </div>

        <p className="text-xs text-ink-muted leading-tight pt-1">
          {angle < 13
            ? "Too flat: The blade face scratches against the stone without creating a sharp cutting bevel."
            : angle > 17
            ? "Too steep: Creates a thick, blunt wedge that splits vegetables rather than slicing smoothly."
            : "Optimal 15°: Two quarters stacked under the spine creates the exact Japanese razor edge."}
        </p>
      </div>
    </div>
  );
}

export function EspressoExtractionSimulator() {
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
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full my-3 p-4 bg-canvas/90 border-2 border-surface-border rounded-2xl corner-ticks text-ink shadow-2xs select-none"
    >
      <div className="flex items-center justify-between text-xs font-mono tracking-wider text-ink-subtle uppercase mb-2 pb-1.5 border-b border-surface-border/60">
        <span className="flex items-center gap-1.5">
          <AppIcon name="cup-hot-linear" className="w-3.5 h-3.5 text-warning" />
          <span>MICRO-SIMULATOR // 1:2 EXTRACTION DIAL</span>
        </span>
        <span className="text-warning font-bold">DOSE: 18.0G &rarr; YIELD: 36.0G</span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-2">
        <div className="p-3 bg-white border border-surface-border rounded-xl text-center flex flex-col justify-center">
          <span className="text-xs font-mono font-bold text-ink-muted uppercase">
            SHOT ELAPSED TIME
          </span>
          <span
            className={`font-mono font-extrabold text-3xl leading-tight my-0.5 ${
              isTargetWindow
                ? "text-accent-emerald"
                : seconds > 32
                ? "text-danger"
                : "text-ink"
            }`}
          >
            {seconds.toFixed(1)}s
          </span>
          <span className="text-xs text-ink-subtle font-mono">
            {seconds < 6
              ? "Pre-infusion phase"
              : seconds <= 25
              ? "Golden Crema flow"
              : seconds <= 30
              ? "SWEET SPOT CUTOFF"
              : "Over-extracted / Bitter"}
          </span>
        </div>

        <div className="p-3 bg-white border border-surface-border rounded-xl text-center flex flex-col justify-center">
          <span className="text-xs font-mono font-bold text-ink-muted uppercase">
            SCALE WEIGHT (LIQUID)
          </span>
          <span className="font-mono font-extrabold text-3xl text-warning-strong leading-tight my-0.5">
            {currentYield.toFixed(1)}g
          </span>
          <span className="text-xs text-warning font-mono font-semibold">
            Ratio 1:{(currentYield / 18).toFixed(1)} (Target: 1:2.0)
          </span>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden flex">
          <div
            className="h-full bg-warning-soft transition-all duration-100"
            style={{ width: `${Math.min(100, (seconds / 32) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-ink-subtle">
          <span>0s (Pump On)</span>
          <span>6s (Drip)</span>
          <span className="text-brand-600 font-bold">28s–30s (Cutoff)</span>
          <span>35s</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-surface-border/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isRunning
                ? "bg-warning hover:bg-warning-hover text-white"
                : "bg-ink hover:bg-brand-500 text-white"
            }`}
          >
            <AppIcon name={isRunning ? "pause-linear" : "play-linear"} className="w-4 h-4" />
            <span>{isRunning ? "CUT OFF SHOT" : "PUMP START"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-white border border-surface-border hover:border-brand-500 text-xs font-semibold text-ink transition"
          >
            Reset Scale
          </button>
        </div>

        {seconds > 0 && !isRunning && (
          <div
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
              isTargetWindow
                ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30"
                : "bg-warning-light text-warning-strong border border-warning-border"
            }`}
          >
            {isTargetWindow ? "PERFECT EXTRACTION" : "ADJUST GRIND FINER/COARSER"}
          </div>
        )}
      </div>
    </div>
  );
}

export function PhoneticSoundboard({ onSpeak }: { onSpeak: (text: string, lang?: string) => void }) {
  const [selectedLetter, setSelectedLetter] = useState<{
    char: string;
    sound: string;
    anchor: string;
    word: string;
  } | null>({
    char: "А",
    sound: "A (like Father)",
    anchor: "Identical to Latin 'A'",
    word: "АКУЛА (Shark)",
  });

  const categories = [
    {
      name: "True Friends",
      note: "Identical sound & look",
      letters: [
        { char: "А", sound: "A", anchor: "Open 'ah' like Father", word: "АКУЛА (Shark)" },
        { char: "К", sound: "K", anchor: "Crisp 'k' like Kite", word: "КОТ (Cat)" },
        { char: "М", sound: "M", anchor: "Clear 'm' like Mother", word: "МАМА (Mom)" },
        { char: "О", sound: "O", anchor: "Round 'o' like Open", word: "ОКНО (Window)" },
        { char: "Т", sound: "T", anchor: "Sharp 't' like Table", word: "ТОМ (Volume)" },
      ],
    },
    {
      name: "False Friends",
      note: "Look like Latin, sound different",
      letters: [
        { char: "В", sound: "V", anchor: "Looks like B, sounds like V (Victory)", word: "ВОДА (Water)" },
        { char: "Н", sound: "N", anchor: "Looks like H, sounds like N (No)", word: "НЕТ (No)" },
        { char: "Р", sound: "R", anchor: "Looks like P, sounds like rolled R", word: "РЕКА (River)" },
        { char: "С", sound: "S", anchor: "Looks like C, sounds like S (Sun)", word: "СЫР (Cheese)" },
        { char: "У", sound: "OO", anchor: "Looks like Y, sounds like OO (Moon)", word: "УТРО (Morning)" },
        { char: "Х", sound: "KH", anchor: "Looks like X, throaty H (Bach)", word: "ХЛЕБ (Bread)" },
      ],
    },
    {
      name: "Greek Roots",
      note: "Distinctive geometric forms",
      letters: [
        { char: "Д", sound: "D", anchor: "Greek Delta &rarr; English D", word: "ДОМ (House)" },
        { char: "Г", sound: "G", anchor: "Greek Gamma &rarr; English G (Go)", word: "ГОРОД (City)" },
        { char: "П", sound: "P", anchor: "Greek Pi &rarr; English P (Park)", word: "ПАРК (Park)" },
        { char: "Ж", sound: "ZH", anchor: "Buzzing sibilant like Treasure", word: "ЖУК (Beetle)" },
        { char: "Ш", sound: "SH", anchor: "Three-pronged hush like Ship", word: "ШКОЛА (School)" },
      ],
    },
  ];

  const handleTileClick = (letter: { char: string; sound: string; anchor: string; word: string }) => {
    playMechanicalClick();
    setSelectedLetter(letter);
    const spokenSample = `${letter.char}. ${letter.word.split(" ")[0]}`;
    onSpeak(spokenSample, "ru-RU");
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full my-3 p-4 bg-canvas/90 border border-surface-border rounded-2xl text-ink shadow-2xs select-none"
    >
      <div className="flex items-center justify-between text-xs font-mono tracking-wider text-ink-subtle uppercase mb-2 pb-1.5 border-b border-surface-border/60">
        <span className="flex items-center gap-1.5">
          <AppIcon name="volume-loud-linear" className="w-3.5 h-3.5 text-brand-600" />
          <span>PHONETIC SOUNDBOARD</span>
        </span>
        <span className="text-brand-600 font-bold">CLICK TILE TO HEAR</span>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center justify-between text-xs mb-1 font-semibold text-ink-muted">
              <span>{cat.name}</span>
              <span className="text-ink-subtle text-xs">{cat.note}</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
              {cat.letters.map((l) => {
                const isSelected = selectedLetter?.char === l.char;
                return (
                  <button
                    key={l.char}
                    type="button"
                    onClick={() => handleTileClick(l)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center transform active:scale-95 ${
                      isSelected
                        ? "bg-brand-600 text-white border-brand-600 shadow-md scale-105"
                        : "bg-white border-surface-border text-ink hover:border-brand-500/50 hover:shadow-xs"
                    }`}
                  >
                    <span className="font-display font-extrabold text-lg leading-tight">
                      {l.char}
                    </span>
                    <span
                      className={`text-xs font-mono mt-0.5 ${
                        isSelected ? "text-brand-100 font-bold" : "text-ink-muted"
                      }`}
                    >
                      /{l.sound}/
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedLetter && (
        <div className="mt-3 p-3 bg-white border border-surface-border rounded-xl flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-brand-700 font-display">
                {selectedLetter.char}
              </span>
              <span className="text-xs font-bold text-ink">
                Sound: /{selectedLetter.sound}/
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              {selectedLetter.anchor} • Example: <strong>{selectedLetter.word}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onSpeak(`${selectedLetter.char}. ${selectedLetter.word.split(" ")[0]}`, "ru-RU")
            }
            className="p-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 transition flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
            title="Hear native pronunciation"
          >
            <AppIcon name="volume-loud-linear" className="w-4 h-4" />
            <span>Replay</span>
          </button>
        </div>
      )}
    </div>
  );
}

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

  const formatMinSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full my-3 p-4 bg-night text-night-text border-2 border-night-hover rounded-2xl corner-ticks shadow-2xs select-none font-mono"
    >
      <div className="flex items-center justify-between text-xs tracking-wider text-night-muted uppercase mb-2 pb-1.5 border-b border-night-line">
        <span className="flex items-center gap-1.5">
          <AppIcon name="code-linear" className="w-3.5 h-3.5 text-night-green" />
          <span>MICRO-SIMULATOR // CODE TEST RUNNER</span>
        </span>
        <span className="text-night-green font-bold">
          TARGET: {targetMilestones} MILESTONES
        </span>
      </div>

      <div className="p-3 bg-night/70 rounded-xl border border-night-line text-xs leading-relaxed mb-3 space-y-1 overflow-x-auto text-night-text">
        {terminalLogs.map((log, i) => (
          <div
            key={i}
            className={
              log.startsWith("✓")
                ? "text-night-green font-bold"
                : log.startsWith("$")
                ? "text-night-blue font-semibold"
                : "text-night-muted"
            }
          >
            {log}
          </div>
        ))}
        {isTestRunning && (
          <div className="text-night-amber animate-pulse">
            &gt; Executing test runner... [••••]
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 my-2">
        <div className="p-3 bg-night-raised/90 border border-night-line rounded-xl text-center flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-night-muted uppercase">
            CODE MILESTONES
          </span>
          <div className="flex items-center justify-center gap-2.5 my-1">
            <button
              type="button"
              onClick={handleManualMinus}
              className="w-7 h-7 rounded-lg bg-night-line hover:bg-night-hover text-night-text font-bold transition text-xs cursor-pointer"
            >
              -
            </button>
            <span className="font-mono font-extrabold text-2xl text-night-text tabular-nums">
              {milestones} / {targetMilestones}
            </span>
            <button
              type="button"
              onClick={handleManualPlus}
              className="w-7 h-7 rounded-lg bg-night-green/80 hover:bg-night-green/25 border border-night-green/80 text-night-green font-bold transition text-xs cursor-pointer"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleRunVerification}
            disabled={isTestRunning}
            className="w-full mt-1 py-1.5 px-2 rounded-lg bg-ink hover:bg-ink/90 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <AppIcon name="play-linear" className="w-3 h-3" />
            <span>Run Test Suite (+1)</span>
          </button>
        </div>

        <div className="p-3 bg-night-raised/90 border border-night-line rounded-xl text-center flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-night-muted uppercase">
            20M FOCUS SPRINT
          </span>
          <span className="font-mono font-extrabold text-2xl text-night-amber my-1 tabular-nums">
            {formatMinSec(timerSeconds)}
          </span>
          <button
            type="button"
            onClick={() => {
              playMechanicalClick();
              if (timerSeconds === 0) setTimerSeconds(1200);
              setTimerActive(!timerActive);
            }}
            className={`w-full mt-1 py-1.5 px-2 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
              timerActive
                ? "bg-night-red/70 border border-night-red/40 text-night-red hover:bg-night-red/25"
                : "bg-night-line text-night-text hover:bg-night-hover"
            }`}
          >
            {timerActive ? "Pause Sprint" : timerSeconds === 0 ? "Reset (20m)" : "Start Sprint"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FocusRepetitionDrill({
  stepTitle,
  targetReps = 10,
  metricHeading = "COMPLETED DRILLS",
  metricNoun = "clean repetitions",
  actionLabel = "Click (+) on each clean repetition",
  guidanceTip,
}: {
  stepTitle: string;
  targetReps?: number;
  metricHeading?: string;
  metricNoun?: string;
  actionLabel?: string;
  guidanceTip?: string;
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
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full my-3 p-4 bg-canvas/90 border-2 border-surface-border rounded-2xl corner-ticks text-ink shadow-2xs select-none"
    >
      <div className="flex items-center justify-between text-xs font-mono tracking-wider text-ink-subtle uppercase mb-2 pb-1.5 border-b border-surface-border/60">
        <span className="flex items-center gap-1.5">
          <AppIcon name="stopwatch-linear" className="w-3.5 h-3.5 text-brand-600" />
          <span>MICRO-SIMULATOR // {metricHeading}</span>
        </span>
        <span className="text-brand-600 font-bold">
          TARGET: {targetReps} {metricNoun.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-2">
        <div className="p-3 bg-white border border-surface-border rounded-xl text-center flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-ink-muted uppercase">
            {metricHeading}
          </span>
          <div className="flex items-center justify-center gap-3 my-1">
            <button
              type="button"
              onClick={handleMinusRep}
              className="w-8 h-8 rounded-lg bg-surface-muted hover:bg-surface-border text-ink font-bold transition cursor-pointer"
            >
              -
            </button>
            <span className="font-mono font-extrabold text-3xl text-ink">
              {reps} / {targetReps}
            </span>
            <button
              type="button"
              onClick={handleAddRep}
              className="w-8 h-8 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold transition cursor-pointer"
            >
              +
            </button>
          </div>
          <span className="text-xs text-ink-subtle font-mono">
            {reps >= targetReps ? "TARGET REACHED" : actionLabel}
          </span>
        </div>

        <div className="p-3 bg-white border border-surface-border rounded-xl text-center flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-ink-muted uppercase">
            60-SEC DRILL CLOCK
          </span>
          <span className="font-mono font-extrabold text-3xl text-brand-700 my-1">
            {timerSeconds}s
          </span>
          <button
            type="button"
            onClick={() => {
              playMechanicalClick();
              if (timerSeconds === 0) setTimerSeconds(60);
              setTimerActive(!timerActive);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              timerActive
                ? "bg-danger-light text-danger border border-danger-border"
                : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {timerActive ? "Pause" : timerSeconds === 0 ? "Reset (60s)" : "Start Interval"}
          </button>
        </div>
      </div>

      {guidanceTip && (
        <div className="mt-2 text-xs font-mono text-ink-muted bg-surface-muted/40 px-2.5 py-1 rounded-lg border border-surface-border/50 text-left">
          {guidanceTip}
        </div>
      )}
    </div>
  );
}
