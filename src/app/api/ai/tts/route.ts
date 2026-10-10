import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "fable" } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Limit length to 600 characters for concise, high-signal mentor responses
    const cleanText = text.trim().slice(0, 600);

    const validVoices = ["fable", "onyx", "alloy", "echo", "nova", "shimmer"];
    const chosenVoice = validVoices.includes(voice) ? voice : "fable";

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: chosenVoice as "fable" | "onyx" | "alloy" | "echo" | "nova" | "shimmer",
      input: cleanText,
      speed: 1.0,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to synthesize speech";
    console.error("OpenAI TTS error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
