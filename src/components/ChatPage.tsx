import { useState, useEffect, useRef } from "react";
import { useConversation } from "../hooks/useConversation";
import { useChat } from "../hooks/useChat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import LoadingDots from "./LoadingDots";
import ConversationList from "./ConversationList";
import { buildSystemPrompt } from "../prompts/system-prompt";
import { sendChatMessage } from "../lib/gemini";

interface ChatPageProps {
  userId: string;
  userName: string;
  onSignOut: () => void;
}

export default function ChatPage({ userId, userName, onSignOut }: ChatPageProps) {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    userContext,
    loading,
    createConversation,
    addMessage,
    nameConversation,
  } = useConversation(userId);

  const { send, sending } = useChat({
    userName,
    userContext,
    messages,
    activeConversationId,
    createConversation,
    addMessage,
    nameConversation,
  });

  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const [onboardingTriggered, setOnboardingTriggered] = useState(false);

  useEffect(() => {
    if (!loading && conversations.length === 0 && !onboardingTriggered) {
      setOnboardingTriggered(true);
      triggerOnboarding();
    }
  }, [loading, conversations.length, onboardingTriggered]);

  async function triggerOnboarding() {
    const convId = await createConversation();
    const systemPrompt = buildSystemPrompt(userName, undefined);

    try {
      const aiGreeting = await sendChatMessage(
        [{ role: "user", content: "[SYSTEM: New user just signed up. Greet them warmly and begin onboarding.]" }],
        systemPrompt
      );
      await addMessage(convId, "assistant", aiGreeting);
    } catch {
      await addMessage(
        convId,
        "assistant",
        `Hey ${userName}! I'm so glad you're here. I'd love to get to know you. Tell me — what's on your heart today? What season of life are you walking through?`
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-amber-700 font-serif">Loading your conversations...</p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex bg-amber-50">
      {/* Sidebar — hidden on mobile unless toggled */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 transform transition-transform md:relative md:translate-x-0 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={(id) => {
            setActiveConversationId(id);
            setShowSidebar(false);
          }}
          onNew={async () => {
            await createConversation();
            setShowSidebar(false);
          }}
          onClose={() => setShowSidebar(false)}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-amber-100 bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="text-amber-600 hover:text-amber-800 md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 2 10Z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex flex-col items-center">
              <img
                src="/the-living-word/tanaor-logo.png"
                alt="Tanaor"
                className="h-5 mb-0.5"
              />
              <h1 className="font-serif text-amber-900 text-sm leading-tight">The Living Word</h1>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="text-amber-500 hover:text-amber-700 text-sm"
          >
            Sign out
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            {messages.length === 0 && !sending && (
              <div className="text-center py-16">
                <p className="text-amber-700 font-serif text-xl mb-2">
                  Welcome, {userName}
                </p>
                <p className="text-amber-500 text-sm">
                  Share what's on your heart. I'm here for you.
                </p>
              </div>
            )}

            {messages
              .filter((m) => m.role !== "system")
              .map((msg) => (
                <MessageBubble key={msg.id} role={msg.role as "user" | "assistant"} content={msg.content} />
              ))}

            {sending && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-amber-100 rounded-2xl rounded-bl-sm shadow-sm">
                  <LoadingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <ChatInput onSend={send} disabled={sending} />
      </div>
    </div>
  );
}
