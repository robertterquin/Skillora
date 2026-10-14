import { Skill, SkillStep, LearningResource } from "@/types/database";
import { INITIAL_SKILLS } from "@/lib/mock-data";
import { SupabaseClient } from "@supabase/supabase-js";

interface DbResource {
  id: string;
  step_id: string;
  platform_name: string;
  url: string;
  resource_type: string;
  is_free: boolean;
}

interface DbStep {
  id: string;
  skill_id: string;
  step_number: number;
  title: string;
  instructions: string;
  estimated_minutes: number;
  learning_resources?: DbResource[];
}

interface DbSkill {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: string;
  estimated_hours: number;
  time_commitment_label: string;
  is_featured: boolean;
  skill_steps?: DbStep[];
}

export async function fetchLiveSkills(supabase: SupabaseClient): Promise<Skill[]> {
  try {
    const { data, error } = await supabase
      .from("skills")
      .select(`
        id,
        category_id,
        title,
        slug,
        summary,
        difficulty,
        estimated_hours,
        time_commitment_label,
        is_featured,
        skill_steps (
          id,
          skill_id,
          step_number,
          title,
          instructions,
          estimated_minutes,
          learning_resources (
            id,
            step_id,
            platform_name,
            url,
            resource_type,
            is_free
          )
        )
      `)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return INITIAL_SKILLS;
    }

    const liveSkills: Skill[] = (data as unknown as DbSkill[]).map((s) => {
      const steps: SkillStep[] = (s.skill_steps || [])
        .sort((a, b) => a.step_number - b.step_number)
        .map((st) => {
          const resources: LearningResource[] = (st.learning_resources || []).map((r) => ({
            id: r.id,
            step_id: r.step_id,
            platform_name: r.platform_name,
            url: r.url,
            resource_type: r.resource_type as LearningResource["resource_type"],
            is_free: r.is_free,
          }));

          return {
            id: st.id,
            skill_id: st.skill_id,
            step_number: st.step_number,
            title: st.title,
            instructions: st.instructions,
            estimated_minutes: Math.min(25, Math.max(10, Number(st.estimated_minutes) || 20)),
            resources,
          };
        });

      return {
        id: s.id,
        category_id: s.category_id,
        title: s.title,
        slug: s.slug,
        summary: s.summary,
        difficulty: s.difficulty as Skill["difficulty"],
        estimated_hours: s.estimated_hours,
        time_commitment_label: s.time_commitment_label,
        is_featured: s.is_featured,
        steps_count: steps.length,
        steps,
      };
    });

    return liveSkills;
  } catch (err) {
    console.warn("Could not fetch skills from Supabase, falling back to local dataset:", err);
    return INITIAL_SKILLS;
  }
}

export const skillsService = {
  fetchLiveSkills,
};
