"use client";

import React from "react";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="p-3 rounded-2xl bg-white border border-surface-border shadow-2xs text-center">
      <AppIcon name={icon} className="w-4 h-4 mx-auto text-ink-muted mb-1.5" />
      <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="font-display font-bold text-base sm:text-lg text-ink mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}

/** Shown when every drill in the session has been rated. */
export function SessionSummary({ drillCount, onClose }: { drillCount: number; onClose: () => void }) {
  return (
    <div className="text-center py-6 space-y-6 max-w-md mx-auto" role="status">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-success-light border border-success-border flex items-center justify-center text-success">
        <AppIcon name="check-circle-bold" className="w-9 h-9" />
      </div>
      <div>
        <h3 className="font-display font-bold text-2xl text-ink">Session done</h3>
        <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
          You finished all {drillCount} drills for today.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <Stat icon="check-circle-linear" label="Drills" value={String(drillCount)} />
        <Stat icon="fire-linear" label="Practice day" value="+1" />
        <Stat icon="clock-circle-linear" label="Next review" value="Tomorrow" />
      </div>
      <Button block onClick={onClose}>
        Back to Studio
      </Button>
    </div>
  );
}
