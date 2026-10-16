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
  GuidedPracticeSessionModal,
} from "@/components";
import {
  getDailyDocket,
  getPracticeStreak,
  getSpacedRepetitionStore,
  getWeekActivity,
  logPracticeDay,
  syncPracticeStatsWithCloud,
  pushPracticeStatsToCloud,
  DocketItem,
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

  // Spaced Repetition Docket State
  const [docketItems, setDocketItems] = useState<DocketItem[]>([]);
  const [isGuidedPracticeOpen, setIsGuidedPracticeOpen] = useState(false);
  const [guidedPracticeInitialIndex, setGuidedPracticeInitialIndex] = useState(0);

  const refreshDocket = useCallback(() => {
    const store = getSpacedRepetitionStore();
    setPracticeDates(store.practiceDates);
    if (currentUser) {
      pushPracticeStatsToCloud(supabase, currentUser.id, store);
    }
    if (myStudioSkills.length > 0) {
      const docket = getDailyDocket(myStudioSkills, completedStepIds);
      setDocketItems(docket.items);
    } else {
      setDocketItems([]);
    }
  }, [myStudioSkills, completedStepIds, currentUser, supabase]);

  useEffect(() => {
    refreshDocket();
  }, [refreshDocket]);

  const streak = getPracticeStreak(practiceDates);
  const weekActivity = getWeekActivity(practiceDates);
  const docketDoneCount = docketItems.filter((i) => i.isCompletedToday).length;
  const isDocketDone = docketItems.length > 0 && docketDoneCount === docketItems.length;

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
                : "STUDIO DISPATCH"}
              {" "}· PERSONAL ATELIER
            </span>
            <span className="hidden sm:inline">AUTONOMOUS CRAFTSMANSHIP DISPATCH</span>
          </div>

          {/* Title & Passport Action */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
            <div className="space-y-1.5">
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
                {displayName}&apos;s Studio
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Your craftsmanship repertoire and daily spaced repetition practice.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                playWoodenThud();
                setIsPassportOpen(true);
              }}
              className="self-start md:self-auto"
            >
              <SolarIcon name="diploma-verified-linear" className="w-3.5 h-3.5 text-ink-muted" />
              <span>Mastery Passport ({isClient ? masteredSkills.length : 0})</span>
            </Button>
          </div>

          {/* Containerless Typographic Stat-Line Chain */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-5 border-y border-surface-border">
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
                <span className="text-xs text-ink-muted font-mono">in studio</span>
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

            <div>
              <span className="text-3xs font-mono uppercase tracking-wider text-ink-muted block mb-1">
                Daily Docket
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif italic text-2xl sm:text-3xl text-ink font-normal tabular-nums">
                  {isClient ? docketItems.length - docketDoneCount : 0}
                </span>
                <span className="text-xs text-ink-muted font-mono">pending</span>
              </div>
            </div>
          </div>
        </header>

        {/* 100% Containerless Daily Practice Station */}
        {myStudioSkills.length > 0 && (
          <section className="mb-14">
            {/* Header: Practice Docket & Primary CTA */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 mb-1 border-b border-surface-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="spec-tag text-ink-muted">DAILY DOCKET</span>
                  {docketItems.some((i) => i.urgency === "overdue") && (
                    <Badge tone="danger">Needs review</Badge>
                  )}
                </div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-ink tracking-tight">
                  Today&apos;s Practice
                </h2>
                <p className="text-xs text-ink-muted">
                  {docketItems.length > 0
                    ? `${docketDoneCount} of ${docketItems.length} drills completed today · ~${docketItems.length * 5} min total`
                    : "No pending practice drills scheduled for today."}
                </p>
              </div>

              {docketItems.length > 0 && (
                <Button
                  onClick={() => {
                    playMechanicalClick();
                    setGuidedPracticeInitialIndex(0);
                    setIsGuidedPracticeOpen(true);
                  }}
                  className="self-start sm:self-auto"
                >
                  <SolarIcon name="play-linear" className="w-4 h-4 text-white/80" />
                  <span>
                    {docketItems.every((i) => i.isCompletedToday)
                      ? "Review today's drills"
                      : `Start session · ~${docketItems.length * 5} min`}
                  </span>
                </Button>
              )}
            </div>

            {/* Drill List (Linear/Read.cv containerless rows directly on oat canvas) */}
            {docketItems.length > 0 ? (
              <div className="divide-y divide-surface-border/70 border-b border-surface-border">
                {docketItems.slice(0, 4).map((item, idx) => {
                  const isOverdue = item.urgency === "overdue";
                  const isDueToday = item.urgency === "due_today";

                  const openDrill = () => {
                    playMechanicalClick();
                    setGuidedPracticeInitialIndex(idx);
                    setIsGuidedPracticeOpen(true);
                  };

                  return (
                    <div
                      key={item.step.id}
                      role="button"
                      tabIndex={0}
                      onClick={openDrill}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openDrill();
                        }
                      }}
                      className="group py-4 px-3 -mx-3 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/80"
                    >
                      {/* Left: Index + Status Dot + Step Details */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <span className="font-mono text-xs font-semibold text-ink-subtle w-5 shrink-0 mt-0.5 sm:mt-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>

                        <div className="mt-0.5 sm:mt-0 shrink-0">
                          {item.isCompletedToday ? (
                            <div className="w-6 h-6 rounded-full bg-accent-emerald/10 text-accent-emerald flex items-center justify-center">
                              <SolarIcon name="check-circle-linear" className="w-3.5 h-3.5" />
                            </div>
                          ) : isOverdue ? (
                            <div className="w-6 h-6 rounded-full bg-accent-vermilion/10 text-accent-vermilion flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-accent-vermilion" />
                            </div>
                          ) : isDueToday ? (
                            <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-amber-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-surface-muted text-ink-muted flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-ink-muted" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-3xs font-mono uppercase tracking-wider text-ink-muted font-semibold truncate">
                              {item.skill.title}
                            </span>
                            {item.isCompletedToday ? (
                              <Badge tone="success">Done</Badge>
                            ) : isOverdue ? (
                              <Badge tone="danger">Overdue +{item.daysOverdue}d</Badge>
                            ) : isDueToday ? (
                              <Badge tone="warning">Due today</Badge>
                            ) : (
                              <Badge>New</Badge>
                            )}
                          </div>
                          <h3 className="font-display font-semibold text-sm sm:text-base text-ink group-hover:text-accent-vermilion transition-colors truncate">
                            {item.step.title}
                          </h3>
                          <p className="text-xs text-ink-secondary line-clamp-1 mt-0.5 leading-relaxed">
                            {item.step.instructions}
                          </p>
                        </div>
                      </div>

                      {/* Right: Duration + Practice Action */}
                      <div className="flex items-center gap-4 self-end sm:self-auto shrink-0 text-xs font-mono">
                        <span className="text-2xs text-ink-muted">~{item.step.estimated_minutes} min</span>
                        <span className="text-2xs font-bold text-ink group-hover:text-accent-vermilion flex items-center gap-1 transition">
                          <span>{item.isCompletedToday ? "Review" : "Practice"}</span>
                          <SolarIcon name="arrow-right-linear" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-ink-muted font-sans border-b border-surface-border">
                No pending practice drills scheduled for today.
              </div>
            )}

            {/* Weekly Consistency Rhythm & Craft Axiom (Single Unboxed Footer Strip) */}
            <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-3xs font-mono font-bold uppercase tracking-widest text-ink-muted">
                  7-DAY RHYTHM
                </span>

                <ol className="flex items-center gap-1.5" aria-label="Practice this week">
                  {weekActivity.map((day) => (
                    <li
                      key={day.date}
                      aria-label={`${day.date}${day.isToday ? " (today)" : ""}: ${
                        day.practiced ? "practiced" : day.isFuture ? "upcoming" : "no practice"
                      }`}
                      className="flex items-center gap-1"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-3xs font-mono transition-all ${
                          day.practiced
                            ? "bg-ink border-ink text-white font-bold"
                            : day.isToday
                            ? "bg-white border-dashed border-ink/40 text-ink font-semibold"
                            : day.isFuture
                            ? "bg-canvas border-surface-border text-ink-subtle"
                            : "bg-surface-muted border-surface-border text-ink-subtle"
                        }`}
                      >
                        {day.practiced ? (
                          <SolarIcon name="check-circle-linear" className="w-3 h-3 text-white" />
                        ) : (
                          <span aria-hidden="true">{day.label}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Craft Axiom */}
              <p className="text-xs font-serif italic text-ink-muted">
                &ldquo;Repetition without tension creates speed without effort.&rdquo;
                <span className="font-sans not-italic text-3xs font-mono uppercase tracking-wider text-ink-subtle ml-2">
                  — Craft Axiom
                </span>
              </p>
            </div>
          </section>
        )}

        {/* My Studio Section: Filtered Repertoire */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display font-bold text-xl text-ink">
                Your skills ({filteredStudioSkills.length})
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Open a skill to practice with flashcards, interactive tools, voice grading, and technique coaching.
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
            /* 1. CONTINUOUS LEDGER STRIP LIST (Containerless Linear/Read.cv style) */
            <div className="divide-y divide-surface-border/70 border-y border-surface-border">
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
                    className="group py-4 px-3 -mx-3 rounded-xl hover:bg-white/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                            <span>{isCertified ? "Certificate" : "Exam"}</span>
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
                            <span>{isCertified ? "View Certificate" : "Take Assessment"}</span>
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
        <section className="pt-8 pb-4 border-t border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-surface-border flex items-center justify-center text-ink flex-shrink-0 shadow-2xs">
              <SolarIcon name="compass-linear" className="w-5 h-5 text-ink-muted" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-ink">
                Ready for another skill?
              </h4>
              <p className="text-xs text-ink-muted">
                Tell Archimedes what you want to learn next.
              </p>
            </div>
          </div>
          <Link href="/library" className={buttonClasses({ variant: "secondary" })}>
            Open Skill Library
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

      {/* 6. Guided Deliberate Practice Session Modal (SM-2 Spaced Repetition) */}
      <AnimatePresence>
        {isGuidedPracticeOpen && docketItems.length > 0 && (
          <GuidedPracticeSessionModal
            isOpen={isGuidedPracticeOpen}
            onClose={() => setIsGuidedPracticeOpen(false)}
            docketItems={docketItems}
            initialIndex={guidedPracticeInitialIndex}
            onDocketUpdated={refreshDocket}
            onStepCompleted={handleToggleStep}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
