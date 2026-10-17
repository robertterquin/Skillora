"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { formatMinutes } from "../learning/LearningPath";

interface CredentialOverviewProps {
  displayName: string;
  email?: string;
  rank: string;
  rankTier: string;
  practiceMinutes: number;
  certifiedCount: number;
  masteredCount: number;
  onPrint: () => void;
  onViewCertificates: () => void;
}

function Stat({ icon, label, value, hint }: { icon: string; label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="bg-surface px-4 py-4">
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
        <AppIcon name={icon} className="w-3.5 h-3.5" />
        {label}
      </dt>
      <dd className="mt-1">
        <span className="font-display font-semibold text-2xl text-ink tabular-nums">{value}</span>
        {hint && <span className="block text-xs text-ink-muted mt-0.5">{hint}</span>}
      </dd>
    </div>
  );
}

/** Profile card: who you are and a quiet row of totals. */
export function CredentialOverview({
  displayName,
  email,
  rank,
  rankTier,
  practiceMinutes,
  certifiedCount,
  masteredCount,
  onPrint,
  onViewCertificates,
}: CredentialOverviewProps) {
  const isVerified = certifiedCount > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <section className="rounded-2xl border border-surface-border bg-canvas p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-muted">Learner</p>
            <h3 className="mt-1 font-serif italic text-3xl text-ink leading-tight truncate">{displayName}</h3>
            <p className="mt-1 text-sm text-ink-muted truncate">{email || "Guest"}</p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full border text-xs font-semibold",
              isVerified
                ? "bg-success-light border-success-border text-success"
                : "bg-surface border-surface-border text-ink-secondary"
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", isVerified ? "bg-success" : "bg-ink-subtle")} />
            {isVerified ? "Verified learner" : "Member"}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl border border-surface-border bg-surface-border">
          <Stat icon="stars-minimalistic-linear" label="Level" value={rankTier} hint={rank} />
          <Stat icon="clock-circle-linear" label="Practice" value={formatMinutes(practiceMinutes)} hint="Steps completed" />
          <Stat icon="diploma-verified-linear" label="Certificates" value={certifiedCount} hint="Earned" />
          <Stat
            icon="cup-first-linear"
            label="Completed"
            value={masteredCount}
            hint={masteredCount === 1 ? "Skill" : "Skills"}
          />
        </dl>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="secondary" size="sm" onClick={onPrint}>
          <AppIcon name="printer-2-linear" className="w-4 h-4" />
          <span>Print</span>
        </Button>
        <Button onClick={onViewCertificates}>
          <span>See certificates ({certifiedCount})</span>
          <AppIcon name="arrow-right-linear" className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
