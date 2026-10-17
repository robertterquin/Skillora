"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "motion/react";
import {
  AppIcon,
  Button,
  EmptyState,
  MasteryPassportModal,
  SegmentedControl,
  SkillAssessmentModal,
  SkillFilterBar,
  SkillPracticeModal,
  SkillSyllabusModal,
  buttonClasses,
  useToast,
} from "@/components";
import {
  ContinueCard,
  SkillCompleteModal,
  SkillList,
  StatsStrip,
  StudioSkeleton,
  type StudioView,
} from "@/components/studio";
import { useAuth } from "@/hooks/useAuth";
import { useStudioCatalog } from "@/hooks/useStudioCatalog";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useStepProgress } from "@/hooks/useStepProgress";
import { useCertificates } from "@/hooks/useCertificates";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { CATEGORIES, isStepCompleted, normalizeSkillId } from "@/lib/catalog-data";
import { filterSkills, getSkillProgress, pickFocusSkill, type DurationFilter } from "@/lib/skill-progress";
import { readString, writeString, STORAGE_KEYS } from "@/lib/storage";
import { playChime, playMechanicalClick, playStampThud, playWoodenThud } from "@/lib/workbench-audio";
import { Skill } from "@/types/database";

/** Show search and filters only once the Studio is big enough to need them. */
const FILTERS_MIN_SKILLS = 5;

export default function DashboardPage() {
  return (
    <Suspense>
      <Studio />
    </Suspense>
  );
}

function Studio() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const authReady = !authLoading;

  const { allSkills, isLoaded: catalogLoaded } = useStudioCatalog();
  const { enrolledSkillIds, isLoaded: enrollmentsLoaded, addSkill, removeSkill } = useEnrollments(userId, authReady);
  const toast = useToast();
  const practice = usePracticeStats(userId, authReady);
  const { completedStepIds, isLoaded: progressLoaded, toggleStep } = useStepProgress(userId, authReady, {
    onStepCompleted: practice.recordPracticeDay,
  });
  const { certifiedSkillIds, isCertified, markCertified } = useCertificates(userId, authReady);

  const [view, setView] = useState<StudioView>("ledger");
  const [categoryId, setCategoryId] = useState("cat-all");
  const [duration, setDuration] = useState<DurationFilter>("all");
  const [query, setQuery] = useState("");

  const [practiceSkill, setPracticeSkill] = useState<Skill | null>(null);
  const [stepsSkill, setStepsSkill] = useState<Skill | null>(null);
  const [examSkill, setExamSkill] = useState<Skill | null>(null);
  const [isCertificatesOpen, setIsCertificatesOpen] = useState(false);
  const [completedSkill, setCompletedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    const saved = readString(STORAGE_KEYS.studioView);
    if (saved === "ledger" || saved === "grid") setView(saved);
  }, []);

  useEffect(() => {
    if (searchParams.get("open") === "passport") {
      setIsCertificatesOpen(true);
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

  const isLoaded = authReady && catalogLoaded && enrollmentsLoaded && progressLoaded;

  const studioSkills = useMemo(() => {
    const enrolled = new Set(enrolledSkillIds.map(normalizeSkillId));
    return allSkills.filter((s) => enrolled.has(normalizeSkillId(s.id)));
  }, [allSkills, enrolledSkillIds]);

  const visibleSkills = useMemo(
    () => filterSkills(studioSkills, { categoryId, duration, query }),
    [studioSkills, categoryId, duration, query]
  );

  const masteredCount = studioSkills.filter((s) => getSkillProgress(s, completedStepIds).isComplete).length;
  const focusSkill = pickFocusSkill(studioSkills, completedStepIds);
  const showFilters = studioSkills.length >= FILTERS_MIN_SKILLS;
  const firstName = (user?.user_metadata?.full_name || user?.email?.split("@")[0] || "").split(" ")[0];

  const openPractice = (skill: Skill) => {
    playWoodenThud();
    setPracticeSkill(skill);
  };
  const openSteps = (skill: Skill) => {
    playMechanicalClick();
    setStepsSkill(skill);
  };
  const openAssessment = (skill: Skill) => {
    if (isCertified(skill.id)) playStampThud();
    else playMechanicalClick();
    setExamSkill(skill);
  };
  const handleToggleStep = (stepId: string) => {
    if (isStepCompleted(stepId, completedStepIds)) {
      playMechanicalClick();
      toggleStep(stepId);
      return;
    }

    playStampThud();
    playChime();
    toggleStep(stepId);

    // Was this the last step of its skill? Let the step animation play, then celebrate.
    const skill = studioSkills.find((s) => s.steps?.some((st) => st.id === stepId));
    const others = skill?.steps?.filter((st) => st.id !== stepId) ?? [];
    if (skill && others.every((st) => isStepCompleted(st.id, completedStepIds))) {
      window.setTimeout(() => {
        setPracticeSkill(null);
        setStepsSkill(null);
        practice.refresh();
        setCompletedSkill(skill);
      }, 900);
    }
  };
  const handleRemove = (skill: Skill) => {
    removeSkill(skill.id);
    toast({
      message: `Removed ${skill.title} from your Studio`,
      tone: "info",
      action: {
        label: "Undo",
        onClick: () => {
          addSkill(skill);
          toast({ message: `${skill.title} is back in your Studio` });
        },
      },
    });
  };
  const handlePass = (skillId: string) => {
    const wasCertified = isCertified(skillId);
    markCertified(skillId);
    if (!wasCertified) {
      toast({
        message: "Certificate saved",
        action: { label: "View", onClick: () => setIsCertificatesOpen(true) },
      });
    }
  };
  const changeView = (next: StudioView) => {
    playMechanicalClick();
    setView(next);
    writeString(STORAGE_KEYS.studioView, next);
  };
  const clearFilters = () => {
    setCategoryId("cat-all");
    setDuration("all");
    setQuery("");
  };

  return (
    <div className="flex-1 flex flex-col bg-canvas text-ink">
      <main id="main" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {authReady && !user && (
          <div className="p-4 rounded-2xl bg-white border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-ink-secondary">
            <div className="flex items-center gap-2">
              <AppIcon name="info-circle-linear" className="w-4 h-4 text-ink-muted shrink-0" />
              <span>You&apos;re browsing as a guest. Progress is saved in this browser only.</span>
            </div>
            <Link href="/signup" className={buttonClasses({ size: "sm" })}>
              Sign up to save progress
            </Link>
          </div>
        )}

        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
              Your <span className="font-serif italic font-normal text-brand-600">Studio</span>
            </h1>
            {firstName && <p className="mt-1 text-sm text-ink-muted">Welcome back, {firstName}.</p>}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="self-start sm:self-auto"
            onClick={() => {
              playWoodenThud();
              setIsCertificatesOpen(true);
            }}
          >
            <AppIcon name="diploma-verified-linear" className="w-3.5 h-3.5 text-ink-muted" />
            <span>Certificates</span>
          </Button>
        </header>

        {!isLoaded ? (
          <StudioSkeleton />
        ) : studioSkills.length === 0 ? (
          <EmptyState
            icon="stars-minimalistic-linear"
            title="Your Studio is empty"
            description="Tell Archimedes what you want to learn. It will build a step-by-step practice plan and add it here."
            action={
              <Link href="/library" className={buttonClasses({ size: "lg" })}>
                <span>Ask Archimedes</span>
                <AppIcon name="arrow-right-linear" className="w-4 h-4" />
              </Link>
            }
          />
        ) : (
          <>
            {focusSkill && (
              <ContinueCard
                skill={focusSkill}
                completedStepIds={completedStepIds}
                onResume={() => openPractice(focusSkill)}
                onViewSteps={() => openSteps(focusSkill)}
              />
            )}

            <StatsStrip
              week={practice.week}
              stepsDone={completedStepIds.length}
              masteredCount={masteredCount}
            />

            <section aria-labelledby="skills-heading" className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 id="skills-heading" className="font-display font-bold text-xl">
                  All skills <span className="text-ink-muted font-medium">({studioSkills.length})</span>
                </h2>
                <div className="flex items-center gap-2">
                  <SegmentedControl
                    label="Skill layout"
                    layoutId="studioViewToggle"
                    size="sm"
                    value={view}
                    onChange={changeView}
                    options={[
                      { value: "ledger", label: "List", icon: "list-linear" },
                      { value: "grid", label: "Grid", icon: "grid-linear" },
                    ]}
                  />
                  <Link href="/library" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                    <AppIcon name="add-circle-linear" className="w-4 h-4 text-ink-muted" />
                    <span>Add a skill</span>
                  </Link>
                </div>
              </div>

              {showFilters && (
                <SkillFilterBar
                  categories={CATEGORIES}
                  selectedCategory={categoryId}
                  onSelectCategory={setCategoryId}
                  selectedDuration={duration}
                  onSelectDuration={setDuration}
                  searchQuery={query}
                  onSearchChange={setQuery}
                />
              )}

              {visibleSkills.length === 0 ? (
                <EmptyState
                  icon="magnifer-linear"
                  title="No skills match these filters"
                  description="Try a different search, category, or length."
                  action={
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <SkillList
                  skills={visibleSkills}
                  view={view}
                  completedStepIds={completedStepIds}
                  isCertified={isCertified}
                  onPractice={openPractice}
                  onViewSteps={openSteps}
                  onAssessment={openAssessment}
                  onRemove={handleRemove}
                />
              )}
            </section>
          </>
        )}
      </main>

      <AnimatePresence>
        {practiceSkill && (
          <SkillPracticeModal
            skill={practiceSkill}
            completedStepIds={completedStepIds}
            onToggleStep={handleToggleStep}
            onClose={() => {
              setPracticeSkill(null);
              practice.refresh();
            }}
            isGuildCertified={isCertified(practiceSkill.id)}
            onOpenGuildExam={(skill) => setExamSkill(skill)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stepsSkill && (
          <SkillSyllabusModal
            skill={stepsSkill}
            completedStepIds={completedStepIds}
            onToggleStep={handleToggleStep}
            onClose={() => setStepsSkill(null)}
            isViewOnly={false}
            isGuildCertified={isCertified(stepsSkill.id)}
            onOpenGuildExam={(skill) => setExamSkill(skill)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCertificatesOpen && (
          <MasteryPassportModal
            isOpen={isCertificatesOpen}
            onClose={() => setIsCertificatesOpen(false)}
            user={user}
            enrolledSkills={studioSkills}
            completedStepIds={completedStepIds}
            certifiedSkillIds={certifiedSkillIds}
            onOpenExam={(skill) => {
              setIsCertificatesOpen(false);
              setExamSkill(skill);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {completedSkill && (
          <SkillCompleteModal
            skill={completedSkill}
            isCertified={isCertified(completedSkill.id)}
            onClose={() => setCompletedSkill(null)}
            onTakeAssessment={() => {
              const skill = completedSkill;
              setCompletedSkill(null);
              openAssessment(skill);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {examSkill && (
          <SkillAssessmentModal
            isOpen
            onClose={() => setExamSkill(null)}
            skill={examSkill}
            onPass={handlePass}
            isAlreadyCertified={isCertified(examSkill.id)}
            userName={user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Learner"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
