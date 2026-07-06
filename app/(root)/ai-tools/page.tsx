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
  Sparkles,
  Calendar,
  AlertCircle,
  Clock
} from "lucide-react";
import Link from "next/link";

import AIChatWindow from "@/components/shared/AIChatWindow";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const getAIToolConfig = async () => {
  const response = await fetch("/api/ai-tools/config", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch AI tool config");
  }

  return response.json();
};

const aiTools = [
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
    id: "claude",
    domain: "claude.ai",
    color: "from-orange-400 to-amber-500",
    url: "https://claude.ai/",
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
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  const userEmails = React.useMemo(() => {
    return user?.emailAddresses?.map((ea) => ea.emailAddress.toLowerCase()) || [];
  }, [user]);

  const [activeChat, setActiveChat] = React.useState<{ id: string, name: string } | null>(null);

  const { data: config, isLoading: isConfigLoading } = useQuery({
    queryKey: ["aiToolConfig"],
    queryFn: () => getAIToolConfig(),
    staleTime: 60_000,
  });

  // Find the current user's access entry
  const userAccessEntry = React.useMemo(() => {
    const accessList = config?.userAccess || [];
    return accessList.find((entry: { email: string; tools?: any[] }) =>
      userEmails.some((ue: string) => entry.email.toLowerCase() === ue)
    );
  }, [config, userEmails]);

  const isUserAllowed = !!userAccessEntry && userAccessEntry.tools && userAccessEntry.tools.length > 0;

  React.useEffect(() => {
    if (config && isUserLoaded) {
      const isGlobalEnabled = config.isRouteEnabled !== false;

      if (!isGlobalEnabled || !isUserAllowed) {
        router.push("/");
      }
    }
  }, [config, router, isUserAllowed, isUserLoaded]);

  if (isConfigLoading || !isUserLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (config?.isRouteEnabled === false || !isUserAllowed) {
    return null;
  }

  // Filter tools based on the user's specific tools array
  const enabledTools = aiTools.filter((tool) =>
    userAccessEntry.tools.some((t: any) => t.toolId === tool.id)
  );

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
          {enabledTools.map((tool) => {
            const toolData = userAccessEntry.tools.find((t: any) => t.toolId === tool.id);
            const now = new Date();
            const activationDate = toolData?.activationDate ? new Date(toolData.activationDate) : now;
            const expirationDate = toolData?.expirationDate ? new Date(toolData.expirationDate) : new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            
            // Allow active chat if within dates, or if dates are same day ignore bounds slightly (reset time to checking day only)
            const isPending = now.getTime() < new Date(activationDate.setHours(0,0,0,0)).getTime();
            const isExpired = now.getTime() > new Date(expirationDate.setHours(23,59,59,999)).getTime();
            const isAvailable = !isPending && !isExpired;
            
            const formatDate = (date: Date) => date.toLocaleDateString();

            return (
              <div 
                key={tool.id}
                onClick={((tool as any).isChat && isAvailable) ? () => setActiveChat({ id: tool.id, name: t(tool.id) }) : undefined}
                className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border transition-all duration-300 flex flex-col ${
                  !isAvailable ? "opacity-75 grayscale-[0.5] hover:grayscale-0 cursor-not-allowed border-slate-200 dark:border-slate-800" :
                  ((tool as any).isPremium 
                    ? "border-primary/50 dark:border-primary/50 shadow-primary/10 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 ring-1 ring-primary/20" 
                    : "border-slate-100 dark:border-slate-800 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10")
                } ${((tool as any).isChat && isAvailable) ? "cursor-pointer" : ""}`}
              >

                <div className="relative mb-6 inline-block">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg ${isAvailable ? "group-hover:scale-110" : ""} transition-transform duration-300 relative overflow-hidden`}>
                    {tool.domain ? (
                      <img 
                        src={`https://www.google.com/s2/favicons?sz=128&domain=${tool.domain}`}
                        alt={tool.id}
                        className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm p-1"
                      />
                    ) : (
                      (tool as any).icon
                    )}
                  </div>
                  
                  {isExpired && (
                    <span className="absolute -top-3 -right-3 z-10 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-red-500/30 border-2 border-white dark:border-slate-900 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {t("statusExpired")}
                    </span>
                  )}
                  {isPending && (
                    <span className="absolute -top-3 -right-3 z-10 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-amber-500/30 border-2 border-white dark:border-slate-900 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t("statusPending")}
                    </span>
                  )}
                  {(tool as any).isPremium && isAvailable && (
                    <span className="absolute -top-3 -right-3 z-10 bg-primary text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/30 animate-pulse border-2 border-white dark:border-slate-900">
                      Free
                    </span>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {t(tool.id)}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow line-clamp-3">
                  {t(tool.id + "Desc")}
                </p>

                {/* Subscription Details */}
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 mb-6 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {t("activatedOn")}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(activationDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {t("expiresOn")}</span>
                    <span className={`font-semibold ${isExpired ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}>{formatDate(expirationDate)}</span>
                  </div>
                </div>

                {!(tool as any).isChat && (
                  <Link 
                    href={isAvailable ? tool.url : "#"}
                    target={isAvailable ? "_blank" : undefined}
                    onClick={(e) => !isAvailable && e.preventDefault()}
                    className={`inline-flex items-center gap-2 w-full justify-center px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                      isAvailable 
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary dark:hover:bg-primary dark:hover:text-white group-hover:gap-3" 
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {isAvailable ? t("visit") : (isExpired ? t("statusExpired") : t("statusPending"))}
                    {isAvailable && <ExternalLink className="w-4 h-4" />}
                  </Link>
                )}

                {isAvailable && (
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIToolsPage;
