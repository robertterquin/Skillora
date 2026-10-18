"use client";

import React, { useId } from "react";
import { Skill } from "@/types/database";
import type { CertificateShare } from "@/hooks/useCertificates";
import { credentialId } from "@/lib/credential";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";
import { useToast } from "../ui/Toast";

export function certificateUrl(token: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/c/${token}`;
}

/** LinkedIn's "Add to profile" form, pre-filled with this certificate. */
function linkedInUrl(skill: Skill, share: CertificateShare): string {
  const issued = share.certifiedAt ? new Date(share.certifiedAt) : new Date();
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${skill.title} — Certificate of mastery`,
    organizationName: "Skillora",
    issueYear: String(issued.getFullYear()),
    issueMonth: String(issued.getMonth() + 1),
    certUrl: certificateUrl(share.token),
    certId: credentialId(share.token),
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

interface ShareCertificateProps {
  skill: Skill;
  share: CertificateShare;
  onToggle: (isPublic: boolean) => Promise<boolean>;
}

/** Public-link switch, copy link and Add to LinkedIn for one certificate. */
export function ShareCertificate({ skill, share, onToggle }: ShareCertificateProps) {
  const id = useId();
  const toast = useToast();

  const toggle = async (next: boolean) => {
    const ok = await onToggle(next);
    toast(
      ok
        ? { message: next ? "Public link is on" : "Public link is off. The old link no longer works.", tone: "info" }
        : { message: "Couldn't change sharing. Please try again.", tone: "danger" }
    );
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(certificateUrl(share.token));
      toast({ message: "Link copied" });
    } catch {
      toast({ message: certificateUrl(share.token), tone: "info", duration: 8000 });
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-surface-border">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p id={`${id}-label`} className="text-sm font-medium text-ink">
            Public link
          </p>
          <p id={`${id}-desc`} className="text-xs text-ink-muted">
            Shows your name, the skill and the date.
          </p>
        </div>
        <Switch checked={share.isPublic} onChange={toggle} labelledBy={`${id}-label`} describedBy={`${id}-desc`} />
      </div>
      {share.isPublic && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={copy}>
            <AppIcon name="document-text-linear" className="w-3.5 h-3.5" />
            <span>Copy link</span>
          </Button>
          <a
            href={linkedInUrl(skill, share)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold bg-surface text-ink border border-surface-border hover:border-brand-300 transition"
          >
            <AppIcon name="square-arrow-right-up-linear" className="w-3.5 h-3.5" />
            <span>Add to LinkedIn</span>
          </a>
          <a
            href={certificateUrl(share.token)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center h-8 px-2 text-xs font-medium text-ink-muted hover:text-ink underline underline-offset-2"
          >
            Preview
          </a>
        </div>
      )}
    </div>
  );
}
