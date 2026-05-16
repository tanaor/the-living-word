interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-amber-700 text-white rounded-br-sm"
            : "bg-white text-amber-950 border border-amber-100 rounded-bl-sm shadow-sm"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
