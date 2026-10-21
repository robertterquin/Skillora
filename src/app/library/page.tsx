"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {
  AppIcon,
  InteractiveOwlAvatar,
  buttonClasses,
  IconButton,
  QuickReplies,
  SuggestionCards,
  CurriculumCard,
  ConsultationSidebar,
  ChatWelcome,
  OwlThinking,
  SkillSyllabusModal,
  BundleList,
  useToast,
} from "@/components";
import { playChime } from "@/lib/workbench-audio";
import { Skill } from "@/types/database";
import { INITIAL_SKILLS, normalizeSkillId } from "@/lib/catalog-data";
import { useAuth } from "@/hooks/useAuth";
import { useOwlChat } from "@/hooks/useOwlChat";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useStudioCatalog } from "@/hooks/useStudioCatalog";
import { findInterest } from "@/lib/interests";
import type { SkillBundle } from "@/lib/bundles";

const isPhone = () => typeof window !== "undefined" && window.innerWidth < 768;

export default function SkillLibraryPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const userId = currentUser?.id ?? null;
  const router = useRouter();
  const toast = useToast();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    if (!isPhone()) setIsSidebarOpen(true);
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

  const { allSkills, rememberSkill } = useStudioCatalog();
  const { enrolledSkillIds, addSkill, isEnrolled } = useEnrollments(userId, !authLoading);

  const enrolledSkills = useMemo(
    () => allSkills.filter((s) => isEnrolled(s.id)),
    [allSkills, isEnrolled]
  );

  const handleEnrollSkill = useCallback(
    async (skill: Skill) => {
      const saved = { ...skill, id: normalizeSkillId(skill.id) };
      rememberSkill(saved);
      await addSkill(saved);
      toast({
        message: `Added ${saved.title} to your Studio`,
        action: { label: "Open Studio", onClick: () => router.push("/dashboard") },
      });
    },
    [rememberSkill, addSkill, toast, router]
  );

  const handleAddBundle = useCallback(
    async (bundle: SkillBundle, skills: Skill[]) => {
      for (const skill of skills) {
        const saved = { ...skill, id: normalizeSkillId(skill.id) };
        rememberSkill(saved);
        await addSkill(saved);
      }
      toast({
        message: `Added ${skills.length} ${skills.length === 1 ? "skill" : "skills"} from ${bundle.title}`,
        action: { label: "Open Studio", onClick: () => router.push("/dashboard") },
      });
    },
    [rememberSkill, addSkill, toast, router]
  );

  const catalogSkillTitles = useMemo(() => INITIAL_SKILLS.map((s) => s.title), []);
  const enrolledSkillTitles = useMemo(() => enrolledSkills.map((s) => s.title), [enrolledSkills]);
  const exampleSkills = useMemo(() => INITIAL_SKILLS.slice(0, 6), []);

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
    resizeCurriculum,
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

  const chatEndRef = useRef<HTMLDivElement>(null);
  const isGuest = !authLoading && !currentUser;
  const [previewSkill, setPreviewSkill] = useState<Skill | null>(null);

  useEffect(() => {
    const interest = findInterest(new URLSearchParams(window.location.search).get("interest"));
    if (interest) setInputText((current) => current || interest.prompt);
  }, [setInputText]);

  const handleNewSession = useCallback(() => {
    startNewConsultation();
    if (isPhone()) setIsSidebarOpen(false);
  }, [startNewConsultation]);

  const handleSelectSession = useCallback(
    (id: string) => {
      selectConsultation(id);
      if (isPhone()) setIsSidebarOpen(false);
    },
    [selectConsultation]
  );

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        startNewConsultation();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startNewConsultation, toggleSidebar]);

  useEffect(() => {
    if (messages.length > 1 || isThinking) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isThinking]);

  const hasUserEngaged = messages.some((m) => m.sender === "user");
  const latestDraftId = useMemo(() => [...messages].reverse().find((m) => m.skill)?.id, [messages]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] bg-canvas text-ink selection:bg-brand-500 selection:text-white overflow-hidden">
      <div className="flex-1 flex h-full overflow-hidden min-h-0 relative">
        <ConsultationSidebar
          consultations={consultations}
          activeConsultationId={activeConsultationId}
          isOpen={isSidebarOpen}
          isCloudSynced={isCloudSynced}
          isSyncingCloud={isSyncingCloud}
          onToggle={toggleSidebar}
          onSelect={handleSelectSession}
          onNew={handleNewSession}
          onDelete={(id) => {
            deleteConsultation(id);
            toast({ message: "Chat deleted", tone: "info" });
          }}
        />

        <main
          id="main"
          className={`flex-1 flex flex-col h-full min-h-0 overflow-hidden relative transition-[margin] duration-300 ease-in-out ${
            isSidebarOpen ? "md:ml-64" : "md:ml-0"
          }`}
        >
          <div className="shrink-0 px-4 sm:px-6 py-2.5 border-b border-surface-border bg-canvas/95 backdrop-blur-md z-20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <IconButton
                icon="sidebar-minimalistic-linear"
                label={isSidebarOpen ? "Hide past chats" : "Show past chats"}
                title="Past chats (⌘B)"
                size="sm"
                variant="ghost"
                aria-expanded={isSidebarOpen}
                className={isSidebarOpen ? "md:hidden" : undefined}
                onClick={toggleSidebar}
              />
              <span className="text-sm font-medium text-ink truncate">
                {!currentConsultation?.title || currentConsultation.title === "New Inquiry"
                  ? "New chat"
                  : currentConsultation.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <IconButton
                icon={voiceEnabled ? "volume-loud-linear" : "volume-cross-linear"}
                label={voiceEnabled ? "Mute Archimedes' voice" : "Turn on Archimedes' voice"}
                title={voiceEnabled ? "Voice on" : "Voice off"}
                size="sm"
                variant="ghost"
                aria-pressed={voiceEnabled}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              />
              <IconButton
                icon="pen-new-square-linear"
                label="New chat"
                title="New chat (⌘N)"
                size="sm"
                variant="ghost"
                className={isSidebarOpen ? "md:hidden" : undefined}
                onClick={handleNewSession}
              />
              <Link href="/dashboard" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                <span>Studio</span>
                <span className="tabular-nums text-ink-muted">{enrolledSkillIds.length}</span>
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-h-0">
            <div className="max-w-3xl w-full mx-auto">
              {!hasUserEngaged ? (
                <section className="flex flex-col items-center text-center pt-4 pb-10">
                  <InteractiveOwlAvatar
                    isListening={isListening}
                    isThinking={isThinking}
                    isSpeaking={isOwlSpeaking}
                    onClick={() => {
                      playChime();
                      speakOwlVoice("I'm listening. Tell me what interests you or ask for suggestions.");
                    }}
                    size={120}
                  />
                  <h1 className="font-serif italic font-normal text-3xl sm:text-4xl text-ink tracking-tight mt-5">
                    What would you like to learn?
                  </h1>
                  <p className="text-[15px] text-ink-muted mt-2 max-w-md leading-relaxed">
                    Tell Archimedes what you&rsquo;re curious about. You&rsquo;ll get a draft plan to adjust before
                    anything is added to your Studio.
                  </p>

                  <div className="mt-8 w-full">
                    {isThinking ? (
                      <div className="flex justify-center">
                        <OwlThinking />
                      </div>
                    ) : (
                      <ChatWelcome
                        examples={exampleSkills}
                        disabled={isThinking}
                        showStarters={!isGuest}
                        onStarter={(prompt) => sendMessage(prompt)}
                        onExample={(skill) => (isGuest ? setPreviewSkill(skill) : buildCurriculum(skill.title))}
                        extra={
                          <BundleList
                            skills={allSkills}
                            isEnrolled={isEnrolled}
                            onAddAll={handleAddBundle}
                            onPreview={setPreviewSkill}
                          />
                        }
                      />
                    )}
                  </div>
                </section>
              ) : (
                <section className="space-y-8 pb-4" aria-label="Conversation">
                  {messages.map((msg, index) => {
                    const isLatest = index === messages.length - 1;

                    if (msg.sender === "user") {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <p className="max-w-[85%] sm:max-w-lg px-4 py-2.5 rounded-2xl rounded-br-md bg-ink text-white text-[15px] leading-relaxed">
                            {msg.text}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <article key={msg.id} className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted">
                            <AppIcon name="stars-minimalistic-linear" className="w-3.5 h-3.5" />
                            Archimedes
                          </span>
                          {voiceEnabled && (
                            <button
                              type="button"
                              onClick={() => speakOwlVoice(msg.text)}
                              className="text-xs text-ink-muted hover:text-ink transition flex items-center gap-1 cursor-pointer"
                              aria-label="Read this reply aloud"
                            >
                              <AppIcon name="volume-loud-linear" className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </button>
                          )}
                        </div>

                        <div className="text-ink text-[15px] sm:text-base leading-7 whitespace-pre-wrap max-w-prose">
                          {msg.text}
                        </div>

                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <SuggestionCards
                            suggestions={msg.suggestions}
                            catalogSkillTitles={catalogSkillTitles}
                            enrolledSkillTitles={enrolledSkillTitles}
                            disabled={isThinking}
                            onSelectSkill={(sugg) => buildCurriculum(sugg)}
                          />
                        )}

                        {msg.skill && (
                          <CurriculumCard
                            skill={msg.skill}
                            isEnrolled={isEnrolled(msg.skill.id)}
                            isLatest={msg.id === latestDraftId}
                            isBusy={isThinking}
                            onEnroll={async (s) => {
                              await triggerEnroll(s);
                            }}
                            onResize={resizeCurriculum}
                          />
                        )}

                        {isLatest && msg.quickReplies && (
                          <QuickReplies
                            replies={msg.quickReplies}
                            disabled={isThinking}
                            onSelect={(reply) => sendMessage(reply)}
                          />
                        )}
                      </article>
                    );
                  })}

                  {isThinking && <OwlThinking />}

                  <div ref={chatEndRef} />
                </section>
              )}
            </div>
          </div>

          <div className="shrink-0 px-4 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-surface-border bg-canvas/95 backdrop-blur-md z-20">
            {isGuest ? (
              <div className="max-w-3xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-surface-border">
                <p className="text-sm text-ink-secondary text-center sm:text-left">
                  Create a free account to chat with Archimedes. You can still add the example plans above.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href="/signin" className={buttonClasses({ variant: "ghost", size: "sm" })}>
                    Sign in
                  </Link>
                  <Link href="/signup" className={buttonClasses({ size: "sm" })}>
                    Create account
                  </Link>
                </div>
              </div>
            ) : (
              <form
                className="max-w-3xl w-full mx-auto p-1.5 bg-white rounded-2xl border border-surface-border focus-within:border-ink shadow-elevated flex items-center gap-2 transition-all"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <IconButton
                  icon="microphone-3-linear"
                  label={isListening ? "Stop listening" : "Speak your request"}
                  size="lg"
                  variant={isListening ? "accent" : "ghost"}
                  aria-pressed={isListening}
                  className={isListening ? "animate-pulse" : undefined}
                  onClick={toggleVoiceListening}
                />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  aria-label="Message Archimedes"
                  placeholder={isListening ? "Listening…" : "What do you want to learn?"}
                  className="flex-1 min-w-0 bg-transparent px-1 text-base text-ink placeholder:text-ink-subtle focus:outline-none"
                />
                <IconButton
                  type="submit"
                  icon="arrow-right-linear"
                  label="Send message"
                  size="lg"
                  variant="primary"
                  disabled={isThinking || !inputText.trim()}
                />
              </form>
            )}
          </div>
        </main>
      </div>
      <AnimatePresence>
        {previewSkill && (
          <SkillSyllabusModal
            skill={previewSkill}
            isViewOnly
            onAdd={(skill) => {
              setPreviewSkill(null);
              handleEnrollSkill(skill);
            }}
            onClose={() => setPreviewSkill(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
