"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { Skill } from "@/types/database";
import { getCategoryStyle, getSkillProgress } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";
import { buttonClasses } from "../ui/Button";
import { LearningPath, WatchRequest, formatMinutes } from "../learning";
import { VideoPlayerModal } from "./VideoPlayerModal";

interface SkillSyllabusModalProps {
  skill: Skill | null;
  completedStepIds?: string[];
  onToggleStep?: (stepId: string) => void;
  onClose: () => void;
  isViewOnly?: boolean;
  isGuildCertified?: boolean;
  onOpenGuildExam?: (skill: Skill) => void;
}

export function SkillSyllabusModal({
  skill,
  completedStepIds = [],
  onToggleStep,
  onClose,
  isViewOnly = false,
  isGuildCertified = false,
  onOpenGuildExam,
}: SkillSyllabusModalProps) {
  const titleId = useId();
  const [activeVideo, setActiveVideo] = useState<WatchRequest | null>(null);

  if (!skill) return null;

  const category = getCategoryStyle(skill);
  const { steps, doneCount, totalCount, percent } = getSkillProgress(skill, completedStepIds);
  const totalMinutes = steps.reduce((sum, s) => sum + (Number(s.estimated_minutes) || 0), 0);

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="max-w-2xl bg-white border border-surface-border flex flex-col max-h-[92vh]">
      <div className="p-6 sm:p-8 bg-canvas border-b border-surface-border">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 text-xs text-ink-muted">
              <span className={cn("inline-flex items-center gap-1.5 font-semibold", category.text)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", category.fill)} aria-hidden="true" />
                {category.label}
              </span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{skill.difficulty}</span>
              {isViewOnly && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{totalCount} steps</span>
                </>
              )}
              {totalMinutes > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>about {formatMinutes(totalMinutes)}</span>
                </>
              )}
            </div>
            <h2 id={titleId} className="font-serif italic font-normal text-3xl sm:text-4xl text-ink leading-tight">
              {skill.title}
            </h2>
          </div>
          <IconButton icon="close" label="Close" variant="ghost" onClick={onClose} />
        </div>

        <p className="mt-3 text-sm text-ink-secondary leading-relaxed max-w-prose">{skill.summary}</p>

        {!isViewOnly && totalCount > 0 && (
          <div className="mt-5">
            <p className="mb-1.5 text-xs text-ink-muted">
              {doneCount} of {totalCount} steps done
            </p>
            <div
              className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label={`${skill.title} progress`}
            >
              <div
                className={cn("h-full rounded-full transition-all duration-500", category.fill)}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
        <LearningPath
          skill={skill}
          completedStepIds={completedStepIds}
          isPreview={isViewOnly}
          onToggleStep={isViewOnly ? undefined : onToggleStep}
          onWatch={setActiveVideo}
          isCertified={isGuildCertified}
          onOpenAssessment={onOpenGuildExam ? () => onOpenGuildExam(skill) : undefined}
        />
      </div>

      {/* Only previews need a footer: the sign-up prompt. The close button sits in the header. */}
      {isViewOnly && (
        <div className="p-4 sm:p-5 bg-canvas border-t border-surface-border flex items-center justify-between gap-3">
          <span className="text-xs text-ink-muted">Sign up to track your progress.</span>
          <Link href="/signup" className={buttonClasses({ size: "sm" })}>
            Start this skill
          </Link>
        </div>
      )}

      {activeVideo && (
        <VideoPlayerModal
          isOpen
          onClose={() => setActiveVideo(null)}
          videoUrl={activeVideo.url}
          title={activeVideo.title}
          stepTitle={activeVideo.stepTitle}
        />
      )}
    </Modal>
  );
}
