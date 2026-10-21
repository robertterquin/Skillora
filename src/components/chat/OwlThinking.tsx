"use client";

import React from "react";
import { InteractiveOwlAvatar } from "@/components/ui/InteractiveOwlAvatar";

export function OwlThinking({ label = "Archimedes is thinking" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-2" role="status" aria-live="polite">
      <div className="pointer-events-none">
        <InteractiveOwlAvatar isThinking size={44} />
      </div>
      <span className="text-sm text-ink-muted">
        {label}
        <span className="inline-flex gap-0.5 ml-1 align-middle" aria-hidden="true">
          <span className="w-1 h-1 rounded-full bg-ink-muted animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1 h-1 rounded-full bg-ink-muted animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1 h-1 rounded-full bg-ink-muted animate-bounce" />
        </span>
      </span>
    </div>
  );
}
