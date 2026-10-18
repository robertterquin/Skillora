import { NextRequest, NextResponse } from "next/server";
import { authRequired, getRequestAuth } from "@/lib/server-auth";
import { createChatCompletion } from "@/lib/openai";
import { invokeEdgeFunction } from "@/lib/supabase";
import {
  sanitizeReworkRequest,
  buildReworkMessages,
  parseReworkReply,
} from "../../../../../supabase/functions/_shared/rework";

/** Rewrites one practice step to be easier or harder. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = await getRequestAuth(req);
    if (!auth) return authRequired();
    const request = sanitizeReworkRequest(body);
    if (!request) {
      return NextResponse.json({ error: "stepTitle and direction (easier|harder) are required" }, { status: 400 });
    }

    const edgeRes = await invokeEdgeFunction("rework-step", body, auth.token);
    if (edgeRes.fromEdgeFunction && edgeRes.data?.title) {
      return NextResponse.json(edgeRes.data);
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 });
    }

    const response = await createChatCompletion({
      messages: buildReworkMessages(request),
      response_format: { type: "json_object" },
      temperature: 0.6,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "Failed to rewrite the step" }, { status: 500 });
    return NextResponse.json(parseReworkReply(content, request));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to rewrite the step";
    console.error("Rework step error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
