import { NextRequest, NextResponse } from "next/server";
import { authRequired, chargeFallback, getRequestAuth } from "@/lib/server-auth";
import { openai, createChatCompletion } from "@/lib/openai";
import { invokeEdgeFunction } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const auth = await getRequestAuth(req);
    if (!auth) return authRequired("Sign in to get a memory aid.");
    const { skillTitle, stepTitle, stepInstructions } = await req.json();

    if (!stepTitle || typeof stepTitle !== "string") {
      return NextResponse.json({ error: "Step title is required" }, { status: 400 });
    }

    const edgeRes = await invokeEdgeFunction("mnemonic", {
      skillTitle,
      stepTitle,
      stepInstructions,
    }, auth.token);
    if (edgeRes.fromEdgeFunction && edgeRes.data) {
      return NextResponse.json(edgeRes.data);
    }
    const limited = await chargeFallback(edgeRes.status, auth.user.id);
    if (limited) return limited;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const textToScan = `${skillTitle || ""} ${stepTitle || ""} ${stepInstructions || ""}`.toLowerCase();
    const isCoding = /\b(code|coding|software|developer|programming|python|javascript|typescript|react|html|css|frontend|backend|web|git|terminal|api|sql|database|functions?|debug|component|calculator|app|scripting)\b/.test(
      textToScan
    );

    const systemPrompt = isCoding
      ? `You are a computer science pedagogy grandmaster and memory architect for Skillora.
Create a vivid, intuitive mental model and memorable rule of thumb for this programming concept (e.g. Python, data structures, functions, control flow).
Help the programmer build an unshakeable intuition for the syntax, data flow, or algorithm.

Return JSON:
{
  "visualMnemonic": "A vivid 1-2 sentence architectural mental model or intuitive data flow picture.",
  "physicalAnchor": "A crisp conceptual or syntax anchor to instantly recall how this works in code (e.g. inputs on left, outputs on right, indentation blocks).",
  "ruleOfThumb": "A catchy 1-liner rule of thumb (max 8 words)."
}`
      : `You are a memory grandmaster and cognitive coach for Skillora.
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

    const response = await createChatCompletion({
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
