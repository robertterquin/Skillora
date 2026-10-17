"use client";

import React from "react";
import { RecallQuality } from "@/lib/spaced-repetition";
import { getDisciplinePracticeProfile } from "@/lib/discipline-practice";

type PracticeProfile = ReturnType<typeof getDisciplinePracticeProfile>;

interface RecallRatingProps {
  profile: PracticeProfile;
  onRate: (quality: RecallQuality) => void;
}

/** "How did it go?" buttons that schedule the next review. Keys 1–3 work too. */
export function RecallRating({ profile, onRate }: RecallRatingProps) {
  const options: { quality: RecallQuality; prompt: { title: string; desc: string }; next: string }[] = [
    { quality: 1, prompt: profile.recallPrompts.hard, next: "Tomorrow" },
    { quality: 2, prompt: profile.recallPrompts.solid, next: "In 3–4 days" },
    { quality: 3, prompt: profile.recallPrompts.effortless, next: "In 7–10 days" },
  ];

  return (
    <section className="p-5 rounded-2xl bg-white border border-surface-border shadow-2xs" aria-labelledby="recall-heading">
      <h3 id="recall-heading" className="font-display font-bold text-sm text-ink">
        How did it go?
      </h3>
      <p className="text-sm text-ink-secondary mt-1 mb-4">Your answer sets when this drill comes back.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map(({ quality, prompt, next }) => (
          <button
            key={quality}
            type="button"
            onClick={() => onRate(quality)}
            aria-keyshortcuts={String(quality)}
            className="p-3.5 rounded-xl border border-surface-border hover:border-ink/50 bg-white hover:bg-surface-subtle text-left transition cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between gap-2 text-sm font-semibold text-ink mb-1">
              <span>{prompt.title}</span>
              <kbd className="text-xs font-mono text-ink-muted border border-surface-border rounded px-1.5">{quality}</kbd>
            </div>
            <p className="text-xs text-ink-secondary leading-snug">{prompt.desc}</p>
            <p className="mt-2 text-xs text-ink-muted">Next: {next}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
