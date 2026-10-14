"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Skill } from "@/types/database";
import { OwlSuggestion, OwlMode, OwlHistoryTurn, OwlContext, OwlProfile } from "@/types/owl";
import { aiService } from "@/services/aiService";
import { playMechanicalClick, playChime, playStampThud } from "@/lib/workbench-audio";

export interface OwlMessage {
  id: string;
  sender: "user" | "owl";
  text: string;
  mode?: OwlMode;
  suggestions?: OwlSuggestion[];
  quickReplies?: string[];
  skill?: Skill | null;
}

export interface UseOwlChatOptions {
  enrolledSkills?: (Skill | string)[];
  catalogSkills?: string[];
  isPro?: boolean;
  daysRemaining?: number;
  onSkillEnrolled?: (skill: Skill) => Promise<void> | void;
  onLimitReached?: () => void;
}

const INITIAL_MESSAGES: OwlMessage[] = [
  {
    id: "intro",
    sender: "owl",
    text: "Hello, I'm Archimedes. What would you like to learn? Tell me your interests or ask for suggestions, and I will guide you to the right craft.",
    mode: "chat",
    quickReplies: ["Give me in-demand skills", "Help me find a skill", "Fingerstyle guitar"],
  },
];

export function useOwlChat(options: UseOwlChatOptions = {}) {
  const [messages, setMessages] = useState<OwlMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isOwlSpeaking, setIsOwlSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [userProfile, setUserProfile] = useState<OwlProfile>({});

  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load saved profile on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("skillora_owl_profile");
      if (saved) setUserProfile(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Audio cleanup on unmount
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

  const stopVoice = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsOwlSpeaking(false);
  }, []);

  const speakOwlVoice = useCallback(
    async (text: string) => {
      if (!voiceEnabled || typeof window === "undefined") return;

      stopVoice();
      setIsOwlSpeaking(true);

      try {
        let audioUrl = audioCacheRef.current.get(text);
        if (!audioUrl) {
          const blob = await aiService.textToSpeech(text, "onyx", 0.92);
          audioUrl = URL.createObjectURL(blob);
          audioCacheRef.current.set(text, audioUrl);
        }

        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => setIsOwlSpeaking(false);
        audio.onerror = () => setIsOwlSpeaking(false);
        await audio.play();
      } catch {
        // Fallback to browser speech synthesis
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          const voices = window.speechSynthesis.getVoices();
          const deepVoice =
            voices.find(
              (v) =>
                v.lang.startsWith("en") &&
                (v.name.includes("Daniel") ||
                  v.name.includes("UK English Male") ||
                  v.name.includes("Oliver") ||
                  v.name.includes("Arthur") ||
                  v.name.includes("Alex") ||
                  v.name.includes("Natural"))
            ) || voices.find((v) => v.lang.startsWith("en"));

          if (deepVoice) utterance.voice = deepVoice;
          utterance.rate = 0.9;
          utterance.pitch = 0.82;
          utterance.onend = () => setIsOwlSpeaking(false);
          utterance.onerror = () => setIsOwlSpeaking(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsOwlSpeaking(false);
        }
      }
    },
    [voiceEnabled, stopVoice]
  );

  const toggleVoiceListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          id: `owl-novoice-${Date.now()}`,
          sender: "owl",
          text: "Voice input isn't supported in this browser. You can type your question instead.",
        },
      ]);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputText(transcript);
          sendMessage(transcript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [isListening]);

  const sendMessage = useCallback(
    async (customPrompt?: string, forceMode?: "curriculum") => {
      const rawText = customPrompt || inputText;
      const textToSend = typeof (rawText as any)?.toWellFormed === "function"
        ? (rawText as any).toWellFormed().trim()
        : String(rawText || "")
            .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "")
            .trim();

      if (!textToSend || isThinking) return;

      stopVoice();
      playMechanicalClick();

      const userMsg: OwlMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: textToSend,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setIsThinking(true);

      // Build conversation history
      const history: OwlHistoryTurn[] = messages
        .filter((m) => m.id !== "intro" && m.id !== "owl-init")
        .slice(-8)
        .map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("owl" as const),
          text: m.text,
          suggestionTitles: m.suggestions?.map((s) => s.title),
          skillTitle: m.skill?.title,
        }));

      const enrolledTitles = (options.enrolledSkills || []).map((s) =>
        typeof s === "string" ? s : s.title
      );

      const context: OwlContext = {
        enrolledSkills: enrolledTitles,
        catalogSkills: options.catalogSkills || [],
        profile: userProfile,
      };

      try {
        const reply = await aiService.chatWithOwl(
          textToSend.trim(),
          history,
          context,
          forceMode
        );

        // Update profile if learner attributes were extracted
        if (reply.profile) {
          setUserProfile((prev) => {
            const next = { ...prev, ...reply.profile };
            try {
              localStorage.setItem("skillora_owl_profile", JSON.stringify(next));
            } catch {
              // ignore
            }
            return next;
          });
        }

        const owlMsg: OwlMessage = {
          id: `owl-${Date.now()}`,
          sender: "owl",
          text: reply.owlMessage,
          mode: reply.mode,
          suggestions: reply.suggestions,
          quickReplies: reply.quickReplies,
          skill: reply.skill,
        };

        setMessages((prev) => [...prev, owlMsg]);
        playChime();
        await speakOwlVoice(reply.owlMessage);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Owl communication failed";
        setMessages((prev) => [
          ...prev,
          {
            id: `owl-err-${Date.now()}`,
            sender: "owl",
            text: `My apologies—${msg}. Let us refine your inquiry.`,
            mode: "chat",
            quickReplies: ["Suggest in-demand skills", "Help me find a skill"],
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [inputText, isThinking, messages, options, userProfile, stopVoice, speakOwlVoice]
  );

  const buildCurriculum = useCallback(
    async (suggestion: OwlSuggestion | string) => {
      const title = typeof suggestion === "string" ? suggestion : suggestion.title;
      await sendMessage(`Build the deliberate practice curriculum for "${title}"`, "curriculum");
    },
    [sendMessage]
  );

  const enrollSkill = useCallback(
    async (skillToEnroll: Skill): Promise<boolean> => {
      // 1. Free-tier 7-day trial check
      if (!options.isPro && typeof options.daysRemaining === "number" && options.daysRemaining <= 0) {
        options.onLimitReached?.();
        return false;
      }

      // 2. Free-tier 3-skill maximum limit check
      if (!options.isPro && (options.enrolledSkills?.length || 0) >= 3) {
        options.onLimitReached?.();
        return false;
      }

      playStampThud();
      if (options.onSkillEnrolled) {
        await options.onSkillEnrolled(skillToEnroll);
      }
      return true;
    },
    [options]
  );

  return {
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
    enrollSkill,
    toggleVoiceListening,
    speakOwlVoice,
    stopVoice,
  };
}
