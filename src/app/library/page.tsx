"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SkillFilterBar, DurationFilter } from "@/components/SkillFilterBar";
import { SkillSyllabusModal } from "@/components/SkillSyllabusModal";
import { SolarIcon } from "@/components/SolarIcon";
import { CATEGORIES, INITIAL_SKILLS } from "@/lib/mock-data";
import { Skill } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { fetchLiveSkills } from "@/lib/skills-service";
import { User } from "@supabase/supabase-js";

export default function SkillLibraryPage() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("cat-all");
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [enrolledSkillIds, setEnrolledSkillIds] = useState<string[]>([]);
  const [activeModalSkill, setActiveModalSkill] = useState<Skill | null>(null);

  // --- Feature 1: AI Skill Deconstructor Modal States ---
  const [isDeconstructModalOpen, setIsDeconstructModalOpen] = useState(false);
  const [deconstructInput, setDeconstructInput] = useState("");
  const [isDeconstructing, setIsDeconstructing] = useState(false);
  const [generatedSkill, setGeneratedSkill] = useState<Skill | null>(null);
  const [deconstructSuccess, setDeconstructSuccess] = useState(false);

  useEffect(() => {
    // Check user & fetch skills
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const live = await fetchLiveSkills(supabase);
      if (live && live.length > 0) {
        // Also check if user has custom AI-deconstructed skills stored locally
        const savedCustom = localStorage.getItem("skillora_custom_ai_skills");
        if (savedCustom) {
          try {
            const customList: Skill[] = JSON.parse(savedCustom);
            setSkills([...customList, ...live]);
          } catch {
            setSkills(live);
          }
        } else {
          setSkills(live);
        }
      }

      // Load enrolled skills
      if (user) {
        const { data: enrollments } = await supabase
          .from("user_enrollments")
          .select("skill_id")
          .eq("user_id", user.id);

        if (enrollments && enrollments.length > 0) {
          const ids = enrollments.map((e: { skill_id: string }) => e.skill_id);
          setEnrolledSkillIds(ids);
          localStorage.setItem("skillora_enrolled_skills", JSON.stringify(ids));
          return;
        }
      }

      // Local storage fallback
      const savedEnrolled = localStorage.getItem("skillora_enrolled_skills");
      if (savedEnrolled) {
        try {
          setEnrolledSkillIds(JSON.parse(savedEnrolled));
        } catch (e) {
          console.error("Error parsing enrolled skills", e);
        }
      } else {
        const defaultSeed = ["skill-cyrillic-script"];
        setEnrolledSkillIds(defaultSeed);
        localStorage.setItem("skillora_enrolled_skills", JSON.stringify(defaultSeed));
      }
    };

    init();
  }, [supabase]);

  // Toggle enroll / add to My Studio
  const handleToggleEnroll = async (skillId: string) => {
    const isEnrolled = enrolledSkillIds.includes(skillId);
    const updated = isEnrolled
      ? enrolledSkillIds.filter((id) => id !== skillId)
      : [...enrolledSkillIds, skillId];

    setEnrolledSkillIds(updated);
    localStorage.setItem("skillora_enrolled_skills", JSON.stringify(updated));

    if (currentUser) {
      try {
        if (isEnrolled) {
          await supabase
            .from("user_enrollments")
            .delete()
            .eq("user_id", currentUser.id)
            .eq("skill_id", skillId);
        } else {
          await supabase
            .from("user_enrollments")
            .insert({
              user_id: currentUser.id,
              skill_id: skillId,
              status: "active",
            });
        }
      } catch (err) {
        console.error("Error syncing enrollment with Supabase", err);
      }
    }
  };

  // --- Feature 1: Trigger OpenAI Skill Deconstruction ---
  const handleDeconstruct = async (topicToDeconstruct?: string) => {
    const topic = topicToDeconstruct || deconstructInput || searchQuery;
    if (!topic.trim()) return;

    setIsDeconstructing(true);
    setGeneratedSkill(null);
    setDeconstructSuccess(false);

    try {
      const res = await fetch("/api/ai/deconstruct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: topic,
          categoryId: selectedCategory !== "cat-all" ? selectedCategory : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to deconstruct skill");

      setGeneratedSkill(data.skill);
    } catch (err: unknown) {
      console.error("AI Deconstruction error:", err);
      alert("AI deconstruction encountered an error. Please try again.");
    } finally {
      setIsDeconstructing(false);
    }
  };

  // Save the AI-generated skill & enroll in My Studio
  const handleSaveAndEnroll = (skill: Skill) => {
    const updatedSkills = [skill, ...skills];
    setSkills(updatedSkills);

    // Save custom skill to localStorage
    const savedCustom = localStorage.getItem("skillora_custom_ai_skills");
    const currentCustom: Skill[] = savedCustom ? JSON.parse(savedCustom) : [];
    localStorage.setItem("skillora_custom_ai_skills", JSON.stringify([skill, ...currentCustom]));

    // Automatically enroll in My Studio
    const updatedEnrolled = [...enrolledSkillIds, skill.id];
    setEnrolledSkillIds(updatedEnrolled);
    localStorage.setItem("skillora_enrolled_skills", JSON.stringify(updatedEnrolled));

    // Supabase sync if logged in
    if (currentUser) {
      supabase
        .from("user_enrollments")
        .insert({
          user_id: currentUser.id,
          skill_id: skill.id,
          status: "active",
        })
        .then(() => {});
    }

    setDeconstructSuccess(true);
    setTimeout(() => {
      setIsDeconstructModalOpen(false);
      setGeneratedSkill(null);
      setDeconstructSuccess(false);
    }, 1800);
  };

  // Filter skills
  const filteredSkills = skills.filter((skill) => {
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-ink selection:bg-brand-500 selection:text-white">
      <Header activePath="/library" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Library Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-2">
              <SolarIcon name="book-bookmark-linear" className="w-3.5 h-3.5" />
              <span>Full Marketplace Catalog</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
              Skill Library
            </h1>
            <p className="text-sm text-ink-muted mt-1 max-w-2xl">
              Browse every discipline available in the market. Add any skill to <strong>My Studio</strong> to practice with flashcards, audio pronunciation, and habit tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Feature 1 Trigger: On-Demand AI Deconstructor */}
            <button
              type="button"
              onClick={() => {
                setDeconstructInput(searchQuery || "");
                setIsDeconstructModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-200" />
              <span>Deconstruct Any Skill (AI)</span>
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-surface-border hover:border-ink/30 text-xs font-semibold text-ink transition shadow-xs whitespace-nowrap"
            >
              <span>My Studio ({enrolledSkillIds.length}) &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Discovery Filter Bar */}
        <section className="mb-8">
          <div className="p-6 bg-white rounded-3xl border border-surface-border shadow-xs">
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

        {/* Catalog Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg text-ink">
              All Skills ({filteredSkills.length})
            </h2>
            <span className="text-xs text-ink-muted">
              Add skills to practice them in your studio queue
            </span>
          </div>

          {filteredSkills.length === 0 ? (
            /* EMPTY SEARCH STATE WITH AI DECONSTRUCTOR ACTION */
            <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-dashed border-surface-border max-w-2xl mx-auto shadow-xs">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                <SolarIcon name="stars-minimalistic-linear" className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-ink mb-1">
                No matching skills for &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted mb-6 max-w-md mx-auto">
                Skillora can build this curriculum right now. Deconstruct &ldquo;{searchQuery}&rdquo; into a step-by-step syllabus with time horizons in 3 seconds.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeconstructInput(searchQuery);
                    setIsDeconstructModalOpen(true);
                    handleDeconstruct(searchQuery);
                  }}
                  className="px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-2"
                >
                  <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-200" />
                  <span>Deconstruct &ldquo;{searchQuery}&rdquo; with AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("cat-all");
                    setSelectedDuration("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2.5 rounded-full bg-canvas text-xs font-semibold text-ink border border-surface-border hover:bg-surface-muted transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map((skill) => {
                const isEnrolled = enrolledSkillIds.includes(skill.id);
                const stepsCount = skill.steps?.length || 3;
                const isCustomAi = skill.id.startsWith("ai-skill-");

                return (
                  <div
                    key={skill.id}
                    className="group flex flex-col justify-between p-6 bg-white rounded-2xl border border-surface-border hover:border-brand-500/40 hover:shadow-xs transition-all relative"
                  >
                    <div>
                      {/* Top Metadata */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                          <SolarIcon name="clock-circle-linear" className="w-3.5 h-3.5 text-ink-subtle" />
                          <span className="font-medium text-ink tabular-nums">
                            {skill.time_commitment_label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isCustomAi && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                              AI Built
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-canvas border border-surface-border text-ink-muted">
                            {skill.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-bold text-lg text-ink group-hover:text-brand-600 transition-colors mb-2">
                        {skill.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-sm text-ink-secondary leading-relaxed line-clamp-3 mb-5">
                        {skill.summary}
                      </p>
                    </div>

                    <div>
                      {/* Step info */}
                      <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs text-ink-muted mb-4">
                        <div className="flex items-center gap-1.5">
                          <SolarIcon name="layers-minimalistic-linear" className="w-3.5 h-3.5 text-ink-subtle" />
                          <span>{stepsCount} Actionable Steps</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveModalSkill(skill)}
                          className="text-brand-600 hover:underline font-semibold"
                        >
                          Preview
                        </button>
                      </div>

                      {/* Primary Action Button: Add to Studio / Remove */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleEnroll(skill.id)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
                            isEnrolled
                              ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                              : "bg-ink hover:bg-neutral-800 text-white shadow-2xs"
                          }`}
                        >
                          <SolarIcon
                            name={isEnrolled ? "check-circle-linear" : "add-circle-linear"}
                            className="w-4 h-4"
                          />
                          <span>{isEnrolled ? "In My Studio (Click to remove)" : "Add to My Studio"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Curriculum Preview Modal */}
      {activeModalSkill && (
        <SkillSyllabusModal
          skill={activeModalSkill}
          isViewOnly={true}
          onClose={() => setActiveModalSkill(null)}
        />
      )}

      {/* ============================================================ */}
      {/* Feature 1: AI Skill Deconstructor Modal                     */}
      {/* ============================================================ */}
      {isDeconstructModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-surface-border shadow-2xl p-6 sm:p-8 my-8 text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                  <SolarIcon name="stars-minimalistic-linear" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-ink">
                    AI Skill Deconstructor
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Turn any craft, instrument, or technique into a structured curriculum in seconds.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeconstructModalOpen(false)}
                className="p-1.5 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-muted transition"
              >
                <SolarIcon name="close-circle-linear" className="w-5 h-5" />
              </button>
            </div>

            {/* Input Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  What skill or discipline do you want to master?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deconstructInput}
                    onChange={(e) => setDeconstructInput(e.target.value)}
                    placeholder="e.g. Sourdough bread folding, Juggling 3 balls, Lockpicking basics..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-canvas border border-surface-border text-xs text-ink focus:outline-none focus:border-brand-500 font-medium"
                    onKeyDown={(e) => e.key === "Enter" && handleDeconstruct()}
                  />
                  <button
                    type="button"
                    disabled={isDeconstructing || !deconstructInput.trim()}
                    onClick={() => handleDeconstruct()}
                    className="px-5 py-2.5 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-40 transition flex items-center gap-2 whitespace-nowrap"
                  >
                    {isDeconstructing ? (
                      <>
                        <SolarIcon name="refresh-linear" className="w-4 h-4 animate-spin text-brand-300" />
                        <span>Deconstructing...</span>
                      </>
                    ) : (
                      <>
                        <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-300" />
                        <span>Deconstruct</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick suggestion chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                <span className="text-[11px] font-medium">Try asking for:</span>
                {["Sourdough Bread Tartine", "Juggle 3 Balls", "Solve 2x2 Rubik's Cube", "Whistling with 2 Fingers"].map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => {
                      setDeconstructInput(idea);
                      handleDeconstruct(idea);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-canvas hover:bg-brand-50 border border-surface-border text-[11px] text-ink-secondary hover:text-brand-700 transition"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Results View */}
            {generatedSkill && (
              <div className="p-5 rounded-2xl bg-canvas border border-brand-500/40 animate-fade-in mb-6">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    {generatedSkill.difficulty} • {generatedSkill.time_commitment_label}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {generatedSkill.steps?.length} Sequential Steps
                  </span>
                </div>

                <h4 className="font-display font-bold text-base text-ink mb-1.5">
                  {generatedSkill.title}
                </h4>
                <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                  {generatedSkill.summary}
                </p>

                {/* Steps Overview */}
                <div className="space-y-2 mb-4">
                  {generatedSkill.steps?.map((step) => (
                    <div
                      key={step.id}
                      className="p-3 bg-white rounded-xl border border-surface-border text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-ink font-semibold">
                          Step {step.step_number}: {step.title}
                        </strong>
                        <span className="text-ink-muted text-[10px]">
                          ~{step.estimated_minutes} mins
                        </span>
                      </div>
                      <p className="text-ink-secondary text-[11px] leading-relaxed">
                        {step.instructions}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Save and enroll button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-ink-muted">
                    Ready to practice with flashcards & streaks?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSaveAndEnroll(generatedSkill)}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition flex items-center gap-2 shadow-xs"
                  >
                    <SolarIcon name="check-circle-linear" className="w-4 h-4" />
                    <span>{deconstructSuccess ? "Added to Studio!" : "Save & Add to My Studio"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
