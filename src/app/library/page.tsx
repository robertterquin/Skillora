"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import {
  Badge,
  AppIcon,
  InteractiveOwlAvatar,
  buttonClasses,
  IconButton,
  QuickReplies,
  SuggestionCards,
  CurriculumCard,
  ConsultationSidebar,
} from "@/components";
import { playChime } from "@/lib/workbench-audio";
import { Skill } from "@/types/database";
import { INITIAL_SKILLS, normalizeSkillId } from "@/lib/catalog-data";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useOwlChat } from "@/hooks/useOwlChat";

export default function SkillLibraryPage() {
  const supabase = createClient();
  const { user: currentUser } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyHeight = document.body.style.height;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.height = originalBodyHeight;
    };
  }, []);

  const [enrolledSkillIds, setEnrolledSkillIds] = useState<string[]>([]);
  const [enrolledSkills, setEnrolledSkills] = useState<Skill[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const user = currentUser;

      const savedEnrolled = localStorage.getItem("skillora_enrolled_skills");
      let localIds: string[] = [];
      if (savedEnrolled) {
        try {
          localIds = (JSON.parse(savedEnrolled) as string[]).map(normalizeSkillId);
        } catch {
        }
      }

      const savedCustom = localStorage.getItem("skillora_custom_ai_skills");
      let customSkills: Skill[] = [];
      if (savedCustom) {
        try {
          customSkills = JSON.parse(savedCustom);
        } catch {
        }
      }
      const allKnown = [...INITIAL_SKILLS, ...customSkills];

      if (user) {
        try {
          const { data: enrollments } = await supabase
            .from("user_enrollments")
            .select("skill_id")
            .eq("user_id", user.id);

          const remoteIds = (enrollments || []).map((e: { skill_id: string }) =>
            normalizeSkillId(e.skill_id)
          );
          const merged = Array.from(new Set([...remoteIds, ...localIds]));
          setEnrolledSkillIds(merged);
          setEnrolledSkills(
            allKnown.filter((s) => merged.includes(normalizeSkillId(s.id)))
          );
          localStorage.setItem("skillora_enrolled_skills", JSON.stringify(merged));
          return;
        } catch (err) {
          console.warn("Failed to fetch user enrollments:", err);
        }
      }

      setEnrolledSkillIds(localIds);
      setEnrolledSkills(
        allKnown.filter((s) => localIds.includes(normalizeSkillId(s.id)))
      );
    };

    init();
  }, [supabase, currentUser]);

  const handleEnrollSkill = async (skillToEnroll: Skill): Promise<void> => {
    const normId = normalizeSkillId(skillToEnroll.id);
    const updatedSkill = { ...skillToEnroll, id: normId };

    setEnrolledSkillIds((prev) => {
      const next = Array.from(new Set([...prev.map(normalizeSkillId), normId]));
      localStorage.setItem("skillora_enrolled_skills", JSON.stringify(next));
      return next;
    });

    setEnrolledSkills((prev) => {
      const filtered = prev.filter((s) => normalizeSkillId(s.id) !== normId);
      return [updatedSkill, ...filtered];
    });

    const savedCustom = localStorage.getItem("skillora_custom_ai_skills");
    const currentCustom: Skill[] = savedCustom ? JSON.parse(savedCustom) : [];
    const updatedCustom = [
      updatedSkill,
      ...currentCustom.filter((s) => normalizeSkillId(s.id) !== normId),
    ];
    localStorage.setItem("skillora_custom_ai_skills", JSON.stringify(updatedCustom));

    try {
      const res = await fetch("/api/skills/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: updatedSkill,
          userId: currentUser?.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn("Supabase enrollment API note:", errorData.error);
      }
    } catch (err) {
      console.warn("Enrollment network sync error:", err);
    }
  };

  const catalogSkillTitles = useMemo(
    () => INITIAL_SKILLS.map((s) => s.title),
    []
  );

  const enrolledSkillTitles = useMemo(
    () => enrolledSkills.map((s) => s.title),
    [enrolledSkills]
  );

  const {
    consultations,
    activeConsultationId,
    currentConsultation,
    startNewConsultation,
    selectConsultation,
    deleteConsultation,
    messages,
    inputText,
    setInputText,
    isThinking,
    isOwlSpeaking,
    isListening,
    voiceEnabled,
    setVoiceEnabled,
    sendMessage,
    buildCurriculum,
    enrollSkill: triggerEnroll,
    toggleVoiceListening,
    speakOwlVoice,
    isCloudSynced,
    isSyncingCloud,
  } = useOwlChat({
    currentUser,
    enrolledSkills,
    catalogSkills: catalogSkillTitles,
    onSkillEnrolled: handleEnrollSkill,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        startNewConsultation();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startNewConsultation]);

  useEffect(() => {
    if (messages.length > 1 || isThinking) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isThinking]);

  const samplePrompts = [
    { label: "Help me find a skill", prompt: "Help me find a skill that fits me" },
    { label: "In-demand skills right now", prompt: "Suggest in-demand skills to learn right now" },
    { label: "Fingerstyle Acoustic Guitar Basics", prompt: "Fingerstyle Acoustic Guitar Basics" },
    { label: "Read Cyrillic Script in One Afternoon", prompt: "Read Cyrillic Script in One Afternoon" },
    { label: "15° Whetstone Knife Sharpening", prompt: "15° Whetstone Knife Sharpening" },
    { label: "Specialty Espresso Extraction 1:2", prompt: "Specialty Espresso Extraction 1:2" },
    { label: "Touch Typing at 80+ WPM", prompt: "Touch Typing at 80+ WPM" },
    { label: "Solve 3x3 Rubik's Cube (CFOP)", prompt: "Solve 3x3 Rubik's Cube (CFOP)" },
  ];

  const hasUserEngaged = messages.some((m) => m.sender === "user");

  const handleSelectSession = useCallback((id: string) => {
    selectConsultation(id);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [selectConsultation]);

  const handleNewSession = useCallback(() => {
    startNewConsultation();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [startNewConsultation]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] md:h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-4rem)] bg-canvas text-ink selection:bg-brand-500 selection:text-white overflow-hidden">
      <div className="flex-1 flex h-full overflow-hidden min-h-0 relative">
        <ConsultationSidebar
          consultations={consultations}
          activeConsultationId={activeConsultationId}
          isOpen={isSidebarOpen}
          isCloudSynced={isCloudSynced}
          isSyncingCloud={isSyncingCloud}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onSelect={handleSelectSession}
          onNew={handleNewSession}
          onDelete={deleteConsultation}
        />

        <main
          className={`flex-1 flex flex-col h-full min-h-0 overflow-hidden relative transition-[margin] duration-300 ease-in-out ${
            isSidebarOpen ? "md:ml-64" : "md:ml-0"
          }`}
        >
          <div className="shrink-0 sticky top-0 px-4 sm:px-6 py-3 border-b border-surface-border bg-canvas/95 backdrop-blur-md z-20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {!isSidebarOpen && (
                <IconButton
                  icon="sidebar-minimalistic-linear"
                  label="Show past chats"
                  title="Show past chats (⌘B)"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                />
              )}

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-surface-border text-xs text-ink-secondary truncate max-w-[180px] sm:max-w-xs shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald shrink-0" />
                <span className="truncate font-sans font-medium text-ink">
                  {!currentConsultation?.title || currentConsultation.title === "New Inquiry"
                    ? "New chat"
                    : currentConsultation.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/dashboard"
                className={buttonClasses({ variant: "secondary", size: "sm" })}
              >
                <span>Studio ({enrolledSkillIds.length}) &rarr;</span>
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-h-0">
            <div className="max-w-3xl w-full mx-auto flex flex-col min-h-full justify-between">
              {!hasUserEngaged ? (
                <section className="flex flex-col items-center text-center my-auto py-8">
                  <InteractiveOwlAvatar
                    isListening={isListening}
                    isThinking={isThinking}
                    isSpeaking={isOwlSpeaking}
                    onClick={() => {
                      playChime();
                      speakOwlVoice(
                        "I'm listening. Tell me what interests you or ask for suggestions."
                      );
                    }}
                    size={170}
                  />

                  <h1 className="font-serif italic font-normal text-3xl sm:text-4xl text-ink tracking-tight mt-6">
                    What would you like to master?
                  </h1>
                  <p className="text-xs sm:text-sm text-ink-muted mt-2 max-w-md leading-relaxed">
                    Tell Archimedes what you want to learn and get a step-by-step practice plan.
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                      aria-pressed={voiceEnabled}
                      className={buttonClasses({
                        variant: "secondary",
                        size: "sm",
                        className: voiceEnabled ? "" : "text-ink-muted",
                      })}
                    >
                      <AppIcon
                        name={voiceEnabled ? "volume-loud-linear" : "volume-cross-linear"}
                        className="w-3.5 h-3.5"
                      />
                      <span>{voiceEnabled ? "Voice enabled" : "Voice muted"}</span>
                    </button>
                  </div>
                </section>
              ) : (
                <section className="my-2 space-y-6 flex-1">
                  {messages.map((msg, index) => {
                    const isLatest = index === messages.length - 1;
                    const normSkillId = msg.skill ? normalizeSkillId(msg.skill.id) : "";
                    const isEnrolled = enrolledSkillIds.map(normalizeSkillId).includes(normSkillId);

                    if (msg.sender === "user") {
                      return (
                        <div key={msg.id} className="flex justify-end my-3">
                          <div className="max-w-lg px-4 py-2.5 rounded-2xl bg-ink text-white text-xs sm:text-sm leading-relaxed shadow-xs">
                            <p>{msg.text}</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className="space-y-3.5 my-6">
                        <div className="flex items-center justify-between text-xs font-mono text-ink-muted uppercase tracking-wider pb-1.5 border-b border-surface-border/50">
                          <div className="flex items-center gap-2">
                            <AppIcon
                              name="stars-minimalistic-linear"
                              className="w-3.5 h-3.5 text-brand-600"
                            />
                            <span className="font-semibold text-ink">Archimedes</span>
                          </div>
                          {voiceEnabled && (
                            <button
                              type="button"
                              onClick={() => speakOwlVoice(msg.text)}
                              className="text-xs font-mono text-ink-muted hover:text-ink transition flex items-center gap-1 cursor-pointer"
                              title="Replay spoken response"
                            >
                              <AppIcon name="volume-loud-linear" className="w-3 h-3" />
                              <span>Replay</span>
                            </button>
                          )}
                        </div>

                        <div className="text-ink text-xs sm:text-sm md:text-base leading-relaxed font-sans whitespace-pre-wrap pl-0.5">
                          {msg.text}
                        </div>

                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="pt-2">
                            <SuggestionCards
                              suggestions={msg.suggestions}
                              catalogSkillTitles={catalogSkillTitles}
                              enrolledSkillTitles={enrolledSkillTitles}
                              disabled={isThinking}
                              onSelectSkill={(sugg) => buildCurriculum(sugg)}
                            />
                          </div>
                        )}

                        {msg.skill && (
                          <div className="pt-2">
                            <CurriculumCard
                              skill={msg.skill}
                              isEnrolled={isEnrolled}
                              onEnroll={async (s) => {
                                await triggerEnroll(s);
                              }}
                            />
                          </div>
                        )}

                        {isLatest && msg.quickReplies && (
                          <div className="pt-2">
                            <QuickReplies
                              replies={msg.quickReplies}
                              disabled={isThinking}
                              onSelect={(reply) => sendMessage(reply)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isThinking && (
                    <div className="flex items-center gap-2.5 py-4 text-xs font-mono text-ink-muted animate-pulse">
                      <AppIcon name="refresh-linear" className="w-4 h-4 animate-spin text-brand-600" />
                      <span>Archimedes is thinking…</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </section>
              )}
            </div>
          </div>

          <div className="shrink-0 sticky bottom-0 px-4 sm:px-6 py-3 border-t border-surface-border bg-canvas/95 backdrop-blur-md z-20">
            <div className="max-w-3xl w-full mx-auto">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 no-scrollbar">
                <span className="text-xs text-ink-muted font-mono whitespace-nowrap pl-0.5">
                  Inspiration:
                </span>
                {samplePrompts.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => sendMessage(item.prompt)}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-surface-subtle border border-surface-border text-xs font-medium text-ink-secondary hover:text-ink transition whitespace-nowrap shadow-2xs cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="p-1.5 bg-white rounded-2xl border border-surface-border focus-within:border-ink shadow-elevated flex items-center gap-2 transition-all">
                <IconButton
                  icon="microphone-3-linear"
                  label={isListening ? "Stop listening" : "Speak your request"}
                  size="lg"
                  variant={isListening ? "accent" : "secondary"}
                  aria-pressed={isListening}
                  className={isListening ? "animate-pulse" : "shadow-none"}
                  onClick={toggleVoiceListening}
                />

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  aria-label="What do you want to learn?"
                  placeholder={
                    isListening
                      ? "Listening to your voice…"
                      : "Ask Archimedes anything…"
                  }
                  className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-ink placeholder:text-ink-subtle focus:outline-none font-medium"
                />

                <IconButton
                  icon="arrow-right-linear"
                  label="Send message"
                  size="lg"
                  variant="primary"
                  disabled={isThinking || !inputText.trim()}
                  onClick={() => sendMessage()}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
