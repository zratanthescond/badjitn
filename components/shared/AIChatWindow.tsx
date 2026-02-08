"use client";

import { useChat } from "@ai-sdk/react";
import { Send, User, Bot, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AIChatWindowProps {
  onClose: () => void;
}

const AIChatWindow = ({ onClose }: AIChatWindowProps) => {
  const t = useTranslations("Chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  
  // Custom type for our simple messages
  type SimplePart = { type: 'text'; text: string };
  type SimpleMessage = { id: string; role: 'user' | 'assistant'; parts: SimplePart[] };

  const { messages, status, sendMessage, error } = useChat({
    id: "badji-chat",
    // initialMessages logic might be different in latest, but we'll try to find it or set it
  });

  // Handle welcome message manually if no messages exist
  const displayMessages = messages.length > 0 ? messages : [
    {
      id: "welcome",
      role: "assistant",
      parts: [{ type: 'text', text: t("welcome") }]
    }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'ready') return;
    
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="flex flex-col h-[500px] w-[350px] sm:w-[400px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-primary-500 text-white">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <h3 className="font-semibold">{t("title")}</h3>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
      >
        <AnimatePresence>
          {displayMessages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`p-2 rounded-full ${m.role === "user" ? "bg-slate-100 dark:bg-slate-800" : "bg-primary-50 dark:bg-primary-900/30"}`}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary-500" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${
                  m.role === "user" 
                    ? "bg-primary-500 text-white rounded-tr-none" 
                    : "bg-slate-100 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none text-slate-800"
                }`}>
                  {m.parts?.map((part: any, i: number) => (
                    part.type === 'text' ? <span key={i}>{part.text}</span> : null
                  ))}
                  {/* Fallback for older message structure if any */}
                  {!(m.parts) && (m as any).content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {status === 'streaming' && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none animate-pulse">
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-xs text-red-500 mt-2">
            {t("error")}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-slate-200"
        />
        <button
          type="submit"
          disabled={status !== 'ready' || !input.trim()}
          className="bg-primary-500 p-2 rounded-full text-white disabled:opacity-50 hover:bg-primary-600 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </motion.div>
  );
};

export default AIChatWindow;
