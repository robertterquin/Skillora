"use client";

import React, { useState } from "react";
import { Skill, SkillStep } from "@/types/database";
import { getDisciplinePracticeProfile } from "@/lib/discipline-practice";
import { aiService } from "@/services/aiService";
import { AppIcon } from "../ui/AppIcon";
import { IconButton } from "../ui/IconButton";
import { buttonClasses } from "../ui/Button";

type PracticeProfile = ReturnType<typeof getDisciplinePracticeProfile>;

interface CoachAdvice {
  diagnosis: string;
  muscleMemoryCue: string;
  actionableDrill: string;
}

interface Mnemonic {
  visualMnemonic: string;
  physicalAnchor: string;
  ruleOfThumb: string;
}

function fallbackAdvice(profile: PracticeProfile): CoachAdvice {
  return profile.disciplineCategory === "coding"
    ? {
        diagnosis: "Double-check your syntax indentation, variable scopes, and argument data types.",
        muscleMemoryCue: "Write the function contract first: verify expected inputs vs output before implementing.",
        actionableDrill: "Write 3 test print() statements with edge cases (empty input, zero, negative value).",
      }
    : {
        diagnosis: "Focus on relaxing physical tension in the wrist and shoulders.",
        muscleMemoryCue: "Feel the feather-light anchor of your fingers before actuation.",
        actionableDrill: "Repeat the motion at 50% speed for 2 minutes with eyes closed.",
      };
}

function fallbackMnemonic(profile: PracticeProfile): Mnemonic {
  return profile.disciplineCategory === "coding"
    ? {
        visualMnemonic: "Think of this function as a postal conveyor belt: inputs get unpacked, stamped, and dispatched.",
        physicalAnchor: "Inputs on the left, pure transformation in the middle, return value on the right.",
        ruleOfThumb: "Pure inputs in, predictable output out.",
      }
    : {
        visualMnemonic: "Imagine the shape as a physical key sliding smoothly into a lock.",
        physicalAnchor: "Feel the pressure anchor at the tip of your thumb.",
        ruleOfThumb: "Slow is smooth, smooth is fast.",
      };
}

function HelperPanel({
  icon,
  title,
  onClose,
  children,
}: {
  icon: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full max-w-lg mt-4 p-5 rounded-2xl bg-white border border-surface-border shadow-xs text-left animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AppIcon name={icon} className="w-4 h-4 text-ink-muted" />
          <h4 className="font-display font-bold text-sm text-ink">{title}</h4>
        </div>
        <IconButton icon="close" label={`Close ${title}`} variant="ghost" size="sm" onClick={onClose} />
      </div>
      {children}
    </section>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="p-3 text-center text-xs text-ink-muted font-semibold animate-pulse flex items-center justify-center gap-2">
      <AppIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

function AdviceItem({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <strong className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</strong>
      <p className="text-sm text-ink-secondary mt-0.5">{text}</p>
    </div>
  );
}

interface PracticeHelpersProps {
  skill: Skill;
  step: SkillStep;
}

/**
 * The AI coach and mnemonic helpers for one step. Remount with `key={step.id}`
 * so answers reset when the step changes.
 */
export function PracticeHelpers({ skill, step }: PracticeHelpersProps) {
  const profile = getDisciplinePracticeProfile(skill, step);

  const [coachOpen, setCoachOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [advice, setAdvice] = useState<CoachAdvice | null>(null);

  const [mnemonicOpen, setMnemonicOpen] = useState(false);
  const [mnemonicLoading, setMnemonicLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState<Mnemonic | null>(null);

  const askCoach = async (preset?: string) => {
    const q = preset || question;
    if (!q.trim()) return;
    setCoachLoading(true);
    setCoachOpen(true);
    try {
      setAdvice(
        await aiService.getCoachAdvice({
          skillTitle: skill.title || "General",
          stepTitle: step.title,
          stepInstructions: step.instructions,
          userQuestion: q,
        })
      );
    } catch (e: unknown) {
      console.error(e);
      setAdvice(fallbackAdvice(profile));
    } finally {
      setCoachLoading(false);
    }
  };

  const generateMnemonic = async () => {
    setMnemonicLoading(true);
    setMnemonicOpen(true);
    try {
      setMnemonic(
        await aiService.getMnemonic({
          skillTitle: skill.title || "Discipline",
          stepTitle: step.title,
          stepInstructions: step.instructions,
        })
      );
    } catch (e) {
      console.error(e);
      setMnemonic(fallbackMnemonic(profile));
    } finally {
      setMnemonicLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-lg mt-5 pt-4 border-t border-surface-border flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setCoachOpen(!coachOpen)}
          aria-expanded={coachOpen}
          className={buttonClasses({ variant: "secondary", size: "sm" })}
        >
          <AppIcon name="stars-minimalistic-linear" className="w-4 h-4" />
          <span>{profile.coachButtonLabel}</span>
        </button>
        <button type="button" onClick={generateMnemonic} className={buttonClasses({ variant: "secondary", size: "sm" })}>
          <AppIcon name="lightbulb-linear" className="w-4 h-4 text-info" />
          <span>Memory aid</span>
        </button>
      </div>

      {coachOpen && (
        <HelperPanel icon="stars-minimalistic-linear" title={profile.coachTitle} onClose={() => setCoachOpen(false)}>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {profile.coachSuggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => askCoach(sug.question)}
                className="px-2.5 py-1 rounded-lg bg-canvas hover:bg-surface-subtle border border-surface-border text-xs text-ink-secondary hover:text-ink transition cursor-pointer"
              >
                {sug.label}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2 mb-3"
            onSubmit={(e) => {
              e.preventDefault();
              askCoach();
            }}
          >
            <input
              type="text"
              placeholder={profile.coachInputPlaceholder}
              aria-label="Your question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 h-9 px-3 rounded-xl bg-canvas border border-surface-border text-sm text-ink focus:outline-none focus:border-ink"
            />
            <button type="submit" disabled={coachLoading || !question.trim()} className={buttonClasses({ size: "sm" })}>
              {coachLoading ? "Thinking…" : "Ask"}
            </button>
          </form>

          {coachLoading && <Loading label={profile.coachDiagnosingLabel} />}

          {advice && !coachLoading && (
            <div className="space-y-2.5 p-3.5 rounded-xl bg-canvas border border-surface-border">
              <AdviceItem label="Diagnosis" text={advice.diagnosis} />
              <AdviceItem label={profile.coachSecondCardLabel.replace(/:$/, "")} text={advice.muscleMemoryCue} />
              <AdviceItem label="Drill" text={advice.actionableDrill} />
            </div>
          )}
        </HelperPanel>
      )}

      {mnemonicOpen && (
        <HelperPanel icon="lightbulb-linear" title="Memory aid" onClose={() => setMnemonicOpen(false)}>
          {mnemonicLoading ? (
            <Loading label="Writing a memory aid…" />
          ) : mnemonic ? (
            <div className="space-y-2.5 p-3.5 rounded-xl bg-canvas border border-surface-border">
              <AdviceItem label="Mental model" text={mnemonic.visualMnemonic} />
              <AdviceItem label={profile.mnemonicAnchorLabel.replace(/:$/, "")} text={mnemonic.physicalAnchor} />
              <p className="pt-1 text-center text-sm font-semibold text-ink">&ldquo;{mnemonic.ruleOfThumb}&rdquo;</p>
            </div>
          ) : null}
        </HelperPanel>
      )}
    </>
  );
}
