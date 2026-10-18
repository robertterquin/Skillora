export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "all-levels";
export type ResourceType = "video" | "interactive" | "article" | "book" | "tool" | "course";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface LearningResource {
  id: string;
  step_id: string;
  platform_name: string;
  url: string;
  resource_type: ResourceType;
  is_free: boolean;
}

export interface SkillStep {
  id: string;
  skill_id: string;
  step_number: number;
  title: string;
  instructions: string;
  estimated_minutes: number;
  resources: LearningResource[];
}

export interface Skill {
  id: string;
  category_id: string;
  category?: Category;
  title: string;
  slug: string;
  summary: string;
  difficulty: DifficultyLevel;
  estimated_hours: number;
  time_commitment_label: string;
  is_featured: boolean;
  steps_count?: number;
  steps?: SkillStep[];
  /** Set on a learner's personal copy; null/absent for catalog and AI-generated skills. */
  owner_id?: string | null;
}

