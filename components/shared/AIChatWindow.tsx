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

const getChatStorageKey = (toolId: string) => `badgi-ai-chat:${toolId}`;

const AIChatWindow = ({ toolId = "badgi-chat", toolName, onClose }: AIChatWindowProps) => {
  const t = useTranslations("aiToolsPage");
  const [model, setModel] = React.useState<"googleIA" | "chatgpt">("googleIA");
  const [input, setInput] = React.useState("");
  const hasLoadedStoredMessages = useRef(false);

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
    if (hasLoadedStoredMessages.current) return;

    try {
      const savedMessages = window.localStorage.getItem(getChatStorageKey(toolId));

      if (savedMessages) {
        setMessages(JSON.parse(savedMessages) as UIMessage[]);
      }
    } catch {
      // Ignore storage parsing errors and start with a fresh chat.
    } finally {
      hasLoadedStoredMessages.current = true;
    }
  }, [toolId, setMessages]);

  useEffect(() => {
    if (!hasLoadedStoredMessages.current) return;

    try {
      window.localStorage.setItem(
        getChatStorageKey(toolId),
        JSON.stringify(messages)
      );
    } catch {
      // Ignore storage write failures to avoid blocking chat usage.
    }
  }, [messages, toolId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleClearChat = () => {
    if (window.confirm(t("chatClearConfirm"))) {
      setMessages([]);
      window.localStorage.removeItem(getChatStorageKey(toolId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col w-[min(95vw,40rem)] h-[66vh] max-h-[700px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                {toolName ?? "badgi AI"}
              </h2>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1 tracking-[0.14em]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                {t("chatAssistantStatus")}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
                <button
                  onClick={() => setModel("googleIA")}
                  className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all ${
                    model === "googleIA"
                      ? "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  {t("chatModelFast")}
                </button>
                <button
                  onClick={() => setModel("chatgpt")}
                  className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all ${
                    model === "chatgpt"
                      ? "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  {t("chatModelAdvanced")}
                </button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                title={t("chatClear")}
                className="h-7 w-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
                disabled={messages.length === 0}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500"
        >
          <X size={16} />
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
              <Bot size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t("badgiAI")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-[13px]">
              {t("chatIntro")}
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
                <p className="font-bold mb-1">{t("chatErrorTitle")}</p>
                <p>{error.message || t("chatErrorFallback")}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800"
      >
        <div className="relative flex items-center gap-3">
          <input
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
            value={input}
            placeholder={t("chatPlaceholder")}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1.5 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </Button>
        </div>
        <p className="mt-3 text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
          {t("chatPoweredBy")}
        </p>
      </form>
    </div>
  );
};

export default AIChatWindow;
