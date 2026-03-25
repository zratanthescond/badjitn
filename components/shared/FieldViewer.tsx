"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { fetchFields } from "@/lib/actions/field.action";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { ClipboardList, CheckCircle2, AlertCircle } from "lucide-react";
// Import the server action

interface Field {
  _id: string;
  type: "text" | "number" | "select" | "radio" | "textarea";
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

const FieldViewer = ({ userId }: { userId: string }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("profile");
  const tBuilder = useTranslations("FormBuilder");

  useEffect(() => {
    const loadFields = async () => {
      if (!userId) return;

      try {
        const fetchedFields = await fetchFields(userId);
        if (fetchedFields.success) {
          setFields(fetchedFields.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFields();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full bg-muted/40 rounded-xl" />
        <Skeleton className="h-12 w-full bg-muted/40 rounded-xl" />
        <Skeleton className="h-12 w-full bg-muted/40 rounded-xl" />
      </div>
    );
  }

  if (!fields.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/30 dark:bg-slate-900/30 rounded-3xl border border-dashed border-white/20 dark:border-slate-700/30 backdrop-blur-sm">
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
            <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground text-center font-medium">{t("emptyCustomFields")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass mt-8 border-white/20 dark:border-slate-700/30 overflow-hidden shadow-2xl rounded-3xl">
        <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-white/10 dark:border-slate-700/30 p-4 sm:p-6 text-center sm:text-left">
          <CardTitle className="flex items-center justify-center sm:justify-start gap-2 text-base sm:text-xl font-bold">
            <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            {tBuilder("preview.title")}
          </CardTitle>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-widest font-semibold opacity-60 mt-1">
            {tBuilder("preview.subtitle") || "Attendee Registration Preview"}
          </p>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
          {fields.length > 0 ? (
            fields.map((field) => (
              <div key={field._id} className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Label className="text-sm sm:text-base font-bold flex items-center gap-1 text-slate-800 dark:text-slate-200">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 font-black animate-pulse">*</span>
                  )}
                </Label>

                <div className="relative group">
                  {field.type === "textarea" ? (
                    <Textarea
                      placeholder={field.placeholder}
                      className="min-h-[100px] sm:min-h-[120px] bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm sm:text-base"
                      disabled
                    />
                  ) : field.type === "select" ? (
                    <Select disabled>
                      <SelectTrigger className="h-11 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm sm:text-base">
                        <SelectValue placeholder={field.placeholder || tBuilder("preview.selectOption")} />
                      </SelectTrigger>
                      <SelectContent className="glass border-slate-200 dark:border-slate-700 rounded-xl">
                        {field.options?.map((opt, i) => (
                          <SelectItem key={i} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "radio" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-1">
                      {field.options?.map((option, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3 p-3 sm:p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 group/radio shadow-sm"
                        >
                          <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover/radio:border-indigo-500 transition-colors" />
                          <Label className="text-sm sm:text-base font-medium cursor-pointer flex-1">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="h-11 sm:h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm sm:text-base"
                      disabled
                    />
                  )}
                  
                  {/* Decorative side accent for desktop */}
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 sm:py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 dark:text-slate-700 border border-slate-200 dark:border-slate-800 border-dashed">
                <ClipboardList className="h-8 w-8 sm:h-10 sm:w-10 opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="text-base sm:text-lg font-bold text-slate-400 dark:text-slate-600">
                  {tBuilder("preview.noFields")}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground max-w-[200px] uppercase tracking-wider font-semibold opacity-60">
                  Start adding fields to see them appearing here
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-white/10 dark:border-slate-700/30 flex items-center justify-center gap-2">
          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
          <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-none">
            Preview Mode • Form functionality simulated
          </span>
        </div>
      </Card>
      
      <div className="flex items-center gap-2 px-2">
        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-[11px] text-muted-foreground italic">
          {tBuilder("preview.disclaimer") || "This is a preview of how the fields will appear to attendees."}
        </p>
      </div>
    </div>
  );
};

export default FieldViewer;
