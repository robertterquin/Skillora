"use client";

import { useCallback, useEffect, useState } from "react";
import { speakWithUniformMaleVoice, stopUniformVoice } from "@/lib/voice";

export function useSpeech(defaultLang: string, resetKey?: unknown) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    stopUniformVoice();
    setIsSpeaking(false);
  }, [resetKey]);

  useEffect(() => () => stopUniformVoice(), []);

  const speak = useCallback(
    (text: string, lang?: string) => {
      speakWithUniformMaleVoice(text, {
        lang: lang || defaultLang,
        speed: 0.92,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    },
    [defaultLang]
  );

  return { speak, isSpeaking };
}
