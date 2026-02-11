"use client";

import React, { useRef, useEffect } from "react";
import { useChat, UIMessage } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { Send, X, ArrowLeft, Loader2, Bot, Sparkles, Trash2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface AIChatWindowProps {
  toolId: string;
  toolName: string;
  onClose: () => void;
}

const AIChatWindow = ({ toolId, toolName, onClose }: AIChatWindowProps) => {
  const t = useTranslations("aiToolsPage");
  const [model, setModel] = React.useState<"googleIA" | "chatgpt">("googleIA");
  const [input, setInput] = React.useState("");

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: toolId, // Stable ID keeps messages across model switches
    transport: new TextStreamChatTransport({
      api: "/api/chat",
      body: { toolId: model },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const scrollRef = useRef<HTMLDivElement>(null);
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

  const handleClearChat = () => {
    if (window.confirm("Voulez-vous vraiment effacer toute la discussion ?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{toolName}</h2>
              <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {model === 'googleIA' ? 'Gemini 2.5 Flash' : 'Llama 3.3 70B'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setModel('googleIA')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    model === 'googleIA' 
                      ? "bg-white dark:bg-slate-700 text-primary shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {t('gemini')}
                </button>
                <button 
                  onClick={() => setModel('chatgpt')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    model === 'chatgpt' 
                      ? "bg-white dark:bg-slate-700 text-primary shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {t('groq')}
                </button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                title="Clear Chat"
                className="rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
                disabled={messages.length === 0}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <Bot size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t('badjiAI')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
              Explore the power of AI with Badji. Select a model above to start.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((m: UIMessage) => {
              const textContent = m.parts
                ? m.parts
                    .filter((p: any) => p.type === "text")
                    .map((p: any) => p.text)
                    .join("")
                : "";
              return (
                <ChatMessage key={m.id} role={m.role} content={textContent} />
              );
            })}
            {isLoading && (
              <div className="flex p-6 gap-4 animate-pulse">
                <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary/40">
                  <Loader2 className="animate-spin" size={20} />
                </div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            )}
            {error && (
              <div className="m-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
                <p className="font-bold mb-1">Désolé, une erreur est survenue :</p>
                <p>{error.message || "Erreur de connexion à l'IA. Vérifiez vos clés API."}</p>
              </div>
            )}
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

      {/* Input Area */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || isLoading) return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800"
      >
        <div className="relative flex items-center gap-3">
          <input
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 pr-14 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </Button>
        </div>
        <p className="mt-4 text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
          Powered by Badgei.net Free {model === 'googleIA' ? 'Gemini' : 'Groq/Llama'} API
        </p>
      </form>
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
