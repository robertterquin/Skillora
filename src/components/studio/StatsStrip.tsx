import React from "react";
import { WeekDayActivity } from "@/lib/spaced-repetition";
import { cn } from "@/lib/cn";

interface StatsStripProps {
  week: WeekDayActivity[];
  stepsDone: number;
  masteredCount: number;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Practice days this week as seven dots, e.g. 4 of 7. */
function WeekDots({ week }: { week: WeekDayActivity[] }) {
  return (
    <ol className="mt-2 flex items-center gap-1.5" aria-label="Practice this week">
      {week.map((day, i) => (
        <li key={day.date} className="flex flex-col items-center gap-1">
          <span
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              day.practiced ? "bg-success" : day.isFuture ? "bg-surface-muted" : "bg-surface-muted border border-surface-border",
              day.isToday && "ring-2 ring-offset-1 ring-ink/25"
            )}
          />
          <span className={cn("text-xs leading-none", day.isToday ? "font-semibold text-ink" : "text-ink-subtle")} aria-hidden="true">
            {day.label}
          </span>
          <span className="sr-only">
            {DAY_NAMES[i]}: {day.practiced ? "practised" : day.isFuture ? "upcoming" : "no practice"}
            {day.isToday ? " (today)" : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** One quiet row of progress numbers. */
export function StatsStrip({ week, stepsDone, masteredCount }: StatsStripProps) {
  const daysThisWeek = week.filter((d) => d.practiced).length;
  const stats = [
    { label: "Steps done", value: stepsDone },
    { label: "Mastered", value: masteredCount },
  ];

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-surface-border bg-surface-border">
      <div className="col-span-2 sm:col-span-1 bg-white px-5 py-4">
        <dt className="text-xs text-ink-muted">Practice days this week</dt>
        <dd className="mt-0.5">
          <span className="font-display font-semibold text-2xl text-ink tabular-nums">{daysThisWeek}</span>
          <span className="text-sm text-ink-muted">/7</span>
          <WeekDots week={week} />
        </dd>
      </div>
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white px-5 py-4">
          <dt className="text-xs text-ink-muted">{stat.label}</dt>
          <dd className="mt-0.5 font-display font-semibold text-2xl text-ink tabular-nums">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
