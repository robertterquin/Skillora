"use client";

import React, { useState, useEffect, useId } from "react";
import { Skill, SkillStep } from "@/types/database";
import { playMechanicalClick } from "@/lib/workbench-audio";
import { isStepCompleted } from "@/lib/catalog-data";
import { getCategoryStyle, getSkillProgress } from "@/lib/skill-progress";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { SegmentedControl } from "../ui/SegmentedControl";
import { LearningPath, WatchRequest } from "../learning";
import {
  PracticeHelpers,
  PracticeShell,
  PronunciationTools,
  StepCard,
  StepNote,
  StepIndicator,
  useSpeech,
} from "../practice";
import { VideoPlayerModal } from "./VideoPlayerModal";

export interface SkillPracticeModalProps {
  skill: Skill | null;
  completedStepIds: string[];
  onToggleStep: (stepId: string) => void;
  onClose: () => void;
  isGuildCertified?: boolean;
  onOpenGuildExam?: (skill: Skill) => void;
  getNote?: (stepId: string) => string;
  onSaveNote?: (stepId: string, text: string) => void;
  onFocusComplete?: () => void;
  initialStepId?: string;
}

type PracticeView = "practice" | "path";

function isLanguage(skill: Skill): boolean {
  return (
    skill.category_id === "cat-language" ||
    skill.category_id === "22222222-2222-2222-2222-222222222222" ||
    skill.slug.includes("cyrillic") ||
    skill.slug.includes("language")
  );
}

function pronunciationSample(step: SkillStep, languageSkill: boolean): string {
  return languageSkill
    ? step.title.replace(/The True Friends|The False Friends|The Greek Siblings/g, "").trim()
    : step.title;
}

export function SkillPracticeModal({
  skill,
  completedStepIds,
  onToggleStep,
  onClose,
  isGuildCertified = false,
  onOpenGuildExam,
  getNote,
  onSaveNote,
  onFocusComplete,
  initialStepId,
}: SkillPracticeModalProps) {
  const titleId = useId();
  const [view, setView] = useState<PracticeView>("practice");
  const [index, setIndex] = useState(() => {
    const steps = skill?.steps || [];
    const requested = initialStepId ? steps.findIndex((s) => s.id === initialStepId) : -1;
    if (requested !== -1) return requested;
    const next = steps.findIndex((s) => !isStepCompleted(s.id, completedStepIds));
    return next === -1 ? 0 : next;
  });
  const [showNotes, setShowNotes] = useState(false);
  const [activeVideo, setActiveVideo] = useState<WatchRequest | null>(null);

  const languageSkill = skill ? isLanguage(skill) : false;
  const { speak, isSpeaking } = useSpeech(languageSkill ? "ru-RU" : "en-US", index);

  useEffect(() => setShowNotes(false), [index]);

  if (!skill) return null;
  const steps = skill.steps || [];
  const step = steps[index];
  if (!step) return null;

  const category = getCategoryStyle(skill);
  const { isComplete } = getSkillProgress(skill, completedStepIds);
  const isDone = isStepCompleted(step.id, completedStepIds);
  const note = getNote?.(step.id) ?? "";

  const goTo = (next: number) => {
    playMechanicalClick();
    setIndex(Math.max(0, Math.min(steps.length - 1, next)));
  };

  const openAssessment = onOpenGuildExam
    ? () => {
        onClose();
        onOpenGuildExam(skill);
      }
    : undefined;

  return (
    <PracticeShell
      titleId={titleId}
      icon="book-bookmark-linear"
      title={skill.title}
      eyebrow={
        <>
          <span className={category.text}>{category.label}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{skill.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span>{skill.time_commitment_label}</span>
        </>
      }
      onClose={onClose}
      headerActions={
        <SegmentedControl<PracticeView>
          label="Practice view"
          layoutId="practiceView"
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: "practice", label: "Practice" },
            { value: "path", label: "Path" },
          ]}
        />
      }
      indicator={
        view === "practice" ? (
          <StepIndicator
            total={steps.length}
            current={index}
            isDone={(i) => isStepCompleted(steps[i].id, completedStepIds)}
            fillClass={category.fill}
            onSelect={goTo}
          />
        ) : undefined
      }
      footer={
        <>
          <div className="flex items-center gap-2 sm:ml-auto">
            {openAssessment && isComplete && (
              <Button size="sm" variant={isGuildCertified ? "secondary" : "accent"} onClick={openAssessment}>
                <AppIcon name="diploma-verified-linear" className="w-3.5 h-3.5" />
                <span>{isGuildCertified ? "View certificate" : "Take assessment"}</span>
              </Button>
            )}
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </>
      }
    >
      {view === "practice" ? (
        <div className="flex flex-col items-center gap-4">
          {languageSkill && (
            <PronunciationTools
              key={`voice-${step.id}`}
              sample={pronunciationSample(step, languageSkill)}
              language={languageSkill ? "ru" : "en"}
              isSpeaking={isSpeaking}
              onSpeak={(text) => speak(text)}
            />
          )}

          <StepCard
            skill={skill}
            step={step}
            isDone={isDone}
            showNotes={showNotes}
            onToggleNotes={() => setShowNotes((v) => !v)}
            onToggleDone={() => onToggleStep(step.id)}
            onSpeak={speak}
            onWatch={setActiveVideo}
            note={note}
            onFocusComplete={onFocusComplete}
          />

          {onSaveNote && (isDone || note) && (
            <StepNote key={`note-${step.id}`} note={note} onSave={(text) => onSaveNote(step.id, text)} />
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" disabled={index === 0} onClick={() => goTo(index - 1)}>
              <AppIcon name="arrow-left-linear" className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>
            <Button size="sm" disabled={index === steps.length - 1} onClick={() => goTo(index + 1)}>
              <span>Next step</span>
              <AppIcon name="arrow-right-linear" className="w-3.5 h-3.5" />
            </Button>
          </div>

          <PracticeHelpers key={`help-${step.id}`} skill={skill} step={step} learnerNote={note} />
        </div>
      ) : (
        <LearningPath
          skill={skill}
          completedStepIds={completedStepIds}
          onToggleStep={onToggleStep}
          onPractiseStep={(i) => {
            setIndex(i);
            setView("practice");
          }}
          onWatch={setActiveVideo}
          isCertified={isGuildCertified}
          onOpenAssessment={openAssessment}
          getNote={getNote}
        />
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
    </PracticeShell>
  );
}
