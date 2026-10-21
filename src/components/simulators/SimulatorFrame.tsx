"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";

interface SimulatorFrameProps {
  icon: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  accentClass?: string;
  className?: string;
  children: React.ReactNode;
}

export function SimulatorFrame({
  icon,
  title,
  meta,
  accentClass = "text-ink-secondary",
  className,
  children,
}: SimulatorFrameProps) {
  return (
    <section
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "w-full my-3 p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border shadow-2xs text-left text-ink select-none",
        className
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-3 mb-4 border-b border-surface-border">
        <h4 className="flex items-center gap-2 min-w-0 flex-1 basis-32 text-xs font-semibold text-ink-muted">
          <AppIcon name={icon} className={cn("w-4 h-4 shrink-0", accentClass)} />
          <span className="truncate">{title}</span>
        </h4>
        {meta && <div className="shrink-0 text-xs font-medium text-ink-muted tabular-nums">{meta}</div>}
      </header>
      {children}
    </section>
  );
}

interface ReadoutProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  valueClassName?: string;
  children?: React.ReactNode;
}

export function Readout({ label, value, hint, valueClassName, children }: ReadoutProps) {
  return (
    <div className="p-3.5 rounded-xl bg-canvas border border-surface-border text-center flex flex-col items-center justify-between gap-1">
      <span className="text-xs font-semibold text-ink-muted">{label}</span>
      <span className={cn("font-display font-bold text-3xl leading-tight tabular-nums text-ink", valueClassName)}>
        {value}
      </span>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
      {children}
    </div>
  );
}

export function SimulatorStatus({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "neutral";
  children: React.ReactNode;
}) {
  const tones = {
    success: "bg-success-light border-success-border text-success",
    warning: "bg-warning-light border-warning-border text-warning-strong",
    danger: "bg-danger-light border-danger-border text-danger",
    neutral: "bg-surface-subtle border-surface-border text-ink-secondary",
  };
  return (
    <span
      role="status"
      className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold", tones[tone])}
    >
      {children}
    </span>
  );
}
