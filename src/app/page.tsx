"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import {
  Badge,
  Card,
  Header,
  HeroFanDeck,
  SkillSyllabusModal,
  SolarIcon,
  buttonClasses,
} from "@/components";
import { INITIAL_SKILLS } from "@/lib/mock-data";
import { Skill } from "@/types/database";
import { createClient } from "@/lib/supabase";
import { fetchLiveSkills } from "@/services/skillsService";

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
    <div className="flex-1 flex flex-col bg-canvas text-ink selection:bg-brand-500 selection:text-white">


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
            Learn any skill through short, ordered steps, hand-picked resources, and honest time estimates.
          </p>

          {/* Hero CTAs: Matching the pill buttons in Image 1 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/signup"
              className={buttonClasses({ size: "lg", className: "w-full sm:w-auto" })}
            >
              Start for free
            </Link>

            <Link
              href="/library"
              className={buttonClasses({ variant: "ghost", size: "lg", className: "w-full sm:w-auto" })}
            >
              Browse skill library &rarr;
            </Link>
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
              Long courses are easy to start and hard to finish. Skillora breaks a skill into steps you can finish in one sitting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-7 sm:p-8 text-left bg-white border border-surface-border hover:border-brand-300 transition-colors">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border/60">
                <span className="font-mono text-xs font-semibold text-brand-600">
                  01
                </span>
                <span className="text-3xs font-mono text-ink-muted">Bite-sized</span>
              </div>
              <h3 className="font-serif italic font-normal text-xl sm:text-2xl text-ink mb-2">
                Short, ordered steps
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Clear exercises, memorable cues, and focused drills sized for a single sitting without cognitive overload.
              </p>
            </Card>

            <Card className="p-7 sm:p-8 text-left bg-white border border-surface-border hover:border-brand-300 transition-colors">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border/60">
                <span className="font-mono text-xs font-semibold text-brand-600">
                  02
                </span>
                <span className="text-3xs font-mono text-ink-muted">Curated</span>
              </div>
              <h3 className="font-serif italic font-normal text-xl sm:text-2xl text-ink mb-2">
                Hand-picked resources
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Zero sponsored filler. Every step links directly to high-quality breakdowns, authentic audio guides, and verified diagrams.
              </p>
            </Card>

            <Card className="p-7 sm:p-8 text-left bg-white border border-surface-border hover:border-brand-300 transition-colors">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border/60">
                <span className="font-mono text-xs font-semibold text-brand-600">
                  03
                </span>
                <span className="text-3xs font-mono text-ink-muted">Realistic</span>
              </div>
              <h3 className="font-serif italic font-normal text-xl sm:text-2xl text-ink mb-2">
                Honest time estimates
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Know up front whether a skill takes an afternoon or several weeks of daily practice.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Minimalist Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 border-t border-surface-border bg-canvas text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink">
              Simple, transparent <span className="font-serif italic font-normal">pricing</span>.
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Start free. Upgrade when you want multiple active studio tracks or unlimited coaching with Archimedes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl border border-surface-border bg-white flex flex-col justify-between shadow-card hover:border-brand-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border/60">
                  <span className="font-mono text-3xs font-medium uppercase tracking-wider text-ink-subtle">
                    Free plan
                  </span>
                  <span className="font-mono text-3xs text-ink-muted">ENTRY</span>
                </div>
                <h3 className="font-serif italic font-normal text-2xl text-ink">Foundation</h3>
                <div className="mt-3 flex items-baseline gap-1.5 font-mono">
                  <span className="font-bold text-3xl text-ink">₱0</span>
                  <span className="text-xs text-ink-muted font-sans">forever</span>
                </div>
                <p className="mt-3 text-xs text-ink-muted leading-relaxed">
                  Practice up to 3 simultaneous skills. Archimedes and AI coaching tools are included for your first 7 days.
                </p>
                <ul className="mt-6 space-y-3 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span>Up to <strong>3 active skills</strong> in My Studio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span><strong>7 days</strong> of Archimedes, voice grading, and drills</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span>Spaced repetition, flashcards, and curated links</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className={buttonClasses({ variant: "secondary", block: true, className: "mt-8" })}
              >
                Start free
              </Link>
            </div>

            {/* Pro Tier (₱299/month) */}
            <div className="p-8 rounded-3xl border-2 border-ink bg-white flex flex-col justify-between relative shadow-elevated">
              <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-accent-vermilion text-white font-mono text-3xs font-semibold uppercase tracking-wider shadow-xs">
                PRO
              </span>
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border/60">
                  <span className="font-mono text-3xs font-medium uppercase tracking-wider text-ink-subtle">
                    Pro plan
                  </span>
                  <span className="font-mono text-3xs text-accent-vermilion font-semibold">ALL ACCESS</span>
                </div>
                <h3 className="font-serif italic font-normal text-2xl text-ink">Skillora Pro</h3>
                <div className="mt-3 flex items-baseline gap-1.5 font-mono">
                  <span className="font-bold text-3xl text-ink">₱299</span>
                  <span className="text-xs text-ink-muted font-sans">/ month</span>
                </div>
                <p className="mt-3 text-xs text-ink-muted leading-relaxed">
                  For dedicated learners practicing multiple disciplines across music, craft, and technology.
                </p>
                <ul className="mt-6 space-y-3 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span><strong>Unlimited skills</strong> in My Studio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span><strong>Unlimited Archimedes</strong> custom syllabi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <SolarIcon name="check-read-linear" className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span><strong>Continuous</strong> coaching, voice diagnostics &amp; certifications</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className={buttonClasses({ block: true, className: "mt-8" })}
              >
                Enroll in Pro
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
            <Link href="/library" className="hover:text-ink transition">Skill Library</Link>
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
