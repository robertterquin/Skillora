"use client";

import React from "react";
import { Icon, addIcon } from "@iconify/react";
import { ICON_NAME_MAP, BUNDLED_ICONS } from "@/lib/icons-data";

// Register all offline bundled icons once so they render synchronously on first render
let iconsRegistered = false;
function ensureIconsRegistered() {
  if (iconsRegistered) return;
  for (const [key, iconData] of Object.entries(BUNDLED_ICONS)) {
    addIcon(key, iconData);
  }
  iconsRegistered = true;
}

// Immediately register icons on client initialization
ensureIconsRegistered();

export interface AppIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Skillora Unified App Icon (powered by Iconify)
 * Renders high-precision Phosphor Light architectural icons with instant 0ms offline rendering.
 */
export function AppIcon({ name, className = "w-4 h-4", style }: AppIconProps) {
  ensureIconsRegistered();

  let iconId: string;

  if (name.includes(":")) {
    // Explicit Iconify namespace (e.g. "ph:sidebar-simple-light" or "solar:clock-circle-linear")
    iconId = name;
  } else if (ICON_NAME_MAP[name]) {
    // Mapped standard name -> offline bundled Phosphor Light icon
    iconId = `ph:${ICON_NAME_MAP[name]}`;
  } else if (name.endsWith("-linear")) {
    const cleanName = name.replace("-linear", "");
    iconId = `ph:${cleanName}-light`;
  } else {
    iconId = `ph:${name}-light`;
  }

  return <Icon icon={iconId} className={className} style={style} />;
}

// Backward-compatible alias for existing imports
export const SolarIcon = AppIcon;
export const IconifyIcon = AppIcon;
