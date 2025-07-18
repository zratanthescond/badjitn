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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { createSponsor } from "@/lib/actions/sponsor.action";

interface SponsorFormProps {
  userId: string;
}

export default function SponsorForm({ userId }: SponsorFormProps) {
  const t = useTranslations("SponsorForm");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sponsorFormSchema = z.object({
    name: z
      .string()
      .min(1, { message: t("validation.nameRequired") })
      .min(2, { message: t("validation.nameMin") })
      .max(100, { message: t("validation.nameMax") }),
    logo: z
      .instanceof(File, { message: t("validation.fileRequired") })
      .refine((file) => file.size <= 5000000, t("validation.fileSize"))
      .refine(
        (file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
        t("validation.fileType")
      )
      .optional(),
    website: z
      .string()
      .min(1, { message: t("validation.urlRequired") })
      .url({ message: t("validation.urlInvalid") }),
    tier: z.string({
      required_error: t("validation.tierRequired"),
    }),
  });

  type SponsorFormValues = z.infer<typeof sponsorFormSchema>;

  const form = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: {
      name: "",
      website: "",
      tier: "",
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
        // Simulate upload progress
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 100);

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

      if (data.logo) {
        formdata.append("logo", data.logo);
      }

      const result = await createSponsor(formdata);

      if (result && result.success) {
        toast({
          title: t("messages.success"),
          description: t("messages.successDescription"),
          duration: 5000,
        });
        form.reset();
        setPreview(null);
      } else {
        throw new Error("Failed to create sponsor");
      }
    } catch (error) {
      toast({
        title: t("messages.error"),
        description: t("messages.errorDescription"),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const tierConfig = {
    platinum: {
      color:
        "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300",
      icon: "💎",
    },
    gold: {
      color:
        "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300",
      icon: "🥇",
    },
    silver: {
      color:
        "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300",
      icon: "🥈",
    },
    bronze: {
      color:
        "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300",
      icon: "🥉",
    },
  };

  return (
    <div
      className={`w-full mx-auto space-y-8 ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Card className="w-full shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 -left-8 w-32 h-32 bg-purple-100 rounded-full opacity-15 animate-bounce"></div>
          <div className="absolute bottom-4 right-1/3 w-16 h-16 bg-pink-100 rounded-full opacity-25 animate-pulse delay-1000"></div>
        </div>

        <CardHeader className="relative space-y-6 pb-8 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
          <div className="flex items-center gap-4">
            <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Building2 className="h-7 w-7 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-yellow-800" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {t("title")}
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg leading-relaxed">
                {t("description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-10 p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Sponsor Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-4 group">
                      <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 group-hover:text-blue-600 transition-colors">
                        <div className="p-1.5 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        {t("fields.sponsorName.label")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={t("fields.sponsorName.placeholder")}
                            {...field}
                            className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-lg pl-4 pr-4 rounded-xl shadow-sm hover:shadow-md"
                          />
                          {field.value && (
                            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500 ml-1">
                        {t("fields.sponsorName.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Website Field */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem className="space-y-4 group">
                      <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 group-hover:text-green-600 transition-colors">
                        <div className="p-1.5 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                          <Globe className="h-4 w-4 text-green-600" />
                        </div>
                        {t("fields.website.label")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={t("fields.website.placeholder")}
                            {...field}
                            className="h-14 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-lg pl-4 pr-4 rounded-xl shadow-sm hover:shadow-md"
                            dir="ltr"
                          />
                          {field.value && field.value.startsWith("http") && (
                            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500 ml-1">
                        {t("fields.website.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sponsorship Tier Field */}
                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem className="space-y-4 group">
                      <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 group-hover:text-purple-600 transition-colors">
                        <div className="p-1.5 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                          <Award className="h-4 w-4 text-purple-600" />
                        </div>
                        {t("fields.tier.label")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-lg rounded-xl shadow-sm hover:shadow-md">
                            <SelectValue
                              placeholder={t("fields.tier.placeholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-2 shadow-xl">
                          {Object.entries(tierConfig).map(([tier, config]) => (
                            <SelectItem
                              key={tier}
                              value={tier}
                              className="py-3 px-4 hover:bg-gray-50 rounded-lg m-1"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{config.icon}</span>
                                <Badge
                                  className={`${config.color} px-3 py-1 text-sm font-semibold`}
                                >
                                  {t(`fields.tier.options.${tier}`)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm text-gray-500 ml-1">
                        {t("fields.tier.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Logo Upload Field */}
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem className="space-y-4 group">
                      <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 group-hover:text-indigo-600 transition-colors">
                        <div className="p-1.5 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                          <ImageIcon className="h-4 w-4 text-indigo-600" />
                        </div>
                        {t("fields.logo.label")}
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div
                            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                              dragActive
                                ? "border-indigo-500 bg-indigo-50 scale-105 shadow-lg"
                                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                          >
                            {preview ? (
                              <div className="relative group">
                                <div className="flex items-center justify-center p-4">
                                  <div className="relative rounded-xl overflow-hidden shadow-lg bg-white p-2">
                                    <img
                                      src={preview || "/placeholder.svg"}
                                      alt="Logo preview"
                                      className="max-h-40 max-w-full object-contain"
                                    />
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={removeImage}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                  <Upload className="h-8 w-8 text-indigo-600" />
                                </div>
                                <div className="space-y-3">
                                  <p className="text-lg font-medium text-gray-700">
                                    {t("fields.logo.dragDrop")}
                                  </p>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileChange(file);
                                    }}
                                    {...fieldProps}
                                    className="hidden"
                                    id="logo-upload"
                                  />
                                  <label htmlFor="logo-upload">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="cursor-pointer h-12 px-6 rounded-xl border-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
                                      asChild
                                    >
                                      <span className="flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        {t("fields.logo.chooseFile")}
                                      </span>
                                    </Button>
                                  </label>
                                </div>
                              </div>
                            )}

                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div className="absolute bottom-4 left-4 right-4">
                                <div className="bg-white rounded-full p-2 shadow-lg">
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">
                                      {uploadProgress}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500 ml-1">
                        {t("fields.logo.description")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-8 border-t border-gray-200">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setPreview(null);
                    }}
                    className="h-14 px-8 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {t("actions.reset")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 px-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("actions.submitting")}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5" />
                        {t("actions.addSponsor")}
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
