import { useState } from "react";
import { sendChatMessage } from "../lib/gemini";
import { buildSystemPrompt } from "../prompts/system-prompt";
import type { Message, UserContext } from "../lib/types";

interface UseChatParams {
  userName: string;
  userContext: UserContext | null;
  messages: Message[];
  activeConversationId: string | null;
  createConversation: () => Promise<string>;
  addMessage: (
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ) => Promise<Message>;
  nameConversation: (conversationId: string, firstUserMessage: string) => Promise<void>;
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

  async function send(userMessage: string) {
    if (!userMessage.trim() || sending) return;

    setSending(true);

    try {
      const isNewConversation = !activeConversationId;
      let convId = activeConversationId;
      if (!convId) {
        convId = await createConversation();
      }

      await addMessage(convId, "user", userMessage);

      if (isNewConversation) {
        nameConversation(convId, userMessage);
      }

      const systemPrompt = buildSystemPrompt(userName, userContext ?? undefined);

      const chatHistory = [
        ...messages.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
        { role: "user" as const, content: userMessage },
      ].filter((m) => m.role !== "system") as Array<{ role: "user" | "assistant"; content: string }>;

      const aiResponse = await sendChatMessage(chatHistory, systemPrompt);

      await addMessage(convId, "assistant", aiResponse);
    } catch (err) {
      console.error("Chat error:", err);
      const convId = activeConversationId;
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
