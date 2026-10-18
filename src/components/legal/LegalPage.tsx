import React from "react";
import Link from "next/link";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/legal";

/** Shared layout for the Privacy Policy and Terms. Server-rendered, no client JS. */
export function LegalPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 bg-canvas text-ink">
      <main id="main" className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-xs font-semibold text-ink-muted">Last updated {LEGAL_UPDATED}</p>
        <h1 className="mt-2 font-serif italic text-4xl sm:text-5xl leading-tight">{title}</h1>
        <p className="mt-4 text-[17px] text-ink-secondary leading-relaxed">{intro}</p>
        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-ink-secondary [&_h2]:font-display [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:text-ink [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_p+p]:mt-3 [&_p+ul]:mt-3 [&_ul+p]:mt-3 [&_strong]:text-ink [&_strong]:font-semibold">
          {children}
        </div>
        <nav aria-label="Legal" className="mt-14 pt-6 border-t border-surface-border flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/privacy" className="font-semibold text-ink underline underline-offset-2">
            Privacy Policy
          </Link>
          <Link href="/terms" className="font-semibold text-ink underline underline-offset-2">
            Terms of Service
          </Link>
          <Link href="/" className="text-ink-muted hover:text-ink">
            Back to Skillora
          </Link>
        </nav>
      </main>
    </div>
  );
}

/** How to reach us. Until NEXT_PUBLIC_CONTACT_EMAIL is set, says so plainly rather than pointing nowhere. */
export function ContactLine({ topic }: { topic: string }) {
  return CONTACT_EMAIL ? (
    <p>
      For {topic}, email{" "}
      <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-ink underline underline-offset-2">
        {CONTACT_EMAIL}
      </a>
      .
    </p>
  ) : (
    <p>A contact email for {topic} will be published on this page shortly.</p>
  );
}
