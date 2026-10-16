"use client";

import React from "react";
import { motion } from "motion/react";
import { Category } from "@/types/database";
import { SolarIcon } from "./SolarIcon";

export type DurationFilter = "all" | "quick" | "sprint" | "deep";

interface SkillFilterBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  selectedDuration: DurationFilter;
  onSelectDuration: (duration: DurationFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const DURATION_OPTIONS: { id: DurationFilter; label: string }[] = [
  { id: "all", label: "Any length" },
  { id: "quick", label: "Under 2h" },
  { id: "sprint", label: "2–6h" },
  { id: "deep", label: "6h+" },
];

export function SkillFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedDuration,
  onSelectDuration,
  searchQuery,
  onSearchChange,
}: SkillFilterBarProps) {
  return (
    <div className="w-full space-y-3.5">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <SolarIcon
            name="magnifer-linear"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search your skills"
            placeholder="Search your skills"
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-surface-border bg-white text-xs sm:text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-ink-subtle hover:text-ink hover:bg-surface-muted transition cursor-pointer"
              aria-label="Clear search"
            >
              <SolarIcon name="close-circle-linear" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 p-1 bg-surface-muted/80 border border-surface-border/70 rounded-2xl text-xs font-medium overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 px-2 text-ink-muted shrink-0">
            <SolarIcon name="clock-circle-linear" className="w-3.5 h-3.5 text-ink-subtle" />
            <span className="hidden sm:inline text-3xs font-mono uppercase tracking-wider text-ink-subtle">
              Length
            </span>
          </div>

          {DURATION_OPTIONS.map((dur) => {
            const isActive = selectedDuration === dur.id;
            return (
              <button
                key={dur.id}
                type="button"
                onClick={() => onSelectDuration(dur.id)}
                aria-pressed={isActive}
                className={`relative px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer text-xs ${
                  isActive ? "text-ink font-semibold" : "text-ink-muted hover:text-ink"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeDurationPill"
                    transition={{ type: "spring", stiffness: 440, damping: 32 }}
                    className="absolute inset-0 bg-white rounded-xl shadow-2xs border border-surface-border/80"
                  />
                )}
                <span className="relative z-10">{dur.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-surface-muted/80 border border-surface-border/70 rounded-2xl no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              aria-pressed={isActive}
              className={`relative px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                isActive ? "text-ink font-semibold" : "text-ink-muted hover:text-ink"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeCategoryPill"
                  transition={{ type: "spring", stiffness: 440, damping: 32 }}
                  className="absolute inset-0 bg-white rounded-xl shadow-2xs border border-surface-border/80"
                />
              )}
              <span className="relative z-10">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
