import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { INITIAL_SKILLS } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
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
1. Reply warmly and concisely as the Owl (1-2 sentences). Welcome their curiosity, celebrate deliberate practice, and confirm you have structured this pathway for their Studio workshop.
2. Deconstruct their requested craft into a realistic, high-signal Skillora curriculum.

Return STRICT JSON matching this schema:
{
  "owlMessage": "Hoo! A brilliant pursuit. Fingerstyle guitar builds extraordinary thumb independence. I have crafted your 3-step pathway and sent it directly to your Studio!",
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
Generate between 3 and 4 sequential steps. Keep tone wise, concise, and focused on physical sensations.`;

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

    const skillId = canonicalMatch ? canonicalMatch.id : `ai-skill-${Date.now()}`;
    const slug = skillData.title
      ? skillData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : "custom-skill";

    const formattedSkill = {
      id: skillId,
      category_id: skillData.category_id || "cat-life",
      title: skillData.title,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      summary: skillData.summary,
      difficulty: skillData.difficulty || "beginner",
      estimated_hours: Number(skillData.estimated_hours) || 2.0,
      time_commitment_label: skillData.time_commitment_label || "20 mins/day for 1 week",
      is_featured: false,
      steps_count: skillData.steps?.length || 3,
      steps: (skillData.steps || []).map((st: {
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
      }, idx: number) => ({
        id: `step-${skillId}-${idx + 1}`,
        skill_id: skillId,
        step_number: st.step_number || idx + 1,
        title: st.title,
        instructions: st.instructions,
        estimated_minutes: st.estimated_minutes || 20,
        resources: (st.resources || []).map((r, rIdx) => ({
          id: `res-${skillId}-${idx + 1}-${rIdx + 1}`,
          step_id: `step-${skillId}-${idx + 1}`,
          platform_name: r.platform_name || "Online Tutorial",
          url: r.url || "https://google.com",
          resource_type: r.resource_type || "video",
          is_free: r.is_free !== undefined ? r.is_free : true,
        })),
      })),
    };

    return NextResponse.json({
      owlMessage: parsed.owlMessage || `Hoo! I've prepared your curriculum for ${formattedSkill.title} and added it to My Studio!`,
      skill: formattedSkill,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to chat with Learning Owl";
    console.error("Owl Chat error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
