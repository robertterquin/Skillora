"use client";

import React, { useEffect, useMemo, useState } from "react";
import { readString, writeString, STORAGE_KEYS } from "@/lib/storage";
import { IconButton } from "../ui/IconButton";

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function recapWeek(today = new Date()): { label: string; start: string; end: string } | null {
  if (today.getDay() !== 1) return null;
  const monday = new Date(today);
  monday.setDate(today.getDate() - 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { label: "Last week", start: dateKey(monday), end: dateKey(sunday) };
}

interface WeeklyRecapCardProps {
  practiceDates: string[];
  completedAt: Record<string, string>;
}

export function WeeklyRecapCard({ practiceDates, completedAt }: WeeklyRecapCardProps) {
  const week = useMemo(() => recapWeek(), []);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(!week || readString(STORAGE_KEYS.recapDismissed) === week.start);
  }, [week]);

  if (!week || dismissed) return null;

  const days = practiceDates.filter((d) => d >= week.start && d <= week.end).length;
  const steps = Object.values(completedAt).filter((iso) => {
    const d = dateKey(new Date(iso));
    return d >= week.start && d <= week.end;
  }).length;

  const dismiss = () => {
    writeString(STORAGE_KEYS.recapDismissed, week.start);
    setDismissed(true);
  };

  return (
    <section
      aria-labelledby="recap-heading"
      className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-paper-warm border border-surface-border"
    >
      <div>
        <h2 id="recap-heading" className="text-sm font-semibold text-ink">
          {week.label}
        </h2>
        <p className="mt-0.5 text-[15px] text-ink-secondary">
          {days === 0 && steps === 0 ? (
            "No practice logged. One short step is enough to start again."
          ) : (
            <>
              <strong className="text-ink">{days}</strong> practice {days === 1 ? "day" : "days"} ·{" "}
              <strong className="text-ink">{steps}</strong> {steps === 1 ? "step" : "steps"} done
            </>
          )}
        </p>
      </div>
      <IconButton icon="close" label="Dismiss weekly recap" variant="ghost" size="sm" onClick={dismiss} />
    </section>
  );
}
