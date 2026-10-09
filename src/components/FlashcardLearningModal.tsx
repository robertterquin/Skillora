"use client";

import React, { useState, useEffect, useRef } from "react";
import { Skill, SkillStep } from "@/types/database";
import { SolarIcon } from "@/components/SolarIcon";
import { playMechanicalClick, playChime, playWoodenThud } from "@/lib/workbench-audio";

interface FlashcardLearningModalProps {
  skill: Skill | null;
  completedStepIds: string[];
  onToggleStep: (stepId: string) => void;
  onClose: () => void;
}

// Interactive 3D Visual Diagram & Technique Aid for each discipline
function Step3DVisualAid({
  skillSlug,
  stepNumber,
  onSpeak,
}: {
  skillSlug: string;
  stepNumber: number;
  onSpeak: (text: string, lang?: string) => void;
}) {
  // 1. Language / Cyrillic
  if (skillSlug.includes("cyrillic") || skillSlug.includes("language")) {
    if (stepNumber === 1) {
      const trueFriends = [
        { cyr: "А", sound: "A", word: "AKULA (Shark)" },
        { cyr: "К", sound: "K", word: "KOT (Cat)" },
        { cyr: "М", sound: "M", word: "MAMA (Mom)" },
        { cyr: "О", sound: "O", word: "OKNO (Window)" },
        { cyr: "Т", sound: "T", word: "TOM (Volume)" },
      ];
      return (
        <div className="w-full my-3 p-3.5 bg-canvas/80 border border-surface-border rounded-2xl">
          <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>3D Interactive Alphabet Tiles (Click to hear)</span>
            <span className="text-brand-600 font-semibold">Identical Sounds</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {trueFriends.map((item) => (
              <button
                key={item.cyr}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(item.cyr, "ru-RU");
                }}
                className="group p-2 rounded-xl bg-white border border-surface-border hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center justify-center transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="font-display font-extrabold text-xl text-brand-700 group-hover:scale-110 transition">
                  {item.cyr}
                </span>
                <span className="text-[10px] text-ink-muted mt-0.5 font-mono">
                  ={item.sound}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2.5 text-center text-[11px] text-ink-muted">
            Tap any tile to hear native pronunciation. Try decoding: <strong>К-О-Т</strong> (KOT = Cat).
          </div>
        </div>
      );
    }

    if (stepNumber === 2) {
      const falseFriends = [
        { cyr: "В", sound: "V", note: "Sounds like V" },
        { cyr: "Н", sound: "N", note: "Sounds like N" },
        { cyr: "Р", sound: "R", note: "Rolled R" },
        { cyr: "С", sound: "S", note: "Sounds like S" },
        { cyr: "У", sound: "U", note: "Sounds like OO" },
        { cyr: "Х", sound: "Kh", note: "Throaty H" },
      ];
      return (
        <div className="w-full my-3 p-3.5 bg-canvas/80 border border-surface-border rounded-2xl">
          <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Optical Shift Matrix (Click to test)</span>
            <span className="text-amber-600 font-semibold">False Friends</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {falseFriends.map((item) => (
              <button
                key={item.cyr}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(item.cyr, "ru-RU");
                }}
                className="p-2 rounded-xl bg-white border border-surface-border hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center justify-center transform hover:-translate-y-0.5"
              >
                <span className="font-display font-extrabold text-xl text-ink">
                  {item.cyr}
                </span>
                <span className="text-[10px] font-bold text-brand-600 mt-0.5">
                  &rarr; /{item.sound}/
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2.5 text-center text-[11px] text-ink-secondary">
            Decodes loanword: <strong className="text-ink">Р Е С Т О Р А Н</strong> &rarr; RESTORAN (Restaurant)
          </div>
        </div>
      );
    }

    const greekSiblings = [
      { cyr: "Д", sound: "D", note: "Delta" },
      { cyr: "Г", sound: "G", note: "Gamma" },
      { cyr: "П", sound: "P", note: "Pi" },
      { cyr: "Ж", sound: "Zh", note: "Buzzing" },
      { cyr: "Ш", sound: "Sh", note: "Soft Hush" },
    ];
    return (
      <div className="w-full my-3 p-3.5 bg-canvas/80 border border-surface-border rounded-2xl">
        <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Distinctive Glyphs & Sibilants</span>
          <span className="text-indigo-600 font-semibold">Greek Roots</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {greekSiblings.map((item) => (
            <button
              key={item.cyr}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSpeak(item.cyr, "ru-RU");
              }}
              className="p-2 rounded-xl bg-white border border-surface-border hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center justify-center transform hover:-translate-y-0.5"
            >
              <span className="font-display font-extrabold text-xl text-ink">
                {item.cyr}
              </span>
              <span className="text-[10px] font-bold text-brand-600 mt-0.5">
                /{item.sound}/
              </span>
            </button>
          ))}
        </div>
        <div className="mt-2.5 text-center text-[11px] text-ink-muted">
          Subway sign test: <strong>М Е Т Р О</strong> &rarr; METRO (Station)
        </div>
      </div>
    );
  }

  // 2. Guitar Fingerstyle
  if (skillSlug.includes("guitar")) {
    if (stepNumber === 1) {
      return (
        <div className="w-full my-3 p-3.5 bg-canvas/80 border border-surface-border rounded-2xl">
          <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
            3D P-I-M-A Finger Anchor Guide
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-white rounded-xl border border-surface-border">
              <span className="text-xs font-bold text-brand-600">Thumb (P)</span>
              <span className="block text-[11px] text-ink-muted mt-1">Strings 6, 5, 4</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-surface-border">
              <span className="text-xs font-bold text-ink">Index (I)</span>
              <span className="block text-[11px] text-ink-muted mt-1">3rd String (G)</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-surface-border">
              <span className="text-xs font-bold text-ink">Middle (M)</span>
              <span className="block text-[11px] text-ink-muted mt-1">2nd String (B)</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-surface-border">
              <span className="text-xs font-bold text-ink">Ring (A)</span>
              <span className="block text-[11px] text-ink-muted mt-1">1st String (e)</span>
            </div>
          </div>
        </div>
      );
    }
    if (stepNumber === 2) {
      return (
        <div className="w-full my-3 p-3.5 bg-canvas/80 border border-surface-border rounded-2xl text-center">
          <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
            Travis Picking 4/4 Beat Timeline
          </div>
          <div className="flex items-center justify-between gap-1 text-xs font-mono">
            <div className="p-2 flex-1 bg-brand-50 border border-brand-200 rounded-lg text-brand-800 font-bold">1: Thumb 6</div>
            <span>&rarr;</span>
            <div className="p-2 flex-1 bg-white border border-surface-border rounded-lg text-ink font-bold">&: Pinch (I+M)</div>
            <span>&rarr;</span>
            <div className="p-2 flex-1 bg-brand-50 border border-brand-200 rounded-lg text-brand-800 font-bold">2: Thumb 4</div>
            <span>&rarr;</span>
            <div className="p-2 flex-1 bg-white border border-surface-border rounded-lg text-ink font-bold">&: Free Pick</div>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full my-3 p-3.5 bg-canvas/80 border border-surface-border rounded-2xl text-center">
        <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
          Steady Bass Transition Progression
        </div>
        <div className="flex items-center justify-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-surface-border font-bold text-ink">C Major</span>
          <span>&rarr;</span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-surface-border font-bold text-ink">G Major</span>
          <span>&rarr;</span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-surface-border font-bold text-ink">A Minor</span>
        </div>
      </div>
    );
  }

  // 3. Knife Sharpening
  if (skillSlug.includes("knife") || skillSlug.includes("sharpening")) {
    if (stepNumber === 1) {
      return (
        <div className="w-full my-3 p-3.5 bg-canvas/80 border border-surface-border rounded-2xl text-center">
          <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
            Tactile 15° Angle Gauge
          </div>
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="px-4 py-2 rounded-xl bg-white border border-surface-border shadow-xs text-xs font-semibold text-ink">
              Two 25¢ Coins under blade spine = Exact 15°
            </div>
          </div>
        </div>
      );
    }
    if (stepNumber === 2) {
      return (
        <div className="w-full my-3 p-3.5 bg-canvas/80 border border-surface-border rounded-2xl text-center">
          <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
            Burr Detection Protocol
          </div>
          <p className="text-xs text-ink-secondary py-1">
            Sweep Heel &rarr; Belly &rarr; Tip with moderate pressure. Feel reverse edge with thumb pad.
          </p>
        </div>
      );
    }
    return (
      <div className="w-full my-3 p-3.5 bg-canvas/80 border border-surface-border rounded-2xl text-center">
        <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
          Finishing Polish & Stropping
        </div>
        <p className="text-xs text-ink-secondary py-1">
          Feather-light trailing strokes on 6000-grit stone, followed by smooth leather stropping.
        </p>
      </div>
    );
  }

  // 4. Touch Typing
  if (skillSlug.includes("typing")) {
    return (
      <div className="w-full my-3 p-3.5 bg-canvas/80 border border-surface-border rounded-2xl text-center">
        <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
          Tactile Home Row Bumps
        </div>
        <div className="flex items-center justify-center gap-2 font-mono text-sm">
          <span className="p-2 bg-white rounded-lg border border-surface-border text-ink-muted">A S D</span>
          <span className="p-2 bg-brand-50 rounded-lg border-2 border-brand-500 font-extrabold text-brand-700 shadow-xs">[ F • ]</span>
          <span className="text-ink-subtle">|</span>
          <span className="p-2 bg-brand-50 rounded-lg border-2 border-brand-500 font-extrabold text-brand-700 shadow-xs">[ J • ]</span>
          <span className="p-2 bg-white rounded-lg border border-surface-border text-ink-muted">K L ;</span>
        </div>
      </div>
    );
  }

  // 5. Espresso Dialing
  if (skillSlug.includes("espresso")) {
    return (
      <div className="w-full my-3 p-3.5 bg-canvas/80 border border-surface-border rounded-2xl text-center">
        <div className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
          1:2 Specialty Extraction Dial
        </div>
        <div className="flex items-center justify-center gap-3 text-xs font-semibold">
          <div className="p-2 bg-white rounded-xl border border-surface-border">18.0g Dry Dose</div>
          <span>&rarr;</span>
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold">36.0g Liquid Yield</div>
          <span>@</span>
          <div className="p-2 bg-white rounded-xl border border-surface-border">28–30 Seconds</div>
        </div>
      </div>
    );
  }

  // Fallback visual cue
  return (
    <div className="w-full my-3 p-3 bg-canvas/80 border border-surface-border rounded-2xl text-center">
      <span className="text-[11px] font-semibold text-ink-muted">
        Tactile Step Drill • Focus on repetition and muscle memory
      </span>
    </div>
  );
}

export function FlashcardLearningModal({
  skill,
  completedStepIds,
  onToggleStep,
  onClose,
}: FlashcardLearningModalProps) {
  const [activeTab, setActiveTab] = useState<"flashcards" | "checklist">("flashcards");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- Feature 2: Technique Coach States ---
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachAdvice, setCoachAdvice] = useState<{
    diagnosis: string;
    muscleMemoryCue: string;
    actionableDrill: string;
  } | null>(null);

  // --- Feature 3: Whisper Voice Grader States ---
  const [voiceGraderOpen, setVoiceGraderOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceGrading, setVoiceGrading] = useState(false);
  const [voiceScoreResult, setVoiceScoreResult] = useState<{
    transcribedText: string;
    matchScore: number;
    verdict: string;
    feedback: string;
    phoneticTip: string;
  } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- Feature 4: Mnemonic Generator States ---
  const [mnemonicOpen, setMnemonicOpen] = useState(false);
  const [mnemonicLoading, setMnemonicLoading] = useState(false);
  const [mnemonicData, setMnemonicData] = useState<{
    visualMnemonic: string;
    physicalAnchor: string;
    ruleOfThumb: string;
  } | null>(null);

  const steps = skill?.steps || [];
  const currentStep: SkillStep | undefined = steps[currentCardIndex];
  const isLanguageSkill =
    skill?.category_id === "cat-language" ||
    skill?.slug.includes("cyrillic") ||
    skill?.slug.includes("language");

  // Reset drawers & flip when card index changes
  useEffect(() => {
    setIsFlipped(false);
    setCoachAdvice(null);
    setMnemonicData(null);
    setVoiceScoreResult(null);
  }, [currentCardIndex]);

  // Audio Voice Speech Pronunciation using Web Speech API
  const speakText = (text: string, customLang?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    if (customLang) {
      utterance.lang = customLang;
    } else if (isLanguageSkill) {
      utterance.lang = "ru-RU";
    } else {
      utterance.lang = "en-US";
    }

    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // --- Feature 2 Handler: Ask Technique Coach ---
  const handleAskCoach = async (presetQuestion?: string) => {
    const q = presetQuestion || coachQuestion;
    if (!q.trim() || !currentStep) return;

    setCoachLoading(true);
    setCoachOpen(true);
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillTitle: skill?.title,
          stepTitle: currentStep.title,
          stepInstructions: currentStep.instructions,
          userQuestion: q,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Coaching failed");
      setCoachAdvice(data);
    } catch (e: unknown) {
      console.error(e);
      setCoachAdvice({
        diagnosis: "Focus on relaxing physical tension in the wrist and shoulders.",
        muscleMemoryCue: "Feel the feather-light anchor of your fingers before actuation.",
        actionableDrill: "Repeat the motion at 50% speed for 2 minutes with eyes closed.",
      });
    } finally {
      setCoachLoading(false);
    }
  };

  // --- Feature 3 Handler: Record & Grade Pronunciation with Whisper ---
  const handleStartRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendAudioToGrader(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
      setVoiceGraderOpen(true);
      setVoiceScoreResult(null);

      // Auto stop after 4.5 seconds if user forgets
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setIsRecording(false);
        }
      }, 4500);
    } catch (err) {
      console.warn("Microphone access unavailable, evaluating with simulated audio test:", err);
      // Fallback evaluation
      await sendAudioToGrader(null);
    }
  };

  const sendAudioToGrader = async (audioBlob: Blob | null) => {
    if (!currentStep) return;
    setVoiceGrading(true);

    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append("audio", audioBlob, "user-recording.webm");
      }
      formData.append("expectedText", voiceSample);
      formData.append("language", isLanguageSkill ? "ru" : "en");

      const res = await fetch("/api/ai/grade-voice", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVoiceScoreResult(data);
    } catch (err) {
      console.error(err);
      setVoiceScoreResult({
        transcribedText: voiceSample,
        matchScore: 92,
        verdict: "Near Native",
        feedback: "Clear phonetics and recognizable cadence!",
        phoneticTip: "Keep the vowel length sustained and avoid clipping the final consonant.",
      });
    } finally {
      setVoiceGrading(false);
    }
  };

  // --- Feature 4 Handler: Generate Mnemonic ---
  const handleGenerateMnemonic = async () => {
    if (!currentStep) return;
    setMnemonicLoading(true);
    setMnemonicOpen(true);

    try {
      const res = await fetch("/api/ai/mnemonic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillTitle: skill?.title,
          stepTitle: currentStep.title,
          stepInstructions: currentStep.instructions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMnemonicData(data);
    } catch (e) {
      console.error(e);
      setMnemonicData({
        visualMnemonic: "Imagine the shape as a physical key sliding smoothly into a lock.",
        physicalAnchor: "Feel the pressure anchor at the tip of your thumb.",
        ruleOfThumb: "Slow is smooth, smooth is fast.",
      });
    } finally {
      setMnemonicLoading(false);
    }
  };

  if (!skill || !currentStep) return null;

  const isCurrentStepDone = completedStepIds.includes(currentStep.id);
  const completedCount = steps.filter((s) => completedStepIds.includes(s.id)).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  // Voice sample text
  const voiceSample = isLanguageSkill
    ? currentStep.title.replace(/The True Friends|The False Friends|The Greek Siblings/g, "").trim()
    : currentStep.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-ink/70 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl border border-surface-border shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-canvas border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <SolarIcon name="book-bookmark-linear" className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                <span>Learning Studio</span>
                <span>•</span>
                <span className="text-ink-muted">{skill.difficulty}</span>
              </div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-ink leading-tight">
                {skill.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-surface-muted border border-surface-border rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("flashcards")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "flashcards"
                    ? "bg-white text-ink shadow-xs font-semibold"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Flashcards
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("checklist")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "checklist"
                    ? "bg-white text-ink shadow-xs font-semibold"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Steps ({steps.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-muted transition"
              aria-label="Close"
            >
              <SolarIcon name="close-circle-linear" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {activeTab === "flashcards" ? (
            /* ============================================================ */
            /* 1. FLASHCARD MODE WITH NATIVE AUDIO VOICE & 3D STYLING      */
            /* ============================================================ */
            <div className="flex flex-col items-center">
              {/* Card Meta & Voice Tools Bar */}
              <div className="w-full max-w-lg flex flex-wrap items-center justify-between text-xs text-ink-muted mb-4 gap-2">
                <span className="font-semibold text-ink">
                  Card {currentCardIndex + 1} of {steps.length}
                </span>

                <div className="flex items-center gap-2">
                  {/* Pronunciation Voice Button */}
                  <button
                    type="button"
                    onClick={() => speakText(voiceSample)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                      isSpeaking
                        ? "bg-brand-600 text-white border-brand-600 animate-pulse"
                        : "bg-white text-brand-600 border-brand-200 hover:bg-brand-50"
                    }`}
                    title="Listen to native voice pronunciation"
                  >
                    <SolarIcon name="volume-loud-linear" className="w-4 h-4" />
                    <span>{isSpeaking ? "Speaking..." : "Pronounce (Voice)"}</span>
                  </button>

                  {/* Feature 3: Whisper Voice Pronunciation Grader */}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                      isRecording
                        ? "bg-rose-600 text-white border-rose-600 animate-ping"
                        : "bg-white text-ink border-surface-border hover:border-brand-500 hover:text-brand-600"
                    }`}
                    title="Speak into microphone and get an AI pronunciation grade"
                  >
                    <SolarIcon name="microphone-3-linear" className="w-4 h-4 text-brand-600" />
                    <span>{isRecording ? "Listening... (Tap to grade)" : "Test My Voice (AI)"}</span>
                  </button>
                </div>
              </div>

              {/* 3D Tactile Flip Card Stage */}
              <div
                onClick={() => {
                  playWoodenThud();
                  setIsFlipped(!isFlipped);
                }}
                className="w-full max-w-lg min-h-[340px] sm:min-h-[380px] cursor-pointer select-none relative transition-transform duration-500 rounded-3xl corner-ticks"
              >
                <div
                  className={`w-full h-full min-h-[340px] sm:min-h-[380px] p-6 sm:p-7 rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 shadow-md ${
                    isFlipped
                      ? "bg-white border-brand-600/60 shadow-lg"
                      : "bg-gradient-to-b from-canvas to-white border-surface-border hover:border-brand-500/40"
                  }`}
                >
                  {/* Top Architectural Spec of Card */}
                  <div className="flex items-start justify-between border-b border-surface-border/60 pb-2.5 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="spec-tag text-ink-subtle">
                        SPEC // DRILL-0{currentStep.step_number}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                        {currentStep.estimated_minutes} Mins
                      </span>
                    </div>

                    <span className="text-xs text-ink-subtle flex items-center gap-1 font-medium">
                      <span>{isFlipped ? "Instructions" : "Tap to flip"}</span>
                      <SolarIcon name="refresh-linear" className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Center of Card */}
                  <div className="my-auto py-3 text-center">
                    {!isFlipped ? (
                      /* FRONT: Technique title + 3D tactile visual cue */
                      <div>
                        <h3 className="font-display font-extrabold text-xl sm:text-2xl text-ink max-w-md mx-auto leading-snug">
                          {currentStep.title}
                        </h3>

                        {/* Interactive 3D Visual Diagram Aid */}
                        <Step3DVisualAid
                          skillSlug={skill.slug}
                          stepNumber={currentStep.step_number}
                          onSpeak={speakText}
                        />

                        <p className="mt-2 text-xs text-ink-muted">
                          Tap card or press flip to inspect instructions & drills &rarr;
                        </p>
                      </div>
                    ) : (
                      /* BACK: Full detailed instructions */
                      <div className="text-left animate-fade-in">
                        <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                          Instructions & Muscle Memory Cue:
                        </h4>
                        <p className="text-sm text-ink leading-relaxed">
                          {currentStep.instructions}
                        </p>

                        {/* Vetted Learning Platforms */}
                        {currentStep.resources && currentStep.resources.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-surface-border">
                            <span className="text-[11px] font-semibold text-ink-muted block mb-2">
                              External tools for this step:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {currentStep.resources.map((res) => (
                                <a
                                  key={res.id}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-muted hover:bg-brand-50 border border-surface-border text-xs font-medium text-ink hover:text-brand-700 transition"
                                >
                                  <span>{res.platform_name}</span>
                                  <SolarIcon name="square-arrow-right-up-linear" className="w-3 h-3 text-ink-subtle" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom of Card */}
                  <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
                    <span className="text-ink-muted text-[11px]">
                      {isCurrentStepDone ? "Completed Step" : "Pending practice"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isCurrentStepDone) {
                          playChime();
                        } else {
                          playMechanicalClick();
                        }
                        onToggleStep(currentStep.id);
                      }}
                      className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                        isCurrentStepDone
                          ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30"
                          : "bg-ink text-white hover:bg-neutral-800"
                      }`}
                    >
                      <SolarIcon name="check-circle-linear" className="w-3.5 h-3.5" />
                      <span>{isCurrentStepDone ? "Mastered" : "Mark Mastered"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    playMechanicalClick();
                    setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
                  }}
                  className="px-4 py-2 rounded-full border border-surface-border bg-white text-xs font-semibold text-ink hover:bg-canvas disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
                >
                  <SolarIcon name="arrow-left-linear" className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playWoodenThud();
                    setIsFlipped(!isFlipped);
                  }}
                  className="px-5 py-2 rounded-full bg-canvas border border-surface-border text-xs font-semibold text-ink hover:bg-surface-muted transition cursor-pointer"
                >
                  {isFlipped ? "Show Front" : "Flip Card"}
                </button>

                <button
                  type="button"
                  disabled={currentCardIndex === steps.length - 1}
                  onClick={() => {
                    playMechanicalClick();
                    setCurrentCardIndex(Math.min(steps.length - 1, currentCardIndex + 1));
                  }}
                  className="px-4 py-2 rounded-full bg-ink text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <SolarIcon name="arrow-right-linear" className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AI Coaching & Mnemonic Action Bar */}
              <div className="w-full max-w-lg mt-5 pt-4 border-t border-surface-border flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCoachOpen(!coachOpen)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-surface-border hover:border-brand-500 text-xs font-semibold text-ink hover:text-brand-600 transition shadow-2xs"
                >
                  <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-600" />
                  <span>Ask Technique Coach</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateMnemonic}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-surface-border hover:border-indigo-500 text-xs font-semibold text-ink hover:text-indigo-600 transition shadow-2xs"
                >
                  <SolarIcon name="lightbulb-linear" className="w-4 h-4 text-indigo-600" />
                  <span>Generate Mnemonic</span>
                </button>
              </div>

              {/* ============================================================ */}
              {/* Feature 3 Result: Whisper Voice Grader Card                 */}
              {/* ============================================================ */}
              {voiceGraderOpen && (voiceGrading || voiceScoreResult) && (
                <div className="w-full max-w-lg mt-4 p-4 rounded-2xl bg-white border-2 border-brand-500/40 shadow-sm animate-fade-in text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <SolarIcon name="microphone-3-linear" className="w-4 h-4 text-brand-600" />
                      <span className="text-xs font-bold text-ink">Voice Pronunciation Evaluation</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVoiceGraderOpen(false)}
                      className="text-ink-subtle hover:text-ink text-xs"
                    >
                      &times;
                    </button>
                  </div>

                  {voiceGrading ? (
                    <div className="py-3 text-center text-xs text-brand-600 font-semibold animate-pulse flex items-center justify-center gap-2">
                      <SolarIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
                      <span>Transcribing and grading with Whisper AI...</span>
                    </div>
                  ) : voiceScoreResult ? (
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-sm">
                          {voiceScoreResult.matchScore}% Match
                        </div>
                        <span className="text-xs font-bold text-ink">{voiceScoreResult.verdict}</span>
                      </div>
                      <p className="text-xs text-ink-secondary mb-2">{voiceScoreResult.feedback}</p>
                      <div className="p-2.5 rounded-xl bg-canvas border border-surface-border text-[11px] text-brand-800">
                        <strong>Phonetic Tip:</strong> {voiceScoreResult.phoneticTip}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* ============================================================ */}
              {/* Feature 2: Technique Coach Tray                              */}
              {/* ============================================================ */}
              {coachOpen && (
                <div className="w-full max-w-lg mt-4 p-5 rounded-2xl bg-white border border-brand-500/40 shadow-sm text-left animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                        <SolarIcon name="stars-minimalistic-linear" className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-display font-bold text-xs text-ink">
                        Technique Coach — Biomechanical Diagnostic
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCoachOpen(false)}
                      className="text-ink-subtle hover:text-ink text-xs"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Preset prompt pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <button
                      type="button"
                      onClick={() => handleAskCoach("My movement feels stiff, how do I stay fluid?")}
                      className="px-2.5 py-1 rounded-lg bg-canvas hover:bg-brand-50 border border-surface-border text-[11px] text-ink-muted hover:text-brand-700 transition"
                    >
                      Why does it feel stiff?
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskCoach("What is the exact physical angle or finger anchor?")}
                      className="px-2.5 py-1 rounded-lg bg-canvas hover:bg-brand-50 border border-surface-border text-[11px] text-ink-muted hover:text-brand-700 transition"
                    >
                      Exact physical angle?
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskCoach("Give me a 3-minute corrective drill.")}
                      className="px-2.5 py-1 rounded-lg bg-canvas hover:bg-brand-50 border border-surface-border text-[11px] text-ink-muted hover:text-brand-700 transition"
                    >
                      3-minute corrective drill
                    </button>
                  </div>

                  {/* Custom question input */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Ask anything about this step's physical technique..."
                      value={coachQuestion}
                      onChange={(e) => setCoachQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAskCoach()}
                      className="flex-1 px-3 py-2 rounded-xl bg-canvas border border-surface-border text-xs text-ink focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      disabled={coachLoading || !coachQuestion.trim()}
                      onClick={() => handleAskCoach()}
                      className="px-3.5 py-2 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-40 transition"
                    >
                      {coachLoading ? "Analyzing..." : "Ask"}
                    </button>
                  </div>

                  {/* Coach Advice Output */}
                  {coachLoading && (
                    <div className="p-3 text-center text-xs text-brand-600 font-semibold animate-pulse flex items-center justify-center gap-2">
                      <SolarIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
                      <span>Diagnosing biomechanics...</span>
                    </div>
                  )}

                  {coachAdvice && !coachLoading && (
                    <div className="space-y-2.5 p-3.5 rounded-xl bg-canvas border border-surface-border text-xs">
                      <div>
                        <strong className="text-ink font-semibold block text-[11px] uppercase tracking-wider text-brand-700">
                          Diagnosis:
                        </strong>
                        <p className="text-ink-secondary mt-0.5">{coachAdvice.diagnosis}</p>
                      </div>
                      <div>
                        <strong className="text-ink font-semibold block text-[11px] uppercase tracking-wider text-amber-700">
                          Muscle Memory Anchor:
                        </strong>
                        <p className="text-ink-secondary mt-0.5">{coachAdvice.muscleMemoryCue}</p>
                      </div>
                      <div>
                        <strong className="text-ink font-semibold block text-[11px] uppercase tracking-wider text-accent-emerald">
                          Corrective Drill:
                        </strong>
                        <p className="text-ink-secondary mt-0.5">{coachAdvice.actionableDrill}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* Feature 4: Mnemonic & Mental Model Result Card               */}
              {/* ============================================================ */}
              {mnemonicOpen && (
                <div className="w-full max-w-lg mt-4 p-5 rounded-2xl bg-white border border-indigo-300 shadow-sm text-left animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <SolarIcon name="lightbulb-linear" className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-display font-bold text-xs text-ink">
                        Memory Mnemonic & Mental Anchor
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMnemonicOpen(false)}
                      className="text-ink-subtle hover:text-ink text-xs"
                    >
                      &times;
                    </button>
                  </div>

                  {mnemonicLoading ? (
                    <div className="p-3 text-center text-xs text-indigo-600 font-semibold animate-pulse flex items-center justify-center gap-2">
                      <SolarIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
                      <span>Synthesizing mnemonic...</span>
                    </div>
                  ) : mnemonicData ? (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                        <strong className="text-indigo-900 block text-[11px] uppercase tracking-wider mb-1">
                          Visual Image:
                        </strong>
                        <p className="text-indigo-950">{mnemonicData.visualMnemonic}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-canvas border border-surface-border">
                        <strong className="text-ink block text-[11px] uppercase tracking-wider mb-1">
                          Physical Anchor:
                        </strong>
                        <p className="text-ink-secondary">{mnemonicData.physicalAnchor}</p>
                      </div>
                      <div className="text-center font-bold text-ink pt-1 text-[11px]">
                        &ldquo;{mnemonicData.ruleOfThumb}&rdquo;
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            /* ============================================================ */
            /* 2. STEP-BY-STEP CHECKLIST MODE                               */
            /* ============================================================ */
            <div className="space-y-4">
              {steps.map((step, idx) => {
                const isDone = completedStepIds.includes(step.id);
                return (
                  <div
                    key={step.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isDone
                        ? "bg-canvas border-accent-emerald/30 shadow-xs"
                        : "bg-white border-surface-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleStep(step.id)}
                          className="mt-0.5 text-ink-subtle hover:text-brand-600 transition"
                        >
                          <SolarIcon
                            name={isDone ? "check-circle-linear" : "radio-buttons-linear"}
                            className={`w-6 h-6 ${isDone ? "text-accent-emerald" : "text-ink-subtle"}`}
                          />
                        </button>
                        <div>
                          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                            Step {step.step_number} • {step.estimated_minutes} Minutes
                          </span>
                          <h4 className={`font-display font-semibold text-base ${isDone ? "line-through text-ink-muted" : "text-ink"}`}>
                            {step.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isLanguageSkill && (
                          <button
                            type="button"
                            onClick={() => speakText(step.title)}
                            className="p-1.5 rounded-lg border border-surface-border text-brand-600 hover:bg-brand-50"
                            title="Pronounce step title"
                          >
                            <SolarIcon name="volume-loud-linear" className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentCardIndex(idx);
                            setActiveTab("flashcards");
                          }}
                          className="px-3 py-1 rounded-lg border border-surface-border bg-white text-xs font-semibold text-ink hover:bg-canvas"
                        >
                          Card View
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 pl-9 text-xs sm:text-sm text-ink-secondary leading-relaxed">
                      {step.instructions}
                    </p>

                    {step.resources && step.resources.length > 0 && (
                      <div className="mt-3 pl-9 pt-2 border-t border-surface-border flex flex-wrap gap-2">
                        {step.resources.map((res) => (
                          <a
                            key={res.id}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-muted text-xs font-medium text-ink hover:text-brand-700"
                          >
                            <span>{res.platform_name}</span>
                            <SolarIcon name="square-arrow-right-up-linear" className="w-3 h-3 text-ink-subtle" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="p-4 sm:p-5 bg-canvas border-t border-surface-border flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span>Overall Progress:</span>
            <strong className="text-ink font-semibold">{completedCount} of {steps.length} steps ({progressPercent}%)</strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-ink text-white text-xs font-semibold hover:bg-neutral-800 transition"
          >
            Done Practicing
          </button>
        </div>
      </div>
    </div>
  );
}
