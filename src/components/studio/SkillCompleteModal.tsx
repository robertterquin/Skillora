"use client";

import React, { useId } from "react";
import { motion } from "motion/react";
import { Skill } from "@/types/database";
import { getCategoryStyle } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { formatMinutes } from "../learning";

interface SkillCompleteModalProps {
  skill: Skill;
  isCertified: boolean;
  onTakeAssessment: () => void;
  onClose: () => void;
}

/** The moment every step of a skill is done; points the learner at the certificate. */
export function SkillCompleteModal({ skill, isCertified, onTakeAssessment, onClose }: SkillCompleteModalProps) {
  const titleId = useId();
  const category = getCategoryStyle(skill);
  const steps = skill.steps || [];
  const minutes = steps.reduce((sum, s) => sum + (Number(s.estimated_minutes) || 0), 0);

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="max-w-md bg-white border border-surface-border">
      <div className="p-8 text-center">
        <div className="relative mx-auto w-20 h-20">
          <motion.span
            aria-hidden="true"
            className={cn("absolute inset-0 rounded-full", category.soft)}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.35, 1.2], opacity: [0, 1, 1] }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
          <motion.span
            className={cn("relative flex w-20 h-20 items-center justify-center rounded-full text-white", category.fill)}
            initial={{ scale: 0.5, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.1 }}
          >
            <AppIcon name="cup-first-linear" className="w-9 h-9" />
          </motion.span>
        </div>

        <p className={cn("mt-6 text-xs font-semibold", category.text)}>{category.label} · Skill complete</p>
        <h2 id={titleId} className="mt-1 font-serif italic text-3xl text-ink leading-tight">
          {skill.title}
        </h2>
        <p className="mt-3 text-[15px] text-ink-secondary leading-relaxed">
          You finished all {steps.length} steps
          {minutes > 0 && <> &middot; about {formatMinutes(minutes)} of practice</>}.{" "}
          {isCertified
            ? "Your certificate for this skill is already saved."
            : "Take the short assessment to earn your certificate."}
        </p>

        <div className="mt-7 flex flex-col gap-2">
          <Button size="lg" block variant={isCertified ? "primary" : "accent"} onClick={onTakeAssessment}>
            <AppIcon name="diploma-verified-linear" className="w-4 h-4" />
            <span>{isCertified ? "View certificate" : "Take the assessment"}</span>
          </Button>
          <Button size="lg" block variant="ghost" onClick={onClose}>
            {isCertified ? "Close" : "Later"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
