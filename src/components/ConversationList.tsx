import type { Conversation } from "../lib/types";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onClose,
}: ConversationListProps) {
  return (
    <div className="h-full flex flex-col bg-amber-50 border-r border-amber-100">
      <div className="p-4 flex items-center justify-between border-b border-amber-100">
        <h2 className="font-serif text-amber-900 text-lg">Conversations</h2>
        <button onClick={onClose} className="text-amber-500 hover:text-amber-700 md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>

      <button
        onClick={onNew}
        className="mx-4 mt-4 py-2 rounded-xl border-2 border-dashed border-amber-300
                   text-amber-700 text-sm hover:bg-amber-100 transition-colors"
      >
        + New Conversation
      </button>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              conv.id === activeId
                ? "bg-amber-200 text-amber-900"
                : "text-amber-700 hover:bg-amber-100"
            }`}
          >
            {conv.title}
          </button>
        ))}
      </div>
    </div>
  );
}
