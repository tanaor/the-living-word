import { describe, it, expect } from "vitest";
import { extractMemory, extractChips, parseSegments } from "./responseFormat";

describe("extractMemory", () => {
  it("returns null memory and unchanged text when no block", () => {
    const { cleaned, memory } = extractMemory("Just a normal reply.");
    expect(memory).toBeNull();
    expect(cleaned).toBe("Just a normal reply.");
  });

  it("parses life_season, faith_journey, and topics", () => {
    const raw =
      "Comfort to you.\n[MEMORY]\nlife_season: lost her mother, grieving\nfaith_journey: lifelong believer\ntopics: grief, comfort, hope\n[/MEMORY]";
    const { cleaned, memory } = extractMemory(raw);
    expect(cleaned).toBe("Comfort to you.");
    expect(memory).toEqual({
      life_season: "lost her mother, grieving",
      faith_journey: "lifelong believer",
      key_topics: ["grief", "comfort", "hope"],
    });
  });

  it("ignores empty values and unknown keys", () => {
    const raw = "[MEMORY]\nlife_season:\nfavorite_color: blue\ntopics: faith\n[/MEMORY]";
    const { memory } = extractMemory(raw);
    expect(memory).toEqual({ key_topics: ["faith"] });
  });
});

describe("extractChips", () => {
  it("returns empty chips when no block", () => {
    expect(extractChips("hello")).toEqual({ body: "hello", chips: [] });
  });

  it("extracts up to 3 chip titles and strips the block from body", () => {
    const raw =
      "Here is comfort.\n[CHIPS]\nHow Jesus grieved Lazarus\nPsalm for bereaved hearts\nA prayer for comfort\nExtra one\n[/CHIPS]";
    const { body, chips } = extractChips(raw);
    expect(body).toBe("Here is comfort.");
    expect(chips).toEqual([
      "How Jesus grieved Lazarus",
      "Psalm for bereaved hearts",
      "A prayer for comfort",
    ]);
  });

  it("strips bullet markers from chip lines", () => {
    const raw = "[CHIPS]\n- First\n* Second\n[/CHIPS]";
    expect(extractChips(raw).chips).toEqual(["First", "Second"]);
  });
});

describe("parseSegments", () => {
  it("returns a single text segment when no prayer block", () => {
    const segs = parseSegments("Plain teaching text.");
    expect(segs).toEqual([{ type: "text", content: "Plain teaching text." }]);
  });

  it("splits text before and after a prayer block", () => {
    const raw =
      'Intro line.\n[PRAYER label="SUPPLICATION" verse="John 14:27" translation="KJV"]\n"Peace I leave with you."\n---\nHeavenly Father, give me peace. Amen.\n[/PRAYER]\nClosing line.';
    const segs = parseSegments(raw);
    expect(segs[0]).toEqual({ type: "text", content: "Intro line." });
    expect(segs[1]).toEqual({
      type: "prayer",
      label: "SUPPLICATION",
      verse: "John 14:27",
      translation: "KJV",
      verseText: "Peace I leave with you.",
      body: "Heavenly Father, give me peace. Amen.",
    });
    expect(segs[2]).toEqual({ type: "text", content: "Closing line." });
  });

  it("defaults label to PRAYER and tolerates a missing verse/body separator", () => {
    const raw = '[PRAYER verse="Psalm 23:1"]\nThe Lord is my shepherd.\n[/PRAYER]';
    const segs = parseSegments(raw);
    expect(segs[0]).toEqual({
      type: "prayer",
      label: "PRAYER",
      verse: "Psalm 23:1",
      translation: "",
      verseText: "The Lord is my shepherd.",
      body: "",
    });
  });
});
