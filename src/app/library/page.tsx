"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SolarIcon } from "@/components/SolarIcon";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { Skill } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface OwlConversation {
  id: string;
  sender: "user" | "owl";
  text: string;
  skill?: Skill;
}

export default function SkillLibraryPage() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Enrolled skills tracking
  const [enrolledSkillIds, setEnrolledSkillIds] = useState<string[]>([]);

  // Free Tier & 7-Day Trial Limits
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [isPro, setIsPro] = useState(false);

  // Owl interaction states
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isOwlSpeaking, setIsOwlSpeaking] = useState(false);
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState(true);

  // Conversation history
  const [messages, setMessages] = useState<OwlConversation[]>([
    {
      id: "intro",
      sender: "owl",
      text: "Hoo! Welcome to my study. What craft, instrument, or technique do you wish to master today? Speak to me or type your request below.",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    // Check auth user & existing enrollments
    const init = async () => {
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

      const savedEnrolled = localStorage.getItem("skillora_enrolled_skills");
      if (savedEnrolled) {
        try {
          setEnrolledSkillIds(JSON.parse(savedEnrolled));
        } catch {
          // ignore
        }
      }
    };

    init();
  }, [supabase]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Voice speech synthesis for the Owl
  const speakOwlVoice = (text: string) => {
    if (!voiceAudioEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;

    setIsOwlSpeaking(true);
    utterance.onend = () => setIsOwlSpeaking(false);
    utterance.onerror = () => setIsOwlSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Browser Speech Recognition for voice interaction
  const toggleVoiceListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your message into the chat.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        (recognitionRef.current as { stop: () => void }).stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition() as {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        start: () => void;
        stop: () => void;
        onresult: (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
        onerror: (e: unknown) => void;
        onend: () => void;
      };

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      setIsListening(false);
    }
  };

  // Handle message sending & dispatching skill to My Studio
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isThinking) return;

    // --- CHECK 1: Free tier 7-day trial expired check ---
    if (!isPro && daysRemaining <= 0) {
      setIsLimitReached(true);
      setIsSubscriptionModalOpen(true);
      const expiredMsg: OwlConversation = {
        id: `owl-expired-${Date.now()}`,
        sender: "owl",
        text: "Hoo! Your 7-day free AI trial has concluded. Upgrade to Skillora Pro for ₱299/month to continue unlimited AI learning and skill summoning!",
      };
      setMessages((prev) => [...prev, expiredMsg]);
      speakOwlVoice(expiredMsg.text);
      return;
    }

    // --- CHECK 2: Free tier maximum 3 skills limit ---
    if (!isPro && enrolledSkillIds.length >= 3) {
      setIsLimitReached(true);
      setIsSubscriptionModalOpen(true);
      const limitMsg: OwlConversation = {
        id: `owl-limit-${Date.now()}`,
        sender: "owl",
        text: "Hoo! You have reached the Free Explorer limit of 3 active studio skills. Upgrade to Skillora Pro for ₱299/month to learn as many skills as you want simultaneously!",
      };
      setMessages((prev) => [...prev, limitMsg]);
      speakOwlVoice(limitMsg.text);
      return;
    }

    const userMsg: OwlConversation = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/ai/owl-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Owl communication failed");

      const owlReply = data.owlMessage;
      const newSkill: Skill = data.skill;

      // Automatically add skill to My Studio
      const updatedEnrolled = Array.from(new Set([...enrolledSkillIds, newSkill.id]));
      setEnrolledSkillIds(updatedEnrolled);
      localStorage.setItem("skillora_enrolled_skills", JSON.stringify(updatedEnrolled));

      // Save custom skill locally
      const savedCustom = localStorage.getItem("skillora_custom_ai_skills");
      const currentCustom: Skill[] = savedCustom ? JSON.parse(savedCustom) : [];
      const updatedCustom = [newSkill, ...currentCustom.filter((s) => s.id !== newSkill.id)];
      localStorage.setItem("skillora_custom_ai_skills", JSON.stringify(updatedCustom));

      // Sync with Supabase if logged in
      if (currentUser) {
        supabase
          .from("user_enrollments")
          .insert({
            user_id: currentUser.id,
            skill_id: newSkill.id,
            status: "active",
          })
          .then(() => {});
      }

      const owlMsg: OwlConversation = {
        id: `owl-${Date.now()}`,
        sender: "owl",
        text: owlReply,
        skill: newSkill,
      };

      setMessages((prev) => [...prev, owlMsg]);

      // Speak aloud if enabled
      speakOwlVoice(owlReply);
    } catch (err) {
      console.error("Owl chat error:", err);
      const errorMsg: OwlConversation = {
        id: `owl-err-${Date.now()}`,
        sender: "owl",
        text: "Hoo! My thoughts were momentarily interrupted. Let us try once more — what skill shall we break down?",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const samplePrompts = [
    "Fingerstyle Acoustic Guitar Basics",
    "Read Cyrillic Script in One Afternoon",
    "15° Whetstone Knife Sharpening",
    "Specialty Espresso Extraction 1:2",
    "Touch Typing at 80+ WPM",
    "Solve 3x3 Rubik's Cube (CFOP)",
    "Sourdough Bread Tartine Style",
    "Juggling 3 Balls Cascade",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-ink selection:bg-brand-500 selection:text-white">
      <Header activePath="/library" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-between">
        {/* Top Header & Plan Status Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-surface-border mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse" />
              <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                The Learning Owl&apos;s Oracle
              </span>
            </div>

            {/* Free vs Pro Badge with limits */}
            {isPro ? (
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-bold">
                Pro Member • Unlimited Skills
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLimitReached(false);
                  setIsSubscriptionModalOpen(true);
                }}
                className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold hover:bg-amber-100 transition flex items-center gap-1.5"
                title="Free trial status"
              >
                <span>Free Plan ({enrolledSkillIds.length}/3 Skills • {daysRemaining}d Trial)</span>
                <span className="font-bold text-amber-900 underline">Upgrade ₱299/m &rarr;</span>
              </button>
            )}
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-surface-border hover:border-brand-500/40 text-xs font-semibold text-ink hover:text-brand-600 transition shadow-2xs whitespace-nowrap"
          >
            <span>My Studio Workshop ({enrolledSkillIds.length}) &rarr;</span>
          </Link>
        </div>

        {/* Center Stage: The Big Learning Owl Character */}
        <section className="flex flex-col items-center text-center my-4">
          <div className="relative group cursor-pointer" onClick={() => speakOwlVoice("Hoo! I am listening.")}>
            {/* Glowing Backdrop Ring */}
            <div className={`absolute -inset-4 rounded-full blur-xl transition-all duration-700 ${
              isOwlSpeaking
                ? "bg-brand-500/25 scale-110"
                : isListening
                ? "bg-rose-500/25 scale-110"
                : "bg-brand-500/10 group-hover:bg-brand-500/20"
            }`} />

            {/* Owl Icon Container */}
            <div className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white border-2 flex items-center justify-center p-6 shadow-xl transition-transform duration-500 ${
              isListening ? "border-rose-500 scale-105" : "border-surface-border hover:scale-105"
            }`}>
              <Image
                src="/logo.svg"
                alt="Skillora Learning Owl"
                width={130}
                height={130}
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                priority
              />

              {/* Status Badge on Owl */}
              <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-ink text-white text-[10px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5">
                {isListening ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>Listening...</span>
                  </>
                ) : isThinking ? (
                  <>
                    <SolarIcon name="refresh-linear" className="w-3 h-3 animate-spin text-brand-300" />
                    <span>Deconstructing...</span>
                  </>
                ) : isOwlSpeaking ? (
                  <>
                    <SolarIcon name="volume-loud-linear" className="w-3 h-3 text-brand-300 animate-pulse" />
                    <span>Speaking...</span>
                  </>
                ) : (
                  <>
                    <SolarIcon name="stars-minimalistic-linear" className="w-3 h-3 text-brand-300" />
                    <span>Archimedes</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight mt-6">
            Tell the Owl what you want to learn.
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1.5 max-w-md">
            Speak into your mic or type below. The Owl will immediately deconstruct it into realistic steps and dispatch it to <strong>My Studio</strong>.
          </p>

          {/* Voice Mute Toggle */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVoiceAudioEnabled(!voiceAudioEnabled)}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition flex items-center gap-1.5 ${
                voiceAudioEnabled
                  ? "bg-brand-50 text-brand-700 border-brand-200"
                  : "bg-canvas text-ink-muted border-surface-border"
              }`}
            >
              <SolarIcon
                name={voiceAudioEnabled ? "volume-loud-linear" : "volume-cross-linear"}
                className="w-3.5 h-3.5"
              />
              <span>{voiceAudioEnabled ? "Owl Voice: On" : "Owl Voice: Muted"}</span>
            </button>
          </div>
        </section>

        {/* Conversation Stream */}
        <section className="my-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-xl p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                  msg.sender === "user"
                    ? "bg-ink text-white rounded-br-xs"
                    : "bg-white border border-surface-border text-ink rounded-bl-xs"
                }`}
              >
                {msg.sender === "owl" && (
                  <div className="flex items-center gap-2 mb-1.5 text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                    <SolarIcon name="stars-minimalistic-linear" className="w-3.5 h-3.5" />
                    <span>The Learning Owl</span>
                  </div>
                )}
                <p>{msg.text}</p>
              </div>

              {/* If Owl generated a skill, render dispatch preview */}
              {msg.skill && (
                <div className="mt-3 w-full max-w-xl p-5 rounded-3xl bg-white border-2 border-brand-500/40 shadow-sm animate-fade-in text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                      {msg.skill.difficulty} • {msg.skill.time_commitment_label}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-accent-emerald/10 text-accent-emerald text-[11px] font-bold border border-accent-emerald/30 flex items-center gap-1">
                      <SolarIcon name="check-circle-linear" className="w-3.5 h-3.5" />
                      <span>Dispatched to My Studio</span>
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-ink mb-1">
                    {msg.skill.title}
                  </h3>
                  <p className="text-xs text-ink-secondary mb-4">
                    {msg.skill.summary}
                  </p>

                  {/* Steps preview */}
                  <div className="space-y-1.5 mb-4">
                    {msg.skill.steps?.map((st) => (
                      <div
                        key={st.id}
                        className="p-2.5 rounded-xl bg-canvas border border-surface-border text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-ink">
                          Step {st.step_number}: {st.title}
                        </span>
                        <span className="text-[10px] text-ink-muted">
                          ~{st.estimated_minutes}m
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/dashboard"
                    className="w-full py-2.5 px-4 rounded-xl bg-ink hover:bg-neutral-800 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>Practice in My Studio with Flashcards</span>
                    <SolarIcon name="arrow-right-linear" className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start">
              <div className="p-4 rounded-3xl bg-white border border-surface-border text-xs text-brand-600 font-semibold flex items-center gap-2 shadow-xs animate-pulse">
                <SolarIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
                <span>The Owl is analyzing biomechanics and sculpting steps...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </section>

        {/* Input Dock: Voice & Chat Bar */}
        <section className="sticky bottom-4 z-30 pt-2">
          {/* Quick inspiration suggestion pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 no-scrollbar">
            <span className="text-[11px] text-ink-muted font-medium whitespace-nowrap pl-1">
              Ask for:
            </span>
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setInputText(prompt);
                  handleSendMessage(prompt);
                }}
                className="px-3 py-1 rounded-full bg-white hover:bg-brand-50 border border-surface-border text-[11px] font-medium text-ink-secondary hover:text-brand-700 transition whitespace-nowrap shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Unified Voice & Text Input Pill */}
          <div className="p-2 bg-white rounded-3xl border-2 border-surface-border focus-within:border-brand-500 shadow-lg flex items-center gap-2 transition-all">
            {/* Microphone Voice Button */}
            <button
              type="button"
              onClick={toggleVoiceListening}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                isListening
                  ? "bg-rose-600 text-white animate-pulse shadow-md"
                  : "bg-canvas hover:bg-brand-50 text-ink-muted hover:text-brand-600 border border-surface-border"
              }`}
              title={isListening ? "Tap to stop listening" : "Speak to the Owl (Voice)"}
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
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                isListening
                  ? "Listening to your voice..."
                  : "Tell the Owl what you want to learn (e.g. 'Fingerstyle guitar', 'Latte art')..."
              }
              className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-ink placeholder:text-ink-subtle focus:outline-none font-medium"
            />

            {/* Send Button */}
            <button
              type="button"
              disabled={isThinking || !inputText.trim()}
              onClick={() => handleSendMessage()}
              className="w-11 h-11 rounded-2xl bg-ink hover:bg-neutral-800 disabled:opacity-30 text-white flex items-center justify-center transition shadow-2xs flex-shrink-0"
              aria-label="Send message to Owl"
            >
              <SolarIcon name="arrow-right-linear" className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      {/* Subscription & Pricing Modal (Triggered on limit or click) */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        userEmail={currentUser?.email}
        isLimitReached={isLimitReached}
      />
    </div>
  );
}
