"use client";

import React from "react";
import { Skill } from "@/types/database";
import { BUNDLES, SkillBundle, bundleSkills } from "@/lib/bundles";
import { BundleCard } from "./BundleCard";

interface BundleListProps {
  skills: Skill[];
  isEnrolled: (skillId: string) => boolean;
  onAddAll: (bundle: SkillBundle, skills: Skill[]) => Promise<void> | void;
  onPreview?: (skill: Skill) => void;
  title?: string;
}

export function BundleList({ skills, isEnrolled, onAddAll, onPreview, title = "Bundles" }: BundleListProps) {
  const bundles = BUNDLES.map((bundle) => ({ bundle, skills: bundleSkills(bundle, skills) })).filter(
    (b) => b.skills.length > 0
  );
  if (bundles.length === 0) return null;

  return (
    <section aria-labelledby="bundles-heading">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 id="bundles-heading" className="font-display font-semibold text-base text-ink">
          {title}
        </h2>
        <span className="text-xs text-ink-muted">Skills that go well together</span>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {bundles.map(({ bundle, skills: members }) => (
          <li key={bundle.id} className="flex min-w-0">
            <div className="flex-1 flex min-w-0">
              <BundleCard
                bundle={bundle}
                skills={members}
                isEnrolled={isEnrolled}
                onAddAll={(missing) => onAddAll(bundle, missing)}
                onPreview={onPreview}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
