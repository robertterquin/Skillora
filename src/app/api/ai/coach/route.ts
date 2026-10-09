import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { skillTitle, stepTitle, stepInstructions, userQuestion } = await req.json();

    if (!userQuestion || typeof userQuestion !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are the master technique coach for Skillora.
You specialize in deliberate practice, muscle memory acquisition, and biomechanical diagnostics.
Keep your answer concise, empathetic, and strictly focused on physical sensation, posture, or cognitive drills.
Avoid long essays. Max 3 short paragraphs.

Format your response as JSON:
{
  "diagnosis": "1-2 sentence crisp breakdown of why they are experiencing this hurdle.",
  "muscleMemoryCue": "One memorable tactile sensation to anchor in the body right now.",
  "actionableDrill": "A 3-minute physical or mental drill to fix the issue."
}`;

    const userPrompt = `Discipline: ${skillTitle || "General Practice"}
Current Step: ${stepTitle}
Step Context: ${stepInstructions}

Learner's Problem / Question:
"${userQuestion}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Failed to generate coaching advice" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to coach technique";
    console.error("OpenAI Coach error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
