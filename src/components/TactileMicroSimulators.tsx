"use client";

import React, { useState, useEffect, useRef } from "react";
import { SolarIcon } from "@/components/SolarIcon";
import {
  playMechanicalClick,
  playChime,
  playWoodenThud,
  playMetronomeClick,
  playWhetstoneSound,
  playWaterDrop,
} from "@/lib/workbench-audio";

// ============================================================================
// 1. LIVE PRACTICE METRONOME (Guitar, Rhythm, Typing, Speed Drills)
// ============================================================================
export function PracticeMetronome({ initialBpm = 75 }: { initialBpm?: number }) {
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0); // 0 to 3 for 4/4 time
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play metronome clicks and track beat count
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

    // Initial first beat tick
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
      <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-ink-subtle uppercase mb-3 pb-1.5 border-b border-surface-border/60">
        <span className="flex items-center gap-1.5">
          <SolarIcon name="soundwave-linear" className="w-3.5 h-3.5 text-brand-600" />
          <span>MICRO-SIMULATOR // AUDITORY METRONOME</span>
        </span>
        <span className="text-brand-600 font-bold">4/4 TIME</span>
      </div>

      {/* Main Beat & Tempo Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={() => {
            playMechanicalClick();
            setIsPlaying(!isPlaying);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isPlaying
              ? "bg-rose-500 hover:bg-rose-600 text-white"
              : "bg-brand-600 hover:bg-brand-700 text-white"
          }`}
        >
          <SolarIcon
            name={isPlaying ? "pause-linear" : "play-linear"}
            className="w-4 h-4"
          />
          <span>{isPlaying ? "HALT" : "START TEMPO"}</span>
        </button>

        {/* BPM Counter Display & Steppers */}
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
            <span className="text-[9px] text-ink-muted uppercase font-bold tracking-wider font-mono">
              BPM
            </span>
            <span className="text-[10px] font-serif italic text-ink-secondary block -mt-0.5">
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

      {/* 4-Beat Visual Pulsing LEDs */}
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
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                    isActive
                      ? isDownbeat
                        ? "bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-110"
                        : "bg-ink text-white shadow-xs"
                      : "bg-white border border-surface-border text-ink-muted"
                  }`}
                >
                  {b + 1}
                </div>
                <span className="text-[8px] font-mono text-ink-subtle">
                  {isDownbeat ? "BEAT 1" : `&`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick Tempo Presets */}
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
              className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition ${
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

// ============================================================================
// 2. TACTILE 15° ANGLE GAUGE (Knife Sharpening / Honing)
// ============================================================================
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
      <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-ink-subtle uppercase mb-2 pb-1.5 border-b border-surface-border/60">
        <span className="flex items-center gap-1.5">
          <SolarIcon name="tuning-2-linear" className="w-3.5 h-3.5 text-brand-600" />
          <span>MICRO-SIMULATOR // 15° APEX CALIPER</span>
        </span>
        <span className={isOptimal ? "text-accent-emerald font-bold" : "text-amber-600 font-bold"}>
          {isOptimal ? "★ OPTIMAL 15° BEVEL" : "ADJUST SPINE"}
        </span>
      </div>

      {/* Interactive Blade Cross-Section Diagram */}
      <div className="relative h-28 bg-white border border-surface-border rounded-xl p-3 flex flex-col justify-between overflow-hidden">
        {/* Whetstone Base */}
        <div className="absolute bottom-0 inset-x-0 h-7 bg-neutral-200 border-t border-neutral-300 flex items-center justify-between px-3 text-[9px] font-mono text-neutral-600 uppercase">
          <span>#1000 GRIT WATERSTONE SURFACE</span>
          <span>FLAT HORIZONTAL PLANE (0°)</span>
        </div>

        {/* Dynamic Blade Vector Pivot */}
        <div className="relative w-full h-16 flex items-end justify-center">
          <svg className="w-64 h-20 overflow-visible" viewBox="0 0 200 60">
            {/* Horizontal Waterstone Line */}
            <line x1="10" y1="50" x2="190" y2="50" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />

            {/* Knife Blade Pivot Angle */}
            <g transform={`rotate(-${angle}, 100, 50)`}>
              {/* Blade Body */}
              <polygon
                points="100,50 170,44 175,36 100,48"
                fill="#CBD5E1"
                stroke="#334155"
                strokeWidth="1.5"
              />
              {/* Razor Apex Edge */}
              <line x1="98" y1="50" x2="102" y2="50" stroke="#2563EB" strokeWidth="3" />
              {/* Coin stack spacer indicator */}
              <rect x="155" y="44" width="12" height="6" fill="#F59E0B" rx="1" />
            </g>

            {/* Angle Arc Indicator */}
            <path
              d={`M 130 50 A 30 30 0 0 0 ${100 + 30 * Math.cos((-angle * Math.PI) / 180)} ${
                50 + 30 * Math.sin((-angle * Math.PI) / 180)
              }`}
              fill="none"
              stroke={isOptimal ? "#10B981" : "#F59E0B"}
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Live Tactile Angle Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <div
            className={`px-2.5 py-0.5 rounded-lg border text-xs font-mono font-bold ${
              isOptimal
                ? "bg-accent-emerald/10 border-accent-emerald/40 text-accent-emerald"
                : isClose
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-rose-50 border-rose-300 text-rose-700"
            }`}
          >
            {angle.toFixed(1)}° APEX
          </div>
        </div>
      </div>

      {/* Interactive Angle Slider & Coin Guide */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] text-ink-muted">
            Tilt Blade Spine: <strong>{angle}°</strong> (Target: 15.0°)
          </span>
          <span className="text-[11px] text-ink-subtle font-mono">
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
          {/* Quick Snap Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                playChime();
                setAngle(15);
              }}
              className="px-2 py-0.5 rounded bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-bold hover:bg-brand-100 transition"
            >
              Snap to 15.0° (2 Coins)
            </button>
            <button
              type="button"
              onClick={() => {
                playMechanicalClick();
                setAngle(20);
              }}
              className="px-2 py-0.5 rounded bg-white border border-surface-border text-ink-muted text-[10px] hover:text-ink transition"
            >
              20.0° (Chef Knife)
            </button>
          </div>

          {/* Tactile Sharpening Stroke Simulator */}
          <button
            type="button"
            onClick={handleStroke}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-ink hover:bg-neutral-800 text-white text-[11px] font-semibold transition active:scale-95 shadow-xs cursor-pointer"
          >
            <SolarIcon name="soundwave-linear" className="w-3.5 h-3.5 text-brand-300" />
            <span>Simulate Stroke ({strokesCompleted})</span>
          </button>
        </div>

        {/* Verdict Explainer */}
        <p className="text-[11px] text-ink-muted leading-tight pt-1">
          {angle < 13
            ? "⚠️ Too flat: The blade face scratches against the stone without creating a sharp cutting bevel."
            : angle > 17
            ? "⚠️ Too steep: Creates a thick, blunt wedge that splits vegetables rather than slicing smoothly."
            : "✅ Optimal 15°: Two quarters stacked under the spine creates the exact Japanese razor edge."}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 3. SHOT TIMER & EXTRACTION DIAL (Espresso 1:2 Brew Ratio)
// ============================================================================
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
        // Periodic drop sounds
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

  // Dynamic Yield Calculation (18g dry in -> ~36g out around 28-30s)
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
      <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-ink-subtle uppercase mb-2 pb-1.5 border-b border-surface-border/60">
        <span className="flex items-center gap-1.5">
          <SolarIcon name="cup-hot-linear" className="w-3.5 h-3.5 text-amber-600" />
          <span>MICRO-SIMULATOR // 1:2 EXTRACTION DIAL</span>
        </span>
        <span className="text-amber-700 font-bold">DOSE: 18.0G &rarr; YIELD: 36.0G</span>
      </div>

      {/* Main Stopwatch Stage */}
      <div className="grid grid-cols-2 gap-3 my-2">
        {/* Real-time Extraction Timer */}
        <div className="p-3 bg-white border border-surface-border rounded-xl text-center flex flex-col justify-center">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase">
            SHOT ELAPSED TIME
          </span>
          <span
            className={`font-mono font-extrabold text-3xl leading-tight my-0.5 ${
              isTargetWindow
                ? "text-accent-emerald"
                : seconds > 32
                ? "text-rose-600"
                : "text-ink"
            }`}
          >
            {seconds.toFixed(1)}s
          </span>
          <span className="text-[10px] text-ink-subtle font-mono">
            {seconds < 6
              ? "Pre-infusion phase"
              : seconds <= 25
              ? "Golden Crema flow"
              : seconds <= 30
              ? "★ SWEET SPOT CUTOFF"
              : "Over-extracted / Bitter"}
          </span>
        </div>

        {/* Live Liquid Yield Scale */}
        <div className="p-3 bg-white border border-surface-border rounded-xl text-center flex flex-col justify-center">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase">
            SCALE WEIGHT (LIQUID)
          </span>
          <span className="font-mono font-extrabold text-3xl text-amber-900 leading-tight my-0.5">
            {currentYield.toFixed(1)}g
          </span>
          <span className="text-[10px] text-amber-700 font-mono font-semibold">
            Ratio 1:{(currentYield / 18).toFixed(1)} (Target: 1:2.0)
          </span>
        </div>
      </div>

      {/* Extraction Phase Progress Bar */}
      <div className="space-y-1 mb-3">
        <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden flex">
          <div
            className="h-full bg-amber-300 transition-all duration-100"
            style={{ width: `${Math.min(100, (seconds / 32) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-ink-subtle">
          <span>0s (Pump On)</span>
          <span>6s (Drip)</span>
          <span className="text-brand-600 font-bold">28s–30s (Cutoff)</span>
          <span>35s</span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-surface-border/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isRunning
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-ink hover:bg-neutral-800 text-white"
            }`}
          >
            <SolarIcon name={isRunning ? "pause-linear" : "play-linear"} className="w-4 h-4" />
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

        {/* Verdict Badge */}
        {seconds > 0 && !isRunning && (
          <div
            className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg ${
              isTargetWindow
                ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {isTargetWindow ? "★ PERFECT EXTRACTION!" : "ADJUST GRIND FINER/COARSER"}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 4. INTERACTIVE PHONETIC SOUNDBOARD (Cyrillic, Languages)
// ============================================================================
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
    onSpeak(letter.char, "ru-RU");
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full my-3 p-4 bg-canvas/90 border-2 border-surface-border rounded-2xl corner-ticks text-ink shadow-2xs select-none"
    >
      <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-ink-subtle uppercase mb-2 pb-1.5 border-b border-surface-border/60">
        <span className="flex items-center gap-1.5">
          <SolarIcon name="volume-loud-linear" className="w-3.5 h-3.5 text-brand-600" />
          <span>MICRO-SIMULATOR // PHONETIC SOUNDBOARD</span>
        </span>
        <span className="text-brand-600 font-bold">CLICK TILE TO HEAR</span>
      </div>

      {/* Phonetic Tiles by Category */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center justify-between text-[10px] mb-1 font-semibold text-ink-muted">
              <span>{cat.name}</span>
              <span className="text-ink-subtle text-[9px]">{cat.note}</span>
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
                      className={`text-[9px] font-mono mt-0.5 ${
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

      {/* Active Selected Anchor & Audio Replay */}
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
            <p className="text-[11px] text-ink-secondary mt-0.5">
              {selectedLetter.anchor} • Example: <strong>{selectedLetter.word}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSpeak(selectedLetter.char, "ru-RU")}
            className="p-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 transition flex items-center gap-1 text-xs font-bold shrink-0"
            title="Hear native pronunciation"
          >
            <SolarIcon name="volume-loud-linear" className="w-4 h-4" />
            <span>Replay</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 5. UNIVERSAL FOCUS REPETITION DRILL (Juggling, Rubik's Cube, Custom Skills)
// ============================================================================
export function FocusRepetitionDrill({
  stepTitle,
  targetReps = 10,
}: {
  stepTitle: string;
  targetReps?: number;
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
      <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-ink-subtle uppercase mb-2 pb-1.5 border-b border-surface-border/60">
        <span className="flex items-center gap-1.5">
          <SolarIcon name="stopwatch-linear" className="w-3.5 h-3.5 text-brand-600" />
          <span>MICRO-SIMULATOR // TACTILE REPETITION COUNTER</span>
        </span>
        <span className="text-brand-600 font-bold">TARGET: {targetReps} REPS</span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-2">
        {/* Rep Counter */}
        <div className="p-3 bg-white border border-surface-border rounded-xl text-center flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase">
            COMPLETED DRILLS
          </span>
          <div className="flex items-center justify-center gap-3 my-1">
            <button
              type="button"
              onClick={handleMinusRep}
              className="w-8 h-8 rounded-lg bg-surface-muted hover:bg-surface-border text-ink font-bold transition"
            >
              -
            </button>
            <span className="font-mono font-extrabold text-3xl text-ink">
              {reps} / {targetReps}
            </span>
            <button
              type="button"
              onClick={handleAddRep}
              className="w-8 h-8 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold transition"
            >
              +
            </button>
          </div>
          <span className="text-[10px] text-ink-subtle font-mono">
            {reps >= targetReps ? "★ TARGET REACHED!" : "Click (+) on each clean repetition"}
          </span>
        </div>

        {/* 60s Focus Interval Timer */}
        <div className="p-3 bg-white border border-surface-border rounded-xl text-center flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase">
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
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              timerActive
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {timerActive ? "Pause" : timerSeconds === 0 ? "Reset (60s)" : "Start Interval"}
          </button>
        </div>
      </div>
    </div>
  );
}
