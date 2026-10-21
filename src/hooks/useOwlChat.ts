"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { Skill } from "@/types/database";
import {
  OwlSuggestion,
  OwlMode,
  OwlHistoryTurn,
  OwlContext,
  OwlProfile,
  OwlMessage,
  OwlConsultation,
  ConsultationOutcome,
} from "@/types/owl";
import { aiService } from "@/services/aiService";
import { consultationService } from "@/services/consultationService";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { playMechanicalClick, playChime, playStampThud } from "@/lib/workbench-audio";
import { speakWithUniformMaleVoice, stopUniformVoice } from "@/lib/voice";

export type { OwlMessage, OwlConsultation, ConsultationOutcome };

export interface UseOwlChatOptions {
  enrolledSkills?: (Skill | string)[];
  catalogSkills?: string[];
  isPro?: boolean;
  daysRemaining?: number;
  currentUser?: User | null;
  onSkillEnrolled?: (skill: Skill) => Promise<void> | void;
  onLimitReached?: () => void;
}

export const INITIAL_MESSAGES: OwlMessage[] = [
  {
    id: "intro",
    sender: "owl",
    text: "Hello, I'm Archimedes. What would you like to learn? Tell me your interests or ask for suggestions, and I will guide you to the right craft.",
    mode: "chat",
    quickReplies: ["Give me in-demand skills", "Help me find a skill", "Fingerstyle guitar"],
  },
];

const STORAGE_CONSULTATIONS_KEY = "skillora_owl_consultations";
const STORAGE_ACTIVE_ID_KEY = "skillora_active_consultation_id";

function deriveConsultationTitle(prompt: string): string {
  const cleaned = prompt
    .replace(/^(help me|suggest|build|i want to learn|how to|teach me|tell me about|what is|give me)\s+/i, "")
    .replace(/["'“”]/g, "")
    .trim();
  if (!cleaned) return "New Inquiry";
  const capped = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return capped.length > 36 ? capped.slice(0, 36).trim() + "…" : capped;
}

function getOutcomeFromMessages(
  msgs: OwlMessage[],
  existingTag?: ConsultationOutcome
): ConsultationOutcome {
  if (existingTag === "enrolled") return "enrolled";
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (m.skill) return "curriculum";
    if (m.suggestions && m.suggestions.length > 0) return "suggestions";
  }
  return "inquiry";
}

function getSpokenSnippet(text: string): string {
  const clean = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .replace(/^\s*[-•\d.]+\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= 180) return clean;

  const sentences = clean.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    let acc = "";
    for (const s of sentences) {
      if ((acc + s).length <= 220) {
        acc += s;
      } else {
        break;
      }
    }
    if (acc.trim().length > 15) return acc.trim();
  }

  return clean.slice(0, 180).replace(/\s+\S*$/, "") + ".";
}

export function useOwlChat(options: UseOwlChatOptions = {}) {
  const { user: authUser } = useAuth();
  const currentUser = options.currentUser !== undefined ? options.currentUser : authUser;
  const userRef = useRef<User | null>(currentUser);
  useEffect(() => {
    userRef.current = currentUser;
  }, [currentUser]);

  const supabase = useMemo(() => createClient(), []);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const [consultations, setConsultations] = useState<OwlConsultation[]>([]);
  const [activeConsultationId, setActiveConsultationId] = useState<string>("");
  const [messages, setMessages] = useState<OwlMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isOwlSpeaking, setIsOwlSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [userProfile, setUserProfile] = useState<OwlProfile>({});

  const activeConsultationIdRef = useRef<string>("");
  const consultationsRef = useRef<OwlConsultation[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    activeConsultationIdRef.current = activeConsultationId;
  }, [activeConsultationId]);

  useEffect(() => {
    consultationsRef.current = consultations;
  }, [consultations]);

  useEffect(() => {
    const fromAccount = currentUser?.user_metadata?.owl_profile as OwlProfile | undefined;
    if (fromAccount && typeof fromAccount === "object") {
      setUserProfile((prev) => ({ ...prev, ...fromAccount }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedProfile = localStorage.getItem("skillora_owl_profile");
      if (savedProfile) setUserProfile((prev) => ({ ...JSON.parse(savedProfile), ...prev }));

      const raw = localStorage.getItem(STORAGE_CONSULTATIONS_KEY);
      const savedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
      let list: OwlConsultation[] = [];

      if (raw) {
        try {
          list = JSON.parse(raw);
        } catch {
          list = [];
        }
      }

      if (!Array.isArray(list) || list.length === 0) {
        const defaultSession: OwlConsultation = {
          id: `consultation-${Date.now()}`,
          title: "New Inquiry",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: INITIAL_MESSAGES,
          outcomeTag: "inquiry",
        };
        list = [defaultSession];
        localStorage.setItem(STORAGE_CONSULTATIONS_KEY, JSON.stringify(list));
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, defaultSession.id);
      }

      setConsultations(list);
      const target = list.find((c) => c.id === savedId) || list[0];
      setActiveConsultationId(target.id);
      setMessages(target.messages && target.messages.length > 0 ? target.messages : INITIAL_MESSAGES);
    } catch (err) {
      console.warn("Failed to initialize consultations:", err);
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    let cancelled = false;
    setIsSyncingCloud(true);

    consultationService
      .syncLocalAndCloud(supabase, currentUser.id, consultationsRef.current)
      .then((merged) => {
        if (cancelled || !merged || merged.length === 0) return;

        setConsultations(merged);
        try {
          localStorage.setItem(STORAGE_CONSULTATIONS_KEY, JSON.stringify(merged));
        } catch {}

        const currentActive = activeConsultationIdRef.current;
        const target = merged.find((c) => c.id === currentActive) || merged[0];
        if (target) {
          setActiveConsultationId(target.id);
          setMessages(
            target.messages && target.messages.length > 0 ? target.messages : INITIAL_MESSAGES
          );
          try {
            localStorage.setItem(STORAGE_ACTIVE_ID_KEY, target.id);
          } catch {}
        }
      })
      .catch((err) => {
        console.warn("Cloud sync error:", err);
      })
      .finally(() => {
        if (!cancelled) setIsSyncingCloud(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, supabase]);

  useEffect(() => {
    return () => {
      stopUniformVoice();
    };
  }, []);

  const stopVoice = useCallback(() => {
    stopUniformVoice();
    setIsOwlSpeaking(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const speakOwlVoice = useCallback(
    (text: string) => {
      if (!voiceEnabled || typeof window === "undefined") return;

      const spokenText = getSpokenSnippet(text);
      speakWithUniformMaleVoice(spokenText, {
        lang: "en-US",
        speed: 1.0,
        onStart: () => setIsOwlSpeaking(true),
        onEnd: () => setIsOwlSpeaking(false),
      });
    },
    [voiceEnabled]
  );

  const persistConsultationUpdate = useCallback(
    (targetId: string, updatedMsgs: OwlMessage[], explicitOutcome?: ConsultationOutcome) => {
      setConsultations((prev) => {
        let updatedSession: OwlConsultation | null = null;
        const next = prev.map((c) => {
          if (c.id !== targetId) return c;

          let title = c.title;
          if (!title || title === "New Inquiry") {
            const firstUser = updatedMsgs.find((m) => m.sender === "user");
            if (firstUser) {
              title = deriveConsultationTitle(firstUser.text);
            }
          }

          const outcomeTag = explicitOutcome || getOutcomeFromMessages(updatedMsgs, c.outcomeTag);
          updatedSession = {
            ...c,
            title,
            messages: updatedMsgs,
            outcomeTag,
            updatedAt: new Date().toISOString(),
          };
          return updatedSession;
        });

        try {
          localStorage.setItem(STORAGE_CONSULTATIONS_KEY, JSON.stringify(next));
        } catch (err) {
          console.warn("Storage sync failed:", err);
        }

        const user = userRef.current;
        if (user?.id && updatedSession) {
          consultationService.upsertUserConsultation(supabase, user.id, updatedSession);
        }

        return next;
      });
    },
    [supabase]
  );

  const startNewConsultation = useCallback(() => {
    stopVoice();
    const newId = `consultation-${Date.now()}`;
    const newSession: OwlConsultation = {
      id: newId,
      title: "New Inquiry",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: INITIAL_MESSAGES,
      outcomeTag: "inquiry",
    };

    setConsultations((prev) => {
      const next = [newSession, ...prev];
      try {
        localStorage.setItem(STORAGE_CONSULTATIONS_KEY, JSON.stringify(next));
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, newId);
      } catch {}

      const user = userRef.current;
      if (user?.id) {
        consultationService.upsertUserConsultation(supabase, user.id, newSession);
      }

      return next;
    });

    setActiveConsultationId(newId);
    setMessages(INITIAL_MESSAGES);
    setInputText("");
  }, [stopVoice, supabase]);

  const selectConsultation = useCallback(
    (id: string) => {
      if (id === activeConsultationIdRef.current) return;
      stopVoice();

      const target = consultationsRef.current.find((c) => c.id === id);
      if (target) {
        setActiveConsultationId(target.id);
        setMessages(
          target.messages && target.messages.length > 0 ? target.messages : INITIAL_MESSAGES
        );
        setInputText("");
        try {
          localStorage.setItem(STORAGE_ACTIVE_ID_KEY, target.id);
        } catch {}
      }
    },
    [stopVoice]
  );

  const deleteConsultation = useCallback(
    (id: string) => {
      stopVoice();

      const user = userRef.current;
      if (user?.id) {
        consultationService.deleteUserConsultation(supabase, user.id, id);
      }

      setConsultations((prev) => {
        const next = prev.filter((c) => c.id !== id);

        if (next.length === 0) {
          const freshId = `consultation-${Date.now()}`;
          const freshSession: OwlConsultation = {
            id: freshId,
            title: "New Inquiry",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: INITIAL_MESSAGES,
            outcomeTag: "inquiry",
          };
          const fallback = [freshSession];
          try {
            localStorage.setItem(STORAGE_CONSULTATIONS_KEY, JSON.stringify(fallback));
            localStorage.setItem(STORAGE_ACTIVE_ID_KEY, freshId);
          } catch {}

          if (user?.id) {
            consultationService.upsertUserConsultation(supabase, user.id, freshSession);
          }

          setActiveConsultationId(freshId);
          setMessages(INITIAL_MESSAGES);
          return fallback;
        }

        try {
          localStorage.setItem(STORAGE_CONSULTATIONS_KEY, JSON.stringify(next));
        } catch {}

        if (activeConsultationIdRef.current === id) {
          const nextActive = next[0];
          setActiveConsultationId(nextActive.id);
          setMessages(
            nextActive.messages && nextActive.messages.length > 0
              ? nextActive.messages
              : INITIAL_MESSAGES
          );
          try {
            localStorage.setItem(STORAGE_ACTIVE_ID_KEY, nextActive.id);
          } catch {}
        }
        return next;
      });
    },
    [stopVoice, supabase]
  );

  const clearAllConsultations = useCallback(() => {
    stopVoice();
    const user = userRef.current;
    if (user?.id) {
      consultationService.clearUserConsultations(supabase, user.id);
    }

    const freshId = `consultation-${Date.now()}`;
    const freshSession: OwlConsultation = {
      id: freshId,
      title: "New Inquiry",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: INITIAL_MESSAGES,
      outcomeTag: "inquiry",
    };
    const list = [freshSession];
    try {
      localStorage.setItem(STORAGE_CONSULTATIONS_KEY, JSON.stringify(list));
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, freshId);
    } catch {}

    if (user?.id) {
      consultationService.upsertUserConsultation(supabase, user.id, freshSession);
    }

    setConsultations(list);
    setActiveConsultationId(freshId);
    setMessages(INITIAL_MESSAGES);
    setInputText("");
  }, [stopVoice, supabase]);

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
      const textToSend =
        typeof (rawText as any)?.toWellFormed === "function"
          ? (rawText as any).toWellFormed().trim()
          : String(rawText || "")
              .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "")
              .trim();

      if (!textToSend || isThinking) return;

      const currentSessionId = activeConsultationIdRef.current;
      stopVoice();
      playMechanicalClick();

      const userMsg: OwlMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: textToSend,
      };

      const updatedWithUser = [...messages, userMsg];
      setMessages(updatedWithUser);
      setInputText("");
      setIsThinking(true);

      persistConsultationUpdate(currentSessionId, updatedWithUser);

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

        if (reply.profile) {
          setUserProfile((prev) => {
            const next = { ...prev, ...reply.profile };
            try {
              localStorage.setItem("skillora_owl_profile", JSON.stringify(next));
            } catch {
            }
            if (userRef.current) {
              supabase.auth.updateUser({ data: { owl_profile: next } }).then(({ error }) => {
                if (error) console.warn("Could not save Archimedes profile to account", error.message);
              });
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

        const updatedWithOwl = [...updatedWithUser, owlMsg];

        persistConsultationUpdate(currentSessionId, updatedWithOwl);

        if (activeConsultationIdRef.current === currentSessionId) {
          setMessages(updatedWithOwl);
          playChime();
          speakOwlVoice(reply.owlMessage);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Owl communication failed";
        const errMsg: OwlMessage = {
          id: `owl-err-${Date.now()}`,
          sender: "owl",
          text: `My apologies—${msg}. Let us refine your inquiry.`,
          mode: "chat",
          quickReplies: ["Suggest in-demand skills", "Help me find a skill"],
        };

        const updatedWithError = [...updatedWithUser, errMsg];
        persistConsultationUpdate(currentSessionId, updatedWithError);

        if (activeConsultationIdRef.current === currentSessionId) {
          setMessages(updatedWithError);
        }
      } finally {
        setIsThinking(false);
      }
    },
    [
      inputText,
      isThinking,
      messages,
      options,
      userProfile,
      stopVoice,
      speakOwlVoice,
      persistConsultationUpdate,
    ]
  );

  const buildCurriculum = useCallback(
    async (suggestion: OwlSuggestion | string) => {
      const title = typeof suggestion === "string" ? suggestion : suggestion.title;
      await sendMessage(`Build the deliberate practice curriculum for "${title}"`, "curriculum");
    },
    [sendMessage]
  );

  const resizeCurriculum = useCallback(
    async (skill: Skill, direction: "shorter" | "longer") => {
      const title = skill.title.replace(/\s*\((Quick|Extended) version\)$/, "");
      await sendMessage(
        direction === "shorter"
          ? `Make the "${title}" plan shorter`
          : `Make the "${title}" plan longer and more thorough`,
        "curriculum"
      );
    },
    [sendMessage]
  );

  const enrollSkill = useCallback(
    async (skillToEnroll: Skill): Promise<boolean> => {
      playStampThud();
      if (options.onSkillEnrolled) {
        await options.onSkillEnrolled(skillToEnroll);
      }

      const currentId = activeConsultationIdRef.current;
      setConsultations((prev) => {
        let updated: OwlConsultation | null = null;
        const next = prev.map((c) => {
          if (c.id === currentId) {
            updated = { ...c, outcomeTag: "enrolled" as const, updatedAt: new Date().toISOString() };
            return updated;
          }
          return c;
        });
        try {
          localStorage.setItem(STORAGE_CONSULTATIONS_KEY, JSON.stringify(next));
        } catch {}

        const user = userRef.current;
        if (user?.id && updated) {
          consultationService.upsertUserConsultation(supabase, user.id, updated);
        }

        return next;
      });

      return true;
    },
    [options, supabase]
  );

  const currentConsultation =
    consultations.find((c) => c.id === activeConsultationId) || null;

  return {
    consultations,
    activeConsultationId,
    currentConsultation,
    startNewConsultation,
    selectConsultation,
    deleteConsultation,
    clearAllConsultations,
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
    enrollSkill,
    toggleVoiceListening,
    speakOwlVoice,
    stopVoice,
    isCloudSynced: Boolean(currentUser),
    isSyncingCloud,
  };
}
