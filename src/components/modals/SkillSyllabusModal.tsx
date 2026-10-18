"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { Skill, SkillStep } from "@/types/database";
import { getCategoryStyle, getSkillProgress } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";
import { Button, buttonClasses } from "../ui/Button";
import { AppIcon } from "../ui/AppIcon";
import { LearningPath, PlanEditor, ReworkDirection, WatchRequest, formatMinutes } from "../learning";
import { VideoPlayerModal } from "./VideoPlayerModal";

interface SkillSyllabusModalProps {
  skill: Skill | null;
  completedStepIds?: string[];
  onToggleStep?: (stepId: string) => void;
  onClose: () => void;
  isViewOnly?: boolean;
  isGuildCertified?: boolean;
  onOpenGuildExam?: (skill: Skill) => void;
  /** In previews, adds the skill instead of sending the visitor to sign up. */
  onAdd?: (skill: Skill) => void;
  getNote?: (stepId: string) => string;
  /** The skill is the learner's own copy, so it can be edited directly. */
  canEdit?: boolean;
  /** Makes a personal copy of a skill the learner doesn't own. */
  onCustomise?: (skill: Skill) => void;
  /** Saves an edited personal copy. */
  onSaveEdits?: (skill: Skill) => Promise<void> | void;
  /** Asks Archimedes for an easier or harder version of one step. */
  onReworkStep?: (skill: Skill, step: SkillStep, direction: ReworkDirection) => Promise<SkillStep | null>;
  /** Open straight into edit mode (right after customising). */
  startEditing?: boolean;
}

export function SkillSyllabusModal({
  skill,
  completedStepIds = [],
  onToggleStep,
  onClose,
  isViewOnly = false,
  isGuildCertified = false,
  onOpenGuildExam,
  onAdd,
  getNote,
  canEdit = false,
  onCustomise,
  onSaveEdits,
  onReworkStep,
  startEditing = false,
}: SkillSyllabusModalProps) {
  const titleId = useId();
  const [activeVideo, setActiveVideo] = useState<WatchRequest | null>(null);
  const [mode, setMode] = useState<"view" | "confirm-copy" | "edit">(startEditing && canEdit ? "edit" : "view");
  const [draft, setDraft] = useState<SkillStep[]>(() => skill?.steps || []);
  const [saving, setSaving] = useState(false);
  const [busyStepId, setBusyStepId] = useState<string | null>(null);

  if (!skill) return null;

  const startEdit = () => {
    setDraft(skill.steps || []);
    setMode("edit");
  };
  const saveEdits = async () => {
    if (!onSaveEdits || draft.length === 0) return;
    setSaving(true);
    try {
      await onSaveEdits({ ...skill, steps: draft, steps_count: draft.length });
      setMode("view");
    } finally {
      setSaving(false);
    }
  };
  const rework = async (step: SkillStep, direction: ReworkDirection) => {
    if (!onReworkStep) return;
    setBusyStepId(step.id);
    try {
      const rewritten = await onReworkStep(skill, step, direction);
      if (rewritten) setDraft((prev) => prev.map((s) => (s.id === step.id ? { ...rewritten, id: s.id, step_number: s.step_number } : s)));
    } finally {
      setBusyStepId(null);
    }
  };
  const draftChanged = JSON.stringify(draft) !== JSON.stringify(skill.steps || []);

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

        {!isViewOnly && mode === "view" && canEdit && onSaveEdits && (
          <Button size="sm" variant="secondary" className="mt-4" onClick={startEdit}>
            <AppIcon name="pen-new-square-linear" className="w-3.5 h-3.5" />
            <span>Edit plan</span>
          </Button>
        )}
        {!isViewOnly && mode === "view" && !canEdit && onCustomise && !isGuildCertified && (
          <Button size="sm" variant="secondary" className="mt-4" onClick={() => setMode("confirm-copy")}>
            <AppIcon name="pen-new-square-linear" className="w-3.5 h-3.5" />
            <span>Customise</span>
          </Button>
        )}
        {mode === "confirm-copy" && onCustomise && (
          <div className="mt-4 p-4 rounded-2xl bg-white border border-surface-border" role="group" aria-label="Customise this plan">
            <p className="text-sm text-ink">
              This makes your own copy of the plan that only you can change. Your progress and notes carry over.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onCustomise(skill)}>
                Make my copy
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setMode("view")}>
                Cancel
              </Button>
            </div>
          </div>
        )}

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
        {mode === "edit" ? (
          <PlanEditor
            steps={draft}
            onChange={setDraft}
            onRework={onReworkStep ? rework : undefined}
            busyStepId={busyStepId}
          />
        ) : (
        <LearningPath
          skill={skill}
          completedStepIds={completedStepIds}
          isPreview={isViewOnly}
          onToggleStep={isViewOnly ? undefined : onToggleStep}
          onWatch={setActiveVideo}
          isCertified={isGuildCertified}
          onOpenAssessment={onOpenGuildExam ? () => onOpenGuildExam(skill) : undefined}
          getNote={getNote}
        />
        )}
      </div>

      {mode === "edit" && (
        <div className="p-4 sm:p-5 bg-canvas border-t border-surface-border flex items-center justify-between gap-3">
          <span className="text-xs text-ink-muted">
            {draft.length} {draft.length === 1 ? "step" : "steps"} · only you see this plan
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setMode("view")} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveEdits} disabled={saving || !draftChanged || draft.length === 0 || !!busyStepId}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Only previews need a footer: start the skill. The close button sits in the header. */}
      {isViewOnly && (
        <div className="p-4 sm:p-5 bg-canvas border-t border-surface-border flex items-center justify-between gap-3">
          <span className="text-xs text-ink-muted">
            {onAdd ? "You can remove it from your Studio any time." : "Sign up to track your progress."}
          </span>
          {onAdd ? (
            <button type="button" onClick={() => onAdd(skill)} className={buttonClasses({ size: "sm" })}>
              Add to Studio
            </button>
          ) : (
            <Link href="/signup" className={buttonClasses({ size: "sm" })}>
              Start this skill
            </Link>
          )}
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
