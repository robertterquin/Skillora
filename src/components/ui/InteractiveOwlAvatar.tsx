"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [isBlinkingLeft, setIsBlinkingLeft] = useState(false);
  const [isBlinkingRight, setIsBlinkingRight] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [speakingSquint, setSpeakingSquint] = useState(false);
  const lastMouseTimeRef = useRef(Date.now());
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Natural Gaze Tracking with Organic Centering
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMouseTimeRef.current = Date.now();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const angle = Math.atan2(dy, dx);
      // Limit maximum pupil excursion to 3.5px within spectacle boundary
      const dist = Math.min(3.5, Math.hypot(dx, dy) / 65);

      setPupilOffset({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 2. Autonomous Idle Curiosity Glances (when mouse is resting)
  useEffect(() => {
    const runIdleCheck = () => {
      const now = Date.now();
      const timeSinceMouse = now - lastMouseTimeRef.current;

      // If user hasn't moved mouse in 3.5 seconds and not thinking/listening
      if (timeSinceMouse > 3500 && !isThinking && !isListening) {
        const glances = [
          { x: 0, y: 0 }, // Center
          { x: 2.2, y: -1.2 }, // Upper right glance
          { x: -2.0, y: -1.0 }, // Upper left glance
          { x: 1.5, y: 1.8 }, // Down-right glance
          { x: -1.5, y: 1.5 }, // Down-left glance
          { x: 0, y: -2.2 }, // Pondering upward glance
        ];
        const nextGlance = glances[Math.floor(Math.random() * glances.length)];
        setPupilOffset(nextGlance);
      }

      const nextCheck = 3500 + Math.random() * 3000;
      idleTimerRef.current = setTimeout(runIdleCheck, nextCheck);
    };

    idleTimerRef.current = setTimeout(runIdleCheck, 4000);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isThinking, isListening]);

  // 3. Natural Blinking with Occasional Character Double-Blinks
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const performBlink = () => {
      if (isWinking) return;

      const isDoubleBlink = Math.random() < 0.28;

      // First blink
      setIsBlinkingLeft(true);
      setIsBlinkingRight(true);

      setTimeout(() => {
        setIsBlinkingLeft(false);
        setIsBlinkingRight(false);

        // Optional quick secondary flutter blink (classic owl behavior)
        if (isDoubleBlink) {
          setTimeout(() => {
            setIsBlinkingLeft(true);
            setIsBlinkingRight(true);
            setTimeout(() => {
              setIsBlinkingLeft(false);
              setIsBlinkingRight(false);
            }, 110);
          }, 90);
        }
      }, 140);

      const nextInterval = 3400 + Math.random() * 4200;
      timeoutId = setTimeout(performBlink, nextInterval);
    };

    timeoutId = setTimeout(performBlink, 2800);
    return () => clearTimeout(timeoutId);
  }, [isWinking]);

  // 4. Conversational Eyelid Cadence while Speaking
  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingSquint(false);
      return;
    }

    const interval = setInterval(() => {
      setSpeakingSquint((prev) => !prev);
    }, 450);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // 5. Interactive Click Reaction: Playful Wink & Nudge
  const handleClick = useCallback(() => {
    setIsWinking(true);
    // Right eye winks playfully while left stays open
    setIsBlinkingRight(true);
    setIsBlinkingLeft(false);

    setTimeout(() => {
      setIsBlinkingRight(false);
      setIsWinking(false);
    }, 380);

    if (onClick) onClick();
  }, [onClick]);

  // Calculate dynamic pupil coordinate based on state
  const effectiveOffset = isThinking
    ? { x: 2.2, y: -2.4 } // Thoughtfully looking up & to the side
    : pupilOffset;

  // Dynamic pupil radius: dilates when listening or curious
  const pupilRadius = isListening ? 5.4 : isThinking ? 4.3 : isHovered ? 5.1 : 4.8;

  // Eyelid heights (0 = wide open, 24 = fully shut)
  const leftLidHeight = isBlinkingLeft
    ? 24
    : isThinking
    ? 5.5
    : speakingSquint
    ? 4
    : 0;

  const rightLidHeight = isBlinkingRight
    ? 24
    : isThinking
    ? 5.5
    : speakingSquint
    ? 4
    : 0;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative select-none flex items-center justify-center cursor-pointer group"
      style={{ width: size, height: size }}
      title="Archimedes the Learning Owl — Click to interact"
    >
      {/* 1. Living Soundwave & Speech Rings */}
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

      {/* 2. Owl Outer Perch Disc */}
      <div
        className={`relative w-full h-full rounded-full bg-white border-2 flex items-center justify-center p-6 shadow-xl transition-all duration-500 ${
          isListening
            ? "border-rose-500 shadow-rose-500/10 scale-105"
            : isSpeaking
            ? "border-brand-600 shadow-brand-500/15 scale-105"
            : isThinking
            ? "border-brand-400 shadow-md rotate-[-3deg]"
            : isWinking
            ? "scale-98 rotate-[2deg]"
            : "border-surface-border hover:border-brand-500/50 hover:scale-[1.03]"
        }`}
      >
        {/* Dynamic Vector SVG with Organic Eye-Gaze & Eyelid Physics */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full object-contain filter drop-shadow-2xs overflow-visible"
          fill="none"
        >
          <defs>
            {/* Left Eye Clipping Portal (Inside Spectacle Frame) */}
            <clipPath id="owl-left-eye-clip">
              <circle cx="50" cy="44" r="9.75" />
            </clipPath>

            {/* Right Eye Clipping Portal (Inside Spectacle Frame) */}
            <clipPath id="owl-right-eye-clip">
              <circle cx="76" cy="44" r="9.75" />
            </clipPath>
          </defs>

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

          {/* Spectacles Top Bridge Bar */}
          <line
            x1="36"
            y1="36"
            x2="92"
            y2="36"
            stroke="#111827"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* ======================================================== */}
          {/* LEFT EYE (Eyeball, Smooth Gaze Tracking & Eyelids)       */}
          {/* ======================================================== */}
          <g>
            {/* White Eye Sclera Underlay */}
            <circle cx="50" cy="44" r="10" fill="#FFFFFF" />

            {/* Clipped Eye Interior: Pupil, Catchlights & Sliding Eyelid */}
            <g clipPath="url(#owl-left-eye-clip)">
              {/* Pupil & Catchlight Sparkles with Spring Inertia */}
              <g
                style={{
                  transform: `translate(${effectiveOffset.x}px, ${effectiveOffset.y}px)`,
                  transition: "transform 140ms cubic-bezier(0.2, 0.9, 0.3, 1)",
                }}
              >
                {/* Deep Obsidian Pupil */}
                <circle cx="50" cy="44" r={pupilRadius} fill="#111827" />

                {/* Primary Glint / Catchlight Sparkle (top-right) */}
                <circle cx={51.6} cy={42.4} r={1.6} fill="#FFFFFF" />

                {/* Secondary Micro-Sheen (bottom-left) */}
                <circle cx={48.6} cy={45.4} r={0.8} fill="#FFFFFF" opacity={0.65} />
              </g>

              {/* Upper Eyelid Curtain (Slides down smoothly during blinks) */}
              <rect
                x="38"
                y="32"
                width="24"
                height={leftLidHeight}
                fill="#FFFFFF"
                style={{
                  transition: "height 120ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />

              {/* Curved Closed Eyelid Line (Serene, happy curved lash when fully closed) */}
              <path
                d="M 42 44.5 Q 50 49 58 44.5"
                stroke="#111827"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
                style={{
                  opacity: isBlinkingLeft ? 1 : 0,
                  transition: "opacity 90ms ease-in-out",
                }}
              />
            </g>

            {/* Crisp Spectacle Outer Frame Rim */}
            <circle
              cx="50"
              cy="44"
              r="12"
              stroke="#111827"
              strokeWidth="4.5"
              fill="none"
            />
          </g>

          {/* ======================================================== */}
          {/* RIGHT EYE (Eyeball, Smooth Gaze Tracking & Eyelids)      */}
          {/* ======================================================== */}
          <g>
            {/* White Eye Sclera Underlay */}
            <circle cx="76" cy="44" r="10" fill="#FFFFFF" />

            {/* Clipped Eye Interior: Pupil, Catchlights & Sliding Eyelid */}
            <g clipPath="url(#owl-right-eye-clip)">
              {/* Pupil & Catchlight Sparkles with Spring Inertia */}
              <g
                style={{
                  transform: `translate(${effectiveOffset.x}px, ${effectiveOffset.y}px)`,
                  transition: "transform 140ms cubic-bezier(0.2, 0.9, 0.3, 1)",
                }}
              >
                {/* Deep Obsidian Pupil */}
                <circle cx="76" cy="44" r={pupilRadius} fill="#111827" />

                {/* Primary Glint / Catchlight Sparkle (top-right) */}
                <circle cx={77.6} cy={42.4} r={1.6} fill="#FFFFFF" />

                {/* Secondary Micro-Sheen (bottom-left) */}
                <circle cx={74.6} cy={45.4} r={0.8} fill="#FFFFFF" opacity={0.65} />
              </g>

              {/* Upper Eyelid Curtain (Slides down smoothly during blinks or winks) */}
              <rect
                x="64"
                y="32"
                width="24"
                height={rightLidHeight}
                fill="#FFFFFF"
                style={{
                  transition: "height 120ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />

              {/* Curved Closed Eyelid Line (Serene, happy curved lash when fully closed) */}
              <path
                d="M 68 44.5 Q 76 49 84 44.5"
                stroke="#111827"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
                style={{
                  opacity: isBlinkingRight ? 1 : 0,
                  transition: "opacity 90ms ease-in-out",
                }}
              />
            </g>

            {/* Crisp Spectacle Outer Frame Rim */}
            <circle
              cx="76"
              cy="44"
              r="12"
              stroke="#111827"
              strokeWidth="4.5"
              fill="none"
            />
          </g>

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
