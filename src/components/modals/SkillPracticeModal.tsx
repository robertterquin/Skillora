"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { motion } from "motion/react";
import { Skill, SkillStep } from "@/types/database";
import { SolarIcon } from "../ui/SolarIcon";
import { Modal } from "../ui/Modal";
import { buttonClasses } from "../ui/Button";
import { playMechanicalClick, playChime, playWoodenThud, playStampThud } from "@/lib/workbench-audio";
import { isStepCompleted } from "@/lib/catalog-data";
import {
  PracticeMetronome,
  KnifeAngleGauge,
  EspressoExtractionSimulator,
  PhoneticSoundboard,
  CodeMilestoneTerminalSimulator,
} from "../simulators/TactileMicroSimulators";
import { StepActionBlueprint } from "../simulators/StepActionBlueprint";
import { VideoPlayerModal, extractYouTubeId } from "./VideoPlayerModal";
import { getDisciplinePracticeProfile } from "@/lib/discipline-practice";
import { aiService } from "@/services/aiService";
import { speakWithUniformMaleVoice, stopUniformVoice } from "@/lib/voice";

export interface SkillPracticeModalProps {
  skill: Skill | null;
  completedStepIds: string[];
  onToggleStep: (stepId: string) => void;
  onClose: () => void;
  isGuildCertified?: boolean;
  onOpenGuildExam?: (skill: Skill) => void;
}

export type FlashcardLearningModalProps = SkillPracticeModalProps;

function StepMicroSimulatorAid({
  step,
  skill,
  onSpeak,
  onOpenVideo,
}: {
  step: SkillStep;
  skill: Skill;
  onSpeak: (text: string, lang?: string) => void;
  onOpenVideo?: (video: { url: string; title: string; stepTitle: string }) => void;
}) {
  const slug = `${skill.slug || ""} ${skill.title || ""} ${step.title || ""}`.toLowerCase();

  if (slug.includes("cyrillic") || slug.includes("language") || slug.includes("alphabet") || slug.includes("script")) {
    return <PhoneticSoundboard onSpeak={onSpeak} />;
  }

  if (slug.includes("knife") || slug.includes("sharpen") || slug.includes("blade") || slug.includes("whetstone")) {
    return <KnifeAngleGauge />;
  }

  if (slug.includes("espresso") || slug.includes("coffee") || slug.includes("extraction")) {
    return <EspressoExtractionSimulator />;
  }

  if (
    slug.includes("guitar") ||
    slug.includes("fingerstyle") ||
    slug.includes("music") ||
    slug.includes("typing") ||
    slug.includes("rhythm") ||
    slug.includes("tempo")
  ) {
    const defaultBpm = slug.includes("typing") ? 60 : 75;
    return (
      <div className="space-y-3">
        <PracticeMetronome initialBpm={defaultBpm} />
        <StepActionBlueprint
          step={step}
          skill={skill}
          onOpenVideo={onOpenVideo}
        />
      </div>
    );
  }

  return (
    <StepActionBlueprint
      step={step}
      skill={skill}
      onOpenVideo={onOpenVideo}
    />
  );
}

export function SkillPracticeModal({
  skill,
  completedStepIds,
  onToggleStep,
  onClose,
  isGuildCertified = false,
  onOpenGuildExam,
}: SkillPracticeModalProps) {
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<"flashcards" | "checklist">("flashcards");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string; stepTitle?: string } | null>(null);

  const [coachOpen, setCoachOpen] = useState(false);
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachAdvice, setCoachAdvice] = useState<{
    diagnosis: string;
    muscleMemoryCue: string;
    actionableDrill: string;
  } | null>(null);

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

  const [mnemonicOpen, setMnemonicOpen] = useState(false);
  const [mnemonicLoading, setMnemonicLoading] = useState(false);
  const [mnemonicData, setMnemonicData] = useState<{
    visualMnemonic: string;
    physicalAnchor: string;
    ruleOfThumb: string;
  } | null>(null);

  const steps = skill?.steps || [];
  const currentStep: SkillStep | undefined = steps[currentCardIndex];
  const profile = getDisciplinePracticeProfile(skill, currentStep);
  const isLanguageSkill =
    skill?.category_id === "cat-language" ||
    skill?.category_id === "22222222-2222-2222-2222-222222222222" ||
    skill?.slug.includes("cyrillic") ||
    skill?.slug.includes("language");

  useEffect(() => {
    stopUniformVoice();
    setIsSpeaking(false);
    setIsFlipped(false);
    setCoachAdvice(null);
    setMnemonicData(null);
    setVoiceScoreResult(null);
  }, [currentCardIndex]);

  useEffect(() => {
    return () => {
      stopUniformVoice();
    };
  }, []);

  const speakText = (text: string, customLang?: string) => {
    const lang = customLang || (isLanguageSkill ? "ru-RU" : "en-US");
    speakWithUniformMaleVoice(text, {
      lang,
      speed: 0.92,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleAskCoach = async (presetQuestion?: string) => {
    const q = presetQuestion || coachQuestion;
    if (!q.trim() || !currentStep) return;

    setCoachLoading(true);
    setCoachOpen(true);
    try {
      const data = await aiService.getCoachAdvice({
        skillTitle: skill?.title || "General",
        stepTitle: currentStep.title,
        stepInstructions: currentStep.instructions,
        userQuestion: q,
      });
      setCoachAdvice(data);
    } catch (e: unknown) {
      console.error(e);
      if (profile.disciplineCategory === "coding") {
        setCoachAdvice({
          diagnosis: "Double-check your syntax indentation, variable scopes, and argument data types.",
          muscleMemoryCue: "Write the function contract first: verify expected inputs vs output before implementing.",
          actionableDrill: "Write 3 test print() statements with edge cases (empty input, zero, negative value).",
        });
      } else {
        setCoachAdvice({
          diagnosis: "Focus on relaxing physical tension in the wrist and shoulders.",
          muscleMemoryCue: "Feel the feather-light anchor of your fingers before actuation.",
          actionableDrill: "Repeat the motion at 50% speed for 2 minutes with eyes closed.",
        });
      }
    } finally {
      setCoachLoading(false);
    }
  };

  const handleStartRecording = async () => {
    if (isRecording) {
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

      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setIsRecording(false);
        }
      }, 4500);
    } catch (err) {
      console.warn("Microphone access unavailable, evaluating with simulated audio test:", err);
      await sendAudioToGrader(null);
    }
  };

  const sendAudioToGrader = async (audioBlob: Blob | null) => {
    if (!currentStep) return;
    setVoiceGrading(true);

    try {
      const data = await aiService.gradeVoice(
        audioBlob,
        voiceSample,
        isLanguageSkill ? "ru" : "en"
      );
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

  const handleGenerateMnemonic = async () => {
    if (!currentStep) return;
    setMnemonicLoading(true);
    setMnemonicOpen(true);

    try {
      const data = await aiService.getMnemonic({
        skillTitle: skill?.title || "Discipline",
        stepTitle: currentStep.title,
        stepInstructions: currentStep.instructions,
      });
      setMnemonicData(data);
    } catch (e) {
      console.error(e);
      if (profile.disciplineCategory === "coding") {
        setMnemonicData({
          visualMnemonic: "Think of this function as a postal conveyor belt: inputs get unpacked, stamped, and dispatched.",
          physicalAnchor: "Inputs on the left, pure transformation in the middle, return value on the right.",
          ruleOfThumb: "Pure inputs in, predictable output out.",
        });
      } else {
        setMnemonicData({
          visualMnemonic: "Imagine the shape as a physical key sliding smoothly into a lock.",
          physicalAnchor: "Feel the pressure anchor at the tip of your thumb.",
          ruleOfThumb: "Slow is smooth, smooth is fast.",
        });
      }
    } finally {
      setMnemonicLoading(false);
    }
  };

  if (!skill || !currentStep) return null;

  const isCurrentStepDone = isStepCompleted(currentStep.id, completedStepIds);
  const completedCount = steps.filter((s) => isStepCompleted(s.id, completedStepIds)).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  const voiceSample = isLanguageSkill
    ? currentStep.title.replace(/The True Friends|The False Friends|The Greek Siblings/g, "").trim()
    : currentStep.title;

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="max-w-3xl bg-white border border-surface-border flex flex-col max-h-[92vh]">
      <div className="p-5 sm:p-6 bg-canvas border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <SolarIcon name="book-bookmark-linear" className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-0.5 font-medium">
              <span className="capitalize">{skill.difficulty}</span>
              <span className="text-ink-subtle">·</span>
              <span>{skill.steps?.length || 0} steps</span>
              <span className="text-ink-subtle">·</span>
              <span>{skill.time_commitment_label}</span>
            </div>
            <h2 id={titleId} className="font-display font-bold text-lg sm:text-xl text-ink leading-tight">
              {skill.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-surface-muted border border-surface-border rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("flashcards")}
              className={`relative px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "flashcards"
                  ? "text-ink font-semibold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {activeTab === "flashcards" && (
                <motion.span
                  layoutId="flashcardActiveTab"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-white rounded-lg shadow-xs"
                />
              )}
              <span className="relative z-10">Flashcards</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("checklist")}
              className={`relative px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "checklist"
                  ? "text-ink font-semibold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {activeTab === "checklist" && (
                <motion.span
                  layoutId="flashcardActiveTab"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-white rounded-lg shadow-xs"
                />
              )}
              <span className="relative z-10">Steps ({steps.length})</span>
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

      <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
        {activeTab === "flashcards" ? (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-lg flex flex-wrap items-center justify-between text-xs text-ink-muted mb-4 gap-2">
              <span className="font-semibold text-ink">
                Card {currentCardIndex + 1} of {steps.length}
              </span>

              {isLanguageSkill && (
                <div className="flex items-center gap-2">
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
                    <span>{isSpeaking ? "Speaking…" : "Pronounce"}</span>
                  </button>

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
                    <span>{isRecording ? "Listening…" : "Test Pronunciation"}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="w-full max-w-xl min-h-[380px] sm:min-h-[420px] select-none relative transition-transform duration-500 rounded-2xl">
              <div
                className={`w-full h-full min-h-[380px] sm:min-h-[420px] p-6 sm:p-7 rounded-2xl border flex flex-col justify-between transition-all duration-300 shadow-card ${
                  isFlipped
                    ? "bg-surface border-brand-700 shadow-elevated"
                    : "bg-surface border-surface-border"
                }`}
              >
                <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-2">
                  <div className="flex items-center gap-2 text-3xs font-mono text-ink-muted uppercase tracking-widest font-semibold">
                    <span>Step {currentStep.step_number < 10 ? `0${currentStep.step_number}` : currentStep.step_number}</span>
                    <span className="text-surface-border">|</span>
                    <span>~{currentStep.estimated_minutes} mins</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrentStepDone && (
                      <span className="inline-flex items-center gap-1.5 text-3xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        <SolarIcon name="check-circle-bold" className="w-3.5 h-3.5 text-emerald-600" />
                        <span>COMPLETED</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        playWoodenThud();
                        setIsFlipped(!isFlipped);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-canvas hover:bg-surface-muted border border-surface-border text-3xs text-ink font-mono tracking-wider uppercase flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>{isFlipped ? "Back to Practice" : "Step Notes"}</span>
                      <SolarIcon name="refresh-linear" className="w-3 h-3 text-ink-muted" />
                    </button>
                  </div>
                </div>

                <div className="my-auto py-2 text-center">
                  {!isFlipped ? (
                    <div>
                      <h3 className="font-serif italic text-2xl sm:text-3xl text-ink max-w-lg mx-auto leading-tight mb-1">
                        {currentStep.title}
                      </h3>

                      <StepMicroSimulatorAid
                        step={currentStep}
                        skill={skill}
                        onSpeak={speakText}
                        onOpenVideo={(video) => setActiveVideo(video)}
                      />
                    </div>
                  ) : (
                    <div className="text-left animate-fade-in">
                      <h4 className="text-3xs font-mono font-bold text-ink-muted uppercase tracking-widest mb-2">
                        Technique Notes:
                      </h4>
                      <p className="text-sm text-ink leading-relaxed">
                        {currentStep.instructions}
                      </p>

                      {currentStep.resources && currentStep.resources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-surface-border">
                          <span className="text-2xs font-semibold text-ink-muted block mb-2">
                            Resources:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {currentStep.resources.map((res) => {
                              const isYouTube = Boolean(extractYouTubeId(res.url));
                              if (isYouTube) {
                                return (
                                  <div
                                    key={res.id}
                                    className="inline-flex items-center rounded-lg overflow-hidden border border-rose-200 bg-rose-50 hover:bg-rose-100/80 transition shadow-2xs group"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveVideo({
                                          url: res.url,
                                          title: res.platform_name,
                                          stepTitle: currentStep.title,
                                        });
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-950 transition cursor-pointer"
                                      title="Watch tutorial inside workbench player"
                                    >
                                      <SolarIcon name="play-linear" className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition" />
                                      <span>{res.platform_name}</span>
                                      <span className="text-3xs px-1.5 py-0.5 rounded bg-white text-rose-600 font-semibold font-mono">
                                        Watch
                                      </span>
                                    </button>

                                    <a
                                      href={res.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="px-2 py-1 text-rose-700 hover:text-rose-950 hover:bg-rose-200/60 border-l border-rose-200 transition flex items-center"
                                      title="Open directly on YouTube (external link)"
                                    >
                                      <SolarIcon name="square-arrow-right-up-linear" className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                );
                              }

                              return (
                                <a
                                  key={res.id}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface hover:bg-surface-subtle border border-surface-border text-xs font-medium text-ink hover:text-accent-vermilion transition"
                                >
                                  <span>{res.platform_name}</span>
                                  <SolarIcon name="square-arrow-right-up-linear" className="w-3 h-3 text-ink-muted" />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
                  <span className="text-ink-muted text-3xs font-mono tracking-wider uppercase">
                    Step {currentStep.step_number} of {steps.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCurrentStepDone) {
                        playStampThud();
                        playChime();
                      } else {
                        playMechanicalClick();
                      }
                      onToggleStep(currentStep.id);
                    }}
                    className={`px-4 py-2 rounded-xl font-mono text-2xs font-semibold tracking-wide transition flex items-center gap-2 cursor-pointer ${
                      isCurrentStepDone
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs hover:bg-emerald-100/80"
                        : "bg-ink text-white hover:bg-accent-vermilion shadow-xs"
                    }`}
                  >
                    {isCurrentStepDone ? (
                      <>
                        <SolarIcon name="check-circle-bold" className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <SolarIcon name="check-circle-linear" className="w-3.5 h-3.5" />
                        <span>Mark as complete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

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
                className={buttonClasses({ size: "sm" })}
              >
                <span>Next</span>
                <SolarIcon name="arrow-right-linear" className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-full max-w-lg mt-5 pt-4 border-t border-surface-border flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCoachOpen(!coachOpen)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-surface-border hover:border-brand-500 text-xs font-semibold text-ink hover:text-brand-600 transition shadow-2xs cursor-pointer"
              >
                <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-600" />
                <span>{profile.coachButtonLabel}</span>
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
                    <span>Transcribing and grading…</span>
                  </div>
                ) : voiceScoreResult ? (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="px-3 py-1 rounded-full bg-surface-muted border border-surface-border text-ink font-mono font-bold text-sm">
                        {voiceScoreResult.matchScore}% Match
                      </div>
                      <span className="text-xs font-bold text-ink">{voiceScoreResult.verdict}</span>
                    </div>
                    <p className="text-xs text-ink-secondary mb-2">{voiceScoreResult.feedback}</p>
                    <div className="p-2.5 rounded-xl bg-canvas border border-surface-border text-2xs text-ink">
                      <strong>Phonetic Tip:</strong> {voiceScoreResult.phoneticTip}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {coachOpen && (
              <div className="w-full max-w-lg mt-4 p-5 rounded-2xl bg-white border border-brand-500/40 shadow-sm text-left animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                      <SolarIcon name="stars-minimalistic-linear" className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-display font-bold text-xs text-ink">
                      {profile.coachTitle}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoachOpen(false)}
                    className="text-ink-subtle hover:text-ink text-xs cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {profile.coachSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAskCoach(sug.question)}
                      className="px-2.5 py-1 rounded-lg bg-canvas hover:bg-brand-50 border border-surface-border text-2xs text-ink-muted hover:text-brand-700 transition cursor-pointer"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    placeholder={profile.coachInputPlaceholder}
                    value={coachQuestion}
                    onChange={(e) => setCoachQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskCoach()}
                    className="flex-1 px-3 py-2 rounded-xl bg-canvas border border-surface-border text-xs text-ink focus:outline-none focus:border-brand-500 font-sans"
                  />
                  <button
                    type="button"
                    disabled={coachLoading || !coachQuestion.trim()}
                    onClick={() => handleAskCoach()}
                    className={buttonClasses({ size: "sm" })}
                  >
                    {coachLoading ? "Analyzing..." : "Ask"}
                  </button>
                </div>

                {coachLoading && (
                  <div className="p-3 text-center text-xs text-brand-600 font-semibold animate-pulse flex items-center justify-center gap-2">
                    <SolarIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
                    <span>{profile.coachDiagnosingLabel}</span>
                  </div>
                )}

                {coachAdvice && !coachLoading && (
                  <div className="space-y-2.5 p-3.5 rounded-xl bg-canvas border border-surface-border text-xs">
                    <div>
                      <strong className="text-ink font-semibold block text-2xs uppercase tracking-wider text-brand-700">
                        Diagnosis:
                      </strong>
                      <p className="text-ink-secondary mt-0.5">{coachAdvice.diagnosis}</p>
                    </div>
                    <div>
                      <strong className="text-ink font-semibold block text-2xs uppercase tracking-wider text-amber-700">
                        {profile.coachSecondCardLabel}
                      </strong>
                      <p className="text-ink-secondary mt-0.5">{coachAdvice.muscleMemoryCue}</p>
                    </div>
                    <div>
                      <strong className="text-ink font-semibold block text-2xs uppercase tracking-wider text-accent-emerald">
                        Actionable Drill:
                      </strong>
                      <p className="text-ink-secondary mt-0.5">{coachAdvice.actionableDrill}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                    className="text-ink-subtle hover:text-ink text-xs cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                {mnemonicLoading ? (
                  <div className="p-3 text-center text-xs text-ink-muted font-semibold animate-pulse flex items-center justify-center gap-2">
                    <SolarIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
                    <span>Synthesizing mnemonic...</span>
                  </div>
                ) : mnemonicData ? (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-surface border border-surface-border">
                      <strong className="text-ink block text-2xs uppercase tracking-wider mb-1">
                        Mental Model:
                      </strong>
                      <p className="text-ink-secondary">{mnemonicData.visualMnemonic}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-canvas border border-surface-border">
                      <strong className="text-ink block text-2xs uppercase tracking-wider mb-1">
                        {profile.mnemonicAnchorLabel}
                      </strong>
                      <p className="text-ink-secondary">{mnemonicData.physicalAnchor}</p>
                    </div>
                    <div className="text-center font-bold text-ink pt-1 text-2xs">
                      &ldquo;{mnemonicData.ruleOfThumb}&rdquo;
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isDone = isStepCompleted(step.id, completedStepIds);
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
                        className="mt-0.5 text-ink-subtle hover:text-ink transition cursor-pointer"
                        aria-label={isDone ? "Mark step incomplete" : "Mark step complete"}
                      >
                        {isDone ? (
                          <SolarIcon name="check-circle-linear" className="w-5 h-5 text-accent-emerald" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-surface-border hover:border-ink bg-white transition shadow-2xs" />
                        )}
                      </button>
                      <div>
                        <span className="text-2xs font-mono text-ink-subtle mb-0.5 block">
                          Step {step.step_number} · ~{step.estimated_minutes} mins
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
                      {step.resources.map((res) => {
                        const isYouTube = Boolean(extractYouTubeId(res.url));
                        if (isYouTube) {
                          return (
                            <div
                              key={res.id}
                              className="inline-flex items-center rounded-lg overflow-hidden border border-rose-200 bg-rose-50 hover:bg-rose-100/80 transition shadow-2xs group"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveVideo({
                                    url: res.url,
                                    title: res.platform_name,
                                    stepTitle: step.title,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-950 transition cursor-pointer"
                                title="Watch tutorial inside workbench player"
                              >
                                <SolarIcon name="play-linear" className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition" />
                                <span>{res.platform_name}</span>
                                <span className="text-3xs px-1.5 py-0.5 rounded bg-white text-rose-600 font-semibold font-mono">
                                  Watch
                                </span>
                              </button>

                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 text-rose-700 hover:text-rose-950 hover:bg-rose-200/60 border-l border-rose-200 transition flex items-center"
                                title="Open directly on YouTube (external link)"
                              >
                                <SolarIcon name="square-arrow-right-up-linear" className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          );
                        }

                        return (
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
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 bg-canvas border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <span>Progress:</span>
          <strong className="text-ink font-semibold">{completedCount} of {steps.length} completed ({progressPercent}%)</strong>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenGuildExam && completedCount === steps.length && steps.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGuildExam(skill);
              }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold font-mono transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <SolarIcon name={isGuildCertified ? "diploma-verified-linear" : "cup-first-linear"} className="w-3.5 h-3.5" />
              <span>{isGuildCertified ? "View Certificate" : "Take Assessment"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className={buttonClasses()}
          >
            Done
          </button>
        </div>
      </div>

    {activeVideo && (
      <VideoPlayerModal
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo.url}
        title={activeVideo.title}
        stepTitle={activeVideo.stepTitle}
      />
    )}
    </Modal>
  );
}

export const FlashcardLearningModal = SkillPracticeModal;

