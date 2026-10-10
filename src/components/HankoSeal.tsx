"use client";

import React from "react";

interface HankoSealProps {
  label?: string;
  subtext?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "vermilion" | "copper" | "obsidian";
  animate?: boolean;
  className?: string;
}

export function HankoSeal({
  label = "済",
  subtext = "VERIFIED",
  size = "md",
  variant = "vermilion",
  animate = false,
  className = "",
}: HankoSealProps) {
  const sizeStyles = {
    xs: "w-5 h-5 text-[9px]",
    sm: "w-8 h-8 text-[11px]",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-2xl",
    xl: "w-20 h-20 text-3xl",
  };

  const variantStyles = {
    vermilion: {
      border: "border-rose-700/80 text-rose-700 bg-rose-50/30",
      ring: "border-rose-700/60",
      sub: "text-rose-800",
      glow: "shadow-rose-600/10",
    },
    copper: {
      border: "border-amber-700/80 text-amber-800 bg-amber-50/30",
      ring: "border-amber-700/60",
      sub: "text-amber-900",
      glow: "shadow-amber-600/10",
    },
    obsidian: {
      border: "border-ink/80 text-ink bg-neutral-50/50",
      ring: "border-ink/60",
      sub: "text-ink-secondary",
      glow: "shadow-ink/10",
    },
  };

  const curVariant = variantStyles[variant];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        animate ? "animate-bounce duration-500 scale-100" : ""
      } ${className}`}
      title={`Archimedes Atelier Seal // ${subtext}`}
    >
      {/* Outer Seal Stamp with Double Hairline Ring */}
      <div
        className={`relative ${sizeStyles[size]} rounded-full border-2 ${curVariant.border} ${curVariant.glow} flex flex-col items-center justify-center rotate-[-4deg] shadow-xs transition-transform duration-300 hover:rotate-0`}
      >
        {/* Inner concentric ring */}
        <div
          className={`absolute inset-1 rounded-full border ${curVariant.ring} border-dashed pointer-events-none opacity-80`}
        />

        {/* Kanji Seal Glyph or Main Mark (済 = Mastered/Completed) */}
        <span className="font-serif font-black leading-none tracking-tight">
          {label}
        </span>

        {/* Archival micro-text */}
        {size !== "sm" && subtext && (
          <span
            className={`text-[7px] font-mono font-bold tracking-widest uppercase mt-0.5 leading-none ${curVariant.sub}`}
          >
            {subtext}
          </span>
        )}
      </div>

      {/* Ink impact ripple when animated */}
      {animate && (
        <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 animate-ping pointer-events-none" />
      )}
    </div>
  );
}
