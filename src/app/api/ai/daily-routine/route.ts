import { NextRequest, NextResponse } from "next/server";
import { openai, createChatCompletion } from "@/lib/openai";
import { isStepCompleted } from "@/lib/catalog-data";
import { invokeEdgeFunction } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { enrolledSkills, completedStepIds = [] } = await req.json();

    if (!enrolledSkills || !Array.isArray(enrolledSkills) || enrolledSkills.length === 0) {
      return NextResponse.json(
        { error: "At least one enrolled skill is required to create a daily routine" },
        { status: 400 }
      );
    }

    const edgeRes = await invokeEdgeFunction("daily-routine", {
      enrolledSkills,
      completedStepIds,
    });
    if (edgeRes.fromEdgeFunction && edgeRes.data) {
      return NextResponse.json(edgeRes.data);
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const skillsContext = enrolledSkills
      .map((s: {
        title: string;
        difficulty: string;
        steps?: { id: string; step_number: number; title: string }[];
      }) => {
        const pendingSteps = (s.steps || [])
          .filter((st) => !isStepCompleted(st.id, completedStepIds))
          .map((st) => `Step ${st.step_number}: ${st.title}`)
          .join(", ");
        return `- ${s.title} (${s.difficulty}). Pending: [${pendingSteps || "Review & polish"}]`;
      })
      .join("\n");

    const systemPrompt = `You are the master athletic and deliberate practice coach for Skillora.
Design a cohesive, tightly timed 15-minute daily workout routine that cross-trains the learner across their active skills.
Keep drills punchy, focused on muscle memory and sensory feedback.

Return JSON matching this schema:
{
  "headline": "e.g. 15-Minute Mastery Workout: Finger Independence & Glyph Recall",
  "totalMinutes": 15,
  "blocks": [
    {
      "minutes": 5,
      "skillTitle": "Name of skill",
      "drillTitle": "Name of drill (e.g. 4/4 Steady Thumb Pulse or False Friends Recall)",
      "action": "Concrete instructions for what to do during these 5 minutes."
    },
    {
      "minutes": 10,
      "skillTitle": "Name of second skill",
      "drillTitle": "Deep focus drill name",
      "action": "Concrete instructions for the 10-minute focus block."
    }
  ],
  "dailyMantra": "A sharp, inspiring 1-sentence reminder about consistency and deliberate practice."
}`;

    const userPrompt = `User's enrolled skills and current step progress:
${skillsContext}

Create today's high-efficiency 15-minute practice session.`;

    const response = await createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Failed to generate daily routine" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate daily routine";
    console.error("OpenAI Daily Routine error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
