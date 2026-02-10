"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { 
  Bot, 
  Search, 
  MessageSquare, 
  Share2, 
  Video, 
  Languages, 
  Zap,
  ExternalLink,
  Sparkles
} from "lucide-react";
import Link from "next/link";

import AIChatWindow from "@/components/shared/AIChatWindow";

const aiTools = [
  {
    id: "badjiAI",
    icon: <Sparkles className="w-10 h-10" />,
    color: "from-primary via-purple-500 to-blue-600",
    url: "#",
    isChat: true,
    isPremium: true
  },
  {
    id: "googleIA",
    domain: "gemini.google.com",
    color: "from-blue-500 to-cyan-500",
    url: "https://gemini.google.com/",
  },
  {
    id: "perplexity",
    domain: "perplexity.ai",
    color: "from-teal-500 to-emerald-500",
    url: "https://www.perplexity.ai/",
  },
  {
    id: "chatgpt",
    domain: "chatgpt.com",
    color: "from-green-500 to-emerald-600",
    url: "https://chat.openai.com/",
  },
  {
    id: "xmind",
    domain: "xmind.net",
    color: "from-orange-500 to-red-500",
    url: "https://www.xmind.net/",
  },
  {
    id: "capcut",
    domain: "capcut.com",
    color: "from-purple-500 to-pink-500",
    url: "https://www.capcut.com/",
  },
  {
    id: "deepl",
    domain: "deepl.com",
    color: "from-blue-600 to-indigo-600",
    url: "https://www.deepl.com/",
  },
  {
    id: "genspark",
    domain: "genspark.ai",
    color: "from-yellow-400 to-orange-500",
    url: "https://www.genspark.ai/",
  }
];

const AIToolsPage = () => {
  const t = useTranslations("aiToolsPage");
  const [activeChat, setActiveChat] = React.useState<{ id: string, name: string } | null>(null);

  if (activeChat) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <AIChatWindow 
            toolId={activeChat.id} 
            toolName={activeChat.name} 
            onClose={() => setActiveChat(null)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-cyan-400">
            {t("title")}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {aiTools.map((tool) => (
            <div 
              key={tool.id}
              onClick={tool.isChat ? () => setActiveChat({ id: tool.id, name: t(tool.id) }) : undefined}
              className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                (tool as any).isPremium 
                  ? "border-primary/50 dark:border-primary/50 shadow-primary/10 shadow-lg ring-1 ring-primary/20" 
                  : "border-slate-100 dark:border-slate-800 hover:shadow-primary/10"
              } ${tool.isChat ? "cursor-pointer" : ""}`}
            >
              <div className="relative mb-6 inline-block">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                  {tool.domain ? (
                    <img 
                      src={`https://www.google.com/s2/favicons?sz=128&domain=${tool.domain}`}
                      alt={tool.id}
                      className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm p-1"
                    />
                  ) : (
                    tool.icon
                  )}
                </div>
                {(tool as any).isPremium && (
                  <span className="absolute -top-3 -right-3 z-10 bg-primary text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/30 animate-pulse border-2 border-white dark:border-slate-900">
                    Free
                  </span>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {t(tool.id)}
              </h3>

              {/* Only show button for external links, not for chat tools */}
              {!tool.isChat && (
                <Link 
                  href={tool.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all duration-200 hover:bg-primary dark:hover:bg-primary dark:hover:text-white group-hover:gap-3"
                >
                  {t("visit")}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}

              {/* Decorative gradient overlay on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIToolsPage;
