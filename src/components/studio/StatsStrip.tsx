import React from "react";

interface StatsStripProps {
  streak: number;
  activeCount: number;
  stepsDone: number;
  masteredCount: number;
}

/** One quiet row of progress numbers. */
export function StatsStrip({ streak, activeCount, stepsDone, masteredCount }: StatsStripProps) {
  const stats = [
    { label: "Day streak", value: streak },
    { label: "In progress", value: activeCount },
    { label: "Steps done", value: stepsDone },
    { label: "Mastered", value: masteredCount },
  ];

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-surface-border bg-surface-border">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white px-5 py-4">
          <dt className="text-xs text-ink-muted">{stat.label}</dt>
          <dd className="mt-0.5 font-display font-semibold text-2xl text-ink tabular-nums">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
