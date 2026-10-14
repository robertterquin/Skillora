import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createChatCompletion } from "@/lib/openai";
import { INITIAL_SKILLS, normalizeCategoryId } from "@/lib/mock-data";
import { createAdminClient, invokeEdgeFunction } from "@/lib/supabase";
import { enrichStepsWithYouTube } from "@/lib/youtube-service";
import {
  sanitizeOwlRequest,
  buildOwlMessages,
  parseOwlReply,
  toOwlReply,
} from "../../../../../supabase/functions/_shared/owl";

interface RawResource {
  platform_name?: string;
  url?: string;
  resource_type?: string;
  is_free?: boolean;
}

interface RawStep {
  step_number?: number;
  title?: string;
  instructions?: string;
  estimated_minutes?: number;
  resources?: RawResource[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const request = sanitizeOwlRequest(body);
    if (!request) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Attempt execution via Supabase Edge Function first
    const edgeRes = await invokeEdgeFunction("owl-chat", body);
    if (edgeRes.fromEdgeFunction && edgeRes.data) {
      return NextResponse.json(edgeRes.data);
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 });
    }

    const response = await createChatCompletion({
      messages: buildOwlMessages(request),
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }

    const reply = parseOwlReply(content, request.forceMode);

    // Conversation and suggestion turns: nothing to enrich or persist.
    if (reply.mode !== "curriculum" || !reply.skillData) {
      return NextResponse.json(toOwlReply(reply, null));
    }

    const skillData = reply.skillData;

    // If the model picked a catalog skill (it is given exact catalog titles), serve the curated version.
    const catalogMatch = INITIAL_SKILLS.find(
      (s) => s.title.toLowerCase() === String(skillData.title || "").trim().toLowerCase()
    );
    if (catalogMatch) {
      return NextResponse.json(toOwlReply(reply, catalogMatch));
    }

    const skillId = crypto.randomUUID();
    const slug = skillData.title
      ? String(skillData.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : "custom-skill";

    const formattedSkill = {
      id: skillId,
      category_id: normalizeCategoryId(skillData.category_id),
      title: skillData.title || "Skillora Practice Discipline",
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      summary: skillData.summary || "Deliberate practice curriculum.",
      difficulty: skillData.difficulty || "beginner",
      estimated_hours: Number(skillData.estimated_hours) || 2.0,
      time_commitment_label: skillData.time_commitment_label || "20 mins/day for 1 week",
      is_featured: false,
      steps_count: skillData.steps?.length || 3,
      steps: [] as unknown[],
    };

    const initialSteps = (skillData.steps as RawStep[]).map((st, idx) => {
      const stepId = crypto.randomUUID();
      return {
        id: stepId,
        skill_id: skillId,
        step_number: st.step_number || idx + 1,
        title: st.title || `Step ${idx + 1}`,
        instructions: st.instructions || "Focus on form and slow deliberate repetitions.",
        estimated_minutes: Math.min(25, Math.max(10, Number(st.estimated_minutes) || 20)),
        resources: (st.resources || []).map((r) => ({
          id: crypto.randomUUID(),
          step_id: stepId,
          platform_name: r.platform_name || "YouTube Tutorial",
          url: r.url || "https://www.youtube.com",
          resource_type: r.resource_type || "video",
          is_free: r.is_free !== false,
        })),
      };
    });

    // Auto-resolve real, verified YouTube video tutorials for newly generated skills
    const finalSteps = await enrichStepsWithYouTube(formattedSkill.title, initialSteps);
    formattedSkill.steps = finalSteps;

    // Persist to Supabase using service role client
    try {
      const admin = createAdminClient();
      await admin.from("skills").upsert(
        {
          id: formattedSkill.id,
          category_id: formattedSkill.category_id,
          title: formattedSkill.title,
          slug: formattedSkill.slug,
          summary: formattedSkill.summary,
          difficulty: formattedSkill.difficulty,
          estimated_hours: formattedSkill.estimated_hours,
          time_commitment_label: formattedSkill.time_commitment_label,
          is_featured: false,
        },
        { onConflict: "id" }
      );

      if (finalSteps && finalSteps.length > 0) {
        await admin.from("skill_steps").upsert(
          finalSteps.map((st: { id?: string; step_number: number; title: string; instructions: string; estimated_minutes: number }) => ({
            id: st.id || crypto.randomUUID(),
            skill_id: formattedSkill.id,
            step_number: st.step_number,
            title: st.title,
            instructions: st.instructions,
            estimated_minutes: st.estimated_minutes,
          })),
          { onConflict: "id" }
        );

        // Persist real video learning_resources to Supabase
        const resourcesToUpsert: {
          id: string;
          step_id: string;
          platform_name: string;
          url: string;
          resource_type: string;
          is_free: boolean;
        }[] = [];

        finalSteps.forEach((st: { id?: string; resources?: { id?: string; platform_name: string; url: string; resource_type: string; is_free: boolean }[] }) => {
          if (st.id && st.resources) {
            st.resources.forEach((r) => {
              resourcesToUpsert.push({
                id: r.id && r.id.length > 20 ? r.id : crypto.randomUUID(),
                step_id: st.id!,
                platform_name: r.platform_name || "YouTube Tutorial",
                url: r.url || "https://www.youtube.com",
                resource_type: r.resource_type || "video",
                is_free: r.is_free !== false,
              });
            });
          }
        });

        if (resourcesToUpsert.length > 0) {
          await admin.from("learning_resources").upsert(resourcesToUpsert, { onConflict: "id" });
        }
      }
    } catch (persistErr) {
      console.warn("Supabase auto-persist in owl-chat notice:", persistErr);
    }

    return NextResponse.json(toOwlReply(reply, formattedSkill));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to chat with Learning Owl";
    console.error("Owl Chat error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
