"use client";

import React from "react";
import { Icon } from "@iconify/react";

// Curated mapping from legacy Solar names to crisp Swiss-architectural Phosphor Light icons
const PHOSPHOR_LIGHT_MAP: Record<string, string> = {
  // Brand & Intelligence
  "stars-minimalistic-linear": "ph:sparkle-light",
  "lightbulb-linear": "ph:lightbulb-filament-light",

  // Navigation & Search
  "magnifer-linear": "ph:magnifying-glass-light",
  "tuning-2-linear": "ph:sliders-horizontal-light",
  "arrow-left-linear": "ph:arrow-left-light",
  "arrow-right-linear": "ph:arrow-right-light",
  "square-arrow-right-up-linear": "ph:arrow-square-out-light",
  "compass-linear": "ph:compass-light",

  // Verification & Status
  "check-circle-linear": "ph:check-circle-light",
  "check-read-linear": "ph:checks-light",
  "close-circle-linear": "ph:x-circle-light",
  "danger-circle-linear": "ph:warning-circle-light",

  // Mastery, Badges & Streaks
  "cup-first-linear": "ph:trophy-light",
  "cup-hot-linear": "ph:coffee-light",
  "fire-linear": "ph:flame-light",
  "layers-minimalistic-linear": "ph:stack-light",

  // Practice & Media Controls
  "book-bookmark-linear": "ph:book-bookmark-light",
  "clock-circle-linear": "ph:clock-light",
  "stopwatch-linear": "ph:timer-light",
  "play-linear": "ph:play-circle-light",
  "printer-2-linear": "ph:printer-light",
  "refresh-linear": "ph:arrows-clockwise-light",

  // Audio & Voice
  "volume-loud-linear": "ph:speaker-high-light",
  "volume-cross-linear": "ph:speaker-slash-light",
  "microphone-3-linear": "ph:microphone-light",
  "soundwave-linear": "ph:waveform-light",

  // User & Auth
  "user-linear": "ph:user-light",
  "letter-linear": "ph:envelope-simple-light",
  "lock-keyhole-linear": "ph:lock-key-light",
  "login-2-linear": "ph:sign-out-light",
};

export interface AppIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Skillora Unified App Icon
 * Renders high-precision Phosphor Light architectural icons with automatic fallback.
 */
export function AppIcon({ name, className = "w-4 h-4", style }: AppIconProps) {
  let iconId: string;

  if (name.includes(":")) {
    // Explicit namespace provided (e.g. "ph:sparkle-light" or "solar:clock-circle-linear")
    iconId = name;
  } else if (PHOSPHOR_LIGHT_MAP[name]) {
    // Mapped standard name -> Phosphor Light icon
    iconId = PHOSPHOR_LIGHT_MAP[name];
  } else if (name.endsWith("-linear")) {
    // Other linear names -> try Phosphor light variant, fallback to solar
    const cleanName = name.replace("-linear", "");
    iconId = `ph:${cleanName}-light`;
  } else {
    // Default to Phosphor light
    iconId = `ph:${name}-light`;
  }

  return <Icon icon={iconId} className={className} style={style} />;
}

// Backward-compatible alias for existing imports
export const SolarIcon = AppIcon;
