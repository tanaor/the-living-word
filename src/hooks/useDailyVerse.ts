import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { UserContext } from "../lib/types";

export interface DailyVerse {
  verse_reference: string;
  verse_text: string;
  reflection: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function generateVerse(userContext: UserContext | null): Promise<DailyVerse> {
  const context = userContext
    ? `The user's life season: ${userContext.life_season || "not specified"}. Faith journey: ${userContext.faith_journey || "not specified"}.`
    : "The user is new and hasn't shared their life season yet.";

  const prompt = `${context}

Choose ONE perfect KJV Bible verse for this person today. Pick something specific to their season, not generic. Respond ONLY with valid JSON, no markdown, no explanation:
{
  "verse_reference": "Book Chapter:Verse",
  "verse_text": "The exact KJV verse text",
  "reflection": "One warm sentence (15-20 words max) connecting this verse to their life. Like a friend, not a preacher."
}`;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      systemPrompt: "You are a scripture expert. Respond only with valid JSON. No markdown code blocks.",
    }),
  });

  const data = await response.json();
  const text = data.message as string;
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as DailyVerse;
}

export function useDailyVerse(userId: string, userContext: UserContext | null) {
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadOrGenerateVerse();
  }, [userId]);

  async function loadOrGenerateVerse() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("daily_verses")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (existing) {
      setVerse({
        verse_reference: existing.verse_reference,
        verse_text: existing.verse_text,
        reflection: existing.reflection,
      });
      setLoading(false);
      return;
    }

    try {
      const generated = await generateVerse(userContext);

      await supabase.from("daily_verses").insert({
        user_id: userId,
        verse_reference: generated.verse_reference,
        verse_text: generated.verse_text,
        reflection: generated.reflection,
        date: today,
      });

      setVerse(generated);
    } catch {
      setVerse({
        verse_reference: "Philippians 4:13",
        verse_text: "I can do all things through Christ which strengtheneth me.",
        reflection: "Whatever today holds, you don't face it alone.",
      });
    } finally {
      setLoading(false);
    }
  }

  return { verse, loading };
}
