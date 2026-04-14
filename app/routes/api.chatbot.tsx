import type { Route } from "./+types/api.chatbot";
import { sendChatMessage } from "~/utils/ai/chatbot.server";
import type { ChatMessage } from "~/utils/ai/chatbot.server";

/**
 * POST /api/chatbot
 *
 * Accepts JSON:
 *   { text: string, history?: { role: string, content: string }[] }
 *
 * Returns JSON:
 *   { ok: true, reply: string }
 *   { ok: false, error: string }
 */
export async function action({ request }: Route.ActionArgs) {
  try {
    if (request.method !== "POST") {
      return Response.json(
        { ok: false, error: "Method not allowed" },
        { status: 405 },
      );
    }

    const body = await request.json();
    const text = (body.text ?? "").toString().trim();

    if (!text) {
      return Response.json(
        { ok: false, error: "Message text is required." },
        { status: 400 },
      );
    }

    // Validate & sanitise history (keep last 20 messages to avoid token overflow)
    const rawHistory: ChatMessage[] = Array.isArray(body.history)
      ? body.history
          .filter(
            (m: any) =>
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string",
          )
          .slice(-20)
      : [];

    const reply = await sendChatMessage({ text, history: rawHistory });

    return Response.json({ ok: true, reply });
  } catch (error) {
    console.error("[Chatbot API] Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process chatbot request.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
