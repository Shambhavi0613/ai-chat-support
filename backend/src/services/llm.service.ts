import OpenAI from "openai";
import { FAQ_CONTEXT } from "../data/faq";

export interface HistoryMessage {
  sender: "user" | "ai";
  text: string;
}

export async function generateReply(
  history: HistoryMessage[],
  userMessage: string
): Promise<string> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: FAQ_CONTEXT },
      ...history.map((msg) => ({
        role: msg.sender === "user" ? "user" as const : "assistant" as const,
        content: msg.text,
      })),
      { role: "user", content: userMessage },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: messages,
    });

    const reply = response.choices[0]?.message?.content;
    if (reply) {
      return reply;
    }

    return "I'm sorry, I could not generate a response. Please try again.";
  } catch (error: any) {
    console.error("LLM Error status:", error.status);
    console.error("LLM Error message:", error.message);

    if (error.status === 401) {
      throw new Error("Invalid API key. Please check your configuration.");
    }
    if (error.status === 429) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    throw new Error("Failed to get response from AI. Please try again.");
  }
}