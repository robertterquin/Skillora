import { NextRequest, NextResponse } from "next/server";
import { openai, createChatCompletion } from "@/lib/openai";
import { invokeEdgeFunction } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { skillTitle, stepTitle, stepInstructions, userQuestion } = await req.json();

    if (!userQuestion || typeof userQuestion !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const edgeRes = await invokeEdgeFunction("coach", {
      skillTitle,
      stepTitle,
      stepInstructions,
      userQuestion,
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

    const textToScan = `${skillTitle || ""} ${stepTitle || ""} ${stepInstructions || ""}`.toLowerCase();
    const isCoding = /\b(code|coding|software|developer|programming|python|javascript|typescript|react|html|css|frontend|backend|web|git|terminal|api|sql|database|functions?|debug|component|calculator|app|scripting)\b/.test(
      textToScan
    );
    const isLanguage = /\b(cyrillic|language|alphabet|script|russian|japanese|spanish|french|german|chinese|mandarin|hangul|korean|arabic|kana|vocab|grammar|phonetic|pronunciation|glyph)\b/.test(
      textToScan
    );
    const isCoffee = /\b(espresso|coffee|dialing|extraction|barista|latte|pour-over|grinder)\b/.test(
      textToScan
    );
    const isKnife = /\b(knife|sharpen|whetstone|blade|burr|apex|grit|water stone)\b/.test(
      textToScan
    );

    let roleSpecialty = "deliberate practice, motor mechanics, and skill acquisition diagnostics.";
    let diagnosisGuide = "1-2 sentence crisp breakdown of why they are experiencing this hurdle.";
    let cueGuide = "One memorable tactile sensation or anchor to lock in right now.";
    let drillGuide = "A 3-minute physical or mental drill to fix the issue.";

    if (isCoding) {
      roleSpecialty = "software engineering pedagogy, clean code patterns, cognitive debugging models, and computer science fundamentals. Never talk about wrists, elbows, or physical body angles.";
      diagnosisGuide = "1-2 sentence crisp breakdown of the syntax error, logic flow flaw, edge case, or conceptual misconception.";
      cueGuide = "One memorable code pattern, mental model, or syntax rule to anchor into memory (e.g. key invariant, indentation rule, or function contract).";
      drillGuide = "A 3-minute hands-on code writing, edge-case testing, or debugging exercise in their editor.";
    } else if (isLanguage) {
      roleSpecialty = "linguistic phonetics, mouth/tongue articulation, script recognition, and second-language acquisition.";
      diagnosisGuide = "1-2 sentence crisp breakdown of why the tongue/mouth shape or phonetic recall is stumbling.";
      cueGuide = "One memorable mouth shape, vocal tract placement, or phonetic anchor.";
      drillGuide = "A 3-minute vocalization or rapid flash-recall pronunciation drill.";
    } else if (isCoffee) {
      roleSpecialty = "espresso extraction theory, puck preparation mechanics, and sensory dialectics.";
      diagnosisGuide = "1-2 sentence crisp breakdown of the extraction flaw (channeling, under-extraction, over-extraction).";
      cueGuide = "One tactile puck prep or sensory balance anchor (e.g. resistance feel, golden flow stripe, crema density).";
      drillGuide = "A 3-minute puck distribution or dial calibration drill.";
    } else if (isKnife) {
      roleSpecialty = "edge geometry, 15-degree water stone mechanics, and tactile burr apex formation.";
      diagnosisGuide = "1-2 sentence crisp breakdown of angle instability or uneven burr generation.";
      cueGuide = "One tactile feedback sensation along the fingertips resting on the blade face.";
      drillGuide = "A 3-minute muscle memory stroke pass drill on the stone.";
    }

    const systemPrompt = `You are the master technique coach for Skillora.
You specialize in ${roleSpecialty}
Keep your answer concise, empathetic, and actionable.
Avoid long essays. Max 3 short paragraphs.

Format your response as STRICT JSON:
{
  "diagnosis": "${diagnosisGuide}",
  "muscleMemoryCue": "${cueGuide}",
  "actionableDrill": "${drillGuide}"
}`;

    const userPrompt = `Discipline: ${skillTitle || "General Practice"}
Current Step: ${stepTitle}
Step Context: ${stepInstructions}

Learner's Problem / Question:
"${userQuestion}"`;

    const response = await createChatCompletion({
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
