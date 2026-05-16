import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Conversation, Message, UserContext } from "../lib/types";

export function useConversation(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    loadUserContext();
  }, [userId]);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  async function loadConversations() {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    setConversations(data || []);
    if (data && data.length > 0 && !activeConversationId) {
      setActiveConversationId(data[0].id);
    }
    setLoading(false);
  }

  async function loadMessages(conversationId: string) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  }

  async function loadUserContext() {
    const { data } = await supabase
      .from("user_context")
      .select("*")
      .eq("user_id", userId)
      .single();

    setUserContext(data);
  }

  async function createConversation(): Promise<string> {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) throw error;

    setConversations((prev) => [data, ...prev]);
    setActiveConversationId(data.id);
    setMessages([]);
    return data.id;
  }

  async function addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, role, content })
      .select()
      .single();

    if (error) throw error;

    setMessages((prev) => [...prev, data]);

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return data;
  }

  async function nameConversation(conversationId: string, userMessage: string, aiResponse: string) {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    let title = userMessage.trim().slice(0, 35);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: userMessage },
            { role: "assistant", content: aiResponse },
          ],
          systemPrompt: `Give this conversation a short title (3-5 words max). Capture the topic or emotion — like "Anxiety about new job" or "Finding peace in grief" or "Understanding Psalm 23". Reply with ONLY the title, no quotes, no punctuation at the end.`,
        }),
      });
      const data = await res.json();
      if (data.message) title = data.message.trim().slice(0, 50);
    } catch {
      // fall back to truncated user message
    }

    await supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId);

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
    );
  }

  async function updateUserContext(context: Partial<UserContext>) {
    const { error } = await supabase
      .from("user_context")
      .upsert({
        user_id: userId,
        ...context,
        updated_at: new Date().toISOString(),
      });

    if (!error) {
      setUserContext((prev) => prev ? { ...prev, ...context } : null);
    }
  }

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    userContext,
    loading,
    createConversation,
    addMessage,
    nameConversation,
    updateUserContext,
    loadConversations,
  };
}
