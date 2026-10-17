"use client";

import React from "react";
import { AppIcon } from "@/components/ui/AppIcon";

interface QuickRepliesProps {
  replies?: string[];
  disabled?: boolean;
  onSelect: (reply: string) => void;
}

export function QuickReplies({ replies, disabled, onSelect }: QuickRepliesProps) {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2.5 animate-fade-in">
      {replies.map((reply, idx) => (
        <button
          key={`${reply}-${idx}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-brand-50 border border-surface-border hover:border-brand-300 text-xs sm:text-xs font-medium text-ink-secondary hover:text-brand-700 transition-all shadow-2xs disabled:opacity-40 cursor-pointer text-left"
        >
          <AppIcon
            name="stars-minimalistic-linear"
            className="w-3 h-3 text-ink-subtle group-hover:text-brand-500 transition"
          />
          <span>{reply}</span>
        </button>
      ))}
    </div>
  );
}
