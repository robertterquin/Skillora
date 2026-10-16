"use client";

import React, { useEffect, useState } from "react";
import { Skill } from "@/types/database";
import { normalizeCategoryId } from "@/lib/catalog-data";
import { SolarIcon } from "./SolarIcon";

interface HeroFanDeckProps {
  skills: Skill[];
  onSelectSkill: (skill: Skill) => void;
}

const CATEGORY_STYLES: Record<string, { label: string; bg: string }> = {
  "11111111-1111-1111-1111-111111111111": { label: "Music", bg: "bg-deck-music" },
  "22222222-2222-2222-2222-222222222222": { label: "Languages", bg: "bg-deck-languages" },
  "33333333-3333-3333-3333-333333333333": { label: "Crafts & life", bg: "bg-deck-life" },
  "44444444-4444-4444-4444-444444444444": { label: "Tech", bg: "bg-deck-tech" },
};
const FALLBACK_STYLE = CATEGORY_STYLES["33333333-3333-3333-3333-333333333333"];

// How many cards fit without clipping at each breakpoint (matches Tailwind sm/md/lg).
const DECK_BREAKPOINTS = [
  { query: "(min-width: 1024px)", count: 6 },
  { query: "(min-width: 768px)", count: 5 },
  { query: "(min-width: 640px)", count: 4 },
];
const MAX_ROTATION_DEG = 12;
const ARC_DROP_PX = 18;

function useDeckSize(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const match = DECK_BREAKPOINTS.find((bp) => window.matchMedia(bp.query).matches);
      setCount(match ? match.count : 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

export function HeroFanDeck({ skills, onSelectSkill }: HeroFanDeckProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const deckSize = useDeckSize();
  const deckSkills = deckSize ? skills.slice(0, deckSize) : [];
  const mid = (deckSkills.length - 1) / 2;

  return (
    <div className="relative isolate w-full select-none">
      {/* Fixed-height stage so the page doesn't shift while the deck size is measured */}
      <div className="flex items-center justify-center -space-x-6 sm:-space-x-8 md:-space-x-10 lg:-space-x-12 pt-8 pb-12 min-h-[248px] sm:min-h-[296px] md:min-h-[312px] lg:min-h-[344px]">
        {deckSkills.map((skill, idx) => {
          const style = CATEGORY_STYLES[normalizeCategoryId(skill.category_id)] ?? FALLBACK_STYLE;
          const isHovered = hoveredIdx === idx;
          // Position in the fan from -1 (left) to 1 (right)
          const t = mid === 0 ? 0 : (idx - mid) / mid;
          const transform = isHovered
            ? "translateY(-16px) rotate(0deg) scale(1.06)"
            : `translateY(${t * t * ARC_DROP_PX}px) rotate(${t * MAX_ROTATION_DEG}deg)`;

          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => onSelectSkill(skill)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onFocus={() => setHoveredIdx(idx)}
              onBlur={() => setHoveredIdx(null)}
              aria-label={`Preview ${skill.title}`}
              style={{ transform, zIndex: isHovered ? 50 : 10 + Math.round((1 - Math.abs(t)) * 10) }}
              className="relative flex-shrink-0 origin-bottom transition-transform duration-300 ease-out rounded-2xl sm:rounded-3xl"
            >
              <span
                className={`w-28 sm:w-36 md:w-40 lg:w-48 h-40 sm:h-52 md:h-56 lg:h-64 rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-5 flex flex-col justify-between text-left text-white border border-white/15 animate-fade-in ${style.bg} ${
                  isHovered ? "shadow-2xl" : "shadow-lg"
                } transition-shadow`}
              >
                <span className="flex items-start justify-between gap-1">
                  <span className="text-3xs font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white/90 truncate">
                    {style.label}
                  </span>
                  <SolarIcon name="play-linear" className="hidden sm:block w-4 h-4 text-white/70 flex-shrink-0" />
                </span>

                <span className="block">
                  <span className="block font-serif italic font-normal text-sm sm:text-base lg:text-lg leading-tight line-clamp-3">
                    {skill.title}
                  </span>
                  <span className="mt-2 flex items-center gap-1.5 text-2xs sm:text-xs text-white/80 font-mono">
                    <SolarIcon name="clock-circle-linear" className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="tabular-nums line-clamp-1">{skill.time_commitment_label}</span>
                  </span>
                </span>

                <span className="pt-2 border-t border-white/20 flex items-center justify-between text-2xs text-white/75 font-mono">
                  <span>{skill.steps?.length ?? 0} STEPS</span>
                  <span className="hidden sm:inline font-sans font-medium">Preview &rarr;</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
