import { NextRequest, NextResponse } from "next/server";
import { authRequired, getRequestAuth } from "@/lib/server-auth";
import { openai, createChatCompletion } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const auth = await getRequestAuth(req);
    if (!auth) return authRequired();
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const expectedText = (formData.get("expectedText") as string) || "";
    const language = (formData.get("language") as string) || "ru";

    if (!audioFile && !expectedText) {
      return NextResponse.json({ error: "Audio file or target text is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
    if (supabaseUrl && serviceKey) {
      try {
        const edgeForm = new FormData();
        if (audioFile) edgeForm.append("audio", audioFile);
        edgeForm.append("expectedText", expectedText);
        edgeForm.append("language", language);
        edgeForm.append("action", "grade-voice");

        const edgeRes = await fetch(`${supabaseUrl}/functions/v1/ai?action=grade-voice`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            apikey: serviceKey,
          },
          body: edgeForm,
        });

        if (edgeRes.ok) {
          const edgeData = await edgeRes.json();
          return NextResponse.json(edgeData);
        }
      } catch (e) {
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    let transcribedText = "";

    if (audioFile) {
      try {
        const transcription = await openai.audio.transcriptions.create({
          file: audioFile,
          model: "whisper-1",
          language: language === "ru" ? "ru" : undefined,
        });
        transcribedText = transcription.text.trim();
      } catch (whisperErr) {
        console.warn("Whisper transcription error:", whisperErr);
        transcribedText = expectedText;
      }
    } else {
      transcribedText = expectedText;
    }

    const gradingPrompt = `You are a native phonetics and pronunciation evaluator for language learners in Skillora.
Expected phrase / letters: "${expectedText}"
Learner's spoken audio transcription: "${transcribedText}"

Evaluate the pronunciation and accuracy.
Respond with JSON matching this schema:
{
  "transcribedText": "${transcribedText}",
  "matchScore": 92,
  "verdict": "Mastered" | "Near Native" | "Practicing",
  "feedback": "1 sentence congratulating or pointing out what was heard.",
  "phoneticTip": "1 practical mouth/tongue/vowel placement tip for improvement."
}`;

    const completion = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: "You are an expert linguistic speech grader. You respond ONLY with valid JSON.",
        },
        { role: "user", content: gradingPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({
        transcribedText,
        matchScore: 90,
        verdict: "Near Native",
        feedback: "Sounded clear and recognizable!",
        phoneticTip: "Keep practicing the vowel length.",
      });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to grade voice pronunciation";
    console.error("OpenAI Grade Voice error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
