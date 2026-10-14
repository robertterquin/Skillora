import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const OPENAI_PRIMARY_MODEL = process.env.OPENAI_MODEL || "gpt-6-luna";
export const OPENAI_FALLBACK_MODEL = "gpt-4o-mini";

export async function createChatCompletion(
  params: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, "model"> & { model?: string }
) {
  const modelToUse = params.model || OPENAI_PRIMARY_MODEL;
  try {
    return await openai.chat.completions.create({
      ...params,
      model: modelToUse,
    } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming);
  } catch (err: any) {
    const isModelUnavailable =
      err?.status === 404 ||
      err?.code === "model_not_found" ||
      (typeof err?.message === "string" && err.message.toLowerCase().includes("model"));

    if (isModelUnavailable && modelToUse !== OPENAI_FALLBACK_MODEL) {
      console.warn(`[OpenAI Fallback] Model "${modelToUse}" unavailable. Falling back to "${OPENAI_FALLBACK_MODEL}".`);
      return await openai.chat.completions.create({
        ...params,
        model: OPENAI_FALLBACK_MODEL,
      } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming);
    }
    throw err;
  }
}
