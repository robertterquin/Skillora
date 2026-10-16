import React from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "inverse";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-subtle text-ink-secondary border-surface-border",
  accent: "bg-accent-vermilion-light text-accent-vermilion border-accent-vermilion-border",
  success: "bg-accent-emerald-light text-accent-emerald border-accent-emerald-border",
  warning: "bg-accent-amber-light text-accent-amber border-accent-amber/20",
  danger: "bg-[#FDF0ED] text-[#A63826] border-[#F5D0C7]",
  inverse: "bg-ink text-white border-ink",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  shape?: "label" | "pill";
}

export function Badge({ tone = "neutral", shape = "label", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border whitespace-nowrap",
        shape === "label"
          ? "gap-1 rounded-md px-1.5 py-0.5 font-mono text-3xs font-semibold uppercase tracking-wider"
          : "gap-1.5 rounded-full px-2.5 py-1 text-2xs font-medium",
        TONES[tone],
        className
      )}
      {...rest}
    />
  );
}
