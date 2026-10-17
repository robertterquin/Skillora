"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { AppIcon } from "./AppIcon";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group, e.g. "Skill view". */
  label: string;
  /** Must be unique per page so the sliding highlight animates correctly. */
  layoutId: string;
  size?: "sm" | "md";
  /** Scroll horizontally instead of wrapping (for long option lists). */
  scrollable?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  layoutId,
  size = "md",
  scrollable = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-xl bg-surface-muted/80 border border-surface-border/70",
        scrollable && "max-w-full overflow-x-auto no-scrollbar",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={isActive}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs",
              size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5",
              isActive ? "text-ink font-semibold" : "text-ink-muted hover:text-ink font-medium"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 440, damping: 32 }}
                className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-surface-border/80"
              />
            )}
            {opt.icon && <AppIcon name={opt.icon} className="relative z-10 w-3.5 h-3.5" />}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
