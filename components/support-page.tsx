"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  FileText,
  Headphones,
  Calendar,
  Users,
  Zap,
  Shield,
  ExternalLink,
  Upload,
  Paperclip,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function SupportPage() {
  const t = useTranslations("supportPage");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    priority: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const supportChannels = [
    {
      id: "live-chat",
      icon: MessageCircle,
      color: "from-green-500 to-emerald-500",
      bgColor:
        "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      borderColor: "border-green-200/30 dark:border-green-700/30",
      available: true,
      responseTime: "immediate",
    },
    {
      id: "email",
      icon: Mail,
      color: "from-blue-500 to-cyan-500",
      bgColor:
        "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      borderColor: "border-blue-200/30 dark:border-blue-700/30",
      available: true,
      responseTime: "24h",
    },
    {
      id: "phone",
      icon: Phone,
      color: "from-purple-500 to-pink-500",
      bgColor:
        "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      borderColor: "border-purple-200/30 dark:border-purple-700/30",
      available: false,
      responseTime: "business-hours",
    },
  ];

  const supportCategories = [
    { id: "account", icon: Users },
    { id: "events", icon: Calendar },
    { id: "payments", icon: FileText },
    { id: "technical", icon: Zap },
    { id: "security", icon: Shield },
    { id: "other", icon: MessageCircle },
  ];

  const priorityLevels = [
    { id: "low", color: "bg-green-500" },
    { id: "medium", color: "bg-yellow-500" },
    { id: "high", color: "bg-orange-500" },
    { id: "urgent", color: "bg-red-500" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 flex items-center justify-center p-4 ${
          isRTL ? "rtl" : "ltr"
        }`}
      >
        <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-green-200/30 dark:border-green-700/30 rounded-3xl max-w-2xl w-full shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 w-fit mx-auto mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            <h1
              className={`text-3xl font-bold text-green-800 dark:text-green-200 mb-4 ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {t("success.title")}
            </h1>
            <p
              className={`text-lg text-green-700 dark:text-green-300 mb-6 ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {t("success.description")}
            </p>
            <div className="glass bg-green-500/10 border border-green-200/30 dark:border-green-700/30 rounded-2xl p-6 mb-8">
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span
                  className={`font-medium text-green-800 dark:text-green-200 ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("success.ticketNumber")}: #SUP-
                  {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </span>
              </div>
            </div>
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center ${
                isRTL ? "sm:flex-row-reverse" : ""
              }`}
            >
              <Button
                className={`bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full transition-all duration-200 hover:scale-105 ${
                  isRTL ? "font-arabic" : ""
                }`}
                asChild
              >
                <Link href="/help">
                  <FileText className="h-4 w-4 mr-2" />
                  {t("success.actions.browseHelp")}
                </Link>
              </Button>
              <Button
                variant="outline"
                className={`glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full transition-all duration-200 hover:scale-105 ${
                  isRTL ? "font-arabic" : ""
                }`}
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    subject: "",
                    category: "",
                    priority: "",
                    message: "",
                  });
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {t("success.actions.newTicket")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div
            className={`flex justify-center mb-6 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 glass backdrop-blur-sm">
              <Headphones className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1
            className={`text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 ${
              isRTL ? "font-arabic" : ""
            }`}
          >
            {t("title")}
          </h1>
          <p
            className={`text-xl text-muted-foreground max-w-2xl mx-auto ${
              isRTL ? "font-arabic" : ""
            }`}
          >
            {t("subtitle")}
          </p>
        </div>

        {/* Support Channels */}
        <div className="mb-12">
          <h2
            className={`text-2xl font-bold mb-6 text-center ${
              isRTL ? "font-arabic" : ""
            }`}
          >
            {t("channels.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Card
                  key={channel.id}
                  className={`glass bg-gradient-to-br ${channel.bgColor} backdrop-blur-md border ${channel.borderColor} rounded-3xl hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden`}
                >
                  <CardHeader className="pb-4">
                    <div
                      className={`flex items-center gap-4 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-r ${channel.color} text-white group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                        <CardTitle
                          className={`text-lg ${isRTL ? "font-arabic" : ""}`}
                        >
                          {t(`channels.items.${channel.id}.title`)}
                        </CardTitle>
                        <div
                          className={`flex items-center gap-2 mt-1 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              channel.available ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span
                            className={`text-xs ${
                              channel.available
                                ? "text-green-600"
                                : "text-red-600"
                            } ${isRTL ? "font-arabic" : ""}`}
                          >
                            {channel.available
                              ? t("channels.available")
                              : t("channels.unavailable")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={`text-sm text-muted-foreground mb-4 ${
                        isRTL ? "font-arabic text-right" : ""
                      }`}
                    >
                      {t(`channels.items.${channel.id}.description`)}
                    </p>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={`text-sm text-muted-foreground ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t(`channels.responseTime.${channel.responseTime}`)}
                      </span>
                    </div>
                    <Button
                      className={`w-full mt-4 glass bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-700/60 rounded-full ${
                        isRTL ? "font-arabic" : ""
                      }`}
                      disabled={!channel.available}
                    >
                      {t(`channels.items.${channel.id}.action`)}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Support Form */}
          <div className="lg:col-span-2">
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-xl">
              <CardHeader>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20">
                    <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <CardTitle
                      className={`text-2xl ${isRTL ? "font-arabic" : ""}`}
                    >
                      {t("form.title")}
                    </CardTitle>
                    <CardDescription
                      className={`${isRTL ? "font-arabic" : ""}`}
                    >
                      {t("form.description")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className={isRTL ? "font-arabic" : ""}
                      >
                        {t("form.fields.name.label")}
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder={t("form.fields.name.placeholder")}
                        className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl ${
                          isRTL ? "font-arabic text-right" : ""
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className={isRTL ? "font-arabic" : ""}
                      >
                        {t("form.fields.email.label")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder={t("form.fields.email.placeholder")}
                        className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl ${
                          isRTL ? "font-arabic text-right" : ""
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="subject"
                      className={isRTL ? "font-arabic" : ""}
                    >
                      {t("form.fields.subject.label")}
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      placeholder={t("form.fields.subject.placeholder")}
                      className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl ${
                        isRTL ? "font-arabic text-right" : ""
                      }`}
                      required
                    />
                  </div>

                  {/* Category and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className={isRTL ? "font-arabic" : ""}>
                        {t("form.fields.category.label")}
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger
                          className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          <SelectValue
                            placeholder={t("form.fields.category.placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent className="glass bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-white/20 dark:border-slate-700/50 rounded-xl">
                          {supportCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                              <SelectItem
                                key={category.id}
                                value={category.id}
                                className={isRTL ? "font-arabic" : ""}
                              >
                                <div
                                  className={`flex items-center gap-2 ${
                                    isRTL ? "flex-row-reverse" : ""
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                  {t(
                                    `form.fields.category.options.${category.id}`
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className={isRTL ? "font-arabic" : ""}>
                        {t("form.fields.priority.label")}
                      </Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          handleInputChange("priority", value)
                        }
                      >
                        <SelectTrigger
                          className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          <SelectValue
                            placeholder={t("form.fields.priority.placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent className="glass bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-white/20 dark:border-slate-700/50 rounded-xl">
                          {priorityLevels.map((priority) => (
                            <SelectItem
                              key={priority.id}
                              value={priority.id}
                              className={isRTL ? "font-arabic" : ""}
                            >
                              <div
                                className={`flex items-center gap-2 ${
                                  isRTL ? "flex-row-reverse" : ""
                                }`}
                              >
                                <div
                                  className={`w-3 h-3 rounded-full ${priority.color}`}
                                />
                                {t(
                                  `form.fields.priority.options.${priority.id}`
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className={isRTL ? "font-arabic" : ""}
                    >
                      {t("form.fields.message.label")}
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      placeholder={t("form.fields.message.placeholder")}
                      className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl min-h-32 resize-none ${
                        isRTL ? "font-arabic text-right" : ""
                      }`}
                      required
                    />
                  </div>

                  {/* File Attachment */}
                  <div className="space-y-2">
                    <Label className={isRTL ? "font-arabic" : ""}>
                      {t("form.fields.attachment.label")}
                    </Label>
                    <div className="glass bg-white/40 dark:bg-slate-800/40 border border-white/30 dark:border-slate-700/50 rounded-xl p-6 border-dashed">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p
                          className={`text-sm text-muted-foreground mb-2 ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          {t("form.fields.attachment.description")}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-full ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          {t("form.fields.attachment.button")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full h-12 text-lg transition-all duration-200 hover:scale-105 ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <div
                        className={`flex items-center gap-2 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("form.submitting")}
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-2 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Send className="h-5 w-5" />
                        {t("form.submit")}
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Hours */}
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl">
              <CardHeader>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle
                    className={`text-lg ${isRTL ? "font-arabic" : ""}`}
                  >
                    {t("supportHours.title")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className={`flex justify-between items-center ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("supportHours.weekdays")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    9:00 AM - 6:00 PM
                  </span>
                </div>
                <div
                  className={`flex justify-between items-center ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("supportHours.weekends")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    10:00 AM - 4:00 PM
                  </span>
                </div>
                <div
                  className={`flex justify-between items-center ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("supportHours.timezone")}
                  </span>
                  <span className="text-sm text-muted-foreground">UTC+0</span>
                </div>
                <Alert className="glass bg-green-500/10 border-green-200/30 dark:border-green-700/30">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription
                    className={`text-green-700 dark:text-green-300 ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("supportHours.currentStatus")}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="glass bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 backdrop-blur-md border border-red-200/30 dark:border-red-700/30 rounded-3xl">
              <CardHeader>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle
                    className={`text-lg text-red-800 dark:text-red-200 ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("emergency.title")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p
                  className={`text-sm text-red-700 dark:text-red-300 ${
                    isRTL ? "font-arabic text-right" : ""
                  }`}
                >
                  {t("emergency.description")}
                </p>
                <div className="space-y-2">
                  <div
                    className={`flex items-center gap-2 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-mono">+1 (555) 123-4567</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Mail className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-mono">
                      emergency@badgi.net
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Resources */}
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl">
              <CardHeader>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle
                    className={`text-lg ${isRTL ? "font-arabic" : ""}`}
                  >
                    {t("quickResources.title")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "help-center",
                  "video-tutorials",
                  "community-forum",
                  "status-page",
                ].map((resource) => (
                  <div
                    key={resource}
                    className={`flex items-center justify-between p-3 glass bg-white/40 dark:bg-slate-800/40 rounded-xl hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all cursor-pointer group ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span
                      className={`text-sm font-medium group-hover:text-primary transition-colors ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t(`quickResources.items.${resource}`)}
                    </span>
                    <ExternalLink
                      className={`h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ${
                        isRTL ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
