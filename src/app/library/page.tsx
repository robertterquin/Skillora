"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import {
  Badge,
  Header,
  SolarIcon,
  SubscriptionModal,
  InteractiveOwlAvatar,
  buttonClasses,
  QuickReplies,
  SuggestionCards,
  CurriculumCard,
} from "@/components";
import { playChime } from "@/lib/workbench-audio";
import { Skill } from "@/types/database";
import { INITIAL_SKILLS, normalizeSkillId } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useOwlChat } from "@/hooks/useOwlChat";

export default function SkillLibraryPage() {
  const supabase = createClient();
  const { user: currentUser } = useAuth();

  // Enrolled skills tracking
  const [enrolledSkillIds, setEnrolledSkillIds] = useState<string[]>([]);
  const [enrolledSkills, setEnrolledSkills] = useState<Skill[]>([]);

  // Free Tier & 7-Day Trial Limits
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [isPro, setIsPro] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check existing enrollments and plan
  useEffect(() => {
    const init = async () => {
      const user = currentUser;

      // Check if user is on Pro plan
      const localIsPro =
        typeof window !== "undefined" &&
        localStorage.getItem("skillora_pro_membership") === "true";
      const userIsPro = user?.user_metadata?.plan === "pro" || localIsPro;
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

      const savedEnrolled = localStorage.getItem("skillora_enrolled_skills");
      let localIds: string[] = [];
      if (savedEnrolled) {
        try {
          localIds = (JSON.parse(savedEnrolled) as string[]).map(normalizeSkillId);
        } catch {
          // ignore
        }
      }

      // Load custom AI skills
      const savedCustom = localStorage.getItem("skillora_custom_ai_skills");
      let customSkills: Skill[] = [];
      if (savedCustom) {
        try {
          customSkills = JSON.parse(savedCustom);
        } catch {
          // ignore
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

  // Handle skill enrollment to LocalStorage and Supabase backend
  const handleEnrollSkill = async (skillToEnroll: Skill): Promise<void> => {
    const normId = normalizeSkillId(skillToEnroll.id);
    const updatedSkill = { ...skillToEnroll, id: normId };

    // 1. Update state & localStorage
    setEnrolledSkillIds((prev) => {
      const next = Array.from(new Set([...prev.map(normalizeSkillId), normId]));
      localStorage.setItem("skillora_enrolled_skills", JSON.stringify(next));
      return next;
    });

    setEnrolledSkills((prev) => {
      const filtered = prev.filter((s) => normalizeSkillId(s.id) !== normId);
      return [updatedSkill, ...filtered];
    });

    // 2. Save custom skill locally
    const savedCustom = localStorage.getItem("skillora_custom_ai_skills");
    const currentCustom: Skill[] = savedCustom ? JSON.parse(savedCustom) : [];
    const updatedCustom = [
      updatedSkill,
      ...currentCustom.filter((s) => normalizeSkillId(s.id) !== normId),
    ];
    localStorage.setItem("skillora_custom_ai_skills", JSON.stringify(updatedCustom));

    // 3. Sync to Supabase project via secure server endpoint
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

  // Hook-powered Archimedes dialogue
  const {
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
  } = useOwlChat({
    enrolledSkills,
    catalogSkills: catalogSkillTitles,
    isPro,
    daysRemaining,
    onSkillEnrolled: handleEnrollSkill,
    onLimitReached: () => {
      setIsLimitReached(true);
      setIsSubscriptionModalOpen(true);
    },
  });

  // Scroll to newest message
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

  return (
    <div className="min-h-screen flex flex-col workbench-grid text-ink selection:bg-brand-500 selection:text-white">
      <Header activePath="/library" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-between">
        {/* Top Header & Plan Status Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-surface-border mb-6 gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span className="text-xs font-mono font-semibold text-ink uppercase tracking-wider">
                Skill Library
              </span>
            </div>

            {/* Free vs Pro Badge with limits */}
            {isPro ? (
              <Badge shape="pill">Pro · Unlimited skills</Badge>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLimitReached(false);
                  setIsSubscriptionModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-full bg-surface-muted border border-surface-border text-ink-secondary text-2xs font-medium hover:bg-surface-border/60 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>
                  Free · {enrolledSkillIds.length}/3 skills · {daysRemaining} AI days left
                </span>
                <span className="font-semibold text-ink underline underline-offset-2">
                  Upgrade
                </span>
              </button>
            )}
          </div>

          <Link
            href="/dashboard"
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            <span>My Studio ({enrolledSkillIds.length}) &rarr;</span>
          </Link>
        </div>

        {/* Center Stage: The Big Learning Owl Character */}
        <section className="flex flex-col items-center text-center my-4">
          <InteractiveOwlAvatar
            isListening={isListening}
            isThinking={isThinking}
            isSpeaking={isOwlSpeaking}
            onClick={() => {
              playChime();
              speakOwlVoice("I'm listening. Tell me what interests you or ask for suggestions.");
            }}
            size={180}
          />

          <h1 className="font-serif italic font-normal text-3xl sm:text-4xl text-ink tracking-tight mt-6">
            Tell Archimedes what you wish to master.
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1.5 max-w-md leading-relaxed">
            Chat to find the right craft, explore tailored suggestions, or build a 4-step practice track.
          </p>

          {/* Voice Mute Toggle */}
          <div className="mt-3 flex items-center gap-2">
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
              <SolarIcon
                name={voiceEnabled ? "volume-loud-linear" : "volume-cross-linear"}
                className="w-3.5 h-3.5"
              />
              <span>{voiceEnabled ? "Voice on" : "Voice off"}</span>
            </button>
          </div>
        </section>

        {/* Conversation Stream */}
        <section className="my-6 space-y-4">
          {messages.map((msg, index) => {
            const isLatest = index === messages.length - 1;
            const normSkillId = msg.skill ? normalizeSkillId(msg.skill.id) : "";
            const isEnrolled = enrolledSkillIds.map(normalizeSkillId).includes(normSkillId);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Speech Bubble */}
                <div
                  className={`max-w-xl p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                    msg.sender === "user"
                      ? "bg-ink text-white rounded-br-xs"
                      : "bg-white border border-surface-border text-ink rounded-bl-xs"
                  }`}
                >
                  {msg.sender === "owl" && (
                    <div className="flex items-center gap-2 mb-1.5 text-3xs font-mono font-medium text-ink-muted uppercase tracking-wider">
                      <SolarIcon
                        name="stars-minimalistic-linear"
                        className="w-3.5 h-3.5 text-ink-muted"
                      />
                      <span>Archimedes</span>
                    </div>
                  )}
                  <p>{msg.text}</p>
                </div>

                {/* Suggestions Mode: 3-5 Tailored Pathway Cards */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <SuggestionCards
                    suggestions={msg.suggestions}
                    catalogSkillTitles={catalogSkillTitles}
                    enrolledSkillTitles={enrolledSkillTitles}
                    disabled={isThinking}
                    onSelectSkill={(sugg) => buildCurriculum(sugg)}
                  />
                )}

                {/* Curriculum Mode: Single 4-Step Practice Track */}
                {msg.skill && (
                  <CurriculumCard
                    skill={msg.skill}
                    isEnrolled={isEnrolled}
                    onEnroll={async (s) => {
                      await triggerEnroll(s);
                    }}
                  />
                )}

                {/* Quick Reply Chips (shown under the latest Owl response) */}
                {msg.sender === "owl" && isLatest && msg.quickReplies && (
                  <QuickReplies
                    replies={msg.quickReplies}
                    disabled={isThinking}
                    onSelect={(reply) => sendMessage(reply)}
                  />
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-start">
              <div className="p-4 rounded-3xl bg-white border border-surface-border text-xs text-brand-600 font-semibold flex items-center gap-2 shadow-xs animate-pulse">
                <SolarIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
                <span>Archimedes is deliberating…</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </section>

        {/* Input Dock: Voice & Chat Bar */}
        <section className="sticky bottom-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-6 pb-4 bg-gradient-to-t from-canvas via-canvas to-canvas/0">
          {/* Quick inspiration suggestion pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 no-scrollbar">
            <span className="text-2xs text-ink-muted font-medium whitespace-nowrap pl-1">
              Try:
            </span>
            {samplePrompts.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => sendMessage(item.prompt)}
                className="px-3 py-1 rounded-full bg-white hover:bg-brand-50 border border-surface-border text-2xs font-medium text-ink-secondary hover:text-brand-700 transition whitespace-nowrap shadow-2xs cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Unified Voice & Text Input Pill */}
          <div className="p-2 bg-white rounded-2xl border border-surface-border focus-within:border-ink shadow-elevated flex items-center gap-2 transition-all">
            {/* Microphone Voice Button */}
            <button
              type="button"
              onClick={toggleVoiceListening}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? "bg-accent-vermilion text-white animate-pulse shadow-md"
                  : "bg-canvas hover:bg-surface-subtle text-ink-muted hover:text-ink border border-surface-border"
              }`}
              aria-label={isListening ? "Stop listening" : "Speak your request"}
              aria-pressed={isListening}
            >
              <SolarIcon
                name="microphone-3-linear"
                className={`w-5 h-5 ${isListening ? "text-white" : ""}`}
              />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              aria-label="What do you want to learn?"
              placeholder={
                isListening
                  ? "Listening…"
                  : "Tell Archimedes what you'd like to learn or explore…"
              }
              className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-ink placeholder:text-ink-subtle focus:outline-none font-medium"
            />

            {/* Send Button */}
            <button
              type="button"
              disabled={isThinking || !inputText.trim()}
              onClick={() => sendMessage()}
              className="w-11 h-11 rounded-xl bg-ink hover:bg-accent-vermilion disabled:opacity-30 text-white flex items-center justify-center transition shadow-2xs flex-shrink-0 cursor-pointer"
              aria-label="Send message to Owl"
            >
              <SolarIcon name="arrow-right-linear" className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      {/* Subscription & Pricing Modal */}
      <AnimatePresence>
        {isSubscriptionModalOpen && (
          <SubscriptionModal
            isOpen={isSubscriptionModalOpen}
            onClose={() => setIsSubscriptionModalOpen(false)}
            userEmail={currentUser?.email}
            isLimitReached={isLimitReached}
            onUpgradeSuccess={() => setIsPro(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
