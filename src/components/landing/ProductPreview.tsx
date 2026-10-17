"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Skill } from "@/types/database";
import { getWeekActivity } from "@/lib/spaced-repetition";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { CurriculumCard } from "../chat/CurriculumCard";
import { LearningPath } from "../learning";
import { ContinueCard, StatsStrip } from "../studio";

/** A light "app window" around a live component so it reads as a product shot. */
function PreviewFrame({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <figure
      className={cn(
        "rounded-2xl border border-surface-border bg-canvas shadow-elevated overflow-hidden text-left",
        className
      )}
    >
      <div className="flex items-center gap-2 px-4 h-9 border-b border-surface-border bg-surface-subtle" aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-full bg-surface-border" />
        <span className="w-2.5 h-2.5 rounded-full bg-surface-border" />
        <span className="w-2.5 h-2.5 rounded-full bg-surface-border" />
        <span className="ml-2 text-xs text-ink-subtle">{label}</span>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
      <figcaption className="sr-only">{label} preview</figcaption>
    </figure>
  );
}

function StepCopy({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-md">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-surface-border bg-white text-sm font-semibold text-ink tabular-nums">
        {n}
      </span>
      <h3 className="mt-4 font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">{title}</h3>
      <div className="mt-3 text-base text-ink-secondary leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

/** A sample week: today, yesterday and three days ago count as practised. */
function sampleWeek() {
  const today = new Date();
  const dates = [0, 1, 3]
    .map((ago) => {
      const d = new Date(today);
      d.setDate(today.getDate() - ago);
      return d;
    })
    .map((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  return getWeekActivity(dates);
}

interface ProductPreviewProps {
  /** Skill shown as Archimedes' draft plan. */
  draftSkill: Skill;
  /** What the learner asks for in the sample chat. */
  draftPrompt: string;
  /** Skill shown on the learning path and in the Studio. */
  pathSkill: Skill;
}

/**
 * "How it works", told with the real components and sample data, so the
 * landing page always matches the product.
 */
export function ProductPreview({ draftSkill, draftPrompt, pathSkill }: ProductPreviewProps) {
  const router = useRouter();
  const toSignup = () => router.push("/signup");
  const steps = pathSkill.steps || [];
  const sampleDone = useMemo(() => steps.slice(0, 1).map((s) => s.id), [steps]);
  const week = useMemo(sampleWeek, []);

  return (
    <div className="space-y-20 sm:space-y-28">
      <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <StepCopy n={1} title="Tell Archimedes what you want to learn">
          <p>
            Describe a skill, or ask for ideas. Archimedes, the owl, drafts a short plan with a total time for
            the whole skill.
          </p>
          <p>Make it shorter or longer before anything is added.</p>
        </StepCopy>
        <PreviewFrame label="Ask Archimedes">
          <div className="space-y-4">
            <div className="flex justify-end">
              <p className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-ink text-white text-[15px]">
                {draftPrompt}
              </p>
            </div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted">
              <AppIcon name="stars-minimalistic-linear" className="w-3.5 h-3.5" />
              Archimedes
            </p>
            <CurriculumCard skill={draftSkill} isEnrolled={false} onEnroll={async () => toSignup()} onResize={toSignup} />
          </div>
        </PreviewFrame>
      </div>

      <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <div className="md:order-2">
          <StepCopy n={2} title="Follow one clear path">
            <p>
              Every skill becomes a path you can see at a glance: what&rsquo;s done, what&rsquo;s next, and how long each
              step takes. Each step links to hand-picked videos and guides.
            </p>
            <p>Finish the last step to unlock a short assessment and earn a certificate.</p>
          </StepCopy>
        </div>
        <PreviewFrame label="Learning path" className="md:order-1">
          <LearningPath skill={pathSkill} completedStepIds={sampleDone} onWatch={toSignup} onOpenAssessment={toSignup} />
        </PreviewFrame>
      </div>

      {/* The Studio needs room for its stats row, so this one stacks at every width. */}
      <div className="space-y-10">
        <StepCopy n={3} title="Practise a little, most days">
          <p>
            Your Studio opens on the one thing to do next. A quiet weekly count shows how often you practised, with no
            streak to lose.
          </p>
        </StepCopy>
        <PreviewFrame label="Your Studio" className="max-w-4xl">
          <div className="space-y-4">
            <ContinueCard skill={pathSkill} completedStepIds={sampleDone} onResume={toSignup} onViewSteps={toSignup} />
            <StatsStrip week={week} stepsDone={sampleDone.length + 5} masteredCount={1} />
          </div>
        </PreviewFrame>
      </div>
    </div>
  );
}
