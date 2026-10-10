"use client";

import React from "react";
import { Category } from "@/types/database";
import { SolarIcon } from "@/components/SolarIcon";

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
    <div className="w-full space-y-4">
      {/* Search and Duration Filter Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input with Solar Magnifier */}
        <div className="relative flex-1 max-w-lg">
          <SolarIcon name="magnifer-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search skills by title, domain, or technique..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-white text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-ink/10 focus:border-ink transition"
          />
        </div>

        {/* Duration Segmented Pills with Solar Clock */}
        <div className="flex items-center gap-1 p-1 bg-surface-muted border border-surface-border rounded-xl text-xs font-medium overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 px-2 text-ink-muted">
            <SolarIcon name="clock-circle-linear" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Time:</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectDuration("all")}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              selectedDuration === "all"
                ? "bg-white text-ink shadow-xs font-semibold"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            All Durations
          </button>

          <button
            type="button"
            onClick={() => onSelectDuration("quick")}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              selectedDuration === "quick"
                ? "bg-white text-ink shadow-xs font-semibold"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Under 2 Hours
          </button>

          <button
            type="button"
            onClick={() => onSelectDuration("sprint")}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              selectedDuration === "sprint"
                ? "bg-white text-ink shadow-xs font-semibold"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            1–7 Days
          </button>

          <button
            type="button"
            onClick={() => onSelectDuration("deep")}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              selectedDuration === "deep"
                ? "bg-white text-ink shadow-xs font-semibold"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Multi-Week
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-b border-surface-border">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-ink text-ink font-semibold"
                  : "border-transparent text-ink-muted hover:text-ink hover:border-surface-border"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
