import { Skill } from "./database";

export type OwlMode = "chat" | "suggestions" | "curriculum";
export type OwlDifficulty = "beginner" | "intermediate" | "advanced";

export interface OwlSuggestion {
  title: string;
  pitch: string;
  whyForYou: string;
  difficulty: OwlDifficulty;
  timeToBasics: string;
  category_id: string;
}

export interface OwlProfile {
  interests?: string;
  dailyMinutes?: string;
  goal?: string;
}

export interface OwlHistoryTurn {
  role: "user" | "owl";
  text: string;
  suggestionTitles?: string[];
  skillTitle?: string;
}

export interface OwlContext {
  enrolledSkills?: string[];
  catalogSkills?: string[];
  profile?: OwlProfile;
}

export interface OwlReply<TSkill = Skill> {
  mode: OwlMode;
  owlMessage: string;
  quickReplies: string[];
  suggestions: OwlSuggestion[];
  profile?: OwlProfile;
  skill: TSkill | null;
}

export interface OwlMessage {
  id: string;
  sender: "user" | "owl";
  text: string;
  mode?: OwlMode;
  suggestions?: OwlSuggestion[];
  quickReplies?: string[];
  skill?: Skill | null;
}

export type ConsultationOutcome = "curriculum" | "suggestions" | "enrolled" | "inquiry";

export interface OwlConsultation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: OwlMessage[];
  outcomeTag: ConsultationOutcome;
}

