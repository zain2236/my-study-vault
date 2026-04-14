import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showPulse, setShowPulse] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setShowPulse(false);
    }
  }, [isOpen]);

  // Generate welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text: "Hi there! 👋 I'm your Study Vault assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // ------- Send message -------
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history from existing messages (skip welcome)
      const history = messages
        .filter((m) => m.id !== "welcome" && m.id !== "welcome-new")
        .map((m) => ({ role: m.role, content: m.text }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, history }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: "assistant",
            text: data.reply,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            text: `Sorry, something went wrong: ${data.error ?? "Unknown error"}`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          text: "Unable to reach the server. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        text: "Chat cleared! How can I help you?",
        timestamp: new Date(),
      },
    ]);
  };

  // ------- Render -------
  return (
    <>
      {/* ---- Floating Action Button ---- */}
      <button
        id="chatbot-toggle-btn"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center
                   w-[60px] h-[60px] rounded-full shadow-2xl
                   bg-gradient-to-br from-[#d97757] to-[#c05a3a]
                   text-white cursor-pointer
                   transition-all duration-300 ease-out
                   hover:scale-110 hover:shadow-[0_8px_30px_rgba(217,119,87,0.5)]
                   active:scale-95"
        style={{
          /* glassmorphism ring */
          boxShadow: isOpen
            ? "0 0 0 4px rgba(217,119,87,0.25), 0 6px 24px rgba(0,0,0,0.25)"
            : "0 6px 24px rgba(0,0,0,0.25)",
        }}
      >
        {/* Pulse ring – only while the chat is closed */}
        {showPulse && !isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-[#d97757]/40" />
        )}
        <span
          className="transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
        </span>
      </button>

      {/* ---- Chat Window ---- */}
      <div
        id="chatbot-window"
        className={`fixed bottom-24 right-6 z-[9998]
                    w-[380px] max-w-[calc(100vw-2rem)]
                    rounded-2xl overflow-hidden
                    shadow-[0_16px_70px_rgba(0,0,0,0.25)]
                    flex flex-col
                    transition-all duration-300 ease-out
                    ${
                      isOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
                        : "opacity-0 translate-y-6 pointer-events-none scale-95"
                    }`}
        style={{ height: "min(520px, calc(100vh - 10rem))" }}
      >
        {/* --- Header --- */}
        <div
          className="flex items-center gap-3 px-5 py-4
                     bg-gradient-to-r from-[#d97757] to-[#c05a3a]
                     text-white select-none shrink-0"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm">
            <Sparkles size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold tracking-wide font-[Outfit]">
              Study Vault AI
            </h3>
            <p className="text-[11px] opacity-80 font-[Ovo]">
              Ask me anything about the platform
            </p>
          </div>
          <button
            onClick={clearChat}
            title="Clear chat"
            className="flex items-center justify-center w-8 h-8 rounded-lg
                       hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            title="Close chat"
            className="flex items-center justify-center w-8 h-8 rounded-lg
                       hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* --- Messages Area --- */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4
                     bg-[#f5f5f0] dark:bg-gray-900
                     scrollbar-thin scrollbar-thumb-[#d97757]/30"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0
                           ${
                             msg.role === "assistant"
                               ? "bg-gradient-to-br from-[#d97757] to-[#c05a3a] text-white"
                               : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                           }`}
              >
                {msg.role === "assistant" ? (
                  <Bot size={14} />
                ) : (
                  <User size={14} />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`relative max-w-[75%] px-4 py-2.5 text-sm leading-relaxed
                           rounded-2xl font-[Ovo]
                           ${
                             msg.role === "user"
                               ? "bg-gradient-to-br from-[#d97757] to-[#c05a3a] text-white rounded-br-sm"
                               : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-sm"
                           }`}
              >
                {msg.role === "assistant" ? (
                  <div className="chatbot-markdown">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
                <span
                  className={`block text-[10px] mt-1 ${
                    msg.role === "user"
                      ? "text-white/60"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-end gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full shrink-0
                              bg-gradient-to-br from-[#d97757] to-[#c05a3a] text-white">
                <Bot size={14} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm
                              border border-gray-100 dark:border-gray-700">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[#d97757] rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-[#d97757] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-[#d97757] rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* --- Input Area --- */}
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm
                         bg-[#f5f5f0] dark:bg-gray-900
                         text-gray-800 dark:text-gray-200
                         placeholder-gray-400 dark:placeholder-gray-500
                         border border-gray-200 dark:border-gray-700
                         focus:outline-none focus:ring-2 focus:ring-[#d97757]/40
                         focus:border-[#d97757]
                         transition-all duration-200
                         disabled:opacity-60
                         font-[Ovo]"
            />
            <button
              id="chatbot-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center w-10 h-10 rounded-xl
                         bg-gradient-to-br from-[#d97757] to-[#c05a3a]
                         text-white
                         disabled:opacity-40 disabled:cursor-not-allowed
                         hover:shadow-lg hover:shadow-[#d97757]/30
                         active:scale-95
                         transition-all duration-200
                         cursor-pointer"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2 font-[Ovo]">
            Powered by Groq AI
          </p>
        </div>
      </div>
    </>
  );
}
