"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { FlashcardLearningModal } from "@/components/FlashcardLearningModal";
import { SkillSyllabusModal } from "@/components/SkillSyllabusModal";
import { SkillFilterBar, DurationFilter } from "@/components/SkillFilterBar";
import { SolarIcon } from "@/components/SolarIcon";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { playMechanicalClick, playChime, playWoodenThud } from "@/lib/workbench-audio";
import { CATEGORIES, INITIAL_SKILLS } from "@/lib/mock-data";
import { Skill } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { fetchLiveSkills } from "@/lib/skills-service";

interface DailyRoutineBlock {
  minutes: number;
  skillTitle: string;
  drillTitle: string;
  action: string;
}

interface DailyRoutine {
  headline: string;
  totalMinutes: number;
  blocks: DailyRoutineBlock[];
  dailyMantra: string;
}

export default function DashboardPage() {
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Free Tier & 7-Day Trial Limits
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [isPro, setIsPro] = useState(false);

  // All available skills
  const [allSkills, setAllSkills] = useState<Skill[]>(INITIAL_SKILLS);

  // User's enrolled skill IDs (Only these are shown in My Studio!)
  const [enrolledSkillIds, setEnrolledSkillIds] = useState<string[]>([]);

  // User's completed step IDs
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);

  // Category and duration filters for My Studio
  const [selectedCategory, setSelectedCategory] = useState<string>("cat-all");
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [activeLearningSkill, setActiveLearningSkill] = useState<Skill | null>(null);
  const [activeSyllabusSkill, setActiveSyllabusSkill] = useState<Skill | null>(null);

  // Feature 5: Daily 15-Minute Studio Workout States
  const [dailyRoutine, setDailyRoutine] = useState<DailyRoutine | null>(null);
  const [routineLoading, setRoutineLoading] = useState(false);
  const [routineCompleted, setRoutineCompleted] = useState(false);

  const [isClient, setIsClient] = useState(false);

  // 1. Sync completions & enrollments from Supabase or localStorage
  const loadUserData = useCallback(async (user: User | null) => {
    // --- Load Step Completions ---
    if (user) {
      try {
        const { data: stepData } = await supabase
          .from("user_step_completions")
          .select("step_id")
          .eq("user_id", user.id);

        if (stepData && stepData.length > 0) {
          const ids = stepData.map((row: { step_id: string }) => row.step_id);
          setCompletedStepIds(ids);
          localStorage.setItem("skillora_completed_steps", JSON.stringify(ids));
        } else {
          const savedSteps = localStorage.getItem("skillora_completed_steps");
          if (savedSteps) setCompletedStepIds(JSON.parse(savedSteps));
        }
      } catch (err) {
        console.error("Failed to fetch step completions", err);
      }

      // --- Load Enrollments ---
      try {
        const { data: enrollData } = await supabase
          .from("user_enrollments")
          .select("skill_id")
          .eq("user_id", user.id);

        if (enrollData && enrollData.length > 0) {
          const ids = enrollData.map((row: { skill_id: string }) => row.skill_id);
          setEnrolledSkillIds(ids);
          localStorage.setItem("skillora_enrolled_skills", JSON.stringify(ids));
          return;
        }
      } catch (err) {
        console.error("Failed to fetch enrollments", err);
      }
    }

    // Fallback to localStorage for Enrollments
    const savedEnrolled = localStorage.getItem("skillora_enrolled_skills");
    if (savedEnrolled) {
      try {
        setEnrolledSkillIds(JSON.parse(savedEnrolled));
      } catch (e) {
        console.error("Error parsing enrolled skills", e);
      }
    } else {
      // Default seed for first-time / guest testing: Cyrillic script
      const defaultEnrolled = ["skill-cyrillic-script"];
      setEnrolledSkillIds(defaultEnrolled);
      localStorage.setItem("skillora_enrolled_skills", JSON.stringify(defaultEnrolled));
    }

    // Fallback to localStorage for Step Completions
    const savedSteps = localStorage.getItem("skillora_completed_steps");
    if (savedSteps) {
      try {
        setCompletedStepIds(JSON.parse(savedSteps));
      } catch (e) {
        console.error("Error parsing completed steps", e);
      }
    }
  }, [supabase]);

  useEffect(() => {
    setIsClient(true);

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Check if user is on Pro plan
        const userIsPro = user?.user_metadata?.plan === "pro";
        setIsPro(userIsPro);

        // 7-Day Trial calculation
        const trialStartKey = "skillora_trial_start_timestamp";
        let trialStart = localStorage.getItem(trialStartKey);
        if (!trialStart) {
          trialStart = Date.now().toString();
          localStorage.setItem(trialStartKey, trialStart);
        }
        const daysElapsed = Math.floor(
          (Date.now() - parseInt(trialStart, 10)) / (1000 * 60 * 60 * 24)
        );
        setDaysRemaining(Math.max(0, 7 - daysElapsed));

        await loadUserData(user);
      } catch (e) {
        console.error("Error reading auth state", e);
      } finally {
        setLoadingAuth(false);
      }
    };

    init();

    fetchLiveSkills(supabase).then((live) => {
      const savedCustom = localStorage.getItem("skillora_custom_ai_skills");
      if (savedCustom) {
        try {
          const customList: Skill[] = JSON.parse(savedCustom);
          setAllSkills([...customList, ...(live || INITIAL_SKILLS)]);
          return;
        } catch {
          // ignore
        }
      }
      if (live && live.length > 0) setAllSkills(live);
    });

    // Load saved daily routine if exists
    const savedRoutine = localStorage.getItem("skillora_daily_routine");
    if (savedRoutine) {
      try {
        setDailyRoutine(JSON.parse(savedRoutine));
      } catch {
        // ignore
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      await loadUserData(user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, loadUserData]);

  // 2. Step Completion Toggle with Supabase Sync
  const handleToggleStep = async (stepId: string) => {
    const isCurrentlyDone = completedStepIds.includes(stepId);
    if (isCurrentlyDone) {
      playMechanicalClick();
    } else {
      playChime();
    }

    const updated = isCurrentlyDone
      ? completedStepIds.filter((id) => id !== stepId)
      : [...completedStepIds, stepId];

    setCompletedStepIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("skillora_completed_steps", JSON.stringify(updated));
    }

    if (currentUser) {
      try {
        if (isCurrentlyDone) {
          await supabase
            .from("user_step_completions")
            .delete()
            .eq("user_id", currentUser.id)
            .eq("step_id", stepId);
        } else {
          await supabase
            .from("user_step_completions")
            .insert({
              user_id: currentUser.id,
              step_id: stepId,
            });
        }
      } catch (err) {
        console.error("Failed to sync step completion to Supabase", err);
      }
    }
  };

  // 3. Remove Skill from My Studio
  const handleRemoveFromStudio = async (skillId: string) => {
    const updated = enrolledSkillIds.filter((id) => id !== skillId);
    setEnrolledSkillIds(updated);
    localStorage.setItem("skillora_enrolled_skills", JSON.stringify(updated));

    if (currentUser) {
      try {
        await supabase
          .from("user_enrollments")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("skill_id", skillId);
      } catch (err) {
        console.error("Failed to remove enrollment from Supabase", err);
      }
    }
  };

  // 4. Feature 5 Handler: Generate Daily 15-Minute Workout via OpenAI
  const handleGenerateDailyRoutine = async () => {
    if (myStudioSkills.length === 0) return;

    // Check if free trial has expired for AI generation
    if (!isPro && daysRemaining <= 0) {
      setIsLimitReached(true);
      setIsSubscriptionModalOpen(true);
      return;
    }

    setRoutineLoading(true);
    setRoutineCompleted(false);

    try {
      const res = await fetch("/api/ai/daily-routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrolledSkills: myStudioSkills,
          completedStepIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate routine");

      setDailyRoutine(data);
      localStorage.setItem("skillora_daily_routine", JSON.stringify(data));
      playChime();
    } catch (e) {
      console.error("Daily routine error:", e);
      const fallback: DailyRoutine = {
        headline: "15-Minute Mastery Sprint: Micro-Drills",
        totalMinutes: 15,
        blocks: [
          {
            minutes: 5,
            skillTitle: myStudioSkills[0]?.title || "Active Skill",
            drillTitle: "Warmup Anchor & Sensation Check",
            action: "Focus on relaxed posture and isolated muscle memory repetitions.",
          },
          {
            minutes: 10,
            skillTitle: myStudioSkills[1]?.title || myStudioSkills[0]?.title || "Deep Practice",
            drillTitle: "Continuous Rhythm or Recall Drill",
            action: "Drill transitions with a metronome or flashcard recall at 75% speed.",
          },
        ],
        dailyMantra: "Repetition without tension creates speed without effort.",
      };
      setDailyRoutine(fallback);
      localStorage.setItem("skillora_daily_routine", JSON.stringify(fallback));
    } finally {
      setRoutineLoading(false);
    }
  };

  // 5. Skills currently enrolled in My Studio
  const myStudioSkills = allSkills.filter((s) => enrolledSkillIds.includes(s.id));

  // 6. Filter enrolled studio skills by Category, Duration, and Search Query
  const filteredStudioSkills = myStudioSkills.filter((skill) => {
    if (selectedCategory !== "cat-all" && skill.category_id !== selectedCategory) {
      return false;
    }
    if (selectedDuration === "quick" && skill.estimated_hours > 2) {
      return false;
    }
    if (
      selectedDuration === "sprint" &&
      (skill.estimated_hours <= 2 || skill.estimated_hours > 6)
    ) {
      return false;
    }
    if (selectedDuration === "deep" && skill.estimated_hours <= 6) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = skill.title.toLowerCase().includes(q);
      const matchSummary = skill.summary.toLowerCase().includes(q);
      const matchTime = skill.time_commitment_label.toLowerCase().includes(q);
      return matchTitle || matchSummary || matchTime;
    }
    return true;
  });

  // 7. Calculate Metrics (Streak, Active, Mastered)
  const masteredSkills = myStudioSkills.filter((skill) => {
    const steps = skill.steps || [];
    return steps.length > 0 && steps.every((st) => completedStepIds.includes(st.id));
  });

  const activeSkills = myStudioSkills.filter((skill) => {
    const steps = skill.steps || [];
    const isMastered = steps.length > 0 && steps.every((st) => completedStepIds.includes(st.id));
    return !isMastered;
  });

  const displayName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.email?.split("@")[0] ||
    "Explorer";

  return (
    <div className="min-h-screen flex flex-col workbench-grid text-ink selection:bg-brand-500 selection:text-white">
      <Header completedCount={isClient ? masteredSkills.length : 0} activePath="/dashboard" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Guest Notification Banner */}
        {!loadingAuth && !currentUser && (
          <div className="mb-6 p-4 rounded-2xl bg-brand-50 border border-brand-200 text-brand-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>You are exploring in guest mode. Progress is saved locally on this browser.</span>
            </div>
            <Link
              href="/signup"
              className="px-3.5 py-1.5 rounded-full bg-brand-600 text-white font-semibold hover:bg-brand-700 transition"
            >
              Sign up to sync across devices &rarr;
            </Link>
          </div>
        )}

        {/* User Learning Hub Header & Metrics Banner (Streak, Active, Mastered) */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-surface-border shadow-xs relative">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-canvas border border-surface-border p-2.5 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/logo.svg"
                  alt="Skillora Owl"
                  width={38}
                  height={38}
                  className="w-9 h-9 object-contain"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
                    {displayName}&apos;s Studio
                  </h1>
                  {isPro ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-muted border border-surface-border text-ink text-[11px] font-semibold inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
                      Pro Member • Unlimited Skills
                    </span>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-muted border border-surface-border text-ink-secondary text-[11px] font-medium inline-flex items-center gap-1">
                        <SolarIcon name="clock-circle-linear" className="w-3 h-3 text-ink-muted" />
                        Free Trial: {isClient ? myStudioSkills.length : 0}/3 Skills • {daysRemaining}d Left
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLimitReached(false);
                          setIsSubscriptionModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-full bg-ink hover:bg-neutral-800 text-white text-[11px] font-semibold transition shadow-2xs cursor-pointer"
                      >
                        Upgrade ₱299/mo &rarr;
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    Focus on your chosen micro-skills. Practice daily to build automatic muscle memory.
                  </p>
                </div>
              </div>
            </div>

            {/* Streak & Active & Mastered Metrics (Monochromatic Architectural Styling) */}
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
              {/* STREAK */}
              <div className="p-3.5 px-4 rounded-2xl bg-canvas border border-surface-border text-center min-w-[96px]">
                <span className="spec-tag text-ink-subtle block text-[8px] mb-0.5 font-mono">SPEC // 01</span>
                <div className="flex items-center justify-center gap-1 text-ink-secondary text-xs font-medium">
                  <SolarIcon name="fire-linear" className="w-3.5 h-3.5 text-amber-600" />
                  <span>Streak</span>
                </div>
                <div className="font-display font-bold text-xl text-ink mt-0.5 tabular-nums">
                  {currentUser ? "4 Days" : "1 Day"}
                </div>
              </div>

              {/* ACTIVE */}
              <div className="p-3.5 px-4 rounded-2xl bg-canvas border border-surface-border text-center min-w-[96px]">
                <span className="spec-tag text-ink-subtle block text-[8px] mb-0.5 font-mono">SPEC // 02</span>
                <div className="flex items-center justify-center gap-1 text-ink-secondary text-xs font-medium">
                  <SolarIcon name="clock-circle-linear" className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Active</span>
                </div>
                <div className="font-display font-bold text-xl text-ink mt-0.5 tabular-nums">
                  {isClient ? activeSkills.length : 0}
                </div>
              </div>

              {/* MASTERED */}
              <div className="p-3.5 px-4 rounded-2xl bg-canvas border border-surface-border text-center min-w-[96px]">
                <span className="spec-tag text-ink-subtle block text-[8px] mb-0.5 font-mono">SPEC // 03</span>
                <div className="flex items-center justify-center gap-1 text-ink-secondary text-xs font-medium">
                  <SolarIcon name="cup-first-linear" className="w-3.5 h-3.5 text-accent-emerald" />
                  <span>Mastered</span>
                </div>
                <div className="font-display font-bold text-xl text-ink mt-0.5 tabular-nums">
                  {isClient ? masteredSkills.length : 0}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 5: Daily 15-Minute Deliberate Practice Circuit */}
        {myStudioSkills.length > 0 && (
          <section className="mb-8">
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-surface-border shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-canvas border border-surface-border flex items-center justify-center text-ink">
                    <SolarIcon name="stopwatch-linear" className="w-5 h-5 text-ink" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="spec-tag text-ink-subtle">
                        CIRCUIT // 15-MIN DELIBERATE PRACTICE
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-ink">
                      {dailyRoutine ? dailyRoutine.headline : "Today's 15-Minute Cross-Training Circuit"}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    disabled={routineLoading}
                    onClick={handleGenerateDailyRoutine}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink hover:bg-neutral-800 text-white text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                  >
                    <SolarIcon
                      name="refresh-linear"
                      className={`w-3.5 h-3.5 ${routineLoading ? "animate-spin" : ""}`}
                    />
                    <span>{routineLoading ? "Synthesizing Circuit..." : dailyRoutine ? "Recompile Circuit" : "Synthesize Today's Circuit"}</span>
                  </button>
                </div>
              </div>

              {dailyRoutine ? (
                <div className="space-y-4 animate-fade-in pt-2 border-t border-surface-border">
                  {/* Workout Blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dailyRoutine.blocks.map((block, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-canvas border border-surface-border flex items-start gap-3.5"
                      >
                        <div className="w-8 h-8 rounded-xl bg-white border border-surface-border flex items-center justify-center font-bold text-xs text-ink font-mono flex-shrink-0">
                          {block.minutes}m
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-mono font-medium text-ink-muted uppercase tracking-wider block">
                            {block.skillTitle}
                          </span>
                          <h4 className="font-display font-bold text-sm text-ink mb-1">
                            {block.drillTitle}
                          </h4>
                          <p className="text-xs text-ink-secondary leading-relaxed">
                            {block.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mantra & Complete Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-canvas border border-surface-border text-xs">
                    <p className="text-ink-secondary italic">
                      &ldquo;{dailyRoutine.dailyMantra}&rdquo;
                    </p>

                    <button
                      type="button"
                      onClick={() => setRoutineCompleted(!routineCompleted)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 cursor-pointer ${
                        routineCompleted
                          ? "bg-accent-emerald text-white"
                          : "bg-ink hover:bg-neutral-800 text-white"
                      }`}
                    >
                      <SolarIcon name="check-circle-linear" className="w-4 h-4" />
                      <span>{routineCompleted ? "Circuit Completed Today!" : "Mark Circuit Complete"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-ink-muted pt-2 border-t border-surface-border leading-relaxed">
                  Synthesize a daily 15-minute cross-training routine compiled from your active micro-drills to build automatic physical and cognitive muscle memory.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Discipline & Duration Filter Bar in My Studio */}
        <section className="mb-8">
          <div className="p-6 bg-white rounded-3xl border border-surface-border shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <SolarIcon name="filter-linear" className="w-4 h-4 text-brand-600" />
                <span>Filter My Studio Repertoire</span>
              </span>
              <span className="text-xs text-ink-muted">
                Showing {filteredStudioSkills.length} of {myStudioSkills.length} enrolled skills
              </span>
            </div>
            <SkillFilterBar
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedDuration={selectedDuration}
              onSelectDuration={setSelectedDuration}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </section>

        {/* My Studio Section: Filtered Repertoire */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">
                My Studio Queue ({filteredStudioSkills.length})
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Disciplines you are currently mastering. Open any skill to practice with tactile micro-simulators, voice grading, and technique coaching.
              </p>
            </div>

            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-surface-border hover:border-ink/40 text-xs font-semibold text-ink transition shadow-2xs"
            >
              <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-ink-muted" />
              <span>Explore Archimedes&apos; Library &rarr;</span>
            </Link>
          </div>

          {/* EMPTY STATE */}
          {filteredStudioSkills.length === 0 ? (
            <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-dashed border-surface-border max-w-2xl mx-auto shadow-xs">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-canvas border border-surface-border flex items-center justify-center text-ink">
                <SolarIcon name="book-bookmark-linear" className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-lg text-ink mb-1.5">
                {myStudioSkills.length === 0 ? "Your Studio Queue is Empty" : "No Matching Skills in this Filter"}
              </h3>
              <p className="text-sm text-ink-muted mb-6 max-w-md mx-auto">
                {myStudioSkills.length === 0
                  ? "Talk to Archimedes in the Library to deconstruct and add your first micro-skill."
                  : "Try clearing your search term or selecting 'All Disciplines' above."}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {myStudioSkills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("cat-all");
                      setSelectedDuration("all");
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 rounded-full bg-canvas text-xs font-semibold text-ink border border-surface-border hover:bg-surface-muted transition"
                  >
                    Reset Filter
                  </button>
                )}

                <Link
                  href="/library"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ink hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition"
                >
                  <span>Explore Archimedes&apos; Library</span>
                  <SolarIcon name="arrow-right-linear" className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* ENROLLED SKILLS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudioSkills.map((skill, idx) => {
                const steps = skill.steps || [];
                const doneCount = steps.filter((s) => completedStepIds.includes(s.id)).length;
                const totalCount = steps.length;
                const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
                const isCompleted = totalCount > 0 && doneCount === totalCount;
                const isCustomAi = skill.id.startsWith("ai-skill-");

                return (
                  <div
                    key={skill.id}
                    className="flex flex-col justify-between p-6 bg-white rounded-3xl border border-surface-border hover:border-ink/40 transition shadow-xs group corner-ticks"
                  >
                    <div>
                      {/* Blueprint Architectural Spec Header */}
                      <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-ink-subtle uppercase mb-3 pb-2 border-b border-surface-border/60">
                        <span>SPEC // #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                        <span>EST. {skill.estimated_hours}.0H</span>
                      </div>

                      {/* Top Badges & Remove Option */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          {isCustomAi && (
                            <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-surface-muted text-ink-secondary border border-surface-border">
                              Custom Drill
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-canvas border border-surface-border text-ink-muted">
                            {skill.difficulty}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFromStudio(skill.id)}
                          className="text-[11px] text-ink-subtle hover:text-rose-600 transition"
                          title="Remove from My Studio"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-display font-bold text-lg text-ink group-hover:text-ink transition mb-2">
                        {skill.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-ink-secondary line-clamp-2 mb-4 leading-relaxed">
                        {skill.summary}
                      </p>

                      {/* Progress Bar & Status */}
                      <div className="mb-5 p-3 rounded-2xl bg-canvas border border-surface-border">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-ink">
                            {isCompleted ? "Mastered" : "Progress"}
                          </span>
                          <span className="text-ink-muted font-mono text-[11px]">
                            {doneCount} / {totalCount} steps ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? "bg-accent-emerald" : "bg-ink"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-surface-border">
                      {/* Primary CTA: Start Learning with Flashcard Modal */}
                      <button
                        type="button"
                        onClick={() => {
                          playWoodenThud();
                          setActiveLearningSkill(skill);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-ink hover:bg-neutral-800 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                      >
                        <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-300" />
                        <span>Start Learning & Practice</span>
                      </button>

                      {/* Secondary: Preview Syllabus */}
                      <button
                        type="button"
                        onClick={() => {
                          playMechanicalClick();
                          setActiveSyllabusSkill(skill);
                        }}
                        className="w-full py-2 px-4 rounded-xl bg-canvas hover:bg-surface-muted border border-surface-border text-ink text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <SolarIcon name="layers-minimalistic-linear" className="w-3.5 h-3.5 text-ink-subtle" />
                        <span>View Syllabus & Resources</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Slot Limit Callout if Free Tier and at 3 skills */}
        {!isPro && isClient && myStudioSkills.length >= 3 && (
          <section className="mb-6 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                <SolarIcon name="cup-first-linear" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-ink">
                  Free Explorer Plan: 3/3 Skill Slots Filled
                </h4>
                <p className="text-xs text-ink-muted">
                  You have filled all 3 active skill slots on the Free plan. Upgrade to Skillora Pro for ₱299/month to learn unlimited skills simultaneously!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsLimitReached(true);
                setIsSubscriptionModalOpen(true);
              }}
              className="px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white transition shadow-2xs whitespace-nowrap cursor-pointer"
            >
              Unlock Unlimited (₱299/mo) &rarr;
            </button>
          </section>
        )}

        {/* Discovery Callout Footer */}
        <section className="p-6 rounded-3xl bg-gradient-to-r from-canvas via-white to-canvas border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
              <SolarIcon name="compass-linear" className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-ink">
                Want to learn another craft?
              </h4>
              <p className="text-xs text-ink-muted">
                Speak or chat with the Learning Owl in the Skill Library to generate new micro-skills.
              </p>
            </div>
          </div>
          <Link
            href="/library"
            className="px-4 py-2 rounded-full bg-white border border-surface-border hover:border-brand-500/40 text-xs font-semibold text-ink hover:text-brand-600 transition shadow-2xs whitespace-nowrap"
          >
            Visit Learning Owl &rarr;
          </Link>
        </section>
      </main>

      {/* 1. Flashcard & Voice Pronunciation Learning Modal */}
      {activeLearningSkill && (
        <FlashcardLearningModal
          skill={activeLearningSkill}
          completedStepIds={completedStepIds}
          onToggleStep={handleToggleStep}
          onClose={() => setActiveLearningSkill(null)}
        />
      )}

      {/* 2. Step Syllabus & External Resources Modal */}
      {activeSyllabusSkill && (
        <SkillSyllabusModal
          skill={activeSyllabusSkill}
          completedStepIds={completedStepIds}
          onToggleStep={handleToggleStep}
          onClose={() => setActiveSyllabusSkill(null)}
          isViewOnly={false}
        />
      )}

      {/* 3. Subscription & Upgrade Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        userEmail={currentUser?.email}
        isLimitReached={isLimitReached}
      />
    </div>
  );
}
