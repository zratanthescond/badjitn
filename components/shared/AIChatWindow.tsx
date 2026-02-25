"use client";

import React, { useEffect, useRef } from "react";
import { useChat, UIMessage } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { Send, X, ArrowLeft, Loader2, Bot, Trash2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface AIChatWindowProps {
  toolId?: string;
  toolName?: string;
  onClose: () => void;
}

const AIChatWindow = ({ toolId = "badji-chat", toolName, onClose }: AIChatWindowProps) => {
  const t = useTranslations("aiToolsPage");
  const [model, setModel] = React.useState<"googleIA" | "chatgpt">("googleIA");
  const [input, setInput] = React.useState("");

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: toolId,
    transport: new TextStreamChatTransport({
      api: "/api/chat",
      body: { toolId: model },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleClearChat = () => {
    if (window.confirm("Voulez-vous vraiment effacer toute la discussion ?")) {
      setMessages([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col w-[min(96vw,44rem)] h-[70vh] max-h-[760px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {toolName ?? "Badji AI"}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {model === "googleIA" ? "Gemini 2.5 Flash" : "Llama 3.3 70B"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setModel("googleIA")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    model === "googleIA"
                      ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {t("gemini")}
                </button>
                <button
                  onClick={() => setModel("chatgpt")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    model === "chatgpt"
                      ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {t("groq")}
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

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <Bot size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t("badjiAI")}</h3>
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

              return <ChatMessage key={m.id} role={m.role} content={textContent} />;
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
                <p className="font-bold mb-1">Desole, une erreur est survenue :</p>
                <p>{error.message || "Erreur de connexion a l'IA. Verifiez vos cles API."}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800"
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
          Powered by Badgei.net Free {model === "googleIA" ? "Gemini" : "Groq/Llama"} API
        </p>
      </form>
    </div>
  );
};

export default AIChatWindow;
