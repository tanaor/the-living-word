import { useState } from "react";
import { sendChatMessage } from "../lib/gemini";
import { buildSystemPrompt } from "../prompts/system-prompt";
import { extractMemory } from "../lib/responseFormat";
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
  updateUserContext: (context: Partial<UserContext>) => Promise<void>;
}

export function useChat({
  userName,
  userContext,
  messages,
  activeConversationId,
  createConversation,
  addMessage,
  nameConversation,
  updateUserContext,
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

      // Pull any durable facts the AI learned and persist them to user_context,
      // then strip the [MEMORY] block so it is never shown or re-applied.
      const { cleaned, memory } = extractMemory(aiResponse);
      if (memory) {
        await updateUserContext({
          ...(memory.life_season ? { life_season: memory.life_season } : {}),
          ...(memory.faith_journey ? { faith_journey: memory.faith_journey } : {}),
          ...(memory.key_topics ? { key_topics: memory.key_topics } : {}),
        });
      }

      await addMessage(convId, "assistant", cleaned);
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
