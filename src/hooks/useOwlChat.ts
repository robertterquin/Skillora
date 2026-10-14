"use client";

import { useState, useRef } from "react";
import { Skill } from "@/types/database";
import { aiService } from "@/services/aiService";
import { playMechanicalClick, playChime } from "@/lib/workbench-audio";

export interface OwlMessage {
  id: string;
  sender: "user" | "owl";
  text: string;
  skill?: Skill;
}

const INITIAL_MESSAGES: OwlMessage[] = [
  {
    id: "owl-init",
    sender: "owl",
    text: "Greetings, craftsperson. I am Archimedes. Name any craft—from Travis picking to artisanal sourdough—and I will dissect it into three deliberate practice milestones.",
  },
];

export function useOwlChat(onSkillEnrolled?: (skill: Skill) => Promise<void>) {
  const [messages, setMessages] = useState<OwlMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isOwlSpeaking, setIsOwlSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopVoice = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsOwlSpeaking(false);
  };

  const speakOwlVoice = async (text: string) => {
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
      // Graceful fallback to browser speech synthesis
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 0.85;
        utterance.onend = () => setIsOwlSpeaking(false);
        utterance.onerror = () => setIsOwlSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsOwlSpeaking(false);
      }
    }
  };

  const sendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isThinking) return;

    stopVoice();
    playMechanicalClick();

    const userMsg: OwlMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    try {
      const data = await aiService.chatWithOwl(textToSend.trim());
      const owlReply = data.owlMessage;
      const newSkill: Skill = data.skill;

      if (onSkillEnrolled && newSkill) {
        await onSkillEnrolled(newSkill);
      }

      const owlMsg: OwlMessage = {
        id: `owl-${Date.now()}`,
        sender: "owl",
        text: owlReply,
        skill: newSkill,
      };

      setMessages((prev) => [...prev, owlMsg]);
      playChime();
      await speakOwlVoice(owlReply);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Owl communication failed";
      setMessages((prev) => [
        ...prev,
        {
          id: `owl-err-${Date.now()}`,
          sender: "owl",
          text: `My apologies—${msg}. Let us refine your inquiry.`,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    isThinking,
    isOwlSpeaking,
    voiceEnabled,
    setVoiceEnabled,
    sendMessage,
    speakOwlVoice,
    stopVoice,
  };
}
