export interface MemoryUpdate {
  life_season?: string;
  faith_journey?: string;
  key_topics?: string[];
}

export interface TextSegment {
  type: "text";
  content: string;
}

export interface PrayerSegment {
  type: "prayer";
  label: string;
  verse: string;
  translation: string;
  verseText: string;
  body: string;
}

export type Segment = TextSegment | PrayerSegment;

const MEMORY_RE = /\[MEMORY\]([\s\S]*?)\[\/MEMORY\]/i;
const CHIPS_RE = /\[CHIPS\]([\s\S]*?)\[\/CHIPS\]/i;

/** Pull a `name="value"` attribute out of a raw attribute string. */
function attr(raw: string, name: string): string {
  const m = raw.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return m ? m[1] : "";
}

export function extractMemory(raw: string): { cleaned: string; memory: MemoryUpdate | null } {
  const match = raw.match(MEMORY_RE);
  if (!match) return { cleaned: raw, memory: null };

  const memory: MemoryUpdate = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (!value) continue;
    if (key === "life_season") memory.life_season = value;
    else if (key === "faith_journey") memory.faith_journey = value;
    else if (key === "topics" || key === "key_topics") {
      memory.key_topics = value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }

  const cleaned = raw.replace(MEMORY_RE, "").trim();
  return { cleaned, memory: Object.keys(memory).length ? memory : null };
}

export function extractChips(raw: string): { body: string; chips: string[] } {
  const match = raw.match(CHIPS_RE);
  if (!match) return { body: raw, chips: [] };

  const chips = match[1]
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);

  const body = raw.replace(CHIPS_RE, "").trim();
  return { body, chips };
}

export function parseSegments(body: string): Segment[] {
  const prayerRe = /\[PRAYER([^\]]*)\]([\s\S]*?)\[\/PRAYER\]/gi;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = prayerRe.exec(body)) !== null) {
    if (match.index > lastIndex) {
      const text = body.slice(lastIndex, match.index).trim();
      if (text) segments.push({ type: "text", content: text });
    }

    const attrs = match[1];
    const inner = match[2].trim();
    const parts = inner.split(/\n---\n/);
    const verseText = (parts[0] || "").trim().replace(/^"|"$/g, "");
    const prayerBody = (parts[1] || "").trim();

    segments.push({
      type: "prayer",
      label: attr(attrs, "label") || "PRAYER",
      verse: attr(attrs, "verse"),
      translation: attr(attrs, "translation"),
      verseText,
      body: prayerBody,
    });

    lastIndex = prayerRe.lastIndex;
  }

  if (lastIndex < body.length) {
    const text = body.slice(lastIndex).trim();
    if (text) segments.push({ type: "text", content: text });
  }

  return segments;
}
