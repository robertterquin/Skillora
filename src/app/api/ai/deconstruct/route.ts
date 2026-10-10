import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { openai } from "@/lib/openai";
import { normalizeCategoryId } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const { query, categoryId } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const prompt = `You are the master curriculum architect for Skillora, an intentional learning engine inspired by minimalist Swiss design.
The user wants to master: "${query.trim()}".

Deconstruct this topic into a clear, realistic micro-skill curriculum.
Return a STRICT JSON object matching this schema:
{
  "title": "Concise skill title (max 6 words)",
  "summary": "1-2 sentence high-signal summary of the physical mechanics, techniques, or mental models.",
  "difficulty": "beginner" | "intermediate" | "advanced" | "all-levels",
  "estimated_hours": 2.5,
  "time_commitment_label": "e.g. 20 mins/day for 2 weeks or 90 minutes total",
  "category_id": "${categoryId && categoryId !== "cat-all" ? categoryId : "cat-life"}",
  "steps": [
    {
      "step_number": 1,
      "title": "Clear step technique name",
      "instructions": "Specific, actionable muscle memory instructions or cognitive drill (2-3 sentences).",
      "estimated_minutes": 20,
      "resources": [
        {
          "platform_name": "Name of best reputable site/tool/channel (e.g. YouTube, Masterclass, Anki)",
          "url": "https://www.youtube.com",
          "resource_type": "video" | "interactive" | "article" | "tool",
          "is_free": true
        }
      ]
    }
  ]
}
Generate between 3 and 4 sequential steps. Make the instructions concrete and physical, avoiding generic filler.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert pedagogy and skill-acquisition architect. You respond ONLY with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Failed to generate curriculum" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    const skillId = crypto.randomUUID();
    const slug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const formattedSkill = {
      id: skillId,
      category_id: normalizeCategoryId(parsed.category_id || categoryId),
      title: parsed.title,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      summary: parsed.summary,
      difficulty: parsed.difficulty || "beginner",
      estimated_hours: Number(parsed.estimated_hours) || 2.0,
      time_commitment_label: parsed.time_commitment_label || "20 mins/day for 1 week",
      is_featured: false,
      steps_count: parsed.steps?.length || 3,
      steps: (parsed.steps || []).map((st: {
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
        const stepId = crypto.randomUUID();
        return {
          id: stepId,
          skill_id: skillId,
          step_number: st.step_number || idx + 1,
          title: st.title,
          instructions: st.instructions,
          estimated_minutes: st.estimated_minutes || 20,
          resources: (st.resources || []).map((r) => ({
            id: crypto.randomUUID(),
            step_id: stepId,
            platform_name: r.platform_name || "Web Guide",
            url: r.url || "https://google.com",
            resource_type: r.resource_type || "article",
            is_free: r.is_free !== undefined ? r.is_free : true,
          })),
        };
      }),
    };

    return NextResponse.json({ skill: formattedSkill });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to deconstruct skill";
    console.error("OpenAI Deconstruct error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
