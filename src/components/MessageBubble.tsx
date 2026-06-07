import ReactMarkdown from "react-markdown";
import { parseSegments, extractChips } from "../lib/responseFormat";
import type { PrayerSegment } from "../lib/responseFormat";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-sm bg-amber-700 text-white text-[15px] leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }

  // Chips are rendered separately by ChatPage under the latest answer.
  // Strip them here so they never leak into the body of any message.
  const { body } = extractChips(content);
  const segments = parseSegments(body);

  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white text-amber-950 border border-amber-100 shadow-sm text-[15px] leading-relaxed space-y-3">
        {segments.map((seg, i) =>
          seg.type === "prayer" ? (
            <PrayerCard key={i} segment={seg} />
          ) : (
            <ReactMarkdown
              key={i}
              components={{
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-amber-300 pl-3 italic text-amber-800 my-2">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-amber-900">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>
                ),
              }}
            >
              {seg.content}
            </ReactMarkdown>
          )
        )}
      </div>
    </div>
  );
}

function PrayerCard({ segment }: { segment: PrayerSegment }) {
  return (
    <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 my-1">
      <p className="text-[11px] tracking-[0.15em] font-medium text-amber-600 uppercase mb-1">
        — {segment.label}
      </p>
      <p className="font-serif text-amber-900 text-lg mb-3">Prayer</p>
      {segment.verse && (
        <p className="text-amber-600 font-medium text-sm mb-1">{segment.verse}</p>
      )}
      {segment.verseText && (
        <blockquote className="border-l-2 border-amber-300 pl-3 italic text-amber-800 mb-3">
          "{segment.verseText}"
          {segment.translation ? ` (${segment.translation})` : ""}
        </blockquote>
      )}
      {segment.body && (
        <p className="text-amber-950 whitespace-pre-wrap leading-relaxed">{segment.body}</p>
      )}
    </div>
  );
}
