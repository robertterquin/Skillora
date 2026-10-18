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
  StarterSkills,
  StatsStrip,
  StudioSkeleton,
  WeeklyRecapCard,
  type StudioView,
} from "@/components/studio";
import { useAuth } from "@/hooks/useAuth";
import { useStudioCatalog } from "@/hooks/useStudioCatalog";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useStepProgress } from "@/hooks/useStepProgress";
import { useCertificates } from "@/hooks/useCertificates";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { useInterest } from "@/hooks/useInterest";
import { useStepNotes } from "@/hooks/useStepNotes";
import { useResourceFeedback } from "@/hooks/useResourceFeedback";
import { ResourceFeedbackContext } from "@/components/learning";
import { GUEST_OWNER, isOwnSkill, makePersonalCopy } from "@/lib/personal-copy";
import { aiService } from "@/services/aiService";
import type { ReworkDirection } from "@/components/learning";
import { CATEGORIES, isStepCompleted, normalizeSkillId, onlyCatalogSkills } from "@/lib/catalog-data";
import { filterSkills, getSkillProgress, pickFocusSkill, type DurationFilter } from "@/lib/skill-progress";
import { readString, writeString, STORAGE_KEYS } from "@/lib/storage";
import { playChime, playMechanicalClick, playStampThud, playWoodenThud } from "@/lib/workbench-audio";
import { Skill, SkillStep } from "@/types/database";

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

  const { allSkills, isLoaded: catalogLoaded, rememberSkill } = useStudioCatalog();
  const { enrolledSkillIds, isLoaded: enrollmentsLoaded, addSkill, removeSkill } = useEnrollments(userId, authReady);
  const toast = useToast();
  const practice = usePracticeStats(userId, authReady);
  const { completedStepIds, completedAt, isLoaded: progressLoaded, toggleStep, carryOverSteps } = useStepProgress(userId, authReady, {
    onStepCompleted: practice.recordPracticeDay,
  });
  const { certifiedSkillIds, isCertified, markCertified } = useCertificates(userId, authReady);
  const { interest, setInterest } = useInterest(user, authReady);
  const { getNote, saveNote, copyNotes } = useStepNotes(userId, authReady);
  const resourceFeedback = useResourceFeedback(userId);

  const [view, setView] = useState<StudioView>("ledger");
  const [categoryId, setCategoryId] = useState("cat-all");
  const [duration, setDuration] = useState<DurationFilter>("all");
  const [query, setQuery] = useState("");

  const [practiceSkill, setPracticeSkill] = useState<Skill | null>(null);
  const [stepsSkill, setStepsSkill] = useState<Skill | null>(null);
  const [previewSkill, setPreviewSkill] = useState<Skill | null>(null);
  // Opens the steps modal in edit mode right after making a personal copy.
  const [editOnOpen, setEditOnOpen] = useState(false);
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

  const starterSkills = useMemo(() => onlyCatalogSkills(allSkills), [allSkills]);

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
  const handleAdd = (skill: Skill) => {
    playWoodenThud();
    setPreviewSkill(null);
    addSkill(skill);
    toast({ message: `Added ${skill.title} to your Studio` });
  };
  const handleCustomise = async (skill: Skill) => {
    const { copy, stepIdMap } = makePersonalCopy(skill, userId ?? GUEST_OWNER);
    rememberSkill(copy);
    const saved = await addSkill(copy);
    if (!saved) {
      toast({ message: "Couldn't save your copy. Please try again.", tone: "danger" });
      return;
    }
    carryOverSteps(stepIdMap);
    copyNotes(stepIdMap);
    removeSkill(skill.id);
    setEditOnOpen(true);
    setStepsSkill(copy);
    toast({ message: "Your own copy is ready to edit" });
  };
  const handleSaveEdits = async (edited: Skill) => {
    rememberSkill(edited);
    const saved = await addSkill(edited);
    if (!saved) {
      toast({ message: "Couldn't save your changes. Please try again.", tone: "danger" });
      return;
    }
    setStepsSkill(edited);
    setEditOnOpen(false);
    toast({ message: "Plan saved" });
  };
  const handleReworkStep = async (skill: Skill, step: SkillStep, direction: ReworkDirection) => {
    try {
      const rewritten = await aiService.reworkStep({
        skillTitle: skill.title,
        stepTitle: step.title,
        stepInstructions: step.instructions,
        estimatedMinutes: step.estimated_minutes,
        direction,
      });
      // Keep the step's id and resources; only its content changes.
      return { ...step, ...rewritten };
    } catch (err) {
      console.error(err);
      toast({ message: "Archimedes couldn't rewrite that step. Please try again.", tone: "danger" });
      return null;
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
    <ResourceFeedbackContext.Provider value={resourceFeedback}>
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
            <StarterSkills
              skills={starterSkills}
              interest={interest}
              onChooseInterest={setInterest}
              onPreview={setPreviewSkill}
              onAdd={handleAdd}
            />
          ) : (
            <>
              <WeeklyRecapCard practiceDates={practice.practiceDates} completedAt={completedAt} />

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
              getNote={getNote}
              onSaveNote={saveNote}
              onFocusComplete={practice.recordPracticeDay}
              onOpenGuildExam={(skill) => setExamSkill(skill)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stepsSkill && (
            <SkillSyllabusModal
              key={stepsSkill.id}
              skill={stepsSkill}
              canEdit={isOwnSkill(stepsSkill, userId)}
              onCustomise={handleCustomise}
              onSaveEdits={handleSaveEdits}
              onReworkStep={handleReworkStep}
              startEditing={editOnOpen}
              completedStepIds={completedStepIds}
              onToggleStep={handleToggleStep}
              onClose={() => {
                setStepsSkill(null);
                setEditOnOpen(false);
              }}
              isViewOnly={false}
              isGuildCertified={isCertified(stepsSkill.id)}
              getNote={getNote}
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
          {previewSkill && (
            <SkillSyllabusModal
              skill={previewSkill}
              isViewOnly
              onAdd={handleAdd}
              onClose={() => setPreviewSkill(null)}
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
    </ResourceFeedbackContext.Provider>
  );
}
