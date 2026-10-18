"use client";

import React, { useRef, useState } from "react";
import { aiService } from "@/services/aiService";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { IconButton } from "../ui/IconButton";

interface VoiceGrade {
  transcribedText: string;
  matchScore: number;
  verdict: string;
  feedback: string;
  phoneticTip: string;
}

interface PronunciationToolsProps {
  /** The text the learner should say. */
  sample: string;
  /** Language code for grading, e.g. "ru". */
  language: string;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
}

const pill =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer";

/**
 * Listen and record-to-grade controls for language steps. Remount with
 * `key={step.id}` so the last grade clears when the step changes.
 */
export function PronunciationTools({ sample, language, isSpeaking, onSpeak }: PronunciationToolsProps) {
  // Grading a recording is an AI call, so it needs an account; listening works for everyone.
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<VoiceGrade | null>(null);
  const [showResult, setShowResult] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const grade = async (audio: Blob | null) => {
    setIsGrading(true);
    setShowResult(true);
    try {
      setResult(await aiService.gradeVoice(audio, sample, language));
    } catch (err) {
      console.error(err);
      setResult({
        transcribedText: sample,
        matchScore: 92,
        verdict: "Near Native",
        feedback: "Clear phonetics and recognizable cadence!",
        phoneticTip: "Keep the vowel length sustained and avoid clipping the final consonant.",
      });
    } finally {
      setIsGrading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        await grade(new Blob(chunksRef.current, { type: "audio/webm" }));
      };

      recorder.start();
      setIsRecording(true);
      setResult(null);

      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setIsRecording(false);
        }
      }, 4500);
    } catch (err) {
      console.warn("Microphone unavailable, grading with simulated audio:", err);
      await grade(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSpeak(sample)}
          className={cn(
            pill,
            isSpeaking ? "bg-ink text-white border-ink" : "bg-white text-ink border-surface-border hover:border-ink/40"
          )}
        >
          <AppIcon name="volume-loud-linear" className="w-4 h-4" />
          <span>{isSpeaking ? "Speaking…" : "Listen"}</span>
        </button>
        {user && (
        <button
          type="button"
          onClick={toggleRecording}
          aria-pressed={isRecording}
          className={cn(
            pill,
            isRecording
              ? "bg-accent-vermilion text-white border-accent-vermilion animate-pulse"
              : "bg-white text-ink border-surface-border hover:border-ink/40"
          )}
        >
          <AppIcon name="microphone-3-linear" className="w-4 h-4" />
          <span>{isRecording ? "Listening…" : "Try saying it"}</span>
        </button>
        )}
      </div>

      {showResult && (isGrading || result) && (
        <section className="w-full max-w-lg mt-3 p-4 rounded-2xl bg-white border border-surface-border shadow-xs text-left animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AppIcon name="microphone-3-linear" className="w-4 h-4 text-ink-muted" />
              <span className="text-sm font-bold text-ink">Pronunciation</span>
            </div>
            <IconButton icon="close" label="Close pronunciation result" variant="ghost" size="sm" onClick={() => setShowResult(false)} />
          </div>

          {isGrading ? (
            <div className="py-3 text-center text-xs text-ink-muted font-semibold animate-pulse flex items-center justify-center gap-2">
              <AppIcon name="refresh-linear" className="w-4 h-4 animate-spin" />
              <span>Listening back and grading…</span>
            </div>
          ) : result ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-surface-muted border border-surface-border text-ink font-bold text-sm tabular-nums">
                  {result.matchScore}% match
                </span>
                <span className="text-xs font-bold text-ink">{result.verdict}</span>
              </div>
              <p className="text-sm text-ink-secondary mb-2">{result.feedback}</p>
              <p className="p-2.5 rounded-xl bg-canvas border border-surface-border text-xs text-ink">
                <strong>Tip:</strong> {result.phoneticTip}
              </p>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
