"use client";

import React, { useState } from "react";
import { Skill } from "@/types/database";
import { SolarIcon } from "./SolarIcon";

interface HeroFanDeckProps {
  skills: Skill[];
  onSelectSkill: (skill: Skill) => void;
}

const CARD_THEMES = [
  {
    bg: "from-amber-500 via-orange-600 to-amber-700",
    pillBg: "bg-amber-100 text-amber-900",
    category: "Music & Audio",
    rotation: "-rotate-12",
    translateY: "translate-y-4 hover:-translate-y-4",
    zIndex: "z-10",
  },
  {
    bg: "from-blue-600 via-indigo-600 to-sky-700",
    pillBg: "bg-blue-100 text-blue-900",
    category: "Languages & Scripts",
    rotation: "-rotate-6",
    translateY: "translate-y-1 hover:-translate-y-6",
    zIndex: "z-20",
  },
  {
    bg: "from-zinc-800 via-stone-800 to-neutral-900",
    pillBg: "bg-neutral-200 text-neutral-900",
    category: "Tactile Crafts",
    rotation: "-rotate-1",
    translateY: "-translate-y-1 hover:-translate-y-8",
    zIndex: "z-30",
  },
  {
    bg: "from-rose-600 via-amber-700 to-orange-800",
    pillBg: "bg-rose-100 text-rose-900",
    category: "Culinary & Coffee",
    rotation: "rotate-3",
    translateY: "translate-y-0 hover:-translate-y-7",
    zIndex: "z-25",
  },
  {
    bg: "from-emerald-600 via-teal-700 to-cyan-800",
    pillBg: "bg-emerald-100 text-emerald-900",
    category: "Cognitive Puzzles",
    rotation: "rotate-8",
    translateY: "translate-y-2 hover:-translate-y-5",
    zIndex: "z-20",
  },
  {
    bg: "from-violet-600 via-purple-700 to-fuchsia-800",
    pillBg: "bg-violet-100 text-violet-900",
    category: "Tech & Speed",
    rotation: "rotate-14",
    translateY: "translate-y-6 hover:-translate-y-3",
    zIndex: "z-10",
  },
];

export function HeroFanDeck({ skills, onSelectSkill }: HeroFanDeckProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const deckSkills = skills.slice(0, 6);

  return (
    <div className="relative w-full max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6 select-none">
      {/* Fanned Cards Stage */}
      <div className="flex items-center justify-center -space-x-8 sm:-space-x-12 md:-space-x-14 pt-8 pb-12 overflow-x-auto sm:overflow-visible no-scrollbar">
        {deckSkills.map((skill, idx) => {
          const theme = CARD_THEMES[idx % CARD_THEMES.length];
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={skill.id}
              onClick={() => onSelectSkill(skill)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`relative flex-shrink-0 cursor-pointer transform transition-all duration-300 ease-out origin-bottom ${
                theme.rotation
              } ${theme.translateY} ${
                isHovered ? "!z-50 !rotate-0 !scale-110 shadow-2xl" : theme.zIndex
              }`}
            >
              {/* Physical Tactile Card */}
              <div
                className={`w-36 sm:w-44 md:w-52 h-52 sm:h-64 md:h-72 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between text-white shadow-xl bg-gradient-to-br ${theme.bg} border-2 border-white/20 backdrop-blur-sm transition-transform`}
              >
                {/* Top Card Info */}
                <div className="flex items-start justify-between gap-1">
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.pillBg}`}
                  >
                    {theme.category}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
                    <SolarIcon name="play-linear" className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Center / Cover Details */}
                <div className="my-auto">
                  <h4 className="font-display font-bold text-xs sm:text-sm md:text-base leading-tight drop-shadow-sm line-clamp-3">
                    {skill.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs text-white/90">
                    <SolarIcon name="clock-circle-linear" className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{skill.time_commitment_label}</span>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] sm:text-[11px] text-white/80 font-medium">
                  <span>{skill.steps?.length || 3} Steps</span>
                  <span className="underline underline-offset-2">Explore &rarr;</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
