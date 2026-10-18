import { createAdminClient } from "@/lib/supabase";
import { isValidUuid } from "@/lib/catalog-data";
import { Skill } from "@/types/database";

export interface PublicCertificate {
  name: string;
  skill: Skill;
  certifiedAt: string;
  credentialId: string;
}

/**
 * A certificate the learner has chosen to share, or null. Server only: reads
 * with the service role and returns only what the public page shows (their
 * name, the skill and the date). Nothing comes back while sharing is off.
 */
export async function getPublicCertificate(token: string): Promise<PublicCertificate | null> {
  if (!isValidUuid(token)) return null;
  const admin = createAdminClient();

  const { data: cert } = await admin
    .from("user_certifications")
    .select("user_id, skill_id, certified_at, is_public")
    .eq("share_token", token)
    .maybeSingle();
  if (!cert || !cert.is_public) return null;

  const [{ data: skill }, { data: profile }] = await Promise.all([
    admin
      .from("skills")
      .select("id, category_id, title, slug, summary, difficulty, estimated_hours, time_commitment_label, is_featured")
      .eq("id", cert.skill_id)
      .maybeSingle(),
    admin.from("profiles").select("full_name").eq("id", cert.user_id).maybeSingle(),
  ]);
  if (!skill) return null;

  return {
    name: (profile?.full_name || "").trim() || "A Skillora learner",
    skill: skill as Skill,
    certifiedAt: cert.certified_at,
    credentialId: `SK-${token.slice(0, 8).toUpperCase()}`,
  };
}
