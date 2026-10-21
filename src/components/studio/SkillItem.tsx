"use client";

import React from "react";
import { motion } from "motion/react";
import { Skill } from "@/types/database";
import { getCategoryStyle, getSkillProgress } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";

export interface SkillItemProps {
  skill: Skill;
  completedStepIds: string[];
  isCertified: boolean;
  isConfirmingRemove: boolean;
  onPractice: () => void;
  onViewSteps: () => void;
  onAssessment: () => void;
  onRequestRemove: () => void;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
}

function RemoveControl({
  skill,
  isConfirming,
  onRequest,
  onConfirm,
  onCancel,
}: {
  skill: Skill;
  isConfirming: boolean;
  onRequest: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (isConfirming) {
    return (
      <div className="flex items-center gap-1" role="group" aria-label={`Remove ${skill.title}?`}>
        <Button size="sm" variant="danger" onClick={onConfirm}>
          Remove
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }
  return (
    <IconButton
      icon="trash-bin-trash-linear"
      variant="ghost"
      size="sm"
      label={`Remove ${skill.title} from Studio`}
      title="Remove from Studio"
      className="hover:text-danger hover:bg-danger-light"
      onClick={onRequest}
    />
  );
}

function Meta({ skill }: { skill: Skill }) {
  const category = getCategoryStyle(skill);
  const isCustomAi = skill.id.startsWith("ai-skill-");
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
      <span className={cn("inline-flex items-center gap-1.5 font-semibold", category.text)}>
        <span className={cn("w-1.5 h-1.5 rounded-full", category.fill)} aria-hidden="true" />
        {category.label}
      </span>
      <span aria-hidden="true">·</span>
      <span>{skill.estimated_hours}h</span>
      {isCustomAi && <Badge>AI</Badge>}
    </div>
  );
}

function ProgressBar({ skill, percent }: { skill: Skill; percent: number }) {
  const category = getCategoryStyle(skill);
  return (
    <div
      className="h-1 w-full rounded-full bg-surface-muted overflow-hidden"
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
  );
}

function AssessmentButton({ isCertified, onClick, block }: { isCertified: boolean; onClick: () => void; block?: boolean }) {
  return (
    <Button size="sm" block={block} variant={isCertified ? "secondary" : "accent"} onClick={onClick}>
      <AppIcon name="diploma-verified-linear" className="w-3.5 h-3.5" />
      <span>{isCertified ? "View certificate" : "Take assessment"}</span>
    </Button>
  );
}

export function SkillRow(props: SkillItemProps) {
  const { skill, completedStepIds, isCertified } = props;
  const { doneCount, totalCount, percent, isComplete } = getSkillProgress(skill, completedStepIds);

  return (
    <div className="group py-4 flex flex-col md:flex-row md:items-center gap-4">
      <div className="min-w-0 flex-1">
        <Meta skill={skill} />
        <button
          type="button"
          onClick={props.onPractice}
          className="mt-1 block max-w-full text-left font-serif italic text-lg sm:text-xl text-ink hover:text-accent-vermilion transition-colors truncate cursor-pointer"
        >
          {skill.title}
        </button>
        <p className="text-sm text-ink-muted line-clamp-1 max-w-2xl">{skill.summary}</p>
      </div>

      <div className="flex items-center gap-4 md:gap-5 justify-between md:justify-end shrink-0">
        <div className="w-32 sm:w-40">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-ink-muted">
              {isCertified ? (
                <span className="inline-flex items-center gap-1 text-success font-semibold">
                  <AppIcon name="diploma-verified-linear" className="w-3.5 h-3.5" />
                  Certified
                </span>
              ) : isComplete ? (
                "Complete"
              ) : (
                `${doneCount} of ${totalCount}`
              )}
            </span>
          </div>
          <ProgressBar skill={skill} percent={percent} />
        </div>

        <div className="flex items-center gap-1.5">
          {isComplete && <AssessmentButton isCertified={isCertified} onClick={props.onAssessment} />}
          <Button size="sm" variant={isComplete ? "secondary" : "primary"} onClick={props.onPractice}>
            {isComplete ? "Review" : "Practice"}
          </Button>
          <IconButton
            icon="layers-minimalistic-linear"
            size="sm"
            variant="ghost"
            label={`View steps for ${skill.title}`}
            title="View steps"
            onClick={props.onViewSteps}
          />
          <RemoveControl
            skill={skill}
            isConfirming={props.isConfirmingRemove}
            onRequest={props.onRequestRemove}
            onConfirm={props.onConfirmRemove}
            onCancel={props.onCancelRemove}
          />
        </div>
      </div>
    </div>
  );
}

export function SkillCard(props: SkillItemProps) {
  const { skill, completedStepIds, isCertified } = props;
  const { doneCount, totalCount, percent, isComplete } = getSkillProgress(skill, completedStepIds);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex flex-col p-5 sm:p-6 bg-white rounded-2xl border border-surface-border shadow-2xs hover:border-brand-300 hover:shadow-card transition-[border-color,box-shadow]"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Meta skill={skill} />
        <RemoveControl
          skill={skill}
          isConfirming={props.isConfirmingRemove}
          onRequest={props.onRequestRemove}
          onConfirm={props.onConfirmRemove}
          onCancel={props.onCancelRemove}
        />
      </div>

      <h3 className="font-serif italic text-xl sm:text-2xl text-ink leading-tight">{skill.title}</h3>
      <p className="mt-1.5 text-sm text-ink-muted line-clamp-2">{skill.summary}</p>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="text-ink-muted">
            {isCertified ? (
              <span className="inline-flex items-center gap-1 text-success font-semibold">
                <AppIcon name="diploma-verified-linear" className="w-3.5 h-3.5" />
                Certified
              </span>
            ) : (
              `${doneCount} of ${totalCount} steps`
            )}
          </span>
        </div>
        <ProgressBar skill={skill} percent={percent} />

        <div className="mt-4 flex items-center gap-2">
          <Button className="flex-1" variant={isComplete ? "secondary" : "primary"} onClick={props.onPractice}>
            <AppIcon name="play-linear" className="w-4 h-4" />
            <span>{isComplete ? "Review" : "Practice"}</span>
          </Button>
          <IconButton
            icon="layers-minimalistic-linear"
            size="lg"
            label={`View steps for ${skill.title}`}
            title="View steps"
            onClick={props.onViewSteps}
          />
        </div>
        {isComplete && (
          <div className="mt-2">
            <AssessmentButton block isCertified={isCertified} onClick={props.onAssessment} />
          </div>
        )}
      </div>
    </motion.article>
  );
}
