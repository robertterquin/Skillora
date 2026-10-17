import React from "react";
import { cn } from "@/lib/cn";
import { AppIcon } from "./AppIcon";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: React.ReactNode;
  /** Buttons or links shown below the description. */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon = "book-bookmark-linear", title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "p-10 sm:p-14 text-center bg-white rounded-3xl border border-dashed border-surface-border max-w-2xl mx-auto",
        className
      )}
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-canvas border border-surface-border flex items-center justify-center text-ink">
        <AppIcon name={icon} className="w-7 h-7" />
      </div>
      <h3 className="font-display font-bold text-lg text-ink mb-1.5">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{action}</div>}
    </div>
  );
}
