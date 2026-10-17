"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";

interface StepIndicatorProps {
  total: number;
  /** Zero-based index of the step on screen. */
  current: number;
  isDone: (index: number) => boolean;
  /** Fill class for finished segments, e.g. a category colour. */
  fillClass?: string;
  /** Lets people jump to a step by clicking its segment. */
  onSelect?: (index: number) => void;
  /** Noun for the label, e.g. "Step" or "Drill". */
  noun?: string;
}

/** A segmented bar, one segment per step, with a "Step 3 of 8" label. */
export function StepIndicator({
  total,
  current,
  isDone,
  fillClass = "bg-ink",
  onSelect,
  noun = "Step",
}: StepIndicatorProps) {
  if (total <= 0) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-ink tabular-nums whitespace-nowrap">
        {noun} {current + 1} of {total}
      </span>
      <div className="flex flex-1 items-center gap-1" aria-hidden={onSelect ? undefined : true}>
        {Array.from({ length: total }, (_, i) => {
          const segment = cn(
            "relative h-1.5 flex-1 rounded-full overflow-hidden bg-surface-muted",
            i === current && "outline outline-2 outline-offset-1 outline-ink/30"
          );
          const fill = (
            <span
              className={cn(
                "absolute inset-0 origin-left rounded-full transition-transform duration-500 ease-out",
                fillClass,
                isDone(i) ? "scale-x-100" : "scale-x-0"
              )}
            />
          );
          return onSelect ? (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Go to ${noun.toLowerCase()} ${i + 1}${isDone(i) ? " (done)" : ""}`}
              aria-current={i === current ? "step" : undefined}
              className={cn(segment, "cursor-pointer hover:opacity-80")}
            >
              {fill}
            </button>
          ) : (
            <span key={i} className={segment}>
              {fill}
            </span>
          );
        })}
      </div>
    </div>
  );
}

interface PracticeShellProps {
  titleId: string;
  /** Small line above the title, e.g. "Music · Beginner". */
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  icon: string;
  onClose: () => void;
  /** Controls next to the close button (tabs, badges). */
  headerActions?: React.ReactNode;
  /** Sits under the header, usually a StepIndicator. */
  indicator?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** The shared frame for practice modals: header, step indicator, scrolling body, footer. */
export function PracticeShell({
  titleId,
  eyebrow,
  title,
  icon,
  onClose,
  headerActions,
  indicator,
  footer,
  className,
  children,
}: PracticeShellProps) {
  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      className={cn("max-w-3xl bg-white border border-surface-border flex flex-col max-h-[92vh]", className)}
    >
      <header className="px-5 sm:px-6 pt-5 pb-4 bg-canvas border-b border-surface-border space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-surface-border flex items-center justify-center text-ink">
              <AppIcon name={icon} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-ink-muted font-medium">{eyebrow}</div>
              <h2 id={titleId} className="font-display font-bold text-lg sm:text-xl text-ink leading-tight truncate">
                {title}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <IconButton icon="close" label="Close" variant="ghost" onClick={onClose} />
          </div>
        </div>
        {indicator}
      </header>

      <div className="p-6 sm:p-8 flex-1 overflow-y-auto">{children}</div>

      {footer && (
        <footer className="px-5 sm:px-6 py-4 bg-canvas border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
          {footer}
        </footer>
      )}
    </Modal>
  );
}
