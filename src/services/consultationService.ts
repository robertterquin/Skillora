import { SupabaseClient } from "@supabase/supabase-js";
import { OwlConsultation, ConsultationOutcome, OwlMessage } from "@/types/owl";

export interface DbOwlConsultationRow {
  id: string;
  user_id: string;
  title: string;
  outcome_tag: ConsultationOutcome;
  messages: OwlMessage[];
  created_at: string;
  updated_at: string;
}

export function mapRowToConsultation(row: DbOwlConsultationRow): OwlConsultation {
  return {
    id: row.id,
    title: row.title || "New Inquiry",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: Array.isArray(row.messages) ? row.messages : [],
    outcomeTag: row.outcome_tag || "inquiry",
  };
}

export function mapConsultationToRow(
  consultation: OwlConsultation,
  userId: string
): DbOwlConsultationRow {
  return {
    id: consultation.id,
    user_id: userId,
    title: consultation.title || "New Inquiry",
    outcome_tag: consultation.outcomeTag || "inquiry",
    messages: consultation.messages || [],
    created_at: consultation.createdAt || new Date().toISOString(),
    updated_at: consultation.updatedAt || new Date().toISOString(),
  };
}

export const consultationService = {
  async fetchUserConsultations(
    supabase: SupabaseClient,
    userId: string
  ): Promise<OwlConsultation[] | null> {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from("owl_consultations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          console.info(
            "Note: 'owl_consultations' table not yet found in Supabase. Using local offline storage fallback."
          );
        } else {
          console.warn("Failed to fetch cloud consultations:", error.message);
        }
        return null;
      }

      return (data || []).map(mapRowToConsultation);
    } catch (err) {
      console.warn("Consultation service fetch error:", err);
      return null;
    }
  },

  async upsertUserConsultation(
    supabase: SupabaseClient,
    userId: string,
    consultation: OwlConsultation
  ): Promise<boolean> {
    if (!userId || !consultation.id) return false;

    try {
      const payload = mapConsultationToRow(consultation, userId);
      const { error } = await supabase
        .from("owl_consultations")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        console.warn("Failed to save consultation to cloud:", error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.warn("Consultation service upsert error:", err);
      return false;
    }
  },

  async deleteUserConsultation(
    supabase: SupabaseClient,
    userId: string,
    consultationId: string
  ): Promise<boolean> {
    if (!userId || !consultationId) return false;

    try {
      const { error } = await supabase
        .from("owl_consultations")
        .delete()
        .eq("id", consultationId)
        .eq("user_id", userId);

      if (error) {
        console.warn("Failed to delete cloud consultation:", error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.warn("Consultation service delete error:", err);
      return false;
    }
  },

  async clearUserConsultations(
    supabase: SupabaseClient,
    userId: string
  ): Promise<boolean> {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("owl_consultations")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.warn("Failed to clear cloud consultations:", error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.warn("Consultation service clear error:", err);
      return false;
    }
  },

  async syncLocalAndCloud(
    supabase: SupabaseClient,
    userId: string,
    localConsultations: OwlConsultation[]
  ): Promise<OwlConsultation[]> {
    const cloudConsultations = await this.fetchUserConsultations(supabase, userId);

    if (!cloudConsultations) {
      return localConsultations;
    }

    const map = new Map<string, OwlConsultation>();

    for (const c of cloudConsultations) {
      map.set(c.id, c);
    }

    const toUpload: OwlConsultation[] = [];
    for (const local of localConsultations) {
      const existing = map.get(local.id);
      const hasUserMessage = local.messages.some((m) => m.sender === "user");

      if (!existing && hasUserMessage) {
        map.set(local.id, local);
        toUpload.push(local);
      } else if (existing) {
        const localTime = new Date(local.updatedAt).getTime();
        const existingTime = new Date(existing.updatedAt).getTime();
        if (localTime > existingTime) {
          map.set(local.id, local);
          toUpload.push(local);
        }
      }
    }

    if (toUpload.length > 0) {
      const rows = toUpload.map((c) => mapConsultationToRow(c, userId));
      supabase
        .from("owl_consultations")
        .upsert(rows, { onConflict: "id" })
        .then(({ error }) => {
          if (error) console.warn("Failed to background sync local sessions:", error.message);
        });
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },
};
