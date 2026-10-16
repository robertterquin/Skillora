import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

const ttsMemoryCache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 120;

function getCacheKey(text: string, voice: string, speed: number): string {
  return `${voice}:${speed}:${text.trim().toLowerCase()}`;
}

async function handleTTS(text: string, voice = "onyx", speed = 1.0) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured" },
      { status: 500 }
    );
  }

  const cleanText = text.trim().slice(0, 400);

  const maleVoices = ["onyx", "echo", "fable"];
  const chosenVoice = maleVoices.includes(voice) ? voice : "onyx";

  const cleanSpeed = typeof speed === "number" ? Math.max(0.9, Math.min(1.15, speed)) : 1.0;

  const cacheKey = getCacheKey(cleanText, chosenVoice, cleanSpeed);

  if (ttsMemoryCache.has(cacheKey)) {
    const cachedBuffer = ttsMemoryCache.get(cacheKey)!;
    return new Response(new Uint8Array(cachedBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": cachedBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=604800, immutable",
        "X-TTS-Cache": "HIT",
      },
    });
  }

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: chosenVoice as "onyx" | "echo" | "fable" | "alloy" | "nova" | "shimmer",
    input: cleanText,
    speed: cleanSpeed,
    response_format: "mp3",
  });

  const arrayBuffer = await mp3.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (ttsMemoryCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = ttsMemoryCache.keys().next().value;
    if (firstKey) ttsMemoryCache.delete(firstKey);
  }
  ttsMemoryCache.set(cacheKey, buffer);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.byteLength.toString(),
      "Cache-Control": "public, max-age=604800, immutable",
      "X-TTS-Cache": "MISS",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const text = searchParams.get("text") || "";
    const voice = searchParams.get("voice") || searchParams.get("v") || "onyx";
    const speed = parseFloat(searchParams.get("speed") || "1.0") || 1.0;
    return await handleTTS(text, voice, speed);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to synthesize speech";
    console.error("OpenAI TTS GET error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "onyx", speed = 1.0 } = await req.json();
    return await handleTTS(text, voice, speed);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to synthesize speech";
    console.error("OpenAI TTS POST error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
