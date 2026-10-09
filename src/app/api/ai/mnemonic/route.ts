import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { skillTitle, stepTitle, stepInstructions } = await req.json();

    if (!stepTitle || typeof stepTitle !== "string") {
      return NextResponse.json({ error: "Step title is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a memory grandmaster and cognitive coach for Skillora.
Create a vivid, visceral mental model or physical mnemonic to help the learner lock this technique into long-term muscle memory.
Make it striking, visual, and impossible to forget.

Return JSON:
{
  "visualMnemonic": "A vivid 1-2 sentence visual mental image (e.g. visualizing a creature, physical mechanism, or color contrast).",
  "physicalAnchor": "A tactile feeling or physical sensation to ground the concept in their body.",
  "ruleOfThumb": "A 1-liner rhyme or catchy rule of thumb (max 8 words)."
}`;

    const userPrompt = `Discipline: ${skillTitle || "Deliberate Practice"}
Step: ${stepTitle}
Instructions: ${stepInstructions}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Failed to generate mnemonic" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate mnemonic";
    console.error("OpenAI Mnemonic error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
