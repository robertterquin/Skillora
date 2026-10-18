"use client";

import React, { useState } from "react";
import { Skill } from "@/types/database";
import { getCategoryStyle } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { formatMinutes } from "../learning";
import type { SkillBundle } from "@/lib/bundles";

interface BundleCardProps {
  bundle: SkillBundle;
  /** The bundle's skills, in order. */
  skills: Skill[];
  isEnrolled: (skillId: string) => boolean;
  /** Adds the skills not yet in the Studio. */
  onAddAll: (skills: Skill[]) => Promise<void> | void;
  onPreview?: (skill: Skill) => void;
}

/** A themed set of catalog skills, added to the Studio in one go. */
export function BundleCard({ bundle, skills, isEnrolled, onAddAll, onPreview }: BundleCardProps) {
  const [adding, setAdding] = useState(false);
  const missing = skills.filter((s) => !isEnrolled(s.id));
  const minutes = skills.reduce(
    (sum, s) => sum + (s.steps || []).reduce((m, st) => m + (Number(st.estimated_minutes) || 0), 0),
    0
  );

  const addAll = async () => {
    setAdding(true);
    try {
      await onAddAll(missing);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="w-full min-w-0 flex flex-col p-5 rounded-2xl bg-white border border-surface-border">
      <p className="text-xs font-semibold text-ink-muted">
        Bundle · {skills.length} skills{minutes > 0 && ` · about ${formatMinutes(minutes)}`}
      </p>
      <h3 className="mt-1 font-display font-bold text-lg text-ink">{bundle.title}</h3>
      <p className="mt-1 text-sm text-ink-secondary">{bundle.description}</p>

      <ul className="mt-4 space-y-1.5">
        {skills.map((skill) => {
          const category = getCategoryStyle(skill);
          const inStudio = isEnrolled(skill.id);
          return (
            <li key={skill.id} className="flex items-center gap-2 text-sm">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", category.fill)} aria-hidden="true" />
              {onPreview ? (
                <button
                  type="button"
                  onClick={() => onPreview(skill)}
                  className="min-w-0 truncate text-left text-ink hover:text-accent-vermilion underline-offset-2 hover:underline cursor-pointer"
                >
                  {skill.title}
                </button>
              ) : (
                <span className="min-w-0 truncate text-ink">{skill.title}</span>
              )}
              {inStudio && (
                <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-success">
                  <AppIcon name="check-linear" className="w-3 h-3" />
                  In Studio
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4">
        {missing.length === 0 ? (
          <p className="text-sm font-semibold text-success inline-flex items-center gap-1.5">
            <AppIcon name="check-circle-linear" className="w-4 h-4" />
            All in your Studio
          </p>
        ) : (
          <Button size="sm" onClick={addAll} disabled={adding}>
            <AppIcon name="add-circle-linear" className="w-3.5 h-3.5" />
            <span>
              {adding
                ? "Adding…"
                : missing.length === skills.length
                ? "Add all to Studio"
                : `Add the other ${missing.length}`}
            </span>
          </Button>
        )}
      </div>
    </article>
  );
}
