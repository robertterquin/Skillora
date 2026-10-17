"use client";

import React from "react";
import { Skill, SkillStep } from "@/types/database";
import {
  PracticeMetronome,
  KnifeAngleGauge,
  EspressoExtractionSimulator,
  PhoneticSoundboard,
} from "../simulators/TactileMicroSimulators";
import { StepActionBlueprint } from "../simulators/StepActionBlueprint";

/** Picks a hands-on practice aid (simulator, metronome, blueprint) for the step. */
export function StepPracticeAid({
  step,
  skill,
  onSpeak,
  onOpenVideo,
}: {
  step: SkillStep;
  skill: Skill;
  onSpeak: (text: string, lang?: string) => void;
  onOpenVideo?: (video: { url: string; title: string; stepTitle: string }) => void;
}) {
  const slug = `${skill.slug || ""} ${skill.title || ""} ${step.title || ""}`.toLowerCase();

  if (slug.includes("cyrillic") || slug.includes("language") || slug.includes("alphabet") || slug.includes("script")) {
    return <PhoneticSoundboard onSpeak={onSpeak} />;
  }

  if (slug.includes("knife") || slug.includes("sharpen") || slug.includes("blade") || slug.includes("whetstone")) {
    return <KnifeAngleGauge />;
  }

  if (slug.includes("espresso") || slug.includes("coffee") || slug.includes("extraction")) {
    return <EspressoExtractionSimulator />;
  }

  if (
    slug.includes("guitar") ||
    slug.includes("fingerstyle") ||
    slug.includes("music") ||
    slug.includes("typing") ||
    slug.includes("rhythm") ||
    slug.includes("tempo")
  ) {
    const defaultBpm = slug.includes("typing") ? 60 : 75;
    return (
      <div className="space-y-3">
        <PracticeMetronome initialBpm={defaultBpm} />
        <StepActionBlueprint
          step={step}
          skill={skill}
          onOpenVideo={onOpenVideo}
        />
      </div>
    );
  }

  return (
    <StepActionBlueprint
      step={step}
      skill={skill}
      onOpenVideo={onOpenVideo}
    />
  );
}
