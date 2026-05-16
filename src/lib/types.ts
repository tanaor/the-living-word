export interface Profile {
  id: string;
  name: string;
  created_at: string;
}

export interface UserContext {
  user_id: string;
  life_season: string | null;
  faith_journey: string | null;
  key_topics: string[];
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
