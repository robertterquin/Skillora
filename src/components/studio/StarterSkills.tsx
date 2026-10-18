"use client";

import React from "react";
import Link from "next/link";
import { Skill } from "@/types/database";
import { INTERESTS, Interest } from "@/lib/interests";
import { normalizeCategoryId } from "@/lib/catalog-data";
import { getCategoryStyle, getCategoryStyleById } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button, buttonClasses } from "../ui/Button";
import { formatMinutes } from "../learning";

const STARTER_COUNT = 3;

/** Up to three skills from the interest's category, topped up from other categories. */
function pickStarters(skills: Skill[], interest: Interest): Skill[] {
  const target = normalizeCategoryId(interest.categoryId);
  const inCategory = skills.filter((s) => normalizeCategoryId(s.category_id) === target);
  const others = skills.filter((s) => normalizeCategoryId(s.category_id) !== target);
  return [...inCategory, ...others].slice(0, STARTER_COUNT);
}

interface StarterSkillsProps {
  /** Catalog skills to suggest from. */
  skills: Skill[];
  interest?: Interest;
  onChooseInterest: (id: string) => void;
  onPreview: (skill: Skill) => void;
  onAdd: (skill: Skill) => void;
}

/** The empty Studio: pick an interest, then start one of three suggested skills. */
export function StarterSkills({ skills, interest, onChooseInterest, onPreview, onAdd }: StarterSkillsProps) {
  const starters = interest ? pickStarters(skills, interest) : [];

  return (
    <section aria-labelledby="starter-heading" className="rounded-3xl bg-white border border-surface-border p-6 sm:p-8">
      <h2 id="starter-heading" className="font-display font-bold text-2xl text-ink tracking-tight">
        {interest ? "Start with one of these" : "What would you like to learn first?"}
      </h2>
      <p className="mt-1 text-[15px] text-ink-muted">
        {interest
          ? "Each one is a few short steps you can do in one sitting."
          : "Pick an area and we'll suggest a few skills to start with."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Area of interest">
        {INTERESTS.map((item) => {
          const selected = interest?.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChooseInterest(item.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm font-medium transition cursor-pointer",
                selected
                  ? "border-ink bg-ink text-white"
                  : "border-surface-border bg-white text-ink-secondary hover:border-ink/40 hover:text-ink"
              )}
            >
              <span
                className={cn("w-1.5 h-1.5 rounded-full", selected ? "bg-white" : getCategoryStyleById(item.categoryId).fill)}
                aria-hidden="true"
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {starters.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          {starters.map((skill) => {
            const category = getCategoryStyle(skill);
            const steps = skill.steps || [];
            const minutes = steps.reduce((sum, s) => sum + (Number(s.estimated_minutes) || 0), 0);
            return (
              <li
                key={skill.id}
                className="relative flex flex-col p-5 pl-6 rounded-2xl bg-canvas border border-surface-border overflow-hidden"
              >
                <span className={cn("absolute inset-y-0 left-0 w-1", category.fill)} aria-hidden="true" />
                <span className={cn("text-xs font-semibold", category.text)}>{category.label}</span>
                <h3 className="mt-1 font-serif italic text-xl text-ink leading-snug">{skill.title}</h3>
                <p className="mt-1 text-xs text-ink-muted">
                  {steps.length} steps{minutes > 0 && ` · about ${formatMinutes(minutes)}`}
                </p>
                <div className="mt-auto pt-4 flex items-center gap-2">
                  <Button size="sm" onClick={() => onAdd(skill)}>
                    <AppIcon name="add-circle-linear" className="w-3.5 h-3.5" />
                    <span>Add to Studio</span>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onPreview(skill)}>
                    See the plan
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 pt-5 border-t border-surface-border flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Have something else in mind?</p>
        <Link
          href={interest ? `/library?interest=${interest.id}` : "/library"}
          className={buttonClasses({ variant: "secondary", size: "sm" })}
        >
          <span>Ask Archimedes</span>
          <AppIcon name="arrow-right-linear" className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
