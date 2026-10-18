"use client";

import React, { useState, useId } from "react";
import { Skill } from "@/types/database";
import { User } from "@supabase/supabase-js";
import { EmptyState } from "../ui/EmptyState";
import { SegmentedControl } from "../ui/SegmentedControl";
import { PracticeShell } from "../practice/PracticeShell";
import { CertificateCard, CredentialOverview } from "../certificates";
import type { CertificateShare } from "@/hooks/useCertificates";
import { playMechanicalClick, playWoodenThud, playStampThud } from "@/lib/workbench-audio";
import { isStepCompleted, normalizeSkillId } from "@/lib/catalog-data";

interface MasteryPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  enrolledSkills: Skill[];
  completedStepIds: string[];
  certifiedSkillIds?: string[];
  onOpenExam?: (skill: Skill) => void;
  getShare?: (skillId: string) => CertificateShare | undefined;
  onToggleShare?: (skill: Skill, isPublic: boolean) => Promise<boolean>;
}

type PassportTab = "credential" | "visas";

export function MasteryPassportModal({
  isOpen,
  onClose,
  user,
  enrolledSkills,
  completedStepIds,
  certifiedSkillIds = [],
  onOpenExam,
  getShare,
  onToggleShare,
}: MasteryPassportModalProps) {
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<PassportTab>("credential");

  if (!isOpen) return null;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Explorer";

  const masteredSkills = enrolledSkills.filter((s) => {
    const steps = s.steps || [];
    return steps.length > 0 && steps.every((st) => isStepCompleted(st.id, completedStepIds));
  });

  const totalHours = enrolledSkills.reduce((acc, s) => {
    const steps = s.steps || [];
    const doneSteps = steps.filter((st) => isStepCompleted(st.id, completedStepIds));
    const stepHours = doneSteps.reduce((sub, st) => sub + st.estimated_minutes / 60, 0);
    return acc + stepHours;
  }, 0);

  const certifiedCount = enrolledSkills.filter((s) =>
    certifiedSkillIds.includes(normalizeSkillId(s.id))
  ).length;

  const rank =
    certifiedCount >= 3 || masteredSkills.length >= 3
      ? "Advanced practitioner"
      : certifiedCount >= 1 || masteredSkills.length >= 1
      ? "Intermediate practitioner"
      : "Active learner";

  const rankTier =
    certifiedCount >= 3 || masteredSkills.length >= 3 ? "Tier III" : certifiedCount >= 1 || masteredSkills.length >= 1 ? "Tier II" : "Tier I";

  const handlePrint = () => {
    playStampThud();
    window.print();
  };

  return (
    <PracticeShell
      titleId={titleId}
      icon="diploma-verified-linear"
      eyebrow={<span>Credential SK-{user?.id ? user.id.slice(0, 6).toUpperCase() : "882190"}</span>}
      title="Certificates"
      onClose={onClose}
      className="text-ink select-none"
      headerActions={
        <SegmentedControl<PassportTab>
          size="sm"
          label="Certificates view"
          layoutId="passportActiveTab"
          value={activeTab}
          onChange={(tab) => {
            playMechanicalClick();
            setActiveTab(tab);
          }}
          options={[
            { value: "credential", label: "Overview" },
            { value: "visas", label: `Certificates (${certifiedCount})` },
          ]}
        />
      }
    >
      {activeTab === "credential" ? (
        <CredentialOverview
          displayName={displayName}
          email={user?.email}
          rank={rank}
          rankTier={rankTier}
          practiceMinutes={Math.round(totalHours * 60)}
          certifiedCount={certifiedCount}
          masteredCount={masteredSkills.length}
          onPrint={handlePrint}
          onViewCertificates={() => {
            playWoodenThud();
            setActiveTab("visas");
          }}
        />
      ) : enrolledSkills.length === 0 ? (
        <EmptyState
          icon="diploma-verified-linear"
          title="No skills yet"
          description="Ask Archimedes to add a skill. Your certificates will appear here."
        />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-[15px] text-ink-secondary max-w-md">
              Finish every step of a skill to unlock its assessment and certificate.
            </p>
            <span className="text-xs font-semibold text-ink-muted tabular-nums">
              {certifiedCount} of {enrolledSkills.length} certified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledSkills.map((skill) => {
              const steps = skill.steps || [];
              return (
                <CertificateCard
                  key={skill.id}
                  skill={skill}
                  doneCount={steps.filter((s) => isStepCompleted(s.id, completedStepIds)).length}
                  totalCount={steps.length}
                  isCertified={certifiedSkillIds.includes(normalizeSkillId(skill.id))}
                  onOpenExam={onOpenExam}
                  share={getShare?.(skill.id)}
                  onToggleShare={onToggleShare}
                />
              );
            })}
          </div>
        </div>
      )}
    </PracticeShell>
  );
}
