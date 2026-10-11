"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import {
  Header,
  SolarIcon,
  SubscriptionModal,
  InteractiveOwlAvatar,
} from "@/components";
import { playMechanicalClick, playChime, playWoodenThud, playStampThud } from "@/lib/workbench-audio";
import { Skill } from "@/types/database";
import { normalizeSkillId } from "@/lib/mock-data";
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
      text: "Welcome to the Archimedes Study. What craft, instrument, or discipline do you wish to deconstruct today? Speak or type your request below.",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<unknown>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Check auth user & existing enrollments
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Check if user is on Pro plan
      const localIsPro = typeof window !== "undefined" && localStorage.getItem("skillora_pro_membership") === "true";
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

      if (user) {
        try {
          const { data: enrollments } = await supabase
            .from("user_enrollments")
            .select("skill_id")
            .eq("user_id", user.id);

          const remoteIds = (enrollments || []).map((e: { skill_id: string }) => normalizeSkillId(e.skill_id));
          const merged = Array.from(new Set([...remoteIds, ...localIds]));
          setEnrolledSkillIds(merged);
          localStorage.setItem("skillora_enrolled_skills", JSON.stringify(merged));
          return;
        } catch (err) {
          console.warn("Failed to fetch user enrollments:", err);
        }
      }

      setEnrolledSkillIds(localIds);
    };

    init();
  }, [supabase]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Realistic AI Mentor Voice for Archimedes (OpenAI TTS with browser fallback)
  const speakOwlVoice = async (text: string) => {
    if (!voiceAudioEnabled || typeof window === "undefined") {
      return;
    }

    // Stop any existing speech playback immediately
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsOwlSpeaking(true);

    try {
      // 1. Check in-memory audio blob cache to avoid redundant API calls
      let audioUrl = audioCacheRef.current.get(text);

      if (!audioUrl) {
        const res = await fetch("/api/ai/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: "fable" }),
        });

        if (!res.ok) {
          throw new Error("TTS API unavailable");
        }

        const blob = await res.blob();
        audioUrl = URL.createObjectURL(blob);
        audioCacheRef.current.set(text, audioUrl);
      }

      // 2. Play high-fidelity realistic audio stream
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsOwlSpeaking(false);
      };
      audio.onerror = () => {
        setIsOwlSpeaking(false);
      };

      await audio.play();
    } catch (err) {
      console.warn("Falling back to native browser speech synthesis:", err);
      // Graceful fallback to browser speech synthesis
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 0.9;
        utterance.onend = () => setIsOwlSpeaking(false);
        utterance.onerror = () => setIsOwlSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsOwlSpeaking(false);
      }
    }
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

  // Robust skill enrollment in both LocalStorage and Supabase project
  const enrollSkill = async (skillToEnroll: Skill) => {
    const normId = normalizeSkillId(skillToEnroll.id);
    const updatedSkill = { ...skillToEnroll, id: normId };

    // 1. Update state & localStorage
    setEnrolledSkillIds((prev) => {
      const next = Array.from(new Set([...prev.map(normalizeSkillId), normId]));
      localStorage.setItem("skillora_enrolled_skills", JSON.stringify(next));
      return next;
    });

    // 2. Save custom skill locally
    const savedCustom = localStorage.getItem("skillora_custom_ai_skills");
    const currentCustom: Skill[] = savedCustom ? JSON.parse(savedCustom) : [];
    const updatedCustom = [updatedSkill, ...currentCustom.filter((s) => normalizeSkillId(s.id) !== normId)];
    localStorage.setItem("skillora_custom_ai_skills", JSON.stringify(updatedCustom));

    // 3. Sync to Supabase project via secure server endpoint (service role bypasses RLS)
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
        text: "Your 7-day free trial has concluded. Upgrade to Skillora Pro for ₱299/month to continue unlimited deliberate practice deconstructions.",
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
        text: "You have reached the Free Explorer limit of 3 active studio skills. Upgrade to Skillora Pro for ₱299/month to study unlimited simultaneous disciplines.",
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

      // Automatically enroll skill in My Studio queue
      await enrollSkill(newSkill);

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
        text: "My analysis was momentarily interrupted. Let us try once more — what discipline shall we deconstruct?",
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
    <div className="min-h-screen flex flex-col workbench-grid text-ink selection:bg-brand-500 selection:text-white">
      <Header activePath="/library" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-between">
        {/* Top Header & Plan Status Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-surface-border mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span className="text-xs font-mono font-semibold text-ink uppercase tracking-wider">
                Archimedes&apos; Study
              </span>
            </div>

            {/* Free vs Pro Badge with limits */}
            {isPro ? (
              <span className="px-2.5 py-0.5 rounded-full bg-surface-muted border border-surface-border text-ink text-[11px] font-semibold">
                Pro Member • Unlimited Skills
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLimitReached(false);
                  setIsSubscriptionModalOpen(true);
                }}
                className="px-2.5 py-0.5 rounded-full bg-surface-muted border border-surface-border text-ink-secondary text-[11px] font-medium hover:bg-neutral-100 transition flex items-center gap-1.5 cursor-pointer"
                title="Free trial status"
              >
                <span>Free Plan ({enrolledSkillIds.length}/3 Skills • {daysRemaining}d Trial)</span>
                <span className="font-semibold text-ink underline">Upgrade ₱299/m &rarr;</span>
              </button>
            )}
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-surface-border hover:border-ink/40 text-xs font-semibold text-ink transition shadow-2xs whitespace-nowrap"
          >
            <span>My Studio Repertoire ({enrolledSkillIds.length}) &rarr;</span>
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
              speakOwlVoice("I am listening. What discipline shall we deconstruct today?");
            }}
            size={180}
          />

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight mt-6">
            Tell Archimedes what you want to learn.
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1.5 max-w-md leading-relaxed">
            Speak into your mic or type below. Archimedes will deconstruct it into realistic micro-drills and dispatch it to <strong>My Studio</strong>.
          </p>

          {/* Voice Mute Toggle */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !voiceAudioEnabled;
                setVoiceAudioEnabled(next);
                if (!next) {
                  if (currentAudioRef.current) {
                    currentAudioRef.current.pause();
                  }
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsOwlSpeaking(false);
                }
              }}
              className={`text-[11px] font-medium px-3 py-1 rounded-full border transition flex items-center gap-1.5 cursor-pointer ${
                voiceAudioEnabled
                  ? "bg-surface-muted text-ink border-surface-border"
                  : "bg-canvas text-ink-muted border-surface-border"
              }`}
            >
              <SolarIcon
                name={voiceAudioEnabled ? "volume-loud-linear" : "volume-cross-linear"}
                className="w-3.5 h-3.5"
              />
              <span>{voiceAudioEnabled ? "Voice Audio: Active" : "Voice Audio: Muted"}</span>
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
                  <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono font-medium text-ink-muted uppercase tracking-wider">
                    <SolarIcon name="stars-minimalistic-linear" className="w-3.5 h-3.5 text-ink-muted" />
                    <span>Archimedes</span>
                  </div>
                )}
                <p>{msg.text}</p>
              </div>

              {/* Archimedes Field Notes Index Card */}
              {msg.skill && (
                <div className="mt-3 w-full max-w-xl p-5 sm:p-6 rounded-3xl bg-white border border-surface-border shadow-md animate-fade-in text-left corner-ticks relative overflow-hidden">
                  {/* Unified Field Notes Header */}
                  {(() => {
                    const normSkillId = normalizeSkillId(msg.skill.id);
                    const isEnrolled = enrolledSkillIds.map(normalizeSkillId).includes(normSkillId);

                    return (
                      <>
                        <div className="flex items-center justify-between text-xs text-ink-muted mb-3 pb-2.5 border-b border-surface-border/60">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="capitalize">{msg.skill.difficulty}</span>
                            <span className="text-ink-subtle">·</span>
                            <span>{msg.skill.time_commitment_label}</span>
                            <span className="text-ink-subtle">·</span>
                            <span>{msg.skill.steps?.length || 0} drills</span>
                          </div>
                          {isEnrolled ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-emerald">
                              <SolarIcon name="check-circle-linear" className="w-3.5 h-3.5" />
                              <span>In Studio Queue</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-ink-subtle">
                              New Drill
                            </span>
                          )}
                        </div>

                        <h3 className="font-display font-extrabold text-lg text-ink mb-1">
                          {msg.skill.title}
                        </h3>
                        <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
                          {msg.skill.summary}
                        </p>

                        {/* Sequential Micro-Drills */}
                        <div className="space-y-2 mb-5">
                          {msg.skill.steps?.map((st) => (
                            <div
                              key={st.id}
                              className="p-3 rounded-2xl bg-canvas/80 border border-surface-border text-xs flex items-center justify-between hover:border-ink/20 transition"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-md bg-white border border-surface-border/80 flex items-center justify-center font-mono text-[10px] font-semibold text-ink-muted">
                                  {st.step_number < 10 ? `0${st.step_number}` : st.step_number}
                                </span>
                                <span className="font-medium text-ink">
                                  {st.title}
                                </span>
                              </div>
                              <span className="text-[11px] text-ink-subtle font-mono tabular-nums">
                                ~{st.estimated_minutes}m
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Action CTA: Either Learn This Skill (Add to Queue) or Open Studio */}
                        <div className="pt-2 border-t border-surface-border flex items-center gap-2">
                          {isEnrolled ? (
                            <Link
                              href="/dashboard"
                              onClick={() => playWoodenThud()}
                              className="w-full py-2.5 px-4 rounded-xl bg-ink hover:bg-neutral-800 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs group cursor-pointer"
                            >
                              <span>Practice in Studio Queue with Flashcards</span>
                              <SolarIcon name="arrow-right-linear" className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                playStampThud();
                                await enrollSkill(msg.skill!);
                              }}
                              className="w-full py-2.5 px-4 rounded-xl bg-ink hover:bg-neutral-800 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                            >
                              <SolarIcon name="check-circle-linear" className="w-4 h-4 text-accent-emerald" />
                              <span>Learn This Skill (Add to Studio Queue)</span>
                            </button>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start">
              <div className="p-4 rounded-3xl bg-white border border-surface-border text-xs text-brand-600 font-semibold flex items-center gap-2 shadow-xs animate-pulse">
                <SolarIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
                <span>Archimedes is analyzing biomechanics and sculpting sequential drills...</span>
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
