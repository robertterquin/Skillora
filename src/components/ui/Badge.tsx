import React from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "inverse";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-subtle text-ink-secondary border-surface-border",
  success: "bg-accent-emerald-light text-accent-emerald border-accent-emerald/30",
  warning: "bg-amber-50 text-amber-900 border-amber-200",
  danger: "bg-rose-50 text-rose-800 border-rose-200",
  inverse: "bg-ink text-white border-ink",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** "label" is a compact uppercase mono tag; "pill" is a sentence-case status chip. */
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
