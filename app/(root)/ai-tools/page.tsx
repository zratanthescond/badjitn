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
  ExternalLink 
} from "lucide-react";
import Link from "next/link";

const aiTools = [
  {
    id: "googleIA",
    icon: <Bot className="w-10 h-10" />,
    color: "from-blue-500 to-cyan-500",
    url: "https://gemini.google.com/",
  },
  {
    id: "perplexity",
    icon: <Search className="w-10 h-10" />,
    color: "from-teal-500 to-emerald-500",
    url: "https://www.perplexity.ai/",
  },
  {
    id: "chatgpt",
    icon: <MessageSquare className="w-10 h-10" />,
    color: "from-green-500 to-emerald-600",
    url: "https://chat.openai.com/",
  },
  {
    id: "xmind",
    icon: <Share2 className="w-10 h-10" />,
    color: "from-orange-500 to-red-500",
    url: "https://www.xmind.net/",
  },
  {
    id: "capcut",
    icon: <Video className="w-10 h-10" />,
    color: "from-purple-500 to-pink-500",
    url: "https://www.capcut.com/",
  },
  {
    id: "deepl",
    icon: <Languages className="w-10 h-10" />,
    color: "from-blue-600 to-indigo-600",
    url: "https://www.deepl.com/",
  },
  {
    id: "genspark",
    icon: <Zap className="w-10 h-10" />,
    color: "from-yellow-400 to-orange-500",
    url: "https://www.genspark.ai/",
  }
];

const AIToolsPage = () => {
  const t = useTranslations("aiToolsPage");

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
              className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {tool.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {t(tool.id)}
              </h3>

              <Link 
                href={tool.url}
                target="_blank"
                className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all duration-200 hover:bg-primary dark:hover:bg-primary dark:hover:text-white group-hover:gap-3"
              >
                {t("visit")}
                <ExternalLink className="w-4 h-4" />
              </Link>

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
