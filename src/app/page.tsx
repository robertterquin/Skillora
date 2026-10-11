"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import {
  Header,
  HeroFanDeck,
  SkillSyllabusModal,
  SolarIcon,
} from "@/components";
import { INITIAL_SKILLS } from "@/lib/mock-data";
import { Skill } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { fetchLiveSkills } from "@/lib/skills-service";

export default function LandingPage() {
  const [activeModalSkill, setActiveModalSkill] = useState<Skill | null>(null);
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);

  useEffect(() => {
    const supabase = createClient();
    fetchLiveSkills(supabase).then((data) => {
      if (data && data.length > 0) {
        setSkills(data);
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-ink selection:bg-brand-500 selection:text-white">
      <Header activePath="/" />

      {/* Hero Section inspired by Image 1 (Pallet Ross Composition) */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Hero Headline */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight text-ink max-w-4xl mx-auto leading-[1.08]">
            A place to master your next <span className="font-serif italic font-normal text-ink/90">craft</span>.
          </h1>

          {/* Fanned Tactile Deck of Skill Cards with Floating @learner Tags */}
          <div className="my-6 sm:my-8" id="skills">
            <HeroFanDeck
              skills={skills}
              onSelectSkill={(skill) => setActiveModalSkill(skill)}
            />
          </div>

          {/* Minimalist Subtitle */}
          <p className="text-base sm:text-lg text-ink-muted max-w-xl mx-auto font-normal leading-relaxed mb-8">
            Curious minds can discover, practice, and master any discipline—with step-by-step instructions, vetted learning platforms, and realistic time horizons.
          </p>

          {/* Hero CTAs: Matching the pill buttons in Image 1 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-ink text-white font-medium text-sm hover:bg-neutral-800 transition-all shadow-sm hover:scale-[1.02]"
            >
              Start for free
            </Link>

            <a
              href="#skills"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-transparent hover:bg-neutral-200/60 text-ink-secondary text-sm font-medium transition-all"
            >
              Explore library &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* The 3 Pillars of Skillora (Ultra-Minimalist, No Emojis or Icon Boxes) */}
      <section id="methodology" className="py-16 sm:py-24 bg-canvas border-t border-surface-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink">
              Built for how curious minds <span className="font-serif italic font-normal">actually learn</span>.
            </h2>
            <p className="mt-3 text-ink-muted text-sm sm:text-base">
              Traditional courses have an 8% completion rate. Skillora replaces 40-hour lectures with actionable sequential micro-steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-surface-border shadow-xs text-left">
              <h3 className="font-display font-semibold text-lg text-ink mb-2">
                Procedural Micro-Steps
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Step-by-step hand placements, muscle memory cues, and concrete exercises designed to be completed in 15–30 minute daily sessions.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-surface-border shadow-xs text-left">
              <h3 className="font-display font-semibold text-lg text-ink mb-2">
                Vetted Platforms
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                No sponsored filler. We point you directly to the highest-signal free drills, interactive trainers, and masterclass breakdowns on the internet.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-surface-border shadow-xs text-left">
              <h3 className="font-display font-semibold text-lg text-ink mb-2">
                Transparent Horizons
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Clear expectations upfront. You will know whether you are investing an afternoon or building a 4-week daily muscle habit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 border-t border-surface-border bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink">
              Simple, transparent access.
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Start free, or unlock unlimited tracked pathways and habit analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl border border-surface-border bg-canvas flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-ink">Free Explorer</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-3xl text-ink">₱0</span>
                  <span className="text-xs text-ink-muted">/ 7-day trial</span>
                </div>
                <p className="mt-3 text-xs text-ink-muted leading-relaxed">
                  Start with up to 3 micro-skills and experience Archimedes Studio mentor for 7 days.
                </p>
                <ul className="mt-6 space-y-3 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span>Learn up to <strong>3 active skills</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span><strong>7-day free trial</strong> of Archimedes & Voice coaching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span>3D flashcards & external curated resources</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 block text-center py-2.5 px-4 rounded-full border border-surface-border bg-white text-xs font-semibold text-ink hover:bg-neutral-100 transition"
              >
                Start 7-Day Free Trial
              </Link>
            </div>

            {/* Pro Tier (₱299/month) */}
            <div className="p-8 rounded-2xl border-2 border-ink bg-white flex flex-col justify-between relative shadow-lg">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Unlimited Access
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-ink">Skillora Pro</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-3xl text-ink">₱299</span>
                  <span className="text-xs text-ink-muted">/ month</span>
                </div>
                <p className="mt-3 text-xs text-ink-muted leading-relaxed">
                  For deliberate learners building daily streaks and unlimited multi-discipline mastery.
                </p>
                <ul className="mt-6 space-y-3 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span><strong>Learn as many skills as you want</strong> (unlimited studio slots)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span><strong>Unlimited Archimedes Studio</strong> voice & curriculum deconstruction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span><strong>Unlimited Technique Coach</strong> & voice pronunciation diagnostics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>Daily 15-minute cross-training workout generator</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 block text-center py-2.5 px-4 rounded-full bg-ink text-white text-xs font-semibold hover:bg-neutral-800 transition"
              >
                Join Pro for ₱299/m
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="border-t border-surface-border bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Skillora Owl"
              width={26}
              height={26}
              className="w-6 h-6 object-contain"
            />
            <span className="font-display font-semibold text-sm text-ink">
              Skillora — The Learning Engine
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-ink-muted">
            <a href="#skills" className="hover:text-ink transition">Library</a>
            <Link href="/signin" className="hover:text-ink transition">Sign in</Link>
            <Link href="/signup" className="hover:text-ink transition">Sign up</Link>
            <span>&copy; {new Date().getFullYear()} Skillora</span>
          </div>
        </div>
      </footer>

      {/* Curriculum View Modal for Landing Page */}
      <AnimatePresence>
        {activeModalSkill && (
          <SkillSyllabusModal
            skill={activeModalSkill}
            isViewOnly={true}
            onClose={() => setActiveModalSkill(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
