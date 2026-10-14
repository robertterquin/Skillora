import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { openai } from "@/lib/openai";
import { INITIAL_SKILLS, normalizeCategoryId } from "@/lib/mock-data";
import { createAdminClient } from "@/lib/supabase";
import { enrichStepsWithYouTube } from "@/lib/youtube-service";
import { invokeEdgeFunction } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Attempt execution via Supabase Edge Function first
    const edgeRes = await invokeEdgeFunction("owl-chat", { message });
    if (edgeRes.fromEdgeFunction && edgeRes.data) {
      return NextResponse.json(edgeRes.data);
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const trimmed = message.trim().toLowerCase();

    // Check if user is asking for one of our canonical disciplines
    const canonicalMatch = INITIAL_SKILLS.find(
      (s) =>
        trimmed.includes(s.title.toLowerCase()) ||
        s.slug.split("-").some((part) => trimmed.includes(part) && part.length > 3)
    );

    const systemPrompt = `You are Archimedes, the Skillora Learning Owl — a wise, encouraging, minimalist mentor inspired by Swiss design principles.
The user is speaking or chatting with you to acquire a new skill.
Your goal is to:
1. Reply warmly and concisely as Archimedes the Sage Owl (1-2 sentences). Speak with calm intellectual warmth, contemplative poise, and genuine encouragement. Avoid robotic corporate filler or exclamation marks. Speak as a patient scholar who sees the beauty of deliberate practice clearly.
2. Deconstruct their requested craft into a realistic, high-signal Skillora curriculum.

Return STRICT JSON matching this schema:
{
  "owlMessage": "A brilliant pursuit. Fingerstyle guitar builds extraordinary thumb independence. I have structured your 3-step pathway and dispatched it directly to your Studio.",
  "skill": {
    "title": "Concise skill title (max 6 words)",
    "summary": "1-2 sentence high-signal summary of the physical mechanics, techniques, or mental models.",
    "difficulty": "beginner" | "intermediate" | "advanced" | "all-levels",
    "estimated_hours": 2.5,
    "time_commitment_label": "e.g. 20 mins/day for 2 weeks or 90 minutes total",
    "category_id": "cat-music" | "cat-language" | "cat-life" | "cat-tech",
    "steps": [
      {
        "step_number": 1,
        "title": "Clear step technique name",
        "instructions": "Specific, actionable muscle memory instructions or cognitive drill (2-3 sentences).",
        "estimated_minutes": 20,
        "resources": [
          {
            "platform_name": "Name of best reputable site/tool/channel (e.g. JustinGuitar, YouTube, Anki, Duolingo)",
            "url": "https://www.youtube.com",
            "resource_type": "video" | "interactive" | "article" | "tool",
            "is_free": true
          }
        ]
      }
    ]
  }
}
Generate between 3 and 4 sequential steps.

CRITICAL PEDAGOGY & CRAFT ACCURACY RULES:
1. DISCIPLINE-SPECIFIC DRILLS:
   - For Coding & Tech (Python, React, SQL, Git, Terminal, etc.): Instructions MUST be strictly technical and actionable. Detail exact syntax patterns, REPL commands, function definitions, test assertions, and terminal executions. NEVER give generic bodily sensation advice for software disciplines!
   - For Music & Audio: Detail exact finger/hand anchors (e.g. P-I-M-A), fretboard geometry, tone production, metronome BPM tempo, and rhythmic transition loops.
   - For Languages & Scripts: Detail phonetic approximations, mnemonic glyph anchors, high-frequency cognates, and real reading/pronunciation drills.
   - For Tactile Crafts & Sports: Detail body mechanics, exact tool angles, sensory detection cues (sound, feel, resistance, sight), and observable physical benchmarks.
2. STRICT SEQUENTIAL PROGRESSION:
   - Step 1 (Foundation): Core mental model, posture/setup, and the primary building block.
   - Step 2 (Core Mechanism): Active execution of the central technique or writing the core algorithm/script.
   - Step 3 (Integration & Flow): Combining elements under tempo, handling edge cases/errors, and fluid transition.
   - Step 4 (Real-world Milestone): A complete mini-project, full performance/solve, or standalone verification benchmark.
3. CONCRETE ACTIONABILITY: Every step's instructions (2-3 concise sentences) MUST state:
   (a) The specific technique or mechanism.
   (b) The exact drill to perform.
   (c) The objective verification test (how the user knows they succeeded).
4. DELIBERATE TIME SPRINT: "estimated_minutes" must strictly be a focused 15 to 25 minute sprint (e.g. 15, 20, or 25). Never output marathon blocks like 60 minutes.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `User wants to learn: "${message}". ${
            canonicalMatch ? `(Note: User may be referring to our catalog skill: ${canonicalMatch.title})` : ""
          }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    const skillData = parsed.skill || canonicalMatch;

    const skillId = canonicalMatch ? canonicalMatch.id : crypto.randomUUID();
    const slug = skillData.title
      ? skillData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : "custom-skill";

    const formattedSkill = {
      id: skillId,
      category_id: canonicalMatch ? canonicalMatch.category_id : normalizeCategoryId(skillData.category_id),
      title: skillData.title,
      slug: canonicalMatch ? canonicalMatch.slug : `${slug}-${Math.floor(Math.random() * 1000)}`,
      summary: skillData.summary,
      difficulty: skillData.difficulty || "beginner",
      estimated_hours: Number(skillData.estimated_hours) || 2.0,
      time_commitment_label: skillData.time_commitment_label || "20 mins/day for 1 week",
      is_featured: false,
      steps_count: skillData.steps?.length || 3,
      steps: [] as unknown[],
    };

    // Prepare steps
    const initialSteps = (skillData.steps || []).map((st: {
      step_number: number;
      title: string;
      instructions: string;
      estimated_minutes: number;
      resources?: {
        platform_name: string;
        url: string;
        resource_type: string;
        is_free: boolean;
      }[];
    }, idx: number) => {
      const stepId = canonicalMatch?.steps?.[idx]?.id || crypto.randomUUID();
      return {
        id: stepId,
        skill_id: skillId,
        step_number: st.step_number || idx + 1,
        title: st.title,
        instructions: st.instructions,
        estimated_minutes: Math.min(25, Math.max(10, Number(st.estimated_minutes) || 20)),
        resources: (st.resources || []).map((r, rIdx) => {
          const canonicalRes = canonicalMatch?.steps?.[idx]?.resources?.[rIdx];
          return {
            id: canonicalRes?.id || crypto.randomUUID(),
            step_id: stepId,
            platform_name: canonicalRes?.platform_name || r.platform_name || "YouTube Tutorial",
            url: canonicalRes?.url || r.url || "https://www.youtube.com",
            resource_type: canonicalRes?.resource_type || r.resource_type || "video",
            is_free: r.is_free !== undefined ? r.is_free : true,
          };
        }),
      };
    });

    // Auto-resolve real, verified YouTube video tutorials for newly prompted skills!
    const finalSteps = canonicalMatch
      ? initialSteps
      : await enrichStepsWithYouTube(skillData.title, initialSteps);

    formattedSkill.steps = finalSteps;

    // Auto-persist to Supabase using service role client
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

    return NextResponse.json({
      owlMessage: parsed.owlMessage || `I have structured your curriculum for ${formattedSkill.title} and dispatched it to My Studio!`,
      skill: formattedSkill,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to chat with Learning Owl";
    console.error("Owl Chat error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
