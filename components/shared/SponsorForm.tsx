"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import {
  Upload,
  X,
  Globe,
  Building2,
  Award,
  ImageIcon,
  Sparkles,
  CheckCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { createSponsor, updateSponsor } from "@/lib/actions/sponsor.action";

interface SponsorFormProps {
  userId: string;
  initialData?: any;
  onSuccess?: () => void;
}

export default function SponsorForm({ userId, initialData, onSuccess }: SponsorFormProps) {
  const t = useTranslations("SponsorForm");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialData?.logo || null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sponsorFormSchema = z.object({
    name: z
      .string()
      .min(1, { message: t("validation.nameRequired") })
      .min(2, { message: t("validation.nameMin") })
      .max(100, { message: t("validation.nameMax") }),
    logo: z
      .any()
      .optional(),
    website: z
      .string()
      .min(1, { message: t("validation.urlRequired") })
      .url({ message: t("validation.urlInvalid") }),
    tier: z.string().min(1, {
      message: t("validation.tierRequired"),
    }),
  });

  type SponsorFormValues = z.infer<typeof sponsorFormSchema>;

  const form = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      website: initialData?.website || "",
      tier: initialData?.tier || "",
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = useCallback(
    (file: File) => {
      if (file) {
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 50);

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPreview(result);
          form.setValue("logo", file);
          setTimeout(() => setUploadProgress(0), 1000);
        };
        reader.readAsDataURL(file);
      }
    },
    [form]
  );

  const removeImage = useCallback(() => {
    setPreview(null);
    setUploadProgress(0);
    form.setValue("logo", undefined);
  }, [form]);

  async function onSubmit(data: SponsorFormValues) {
    setIsSubmitting(true);

    try {
      const formdata = new FormData();
      formdata.append("name", data.name);
      formdata.append("tier", data.tier);
      formdata.append("website", data.website);
      formdata.append("creator", userId);

      if (data.logo instanceof File) {
        formdata.append("logo", data.logo);
      }

      let result;
      if (initialData?._id) {
        result = await updateSponsor(initialData._id, formdata);
      } else {
        result = await createSponsor(formdata);
      }

      if (result && result.success) {
        toast({
          title: initialData?._id ? t("messages.updateSuccess") : t("messages.success"),
          description: initialData?._id ? t("messages.updateSuccessDescription") : t("messages.successDescription"),
          duration: 5000,
        });
        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.message || "Failed to process sponsor");
      }
    } catch (error: any) {
      toast({
        title: initialData?._id ? t("messages.updateError") : t("messages.error"),
        description: initialData?._id ? t("messages.updateErrorDescription") : (error.message || t("messages.errorDescription")),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const tierConfig = {
    platinum: {
      color: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300",
      icon: "💎",
    },
    gold: {
      color: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300",
      icon: "🥇",
    },
    silver: {
      color: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300",
      icon: "🥈",
    },
    bronze: {
      color: "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300",
      icon: "🥉",
    },
  };

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {initialData?._id ? t("titleEdit") : t("title")}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t("description")}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                    {t("fields.sponsorName.label")}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.sponsorName.placeholder")} {...field} className="rounded-xl shadow-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-indigo-500" />
                    {t("fields.website.label")}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.website.placeholder")} {...field} className="rounded-xl shadow-sm" dir="ltr" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-indigo-500" />
                    {t("fields.tier.label")}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl shadow-sm">
                        <SelectValue placeholder={t("fields.tier.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border shadow-xl">
                      {Object.entries(tierConfig).map(([tier, config]) => (
                        <SelectItem key={tier} value={tier} className="py-2.5">
                          <div className="flex items-center gap-3">
                            <span>{config.icon}</span>
                            <Badge className={`${config.color} px-2 py-0.5 text-xs font-semibold`}>
                              {t(`fields.tier.options.${tier}`)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-indigo-500" />
                    {t("fields.logo.label")}
                  </FormLabel>
                  <FormControl>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
                        dragActive ? "border-indigo-500 bg-indigo-50" : "border-border hover:border-indigo-300"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {preview ? (
                        <div className="relative group flex items-center justify-center min-h-[100px]">
                          <img
                            src={preview}
                            alt="Logo preview"
                            className="max-h-24 max-w-full object-contain rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 shadow-md"
                            onClick={removeImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground mb-2">{t("fields.logo.dragDrop")}</p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileChange(file);
                            }}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label htmlFor="logo-upload">
                            <Button type="button" variant="outline" size="sm" className="rounded-xl" asChild>
                              <span>{t("fields.logo.chooseFile")}</span>
                            </Button>
                          </label>
                        </div>
                      )}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="absolute inset-x-4 bottom-4">
                          <div className="h-1 bg-indigo-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full px-8 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("actions.submitting")}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {initialData?._id ? t("actions.updateSponsor") : t("actions.addSponsor")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
