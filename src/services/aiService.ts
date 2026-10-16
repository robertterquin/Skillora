import { createClient } from "@/lib/supabase";
import { GuildExamPayload } from "@/app/api/ai/guild-exam/route";
import { Skill } from "@/types/database";
import { OwlReply, OwlHistoryTurn, OwlContext } from "@/types/owl";

const supabase = createClient();

export interface CoachAdvice {
  diagnosis: string;
  muscleMemoryCue: string;
  actionableDrill: string;
}

export interface MnemonicResult {
  visualMnemonic: string;
  physicalAnchor: string;
  ruleOfThumb: string;
}

export interface VoiceGradingResult {
  transcribedText: string;
  matchScore: number;
  verdict: "Mastered" | "Near Native" | "Practicing";
  feedback: string;
  phoneticTip: string;
}

export interface DailyRoutineResult {
  headline: string;
  totalMinutes: number;
  blocks: {
    minutes: number;
    skillTitle: string;
    drillTitle: string;
    action: string;
  }[];
  dailyMantra: string;
}

export const aiService = {
  async chatWithOwl(
    message: string,
    history: OwlHistoryTurn[] = [],
    context: OwlContext = {},
    forceMode?: "curriculum"
  ): Promise<OwlReply<Skill>> {
    const payload = { action: "owl-chat", message, history, context, forceMode };

    try {
      const { data, error } = await supabase.functions.invoke("ai", {
        body: payload,
      });

      if (!error && data && data.owlMessage) {
        return {
          mode: data.mode || (data.skill ? "curriculum" : "chat"),
          owlMessage: data.owlMessage,
          quickReplies: data.quickReplies || [],
          suggestions: data.suggestions || [],
          profile: data.profile,
          skill: data.skill || null,
        };
      }
    } catch {
    }

    const res = await fetch("/api/ai/owl-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Owl communication failed");
    }

    const data = await res.json();
    return {
      mode: data.mode || (data.skill ? "curriculum" : "chat"),
      owlMessage: data.owlMessage,
      quickReplies: data.quickReplies || [],
      suggestions: data.suggestions || [],
      profile: data.profile,
      skill: data.skill || null,
    };
  },

  async getCoachAdvice(params: {
    skillTitle: string;
    stepTitle: string;
    stepInstructions: string;
    userQuestion: string;
  }): Promise<CoachAdvice> {
    try {
      const { data, error } = await supabase.functions.invoke("ai", {
        body: { action: "coach", ...params },
      });

      if (!error && data && data.diagnosis) {
        return data as CoachAdvice;
      }
    } catch {
    }

    const res = await fetch("/api/ai/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to get coaching advice");
    }

    return await res.json();
  },

  async getMnemonic(params: {
    skillTitle: string;
    stepTitle: string;
    stepInstructions: string;
  }): Promise<MnemonicResult> {
    try {
      const { data, error } = await supabase.functions.invoke("ai", {
        body: { action: "mnemonic", ...params },
      });

      if (!error && data && data.visualMnemonic) {
        return data as MnemonicResult;
      }
    } catch {
    }

    const res = await fetch("/api/ai/mnemonic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate mnemonic");
    }

    return await res.json();
  },

  async getGuildExam(params: {
    skillTitle: string;
    skillSummary?: string;
    steps?: any[];
    skillSlug?: string;
  }): Promise<{ exam: GuildExamPayload }> {
    try {
      const { data, error } = await supabase.functions.invoke("ai", {
        body: { action: "guild-exam", ...params },
      });

      if (!error && data && data.exam) {
        return data;
      }
    } catch {
    }

    const res = await fetch("/api/ai/guild-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to load guild exam");
    }

    return await res.json();
  },

  async textToSpeech(text: string, voice = "onyx", speed = 1.0): Promise<Blob> {
    const res = await fetch("/api/ai/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, speed }),
    });

    if (!res.ok) {
      throw new Error("TTS API unavailable");
    }

    return await res.blob();
  },

  async gradeVoice(
    audioFile: File | Blob | null,
    expectedText: string,
    language = "ru"
  ): Promise<VoiceGradingResult> {
    const formData = new FormData();
    if (audioFile) formData.append("audio", audioFile);
    formData.append("expectedText", expectedText);
    formData.append("language", language);
    formData.append("action", "grade-voice");

    try {
      const { data, error } = await supabase.functions.invoke("ai", {
        body: formData,
      });

      if (!error && data && data.matchScore !== undefined) {
        return data as VoiceGradingResult;
      }
    } catch {
    }

    const res = await fetch("/api/ai/grade-voice", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to grade voice pronunciation");
    }

    return await res.json();
  },

  async generateDailyRoutine(
    enrolledSkills: any[],
    completedStepIds: string[] = []
  ): Promise<DailyRoutineResult> {
    try {
      const { data, error } = await supabase.functions.invoke("ai", {
        body: { action: "daily-routine", enrolledSkills, completedStepIds },
      });

      if (!error && data && data.blocks) {
        return data as DailyRoutineResult;
      }
    } catch {
    }

    const res = await fetch("/api/ai/daily-routine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrolledSkills, completedStepIds }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate daily routine");
    }

    return await res.json();
  },
};
