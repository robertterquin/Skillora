"use client";

import React, { useState, useEffect, useRef } from "react";
import { SolarIcon } from "./SolarIcon";

interface InteractiveOwlAvatarProps {
  isListening?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  onClick?: () => void;
  size?: number;
}

export function InteractiveOwlAvatar({
  isListening = false,
  isThinking = false,
  isSpeaking = false,
  onClick,
  size = 180,
}: InteractiveOwlAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // 1. Interactive Cursor Gaze Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      // Limit maximum pupil excursion to 3.8px within spectacle boundary
      const dist = Math.min(3.8, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 80);

      setPupilOffset({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 2. Natural Occasional Blinking (every 3 to 7 seconds)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 170);

      const nextInterval = 3200 + Math.random() * 4000;
      timeoutId = setTimeout(triggerBlink, nextInterval);
    };

    timeoutId = setTimeout(triggerBlink, 2500);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="relative select-none flex items-center justify-center cursor-pointer group"
      style={{ width: size, height: size }}
      title="Archimedes the Learning Owl — Click to interact"
    >
      {/* 3. Living Soundwave Perch Rings */}
      {/* Speaking Ripple Wave */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full bg-brand-500/15 animate-ping duration-1000 scale-125 pointer-events-none" />
          <div className="absolute -inset-3 rounded-full border-2 border-brand-500/40 animate-pulse pointer-events-none" />
          <div className="absolute -inset-6 rounded-full border border-dashed border-brand-500/25 animate-spin duration-10000 pointer-events-none" />
        </>
      )}

      {/* Listening Mic Ripple Wave */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping duration-700 scale-125 pointer-events-none" />
          <div className="absolute -inset-3 rounded-full border-2 border-rose-500/50 animate-pulse pointer-events-none" />
        </>
      )}

      {/* Ambient Breathing Ring (when idle) */}
      {!isSpeaking && !isListening && (
        <div className="absolute -inset-2.5 rounded-full border border-surface-border/80 group-hover:border-brand-500/30 transition-all duration-700 pointer-events-none" />
      )}

      {/* Owl Outer Perch Disc */}
      <div
        className={`relative w-full h-full rounded-full bg-white border-2 flex items-center justify-center p-6 shadow-xl transition-all duration-500 ${
          isListening
            ? "border-rose-500 shadow-rose-500/10 scale-105"
            : isSpeaking
            ? "border-brand-600 shadow-brand-500/15 scale-105"
            : isThinking
            ? "border-brand-400 shadow-md rotate-[-4deg]"
            : "border-surface-border hover:border-brand-500/50 hover:scale-[1.03]"
        }`}
      >
        {/* Dynamic Vector SVG with Eye-Gaze Pupil Tracking */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full object-contain filter drop-shadow-2xs"
          fill="none"
        >
          {/* Cobalt Blue Feather Accent */}
          <path
            d="M54 82C58 68 70 64 72 65C73 73 66 84 54 86L54 82Z"
            fill="#1D4ED8"
            className="transition-all duration-300"
          />
          <path
            d="M50 88L66 70"
            stroke="#1D4ED8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Outer Head & Body Arch */}
          <path
            d="M42 38C45 27 55 22 68 22C81 22 90 30 90 44V76C90 92 78 100 62 100C46 100 36 90 36 78V58"
            stroke="#111827"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Wing Fold */}
          <path
            d="M36 62C44 54 55 58 55 74C55 86 46 96 36 98V62Z"
            stroke="#111827"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Spectacles Top Bar */}
          <line
            x1="36"
            y1="36"
            x2="92"
            y2="36"
            stroke="#111827"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Left Spectacle Frame */}
          <circle
            cx="50"
            cy="44"
            r="12"
            stroke="#111827"
            strokeWidth="4.5"
            fill="white"
          />

          {/* Left Interactive Pupil with Cursor Tracking & Blinking */}
          <ellipse
            cx={50 + pupilOffset.x}
            cy={44 + pupilOffset.y}
            rx={5}
            ry={isBlinking ? 0.7 : 5}
            fill="#111827"
            className="transition-all duration-75"
          />
          {!isBlinking && (
            <circle
              cx={50 + pupilOffset.x + 1.6}
              cy={44 + pupilOffset.y - 1.6}
              r="1.5"
              fill="white"
            />
          )}

          {/* Right Spectacle Frame */}
          <circle
            cx="76"
            cy="44"
            r="12"
            stroke="#111827"
            strokeWidth="4.5"
            fill="white"
          />

          {/* Right Interactive Pupil with Cursor Tracking & Blinking */}
          <ellipse
            cx={76 + pupilOffset.x}
            cy={44 + pupilOffset.y}
            rx={5}
            ry={isBlinking ? 0.7 : 5}
            fill="#111827"
            className="transition-all duration-75"
          />
          {!isBlinking && (
            <circle
              cx={76 + pupilOffset.x + 1.6}
              cy={44 + pupilOffset.y - 1.6}
              r="1.5"
              fill="white"
            />
          )}

          {/* Beak */}
          <path
            d="M58 48L63 58L68 48"
            stroke="#111827"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Status Pill Badge Mounted on Perch */}
        <div className="absolute -bottom-2.5 px-3 py-1 rounded-full bg-ink text-white text-3xs font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
          {isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Listening...</span>
            </>
          ) : isThinking ? (
            <>
              <SolarIcon name="refresh-linear" className="w-3 h-3 animate-spin text-brand-300" />
              <span>Deconstructing...</span>
            </>
          ) : isSpeaking ? (
            <>
              <SolarIcon name="soundwave-linear" className="w-3 h-3 text-brand-300 animate-pulse" />
              <span>Speaking...</span>
            </>
          ) : (
            <>
              <SolarIcon name="stars-minimalistic-linear" className="w-3 h-3 text-brand-300" />
              <span>Archimedes</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
