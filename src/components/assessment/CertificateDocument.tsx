"use client";

import React from "react";
import { Skill } from "@/types/database";
import { CategoryStyle } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";

interface CertificateDocumentProps {
  skill: Skill;
  category: CategoryStyle;
  userName: string;
  honorific: string;
  issuedOn: string;
  /** The certificate's own credential number, when it has one (signed-in learners). */
  credentialId?: string;
}

function Signature({ value, label, align }: { value: React.ReactNode; label: string; align: "left" | "right" }) {
  return (
    <div className={cn("min-w-[160px]", align === "right" ? "sm:text-right" : "sm:text-left")}>
      <div className="font-serif italic text-base text-ink pb-1.5 border-b border-surface-border">{value}</div>
      <div className="pt-1.5 text-xs text-ink-muted">{label}</div>
    </div>
  );
}

/** The printable certificate of mastery. */
export function CertificateDocument({ skill, category, userName, honorific, issuedOn, credentialId }: CertificateDocumentProps) {
  return (
    <div
      id="guild-diploma-print-area"
      className="relative overflow-hidden rounded-3xl bg-paper border-4 border-double border-warning-strong/30 p-8 sm:p-12 text-center print:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-surface-border text-xs text-ink-muted">
        <span className="font-semibold">Skillora</span>
        <span className="tabular-nums">Credential {credentialId ?? `SK-${skill.id.slice(0, 6).toUpperCase()}`}</span>
      </div>

      <p className={cn("mt-8 text-xs font-semibold", category.text)}>{category.label}</p>
      <h1 className="mt-1 font-serif italic text-3xl sm:text-4xl text-ink leading-tight">Certificate of mastery</h1>

      <div className="my-8 space-y-3 max-w-lg mx-auto">
        <p className="text-sm text-ink-muted">This certifies that</p>
        <p className="inline-block px-8 pb-2 border-b-2 border-ink/20 font-serif font-semibold text-2xl sm:text-3xl text-ink">
          {userName}
        </p>
        <p className="pt-1 text-[15px] text-ink-secondary leading-relaxed">
          completed every step of the curriculum and showed practical skill in
        </p>
        <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">{skill.title}</h2>
        <p className="pt-2 text-sm text-ink-muted">and has earned the title</p>
        <p className="inline-block px-4 py-1.5 rounded-xl bg-surface border border-surface-border font-display font-semibold text-base sm:text-lg text-ink">
          {honorific}
        </p>
      </div>

      <div className="mt-10 pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-6">
        <Signature value="Archimedes of Syracuse" label="Instructor, Skillora" align="left" />

        <div aria-hidden="true" className="flex flex-col items-center gap-1.5">
          <span className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xs", category.fill)}>
            <AppIcon name="diploma-verified-linear" className="w-7 h-7" />
          </span>
          <span className="text-xs font-semibold text-ink-muted">Verified</span>
        </div>

        <Signature value={<span className="not-italic font-sans text-sm font-semibold">{issuedOn}</span>} label="Date issued" align="right" />
      </div>
    </div>
  );
}
