import { useState } from "react";
import { sendChatMessage } from "../lib/gemini";
import { buildSystemPrompt } from "../prompts/system-prompt";
import type { Message, UserContext } from "../lib/types";

interface UseChatParams {
  userName: string;
  userContext: UserContext | null;
  messages: Message[];
  activeConversationId: string | null;
  createConversation: (isPrayer?: boolean) => Promise<string>;
  addMessage: (
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ) => Promise<Message>;
  nameConversation: (conversationId: string, userMessage: string) => Promise<void>;
}

export function useChat({
  userName,
  userContext,
  messages,
  activeConversationId,
  createConversation,
  addMessage,
  nameConversation,
}: UseChatParams) {
  const [sending, setSending] = useState(false);

  async function send(userMessage: string, isPrayer = false) {
    if (!userMessage.trim() || sending) return;

    setSending(true);

    // Capture convId locally — prayer always forces a new conversation,
    // so we can't rely on activeConversationId (stale closure after createConversation)
    let convId: string | null = isPrayer ? null : activeConversationId;
    const isFirstMessage = isPrayer || messages.length === 0;
    // For prayer, start with a clean history regardless of prior conversation
    const priorMessages = isPrayer
      ? []
      : messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    try {
      if (!convId) {
        convId = await createConversation(isPrayer);
      }

      await addMessage(convId, "user", userMessage);

      if (isFirstMessage) {
        nameConversation(convId, userMessage);
      }

      const systemPrompt = buildSystemPrompt(userName, userContext ?? undefined);
      const chatHistory = [
        ...priorMessages,
        { role: "user" as const, content: userMessage },
      ];

      const aiResponse = await sendChatMessage(chatHistory, systemPrompt);
      await addMessage(convId, "assistant", aiResponse);
    } catch (err) {
      console.error("Chat error:", err);
      if (convId) {
        await addMessage(
          convId,
          "assistant",
          "I'm sorry, I'm having a moment. Can you try sending that again? I'm right here."
        );
      }
    } finally {
      setSending(false);
    }
  }

  return { send, sending };
}
