"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { HeroFanDeck, SkillSyllabusModal, AppIcon, buttonClasses } from "@/components";
import { ProductPreview } from "@/components/landing";
import { INITIAL_SKILLS } from "@/lib/catalog-data";
import { Skill } from "@/types/database";
import { createClient } from "@/lib/supabase";
import { fetchLiveSkills } from "@/services/skillsService";

const PRINCIPLES = [
  {
    icon: "clock-circle-linear",
    title: "Honest time estimates",
    text: "Know up front whether a skill takes an afternoon or a few weeks of short daily sessions.",
  },
  {
    icon: "bookmark-square-linear",
    title: "Hand-picked resources",
    text: "No sponsored filler. Each step links to a clear video, guide or diagram for exactly that technique.",
  },
  {
    icon: "target-linear",
    title: "A test you can pass",
    text: "Every step ends with a way to check you've got it, so progress means something.",
  },
];

// Catalog skills used in the product preview (guitar for the path, knife sharpening for the draft).
const PATH_SKILL = INITIAL_SKILLS[0];
const DRAFT_SKILL = INITIAL_SKILLS.find((s) => s.slug.includes("knife")) ?? INITIAL_SKILLS[1];

export default function LandingPage() {
  const [activeModalSkill, setActiveModalSkill] = useState<Skill | null>(null);
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);

  useEffect(() => {
    fetchLiveSkills(createClient()).then((data) => {
      if (data && data.length > 0) setSkills(data);
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-canvas text-ink">
      <main id="main">
        <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-20 overflow-hidden text-center" aria-labelledby="hero-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1
              id="hero-heading"
              className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight text-ink max-w-4xl mx-auto leading-[1.08]"
            >
              A place to master your next <span className="font-serif italic font-normal text-ink/90">craft</span>.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink-muted max-w-xl mx-auto leading-relaxed">
              Pick a practical skill. Archimedes turns it into a few short, ordered steps you can finish in one
              sitting.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className={buttonClasses({ size: "lg", className: "w-full sm:w-auto" })}>
                Get started
              </Link>
              <Link
                href="/library"
                className={buttonClasses({ variant: "ghost", size: "lg", className: "w-full sm:w-auto" })}
              >
                Ask Archimedes
                <AppIcon name="arrow-right-linear" className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-10 sm:mt-12" id="skills">
              <h2 className="sr-only">Example skills</h2>
              <HeroFanDeck skills={skills} onSelectSkill={(skill) => setActiveModalSkill(skill)} />
              <p className="mt-2 text-xs text-ink-muted">Tap a card to see its steps.</p>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="py-20 sm:py-28 border-t border-surface-border"
          aria-labelledby="how-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
              <h2 id="how-heading" className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
                How it <span className="font-serif italic font-normal">works</span>
              </h2>
              <p className="mt-3 text-ink-muted text-base">
                Long courses are easy to start and hard to finish. Skillora keeps every step small enough to do today.
              </p>
            </div>
            <ProductPreview
              draftSkill={DRAFT_SKILL}
              draftPrompt="I want to keep my kitchen knives properly sharp."
              pathSkill={PATH_SKILL}
            />
          </div>
        </section>

        <section className="py-20 sm:py-24 border-t border-surface-border" aria-labelledby="principles-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="principles-heading" className="sr-only">
              What makes it different
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRINCIPLES.map((p) => (
                <li key={p.title} className="p-7 rounded-2xl bg-white border border-surface-border">
                  <AppIcon name={p.icon} className="w-5 h-5 text-ink-muted" />
                  <h3 className="mt-4 font-serif italic text-2xl text-ink">{p.title}</h3>
                  <p className="mt-2 text-[15px] text-ink-secondary leading-relaxed">{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-20 sm:py-24 border-t border-surface-border text-center" aria-labelledby="cta-heading">
          <div className="max-w-2xl mx-auto px-4">
            <h2 id="cta-heading" className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
              What will you <span className="font-serif italic font-normal">learn</span> this week?
            </h2>
            <p className="mt-3 text-ink-muted">Start with one skill. Fifteen minutes is enough for a step.</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className={buttonClasses({ size: "lg", className: "w-full sm:w-auto" })}>
                Create an account
              </Link>
              <Link
                href="/library"
                className={buttonClasses({ variant: "secondary", size: "lg", className: "w-full sm:w-auto" })}
              >
                Try Archimedes first
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-surface-border bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="" width={24} height={24} className="w-6 h-6" />
            <span className="font-display font-semibold text-sm text-ink">Skillora</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-muted">
            <Link href="/library" className="hover:text-ink transition">Ask Archimedes</Link>
            <Link href="/signin" className="hover:text-ink transition">Sign in</Link>
            <Link href="/signup" className="hover:text-ink transition">Sign up</Link>
            <span>&copy; {new Date().getFullYear()} Skillora</span>
          </nav>
        </div>
      </footer>

      <AnimatePresence>
        {activeModalSkill && (
          <SkillSyllabusModal skill={activeModalSkill} isViewOnly onClose={() => setActiveModalSkill(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
