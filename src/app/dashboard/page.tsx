"use client";

import React, { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Badge,
  Button,
  buttonClasses,
  SkillPracticeModal,
  SkillSyllabusModal,
  SkillFilterBar,
  DurationFilter,
  SolarIcon,
  MasteryPassportModal,
  SkillAssessmentModal,
} from "@/components";
import {
  getPracticeStreak,
  getSpacedRepetitionStore,
  logPracticeDay,
  syncPracticeStatsWithCloud,
  pushPracticeStatsToCloud,
} from "@/lib/spaced-repetition";
import { playMechanicalClick, playChime, playWoodenThud, playStampThud } from "@/lib/workbench-audio";
import {
  CATEGORIES,
  INITIAL_SKILLS,
  normalizeSkillId,
  normalizeCategoryId,
  normalizeStepId,
  isValidUuid,
  isStepCompleted,
} from "@/lib/catalog-data";
import { Skill } from "@/types/database";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { fetchLiveSkills } from "@/services/skillsService";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  // useSearchParams needs a Suspense boundary in the App Router
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user: currentUser, isLoading: loadingAuth } = useAuth();

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
  const [activeExamSkill, setActiveExamSkill] = useState<Skill | null>(null);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null);

  // Craftsman's Guild Certified Skills
  const [certifiedSkillIds, setCertifiedSkillIds] = useState<string[]>([]);

  // Days with any practice, used for the streak and this week's seals
  const [practiceDates, setPracticeDates] = useState<string[]>([]);

  const [isClient, setIsClient] = useState(false);
  const [repertoireView, setRepertoireView] = useState<"ledger" | "grid">("ledger");

  useEffect(() => {
    const saved = localStorage.getItem("skillora_repertoire_view");
    if (saved === "ledger" || saved === "grid") {
      setRepertoireView(saved);
    }
  }, []);

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
    }

      // --- Load Enrollments ---
      const savedEnrolled = localStorage.getItem("skillora_enrolled_skills");
      let localIds: string[] = [];
      if (savedEnrolled) {
        try {
          localIds = (JSON.parse(savedEnrolled) as string[]).map(normalizeSkillId);
        } catch (e) {
          console.error("Error parsing enrolled skills", e);
        }
      }

      if (user) {
        try {
          const { data: enrollData } = await supabase
            .from("user_enrollments")
            .select("skill_id")
            .eq("user_id", user.id);

          const remoteIds = (enrollData || []).map((row: { skill_id: string }) => normalizeSkillId(row.skill_id));
          // MERGE remote and local so newly added skills in the same session are NEVER lost!
          const merged = Array.from(new Set([...remoteIds, ...localIds]));
          if (merged.length > 0) {
            setEnrolledSkillIds(merged);
            localStorage.setItem("skillora_enrolled_skills", JSON.stringify(merged));
            return;
          }
        } catch (err) {
          console.error("Failed to fetch enrollments", err);
        }
      }

      // Fallback to local or default seed
      if (localIds.length > 0) {
        setEnrolledSkillIds(localIds);
      } else {
        // Default seed for first-time / guest testing: Cyrillic script
        const defaultEnrolled = ["a2222222-2222-2222-2222-222222222222"];
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

      // --- Sync Practice Stats, Streak & Spaced Repetition with Cloud ---
      if (user) {
        syncPracticeStatsWithCloud(supabase, user.id).then((cloudStore) => {
          if (cloudStore && cloudStore.practiceDates) {
            setPracticeDates(cloudStore.practiceDates);
          }
        });
      } else {
        setPracticeDates(getSpacedRepetitionStore().practiceDates);
      }
    },
    [supabase]
  );

  useEffect(() => {
    setIsClient(true);

    const user = currentUser;
    loadUserData(user);
  }, [currentUser, loadUserData]);

  useEffect(() => {
    fetchLiveSkills(supabase).then((live) => {
      const savedCustom = localStorage.getItem("skillora_custom_ai_skills");
      let customList: Skill[] = [];
      if (savedCustom) {
        try {
          customList = (JSON.parse(savedCustom) as Skill[]).map((s) => ({
            ...s,
            id: normalizeSkillId(s.id),
          }));
        } catch {
          // ignore
        }
      }

      const baseSkills = live && live.length > 0 ? live : INITIAL_SKILLS;
      const allSkillsMap = new Map<string, Skill>();

      // Put base skills
      baseSkills.forEach((s) => {
        const id = normalizeSkillId(s.id);
        allSkillsMap.set(id, { ...s, id });
      });

      // Put custom AI skills
      customList.forEach((s) => {
        const id = normalizeSkillId(s.id);
        allSkillsMap.set(id, { ...s, id });
      });

      setAllSkills(Array.from(allSkillsMap.values()));
    });

    // Load saved Guild certified skills from localStorage
    let localCertified: string[] = [];
    const savedCertified = localStorage.getItem("skillora_guild_certified_skills");
    if (savedCertified) {
      try {
        localCertified = (JSON.parse(savedCertified) as string[]).map(normalizeSkillId);
        setCertifiedSkillIds(localCertified);
      } catch (e) {
        console.error("Error parsing certified skills", e);
      }
    }

    // Sync with Supabase user_certifications if user is authenticated
    if (currentUser) {
      supabase
        .from("user_certifications")
        .select("skill_id")
        .eq("user_id", currentUser.id)
        .then(({ data, error }) => {
          if (!error && data) {
            const remoteIds = data.map((d: { skill_id: string }) => normalizeSkillId(d.skill_id));
            const merged = Array.from(new Set([...remoteIds, ...localCertified]));
            setCertifiedSkillIds(merged);
            localStorage.setItem("skillora_guild_certified_skills", JSON.stringify(merged));

            // Upload any local-only certifications
            const unuploaded = localCertified.filter((id) => !remoteIds.includes(id) && isValidUuid(id));
            if (unuploaded.length > 0) {
              const rows = unuploaded.map((id) => ({
                user_id: currentUser.id,
                skill_id: id,
              }));
              supabase.from("user_certifications").upsert(rows, { onConflict: "user_id,skill_id" }).then();
            }
          }
        });
    }
  }, [supabase, currentUser]);

  // Handle passing Craftsman's Guild Diagnostic Exam
  const handlePassGuildExam = (skillId: string) => {
    const targetNorm = normalizeSkillId(skillId);
    const updated = Array.from(new Set([...certifiedSkillIds, targetNorm]));
    setCertifiedSkillIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("skillora_guild_certified_skills", JSON.stringify(updated));
    }
    if (currentUser && isValidUuid(targetNorm)) {
      supabase
        .from("user_certifications")
        .upsert(
          { user_id: currentUser.id, skill_id: targetNorm },
          { onConflict: "user_id,skill_id" }
        )
        .then(({ error }) => {
          if (error) console.warn("Note: user_certifications sync:", error.message);
        });
    }
  };

  // 2. Step Completion Toggle with Supabase Sync
  const handleToggleStep = async (stepId: string) => {
    const normStepId = normalizeStepId(stepId);
    const isCurrentlyDone = isStepCompleted(stepId, completedStepIds);
    if (isCurrentlyDone) {
      playMechanicalClick();
    } else {
      playChime();
    }

    const updated = isCurrentlyDone
      ? completedStepIds.filter((id) => id !== stepId && id !== normStepId)
      : Array.from(new Set([...completedStepIds, stepId, normStepId]));

    setCompletedStepIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("skillora_completed_steps", JSON.stringify(updated));
    }
    if (!isCurrentlyDone) {
      logPracticeDay();
      const updatedStore = getSpacedRepetitionStore();
      setPracticeDates(updatedStore.practiceDates);
      if (currentUser) {
        pushPracticeStatsToCloud(supabase, currentUser.id, updatedStore);
      }
    }

    if (currentUser && isValidUuid(normStepId)) {
      try {
        if (isCurrentlyDone) {
          await supabase
            .from("user_step_completions")
            .delete()
            .eq("user_id", currentUser.id)
            .eq("step_id", normStepId);
        } else {
          await supabase
            .from("user_step_completions")
            .insert({
              user_id: currentUser.id,
              step_id: normStepId,
            });
        }
      } catch (err) {
        console.error("Failed to sync step completion to Supabase", err);
      }
    }
  };

  // 3. Remove Skill from My Studio
  const handleRemoveFromStudio = async (skillId: string) => {
    const targetNorm = normalizeSkillId(skillId);
    const updated = enrolledSkillIds.filter((id) => normalizeSkillId(id) !== targetNorm);
    setEnrolledSkillIds(updated);
    localStorage.setItem("skillora_enrolled_skills", JSON.stringify(updated));

    if (currentUser) {
      try {
        await fetch("/api/skills/enroll", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skillId: targetNorm,
            userId: currentUser.id,
          }),
        });
      } catch (err) {
        console.error("Failed to remove enrollment from Supabase", err);
      }
    }
  };

  // 5. Skills currently enrolled in My Studio (Memoized to prevent infinite re-render cycles)
  const myStudioSkills = useMemo(() => {
    const enrolledSet = new Set(enrolledSkillIds.map(normalizeSkillId));
    return allSkills.filter((s) => enrolledSet.has(normalizeSkillId(s.id)));
  }, [allSkills, enrolledSkillIds]);

  // Practice Dates & Streak Tracking
  const refreshPracticeStats = useCallback(() => {
    const store = getSpacedRepetitionStore();
    setPracticeDates(store.practiceDates);
    if (currentUser) {
      pushPracticeStatsToCloud(supabase, currentUser.id, store);
    }
  }, [currentUser, supabase]);

  useEffect(() => {
    refreshPracticeStats();
  }, [refreshPracticeStats]);

  const streak = getPracticeStreak(practiceDates);

  // Deep link from the account menu: /dashboard?open=passport
  useEffect(() => {
    if (searchParams.get("open") === "passport") {
      setIsPassportOpen(true);
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

  // 6. Filter enrolled studio skills by Category, Duration, and Search Query
  const filteredStudioSkills = useMemo(() => {
    return myStudioSkills.filter((skill) => {
      if (
        selectedCategory !== "cat-all" &&
        normalizeCategoryId(skill.category_id) !== normalizeCategoryId(selectedCategory)
      ) {
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
  }, [myStudioSkills, selectedCategory, selectedDuration, searchQuery]);

  // 7. Calculate Metrics (Streak, Active, Mastered)
  const masteredSkills = useMemo(() => {
    return myStudioSkills.filter((skill) => {
      const steps = skill.steps || [];
      return steps.length > 0 && steps.every((st) => isStepCompleted(st.id, completedStepIds));
    });
  }, [myStudioSkills, completedStepIds]);

  const activeSkills = useMemo(() => {
    return myStudioSkills.filter((skill) => {
      const steps = skill.steps || [];
      const isMastered = steps.length > 0 && steps.every((st) => isStepCompleted(st.id, completedStepIds));
      return !isMastered;
    });
  }, [myStudioSkills, completedStepIds]);

  const displayName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.email?.split("@")[0] ||
    "Explorer";

  return (
    <div className="flex-1 flex flex-col workbench-grid text-ink selection:bg-brand-500 selection:text-white">


      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Guest Notification Banner */}
        {!loadingAuth && !currentUser && (
          <div className="mb-6 p-4 rounded-2xl bg-brand-50 border border-brand-200 text-brand-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>You&apos;re browsing as a guest. Progress is saved in this browser only.</span>
            </div>
            <Link
              href="/signup"
              className={buttonClasses({ size: "sm" })}
            >
              Sign up to save progress
            </Link>
          </div>
        )}

        {/* Atelier Broadsheet Masthead */}
        <header className="mb-10">
          {/* Dateline & Issue Strip */}
          <div className="flex items-center justify-between text-3xs font-mono uppercase tracking-widest text-ink-muted pb-3.5 mb-5 border-b border-surface-border">
            <span>
              {isClient
                ? new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                : "STUDIO RECORD"}
              {" "}· PERSONAL ATELIER
            </span>
            <span className="hidden sm:inline">AUTONOMOUS CRAFTSMANSHIP</span>
          </div>

          {/* Title & Passport Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
              Studio
            </h1>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                playWoodenThud();
                setIsPassportOpen(true);
              }}
              className="self-start sm:self-auto"
            >
              <SolarIcon name="diploma-verified-linear" className="w-3.5 h-3.5 text-ink-muted" />
              <span>Mastery Passport ({isClient ? masteredSkills.length : 0})</span>
            </Button>
          </div>

          {/* Typographic Metric Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-white border border-surface-border shadow-2xs">
            <div>
              <span className="text-3xs font-mono uppercase tracking-wider text-ink-muted block mb-1">
                Streak
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif italic text-2xl sm:text-3xl text-ink font-normal tabular-nums">
                  {isClient ? streak : 0}
                </span>
                <span className="text-xs text-ink-muted font-mono">{streak === 1 ? "day" : "days"}</span>
              </div>
            </div>

            <div>
              <span className="text-3xs font-mono uppercase tracking-wider text-ink-muted block mb-1">
                Active Skills
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif italic text-2xl sm:text-3xl text-ink font-normal tabular-nums">
                  {isClient ? activeSkills.length : 0}
                </span>
                <span className="text-xs text-ink-muted font-mono">active</span>
              </div>
            </div>

            <div>
              <span className="text-3xs font-mono uppercase tracking-wider text-ink-muted block mb-1">
                Steps Finished
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif italic text-2xl sm:text-3xl text-ink font-normal tabular-nums">
                  {isClient ? completedStepIds.length : 0}
                </span>
                <span className="text-xs text-ink-muted font-mono">steps</span>
              </div>
            </div>

            <div>
              <span className="text-3xs font-mono uppercase tracking-wider text-ink-muted block mb-1">
                Mastered
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif italic text-2xl sm:text-3xl text-ink font-normal tabular-nums">
                  {isClient ? masteredSkills.length : 0}
                </span>
                <span className="text-xs text-ink-muted font-mono">certified</span>
              </div>
            </div>
          </div>
        </header>

        {/* My Studio Section: Filtered Repertoire */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">
                Your skills ({filteredStudioSkills.length})
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Select a skill to resume practice.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Ledger vs Grid View Switcher */}
              {myStudioSkills.length > 0 && (
                <div className="inline-flex items-center p-0.5 rounded-lg bg-surface-muted border border-surface-border text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      setRepertoireView("ledger");
                      localStorage.setItem("skillora_repertoire_view", "ledger");
                    }}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer text-xs ${
                      repertoireView === "ledger"
                        ? "bg-white text-ink shadow-2xs font-semibold"
                        : "text-ink-muted hover:text-ink"
                    }`}
                    title="Ledger (Strip List) view"
                    aria-pressed={repertoireView === "ledger"}
                  >
                    <SolarIcon name="list-linear" className="w-3.5 h-3.5" />
                    <span>Ledger</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      setRepertoireView("grid");
                      localStorage.setItem("skillora_repertoire_view", "grid");
                    }}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer text-xs ${
                      repertoireView === "grid"
                        ? "bg-white text-ink shadow-2xs font-semibold"
                        : "text-ink-muted hover:text-ink"
                    }`}
                    title="Bookplate Grid view"
                    aria-pressed={repertoireView === "grid"}
                  >
                    <SolarIcon name="grid-linear" className="w-3.5 h-3.5" />
                    <span>Grid</span>
                  </button>
                </div>
              )}

              <Link
                href="/library"
                className={buttonClasses({ variant: "secondary", size: "sm", className: "self-start sm:self-auto" })}
              >
                <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-ink-muted" />
                <span>Add a skill</span>
              </Link>
            </div>
          </div>

          {/* Filter Bar: Only displayed when user has skills in Studio */}
          {myStudioSkills.length > 0 && (
            <div className="mb-6">
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
          )}

          {/* EMPTY STATE */}
          {filteredStudioSkills.length === 0 ? (
            <div className="p-10 sm:p-16 text-center bg-white rounded-3xl border border-dashed border-surface-border max-w-2xl mx-auto">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-canvas border border-surface-border flex items-center justify-center text-ink">
                <SolarIcon name="book-bookmark-linear" className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-lg text-ink mb-1.5">
                {myStudioSkills.length === 0 ? "No skills yet" : "No skills match these filters"}
              </h3>
              <p className="text-sm text-ink-muted mb-6 max-w-md mx-auto">
                {myStudioSkills.length === 0
                  ? "Tell Archimedes what you want to learn and it will appear here."
                  : "Try a different search, category, or length."}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {myStudioSkills.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedCategory("cat-all");
                      setSelectedDuration("all");
                      setSearchQuery("");
                    }}
                  >
                    Clear filters
                  </Button>
                )}

                <Link
                  href="/library"
                  className={buttonClasses()}
                >
                  <span>Open Skill Library</span>
                  <SolarIcon name="arrow-right-linear" className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : repertoireView === "ledger" ? (
            /* 1. CONTINUOUS LEDGER STRIP LIST (Archival Ledger Register Card) */
            <div className="bg-white rounded-2xl border border-surface-border shadow-2xs divide-y divide-surface-border/70 px-5 sm:px-6">
              {filteredStudioSkills.map((skill, idx) => {
                const steps = skill.steps || [];
                const doneCount = steps.filter((s) => isStepCompleted(s.id, completedStepIds)).length;
                const totalCount = steps.length;
                const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
                const isCompleted = totalCount > 0 && doneCount === totalCount;
                const isCertified = certifiedSkillIds.includes(normalizeSkillId(skill.id));
                const isCustomAi = skill.id.startsWith("ai-skill-");
                const isConfirmingRemove = confirmingRemoveId === skill.id;
                const categoryName =
                  skill.category?.name ||
                  CATEGORIES.find((c) => normalizeCategoryId(c.id) === normalizeCategoryId(skill.category_id))?.name ||
                  "Craft";

                const openPractice = () => {
                  playWoodenThud();
                  setActiveLearningSkill(skill);
                };

                return (
                  <div
                    key={skill.id}
                    className="group py-4 -mx-2 px-2 rounded-xl hover:bg-canvas/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Index + Metadata + Title + Summary */}
                    <div className="flex items-start md:items-center gap-4 min-w-0 flex-1">
                      <span className="font-mono text-xs font-semibold text-ink-subtle w-6 shrink-0 mt-0.5 md:mt-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isCustomAi && <Badge>AI</Badge>}
                          <span className="text-3xs font-mono uppercase tracking-wider text-ink-muted font-medium">
                            {categoryName}
                          </span>
                          <span className="text-surface-border text-xs">·</span>
                          <span className="text-3xs font-mono uppercase tracking-wider text-ink-muted capitalize">
                            {skill.difficulty}
                          </span>
                          <span className="text-surface-border text-xs">·</span>
                          <span className="text-3xs font-mono text-ink-muted">{skill.estimated_hours}h</span>
                          {isCertified && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-muted border border-surface-border text-ink text-3xs font-mono font-semibold">
                              <SolarIcon name="diploma-verified-linear" className="w-3 h-3 text-ink-muted" />
                              <span>CERTIFIED</span>
                            </span>
                          )}
                        </div>

                        <h3
                          role="button"
                          tabIndex={0}
                          onClick={openPractice}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openPractice();
                            }
                          }}
                          className="font-serif italic font-normal text-lg sm:text-xl text-ink group-hover:text-accent-vermilion transition-colors cursor-pointer truncate"
                        >
                          {skill.title}
                        </h3>
                        <p className="text-xs text-ink-secondary line-clamp-1 mt-0.5 max-w-2xl">
                          {skill.summary}
                        </p>
                      </div>
                    </div>

                    {/* Right: Architectural Progress Line + Actions */}
                    <div className="flex items-center gap-5 self-stretch md:self-auto justify-between md:justify-end shrink-0 pl-10 md:pl-0">
                      {/* Architectural Progress Indicator */}
                      <div className="w-28 sm:w-36 space-y-1">
                        <div className="flex items-center justify-between text-3xs font-mono text-ink-muted">
                          <span>{isCertified ? "Certified" : isCompleted ? "Complete" : "Progress"}</span>
                          <span className="font-semibold text-ink tabular-nums">{percent}% ({doneCount}/{totalCount})</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-surface-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-ink"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <button
                            type="button"
                            onClick={() => {
                              if (isCertified) playStampThud();
                              else playMechanicalClick();
                              setActiveExamSkill(skill);
                            }}
                            className={`py-1.5 px-3 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                              isCertified
                                ? "bg-white border border-surface-border hover:border-ink/40 text-ink"
                                : "bg-ink hover:bg-ink/90 text-white"
                            }`}
                          >
                            <SolarIcon name="diploma-verified-linear" className="w-3.5 h-3.5" />
                            <span>{isCertified ? "Certificate" : "Assessment"}</span>
                          </button>
                        )}

                        <Button
                          size="sm"
                          onClick={openPractice}
                        >
                          <SolarIcon name="play-linear" className="w-3.5 h-3.5 text-white/80" />
                          <span>{isCompleted ? "Review" : "Practice"}</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => {
                            playMechanicalClick();
                            setActiveSyllabusSkill(skill);
                          }}
                          className="p-2 rounded-lg border border-surface-border hover:border-ink/30 bg-white hover:bg-surface-subtle text-ink-muted hover:text-ink transition flex items-center justify-center cursor-pointer shadow-2xs"
                          title="View syllabus steps"
                          aria-label={`View syllabus steps for ${skill.title}`}
                        >
                          <SolarIcon name="layers-minimalistic-linear" className="w-3.5 h-3.5" />
                        </button>

                        {isConfirmingRemove ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmingRemoveId(null);
                                handleRemoveFromStudio(skill.id);
                              }}
                              className="px-2 py-1 rounded bg-rose-600 text-white text-3xs font-mono font-bold hover:bg-rose-700 transition cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingRemoveId(null)}
                              className="text-3xs font-mono text-ink-muted hover:text-ink px-1 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmingRemoveId(skill.id)}
                            className="text-3xs font-mono text-ink-subtle hover:text-accent-vermilion p-1 transition cursor-pointer"
                            title="Remove from Studio"
                            aria-label={`Remove ${skill.title} from Studio`}
                          >
                            <SolarIcon name="trash-bin-trash-linear" className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 2. CLASSIC BOOKPLATES GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredStudioSkills.map((skill) => {
                  const steps = skill.steps || [];
                  const doneCount = steps.filter((s) => isStepCompleted(s.id, completedStepIds)).length;
                  const totalCount = steps.length;
                  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
                  const isCompleted = totalCount > 0 && doneCount === totalCount;
                  const isCertified = certifiedSkillIds.includes(normalizeSkillId(skill.id));
                  const isCustomAi = skill.id.startsWith("ai-skill-");
                  const isConfirmingRemove = confirmingRemoveId === skill.id;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      key={skill.id}
                      className={`flex flex-col justify-between p-6 bg-white rounded-xl border transition-all duration-200 ease-out group ${
                        isCertified
                          ? "border-ink/20 shadow-2xs hover:border-ink/40 hover:-translate-y-0.5 hover:shadow-xs"
                          : "border-surface-border shadow-2xs hover:border-ink/30 hover:-translate-y-0.5 hover:shadow-xs"
                      }`}
                    >
                      <div>
                        {/* Unified Editorial Metadata Header */}
                        <div className="flex items-center justify-between text-3xs font-mono text-ink-muted uppercase tracking-widest mb-3 pb-2.5 border-b border-surface-border">
                          <div className="flex items-center gap-1.5 font-medium">
                            {isCustomAi && (
                              <Badge>AI</Badge>
                            )}
                            <span className="capitalize">{skill.difficulty}</span>
                            <span className="text-surface-border">|</span>
                            <span>{skill.estimated_hours}h</span>
                            <span className="text-surface-border">|</span>
                            <span>{totalCount} steps</span>
                          </div>

                          {isConfirmingRemove ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmingRemoveId(null);
                                  handleRemoveFromStudio(skill.id);
                                }}
                                className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-3xs font-mono font-bold hover:bg-rose-700 transition cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingRemoveId(null)}
                                className="text-3xs font-mono text-ink-muted hover:text-ink transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmingRemoveId(skill.id)}
                              className="text-3xs font-mono text-ink-subtle hover:text-accent-vermilion transition cursor-pointer"
                              aria-label={`Remove ${skill.title} from My Studio`}
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {/* Title & Description with Golden Stamp badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-serif italic font-normal text-xl sm:text-2xl text-ink group-hover:text-accent-vermilion transition leading-tight">
                            {skill.title}
                          </h3>
                          {isCertified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-muted border border-surface-border text-ink text-3xs font-mono font-semibold flex-shrink-0">
                              <SolarIcon name="diploma-verified-linear" className="w-3.5 h-3.5 text-ink-muted" />
                              <span>CERTIFIED</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-secondary line-clamp-2 mb-4 leading-relaxed">
                          {skill.summary}
                        </p>

                        {/* Precision Architectural Progress Line */}
                        <div className="mb-5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-2xs font-mono uppercase tracking-wider text-ink-muted">
                              {isCertified ? "Certified" : isCompleted ? "Complete" : "Progress"}
                            </span>
                            <span className="text-ink font-mono text-2xs font-semibold tabular-nums">
                              {doneCount}/{totalCount} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-1 rounded-full bg-surface-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-ink"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-surface-border">
                        {/* Certification CTA when 100% complete */}
                        {isCompleted && (
                          <button
                            type="button"
                            onClick={() => {
                              if (isCertified) {
                                playStampThud();
                              } else {
                                playMechanicalClick();
                              }
                              setActiveExamSkill(skill);
                            }}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                              isCertified
                                ? "bg-surface hover:bg-surface-muted border border-surface-border text-ink"
                                : "bg-ink hover:bg-ink/90 text-white"
                            }`}
                          >
                            <SolarIcon name="diploma-verified-linear" className="w-4 h-4" />
                            <span>{isCertified ? "Certificate" : "Assessment"}</span>
                          </button>
                        )}

                        {/* Studio Action Row: Primary Practice + Syllabus Preview */}
                        <div className="flex items-center gap-2">
                          <Button
                            className="flex-1"
                            onClick={() => {
                              playWoodenThud();
                              setActiveLearningSkill(skill);
                            }}
                          >
                            <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-300" />
                            <span>{isCompleted ? "Review" : "Practice"}</span>
                          </Button>

                          <button
                            type="button"
                            onClick={() => {
                              playMechanicalClick();
                              setActiveSyllabusSkill(skill);
                            }}
                            className="p-2.5 rounded-xl border border-surface-border hover:border-brand-400 bg-white hover:bg-surface-subtle text-ink-muted hover:text-ink transition flex items-center justify-center cursor-pointer shadow-2xs"
                            title="View steps & resources"
                            aria-label={`View syllabus steps for ${skill.title}`}
                          >
                            <SolarIcon name="layers-minimalistic-linear" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Discovery Callout Footer */}
        <section className="p-6 sm:p-7 rounded-2xl bg-white border border-surface-border shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-canvas border border-surface-border flex items-center justify-center text-ink flex-shrink-0">
              <SolarIcon name="compass-linear" className="w-5 h-5 text-ink-muted" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-ink">
                Explore more skills
              </h4>
              <p className="text-xs text-ink-muted">
                Ask Archimedes to build a custom curriculum or browse the library.
              </p>
            </div>
          </div>
          <Link href="/library" className={buttonClasses({ variant: "secondary" })}>
            Open Library
          </Link>
        </section>
      </main>

      {/* 1. Skill Practice & Simulators Modal */}
      <AnimatePresence>
        {activeLearningSkill && (
          <SkillPracticeModal
            skill={activeLearningSkill}
            completedStepIds={completedStepIds}
            onToggleStep={handleToggleStep}
            onClose={() => setActiveLearningSkill(null)}
            isGuildCertified={certifiedSkillIds.includes(normalizeSkillId(activeLearningSkill.id))}
            onOpenGuildExam={(skill) => setActiveExamSkill(skill)}
          />
        )}
      </AnimatePresence>

      {/* 2. Step Syllabus & External Resources Modal */}
      <AnimatePresence>
        {activeSyllabusSkill && (
          <SkillSyllabusModal
            skill={activeSyllabusSkill}
            completedStepIds={completedStepIds}
            onToggleStep={handleToggleStep}
            onClose={() => setActiveSyllabusSkill(null)}
            isViewOnly={false}
            isGuildCertified={certifiedSkillIds.includes(normalizeSkillId(activeSyllabusSkill.id))}
            onOpenGuildExam={(skill) => setActiveExamSkill(skill)}
          />
        )}
      </AnimatePresence>

      {/* 4. Japanese Archival Mastery Passport Modal */}
      <AnimatePresence>
        {isPassportOpen && (
          <MasteryPassportModal
            isOpen={isPassportOpen}
            onClose={() => setIsPassportOpen(false)}
            user={currentUser}
            enrolledSkills={myStudioSkills}
            completedStepIds={completedStepIds}
            certifiedSkillIds={certifiedSkillIds}
            onOpenExam={(skill) => {
              setIsPassportOpen(false);
              setActiveExamSkill(skill);
            }}
            userStreak={streak}
          />
        )}
      </AnimatePresence>

      {/* 5. Skill Assessment Certification Exam Modal */}
      <AnimatePresence>
        {activeExamSkill && (
          <SkillAssessmentModal
            isOpen={!!activeExamSkill}
            onClose={() => setActiveExamSkill(null)}
            skill={activeExamSkill}
            onPass={handlePassGuildExam}
            isAlreadyCertified={certifiedSkillIds.includes(normalizeSkillId(activeExamSkill.id))}
            userName={
              currentUser?.user_metadata?.full_name ||
              currentUser?.email?.split("@")[0] ||
              "Scholar"
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
