"use client";

import React from "react";
import { Icon } from "@iconify/react";

interface SolarIconProps {
  name: string; // e.g. "clock-circle-linear", "fire-linear", "cup-first-linear", "magnifer-linear"
  className?: string;
  style?: React.CSSProperties;
}

export function SolarIcon({ name, className = "w-4 h-4", style }: SolarIconProps) {
  const iconId = name.startsWith("solar:") ? name : `solar:${name}`;
  return <Icon icon={iconId} className={className} style={style} />;
}
