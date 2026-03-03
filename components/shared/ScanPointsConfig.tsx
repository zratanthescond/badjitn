"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { eventFormSchema } from "@/lib/validator";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { X, Plus, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";

type ScanPointsConfigProps = {
  form: UseFormReturn<z.infer<typeof eventFormSchema>>;
};

const SUGGESTIONS = [
  "Entrée principale",
  "Entrée VIP",
  "Atelier 1",
  "Atelier 2",
  "Espace exposants",
  "Sortie",
];

export default function ScanPointsConfig({ form }: ScanPointsConfigProps) {
  const [inputValue, setInputValue] = useState("");
  const t = useTranslations("eventForm");

  const scanPoints = form.watch("scanPoints") || [];

  const SUGGESTIONS = [
    { key: "mainEntrance", label: t("scanPoints.items.mainEntrance") },
    { key: "vipEntrance", label: t("scanPoints.items.vipEntrance") },
    { key: "workshop1", label: t("scanPoints.items.workshop1") },
    { key: "workshop2", label: t("scanPoints.items.workshop2") },
    { key: "exhibitors", label: t("scanPoints.items.exhibitors") },
    { key: "exit", label: t("scanPoints.items.exit") },
  ];

  const addPoint = (point: string) => {
    const trimmedPoint = point.trim();
    if (trimmedPoint && !scanPoints.includes(trimmedPoint)) {
      form.setValue("scanPoints", [...scanPoints, trimmedPoint]);
    }
    setInputValue("");
  };

  const removePoint = (point: string) => {
    form.setValue(
      "scanPoints",
      scanPoints.filter((p) => p !== point)
    );
  };

  return (
    <div className="space-y-4 w-full">
      <FormField
        control={form.control}
        name="scanPoints"
        render={() => (
          <FormItem>
            <FormLabel className="text-lg font-semibold flex items-center gap-2">
              {t("scanPoints.title")}
            </FormLabel>
            <FormDescription>
              {t("scanPoints.description")}
            </FormDescription>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPoint(inputValue);
                    }
                  }}
                  placeholder={t("scanPoints.placeholder")}
                  className="input-field glass"
                />
              </FormControl>
              <Button
                type="button"
                onClick={() => addPoint(inputValue)}
                variant="outline"
                className="glass border-white/20 hover:bg-white/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("scanPoints.add")}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {scanPoints.length > 0 ? (
                scanPoints.map((point) => (
                  <Badge
                    key={point}
                    variant="secondary"
                    className="glass bg-blue-500/10 text-blue-600 border-blue-200/50 px-3 py-1 flex items-center gap-2 animate-in fade-in zoom-in duration-300"
                  >
                    {point}
                    <button
                      type="button"
                      onClick={() => removePoint(point)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {t("scanPoints.empty")}
                </p>
              )}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                <Lightbulb className="h-3 w-3 text-amber-500" />
                {t("scanPoints.suggestions")}
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.filter((s) => !scanPoints.includes(s.label)).map(
                  (suggestion) => (
                    <button
                      key={suggestion.key}
                      type="button"
                      onClick={() => addPoint(suggestion.label)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
                    >
                      {suggestion.label}
                    </button>
                  )
                )}
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
