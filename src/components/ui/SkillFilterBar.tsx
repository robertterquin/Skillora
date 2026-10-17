"use client";

import React from "react";
import { Category } from "@/types/database";
import { Input } from "./Input";
import { IconButton } from "./IconButton";
import { SegmentedControl } from "./SegmentedControl";

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

const DURATION_OPTIONS: { value: DurationFilter; label: string }[] = [
  { value: "all", label: "Any length" },
  { value: "quick", label: "Under 2h" },
  { value: "sprint", label: "2–6h" },
  { value: "deep", label: "6h+" },
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
    <div className="w-full space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            size="sm"
            leadingIcon="magnifer-linear"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search your skills"
            placeholder="Search your skills"
            trailing={
              searchQuery ? (
                <IconButton
                  icon="close-circle-linear"
                  label="Clear search"
                  variant="ghost"
                  size="sm"
                  className="w-7 h-7"
                  onClick={() => onSearchChange("")}
                />
              ) : undefined
            }
          />
        </div>

        <SegmentedControl
          label="Skill length"
          layoutId="activeDurationPill"
          options={DURATION_OPTIONS}
          value={selectedDuration}
          onChange={onSelectDuration}
          scrollable
          className="shrink-0 self-start lg:self-auto"
        />
      </div>

      <SegmentedControl
        label="Category"
        layoutId="activeCategoryPill"
        options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
        value={selectedCategory}
        onChange={onSelectCategory}
        scrollable
        className="flex w-full"
      />
    </div>
  );
}
