import type { ChatMessage } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function sendChatMessage(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ messages, systemPrompt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Edge function error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error);

  return data.message;
}
