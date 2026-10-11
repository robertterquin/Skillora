"use client";

import React from "react";
import { motion } from "motion/react";

interface HankoSealProps {
  label?: string;
  subtext?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "vermilion" | "copper" | "obsidian" | "gold";
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
      ripple: "border-rose-500/40",
    },
    copper: {
      border: "border-amber-700/80 text-amber-800 bg-amber-50/30",
      ring: "border-amber-700/60",
      sub: "text-amber-900",
      glow: "shadow-amber-600/10",
      ripple: "border-amber-500/40",
    },
    obsidian: {
      border: "border-ink/80 text-ink bg-neutral-50/50",
      ring: "border-ink/60",
      sub: "text-ink-secondary",
      glow: "shadow-ink/10",
      ripple: "border-neutral-500/40",
    },
    gold: {
      border: "border-amber-500 text-amber-700 bg-gradient-to-br from-amber-50 via-yellow-100/60 to-amber-100/50",
      ring: "border-amber-600/80",
      sub: "text-amber-800",
      glow: "shadow-amber-500/25 ring-2 ring-amber-400/30",
      ripple: "border-amber-400/60",
    },
  };

  const curVariant = variantStyles[variant];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      title={`Archimedes Atelier Seal // ${subtext}`}
    >
      {/* Outer Seal Stamp with Motion Spring Impact */}
      <motion.div
        initial={animate ? { scale: 1.45, opacity: 0.4, rotate: -12 } : false}
        animate={{ scale: 1, opacity: 1, rotate: -4 }}
        transition={{ type: "spring", stiffness: 480, damping: 22 }}
        whileHover={{ scale: 1.05, rotate: 0 }}
        className={`relative ${sizeStyles[size]} rounded-full border-2 ${curVariant.border} ${curVariant.glow} flex flex-col items-center justify-center shadow-xs transition-shadow`}
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
      </motion.div>

      {/* Ink impact ripple when animated */}
      {animate && (
        <div className={`absolute inset-0 rounded-full border-2 ${curVariant.ripple} animate-ping pointer-events-none`} />
      )}
    </div>
  );
}
