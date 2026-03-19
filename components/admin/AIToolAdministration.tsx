"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAIToolConfig, updateAIToolConfig } from "@/lib/actions/ai-tool.actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Save, Loader2, Users, Plus, Trash2, ChevronDown, ChevronUp, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const ALL_TOOLS = [
  { id: "googleIA", name: "Google IA Pro" },
  { id: "perplexity", name: "Perplexity" },
  { id: "chatgpt", name: "ChatGPT Pro" },
  { id: "xmind", name: "Xmind" },
  { id: "capcut", name: "CapCut" },
  { id: "deepl", name: "DeepL" },
  { id: "genspark", name: "Genspark" },
];

interface ToolAccessDetail {
  toolId: string;
  activationDate: string;
  expirationDate: string;
}

interface UserToolAccess {
  email: string;
  tools: ToolAccessDetail[];
}

// Helper to format Date for input[type="date"]
const formatDateForInput = (dateValue: any) => {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  return d.toISOString().split("T")[0];
};

export default function AIToolAdministration() {
  const t = useTranslations("aiToolsAdmin");
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["aiToolConfig"],
    queryFn: () => getAIToolConfig(),
  });

  const [isRouteEnabled, setIsRouteEnabled] = React.useState(true);
  const [userAccess, setUserAccess] = React.useState<UserToolAccess[]>([]);
  const [newEmail, setNewEmail] = React.useState("");
  const [expandedUser, setExpandedUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (config) {
      setIsRouteEnabled(config.isRouteEnabled);
      setUserAccess(config.userAccess || []);
    }
  }, [config]);

  const mutation = useMutation({
    mutationFn: (data: { isRouteEnabled: boolean; userAccess: UserToolAccess[] }) => updateAIToolConfig(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiToolConfig"] });
      toast.success(t("success"));
    },
    onError: () => {
      toast.error(t("error"));
    },
  });

  const handleAddUser = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    if (userAccess.some((u) => u.email.toLowerCase() === email)) {
      toast.error("Cet email existe déjà");
      return;
    }
    
    const now = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 1);
    
    setUserAccess((prev) => [
      ...prev,
      { 
        email, 
        tools: ALL_TOOLS.map((t) => ({
          toolId: t.id,
          activationDate: now.toISOString(),
          expirationDate: nextYear.toISOString(),
        }))
      },
    ]);
    setNewEmail("");
    setExpandedUser(email);
  };

  const handleRemoveUser = (email: string) => {
    setUserAccess((prev) => prev.filter((u) => u.email !== email));
    if (expandedUser === email) setExpandedUser(null);
  };

  const handleToggleTool = (email: string, toolId: string) => {
    setUserAccess((prev) =>
      prev.map((u) => {
        if (u.email !== email) return u;
        const has = u.tools.some(t => t.toolId === toolId);
        
        if (has) {
          return {
            ...u,
            tools: u.tools.filter((t) => t.toolId !== toolId)
          };
        } else {
          const now = new Date();
          const nextYear = new Date();
          nextYear.setFullYear(now.getFullYear() + 1);
          
          return {
            ...u,
            tools: [...u.tools, {
              toolId,
              activationDate: now.toISOString(),
              expirationDate: nextYear.toISOString()
            }]
          };
        }
      })
    );
  };
  
  const handleUpdateToolDate = (email: string, toolId: string, field: "activationDate" | "expirationDate", value: string) => {
    setUserAccess((prev) =>
      prev.map((u) => {
        if (u.email !== email) return u;
        return {
          ...u,
          tools: u.tools.map(t => {
            if (t.toolId === toolId) {
              return { ...t, [field]: new Date(value).toISOString() };
            }
            return t;
          })
        };
      })
    );
  };

  const handleToggleAllTools = (email: string, enable: boolean) => {
    setUserAccess((prev) =>
      prev.map((u) => {
        if (u.email !== email) return u;
        
        if (!enable) {
          return { ...u, tools: [] };
        }
        
        const now = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(now.getFullYear() + 1);
        
        return {
          ...u,
          tools: ALL_TOOLS.map((t) => ({
            toolId: t.id,
            activationDate: now.toISOString(),
            expirationDate: nextYear.toISOString()
          })),
        };
      })
    );
  };

  const handleSave = () => {
    mutation.mutate({ isRouteEnabled, userAccess });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("title")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <Button 
          disabled={mutation.isPending} 
          onClick={handleSave}
          className="rounded-xl flex items-center gap-2 font-bold"
        >
          {mutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {t("save")}
        </Button>
      </div>

      {/* Global Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <div className="space-y-1">
          <Label htmlFor="route-enabled" className="text-base font-semibold">
            {t("routeEnabled")}
          </Label>
          <p className="text-sm text-slate-500">
            {t("routeEnabledHint")}
          </p>
        </div>
        <Switch
          id="route-enabled"
          checked={isRouteEnabled}
          onCheckedChange={setIsRouteEnabled}
        />
      </div>

      {/* User Access Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {t("userAccess")}
          </h3>
          <span className="text-sm text-slate-500">
            {userAccess.length} {t("usersConfigured")}
          </span>
        </div>

        {/* Add User */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t("addEmailPlaceholder")}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
              className="rounded-xl pl-10"
            />
          </div>
          <Button 
            onClick={handleAddUser} 
            variant="outline" 
            className="rounded-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("addUser")}
          </Button>
        </div>

        <p className="text-xs text-slate-500">{t("userAccessHint")}</p>

        {/* User List */}
        <div className="space-y-3">
          {userAccess.length === 0 && (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-medium">{t("noUsers")}</p>
              <p className="text-xs mt-1">{t("noUsersHint")}</p>
            </div>
          )}

          {userAccess.map((user) => {
            const isExpanded = expandedUser === user.email;
            const toolCount = user.tools?.length || 0;
            const allEnabled = toolCount === ALL_TOOLS.length;

            return (
              <div
                key={user.email}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                {/* User Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors"
                  onClick={() => setExpandedUser(isExpanded ? null : user.email)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user.email}</p>
                      <p className="text-xs text-slate-500">
                        {toolCount}/{ALL_TOOLS.length} {t("toolsEnabled")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveUser(user.email);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* User Tools (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {t("selectTools")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 rounded-lg"
                        onClick={() => handleToggleAllTools(user.email, !allEnabled)}
                      >
                        {allEnabled ? t("deselectAll") : t("selectAll")}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {ALL_TOOLS.map((tool) => {
                        const hasTool = user.tools?.find(t => t.toolId === tool.id);
                        const isEnabled = !!hasTool;
                        
                        return (
                          <div
                            key={tool.id}
                            className={`p-4 bg-white dark:bg-slate-900 rounded-xl border transition-all ${
                              isEnabled ? "border-primary/50 shadow-sm" : "border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <Label className="cursor-pointer text-base font-semibold">
                                {tool.name}
                              </Label>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() => handleToggleTool(user.email, tool.id)}
                              />
                            </div>
                            
                            {isEnabled && hasTool && (
                              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                  <Label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    {t("activationDate") || "Activation"}
                                  </Label>
                                  <Input 
                                    type="date" 
                                    value={formatDateForInput(hasTool.activationDate)}
                                    onChange={(e) => handleUpdateToolDate(user.email, tool.id, "activationDate", e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    {t("expirationDate") || "Expiration"}
                                  </Label>
                                  <Input 
                                    type="date" 
                                    value={formatDateForInput(hasTool.expirationDate)}
                                    onChange={(e) => handleUpdateToolDate(user.email, tool.id, "expirationDate", e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
