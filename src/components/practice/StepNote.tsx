"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { MAX_NOTE_LENGTH } from "@/hooks/useStepNotes";

interface StepNoteProps {
  note: string;
  onSave: (text: string) => void;
}

/**
 * An optional reflection after finishing a step. Saves as you type; a quiet
 * "Saved" replaces toasts so typing never triggers a stream of messages.
 */
export function StepNote({ note, onSave }: StepNoteProps) {
  const id = useId();
  const [draft, setDraft] = useState(note);
  const [status, setStatus] = useState<"idle" | "saved">("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout>>();

  // Pick up the stored note when switching steps (the component is keyed by step, but stay safe).
  useEffect(() => setDraft(note), [note]);
  useEffect(() => () => clearTimeout(savedTimer.current), []);

  const handleChange = (value: string) => {
    setDraft(value);
    onSave(value);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setStatus("saved"), 400);
    setStatus("idle");
  };

  return (
    <div className="w-full max-w-xl">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          What clicked? What was hard?
        </label>
        <span className="text-xs text-ink-muted" aria-live="polite">
          {status === "saved" ? "Saved" : "Optional"}
        </span>
      </div>
      <textarea
        id={id}
        value={draft}
        maxLength={MAX_NOTE_LENGTH}
        onChange={(e) => handleChange(e.target.value)}
        rows={3}
        placeholder="A note for future you, e.g. “Thumb drifts when I speed up past 80 BPM.”"
        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-surface-border text-base sm:text-[15px] text-ink leading-relaxed placeholder:text-ink-subtle focus:outline-none focus:border-ink resize-y"
      />
      <p className="mt-1 text-xs text-ink-muted">Archimedes&rsquo; coach reads this note when you ask for help on this step.</p>
    </div>
  );
}
