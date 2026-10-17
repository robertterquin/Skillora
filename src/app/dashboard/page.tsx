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
  AppIcon,
  EmptyState,
  IconButton,
  SegmentedControl,
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

  const [allSkills, setAllSkills] = useState<Skill[]>(INITIAL_SKILLS);

  const [enrolledSkillIds, setEnrolledSkillIds] = useState<string[]>([]);

  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("cat-all");
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [activeLearningSkill, setActiveLearningSkill] = useState<Skill | null>(null);
  const [activeSyllabusSkill, setActiveSyllabusSkill] = useState<Skill | null>(null);
  const [activeExamSkill, setActiveExamSkill] = useState<Skill | null>(null);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null);

  const [certifiedSkillIds, setCertifiedSkillIds] = useState<string[]>([]);

  const [practiceDates, setPracticeDates] = useState<string[]>([]);

  const [isClient, setIsClient] = useState(false);
  const [repertoireView, setRepertoireView] = useState<"ledger" | "grid">("ledger");

  useEffect(() => {
    const saved = localStorage.getItem("skillora_repertoire_view");
    if (saved === "ledger" || saved === "grid") {
      setRepertoireView(saved);
    }
  }, []);

  const loadUserData = useCallback(async (user: User | null) => {
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

      if (localIds.length > 0) {
        setEnrolledSkillIds(localIds);
      } else {
        const defaultEnrolled = ["a2222222-2222-2222-2222-222222222222"];
        setEnrolledSkillIds(defaultEnrolled);
        localStorage.setItem("skillora_enrolled_skills", JSON.stringify(defaultEnrolled));
      }

      const savedSteps = localStorage.getItem("skillora_completed_steps");
      if (savedSteps) {
        try {
          setCompletedStepIds(JSON.parse(savedSteps));
        } catch (e) {
          console.error("Error parsing completed steps", e);
        }
      }

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
        }
      }

      const baseSkills = live && live.length > 0 ? live : INITIAL_SKILLS;
      const allSkillsMap = new Map<string, Skill>();

      baseSkills.forEach((s) => {
        const id = normalizeSkillId(s.id);
        allSkillsMap.set(id, { ...s, id });
      });

      customList.forEach((s) => {
        const id = normalizeSkillId(s.id);
        allSkillsMap.set(id, { ...s, id });
      });

      setAllSkills(Array.from(allSkillsMap.values()));
    });

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

  const myStudioSkills = useMemo(() => {
    const enrolledSet = new Set(enrolledSkillIds.map(normalizeSkillId));
    return allSkills.filter((s) => enrolledSet.has(normalizeSkillId(s.id)));
  }, [allSkills, enrolledSkillIds]);

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

  useEffect(() => {
    if (searchParams.get("open") === "passport") {
      setIsPassportOpen(true);
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

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

  const currentFocusSkill = activeSkills[0] || myStudioSkills[0];
  const nextIncompleteStep = currentFocusSkill?.steps?.find(
    (s) => !isStepCompleted(s.id, completedStepIds)
  );
  const currentFocusStepNumber = nextIncompleteStep
    ? nextIncompleteStep.step_number
    : (currentFocusSkill?.steps?.length || 1);

  const displayName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.email?.split("@")[0] ||
    "Explorer";

  return (
    <div className="flex-1 flex flex-col bg-canvas text-ink selection:bg-brand-500 selection:text-white">

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!loadingAuth && !currentUser && (
          <div className="mb-6 p-4 rounded-2xl bg-brand-50 border border-brand-200 text-brand-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AppIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
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

        <header className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
            <div className="space-y-1.5 min-w-0 flex-1">
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
                Your <span className="font-serif italic font-normal text-brand-600">Studio</span>
              </h1>

              {currentFocusSkill ? (
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden="true" />
                  <span className="shrink-0">Continue</span>
                  <button
                    type="button"
                    onClick={() => {
                      playWoodenThud();
                      setActiveLearningSkill(currentFocusSkill);
                    }}
                    className="font-medium text-ink hover:text-accent-vermilion transition inline-flex items-center gap-1.5 cursor-pointer truncate max-w-xs sm:max-w-md group"
                    title={`Resume ${currentFocusSkill.title}`}
                  >
                    <span className="truncate group-hover:underline underline-offset-2">
                      {currentFocusSkill.title}
                    </span>
                    <span className="text-ink-muted font-mono text-xs shrink-0">
                      (Step {currentFocusStepNumber})
                    </span>
                    <AppIcon
                      name="arrow-right-linear"
                      className="w-3 h-3 text-accent-vermilion group-hover:translate-x-0.5 transition shrink-0"
                    />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-ink-muted">
                  Ask Archimedes what you want to learn to start your first skill.
                </p>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                playWoodenThud();
                setIsPassportOpen(true);
              }}
              className="self-start sm:self-auto shrink-0"
            >
              <AppIcon name="diploma-verified-linear" className="w-3.5 h-3.5 text-ink-muted" />
              <span>Certificates</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-white border border-surface-border shadow-2xs">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-ink-muted block mb-1">
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
              <span className="text-xs font-mono uppercase tracking-wider text-ink-muted block mb-1">
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
              <span className="text-xs font-mono uppercase tracking-wider text-ink-muted block mb-1">
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
              <span className="text-xs font-mono uppercase tracking-wider text-ink-muted block mb-1">
                Mastered
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif italic text-2xl sm:text-3xl text-ink font-normal tabular-nums">
                  {isClient ? masteredSkills.length : 0}
                </span>
                <span className="text-xs text-ink-muted font-mono">skills</span>
              </div>
            </div>
          </div>
        </header>

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
              {myStudioSkills.length > 0 && (
                <SegmentedControl
                  label="Skill layout"
                  layoutId="studioViewToggle"
                  size="sm"
                  value={repertoireView}
                  onChange={(view) => {
                    playMechanicalClick();
                    setRepertoireView(view);
                    try {
                      localStorage.setItem("skillora_repertoire_view", view);
                    } catch {}
                  }}
                  options={[
                    { value: "ledger", label: "List", icon: "list-linear" },
                    { value: "grid", label: "Grid", icon: "grid-linear" },
                  ]}
                />
              )}

              <Link
                href="/library"
                className={buttonClasses({ variant: "secondary", size: "sm", className: "self-start sm:self-auto" })}
              >
                <AppIcon name="stars-minimalistic-linear" className="w-4 h-4 text-ink-muted" />
                <span>Add a skill</span>
              </Link>
            </div>
          </div>

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

          {filteredStudioSkills.length === 0 ? (
            <EmptyState
              title={myStudioSkills.length === 0 ? "No skills yet" : "No skills match these filters"}
              description={
                myStudioSkills.length === 0
                  ? "Tell Archimedes what you want to learn and it will appear here."
                  : "Try a different search, category, or length."
              }
              action={
                <>
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
                  <Link href="/library" className={buttonClasses()}>
                    <span>Ask Archimedes</span>
                    <AppIcon name="arrow-right-linear" className="w-4 h-4" />
                  </Link>
                </>
              }
            />
          ) : repertoireView === "ledger" ? (
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
                    <div className="flex items-start md:items-center gap-4 min-w-0 flex-1">
                      <span className="font-mono text-xs font-semibold text-ink-subtle w-6 shrink-0 mt-0.5 md:mt-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isCustomAi && <Badge>AI</Badge>}
                          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted font-medium">
                            {categoryName}
                          </span>
                          <span className="text-surface-border text-xs">·</span>
                          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted capitalize">
                            {skill.difficulty}
                          </span>
                          <span className="text-surface-border text-xs">·</span>
                          <span className="text-xs font-mono text-ink-muted">{skill.estimated_hours}h</span>
                          {isCertified && (
                            <Badge tone="success">
                              <AppIcon name="diploma-verified-linear" className="w-3 h-3" />
                              <span>Certified</span>
                            </Badge>
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

                    <div className="flex items-center gap-5 self-stretch md:self-auto justify-between md:justify-end shrink-0 pl-10 md:pl-0">
                      <div className="w-28 sm:w-36 space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
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

                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <Button
                            size="sm"
                            variant={isCertified ? "secondary" : "accent"}
                            onClick={() => {
                              if (isCertified) playStampThud();
                              else playMechanicalClick();
                              setActiveExamSkill(skill);
                            }}
                          >
                            <AppIcon name="diploma-verified-linear" className="w-3.5 h-3.5" />
                            <span>{isCertified ? "View certificate" : "Take assessment"}</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={openPractice}
                        >
                          <AppIcon name="play-linear" className="w-3.5 h-3.5 text-white/80" />
                          <span>{isCompleted ? "Review" : "Practice"}</span>
                        </Button>

                        <IconButton
                          icon="layers-minimalistic-linear"
                          size="sm"
                          label={`View steps for ${skill.title}`}
                          title="View steps"
                          onClick={() => {
                            playMechanicalClick();
                            setActiveSyllabusSkill(skill);
                          }}
                        />

                        {isConfirmingRemove ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setConfirmingRemoveId(null);
                                handleRemoveFromStudio(skill.id);
                              }}
                            >
                              Remove
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfirmingRemoveId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <IconButton
                            icon="trash-bin-trash-linear"
                            variant="ghost"
                            size="sm"
                            label={`Remove ${skill.title} from Studio`}
                            title="Remove from Studio"
                            className="hover:text-danger hover:bg-danger-light"
                            onClick={() => setConfirmingRemoveId(skill.id)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
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
                        <div className="flex items-center justify-between text-xs font-mono text-ink-muted uppercase tracking-wider mb-3 pb-2.5 border-b border-surface-border">
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
                            <div className="flex items-center gap-1 normal-case tracking-normal font-sans">
                              <Button
                                size="sm"
                                variant="danger"
                                className="h-7 px-2.5"
                                onClick={() => {
                                  setConfirmingRemoveId(null);
                                  handleRemoveFromStudio(skill.id);
                                }}
                              >
                                Remove
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2.5"
                                onClick={() => setConfirmingRemoveId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <IconButton
                              icon="trash-bin-trash-linear"
                              variant="ghost"
                              size="sm"
                              label={`Remove ${skill.title} from Studio`}
                              title="Remove from Studio"
                              className="w-7 h-7 hover:text-danger hover:bg-danger-light"
                              onClick={() => setConfirmingRemoveId(skill.id)}
                            />
                          )}
                        </div>

                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-serif italic font-normal text-xl sm:text-2xl text-ink group-hover:text-accent-vermilion transition leading-tight">
                            {skill.title}
                          </h3>
                          {isCertified && (
                            <Badge tone="success" className="flex-shrink-0">
                              <AppIcon name="diploma-verified-linear" className="w-3 h-3" />
                              <span>Certified</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-ink-secondary line-clamp-2 mb-4 leading-relaxed">
                          {skill.summary}
                        </p>

                        <div className="mb-5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
                              {isCertified ? "Certified" : isCompleted ? "Complete" : "Progress"}
                            </span>
                            <span className="text-ink font-mono text-xs font-semibold tabular-nums">
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

                      <div className="space-y-2 pt-2 border-t border-surface-border">
                        {isCompleted && (
                          <Button
                            block
                            variant={isCertified ? "secondary" : "accent"}
                            onClick={() => {
                              if (isCertified) {
                                playStampThud();
                              } else {
                                playMechanicalClick();
                              }
                              setActiveExamSkill(skill);
                            }}
                          >
                            <AppIcon name="diploma-verified-linear" className="w-4 h-4" />
                            <span>{isCertified ? "View certificate" : "Take assessment"}</span>
                          </Button>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            className="flex-1"
                            onClick={() => {
                              playWoodenThud();
                              setActiveLearningSkill(skill);
                            }}
                          >
                            <AppIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-300" />
                            <span>{isCompleted ? "Review" : "Practice"}</span>
                          </Button>

                          <IconButton
                            icon="layers-minimalistic-linear"
                            size="lg"
                            label={`View steps for ${skill.title}`}
                            title="View steps & resources"
                            onClick={() => {
                              playMechanicalClick();
                              setActiveSyllabusSkill(skill);
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        <section className="p-6 sm:p-7 rounded-2xl bg-white border border-surface-border shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-canvas border border-surface-border flex items-center justify-center text-ink flex-shrink-0">
              <AppIcon name="compass-linear" className="w-5 h-5 text-ink-muted" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-ink">
                Explore more skills
              </h4>
              <p className="text-xs text-ink-muted">
                Ask Archimedes to build a practice plan for anything you want to learn.
              </p>
            </div>
          </div>
          <Link href="/library" className={buttonClasses({ variant: "secondary" })}>
            Ask Archimedes
          </Link>
        </section>
      </main>

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
