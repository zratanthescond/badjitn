"use client";

import { useEffect, useState } from "react";
import PublisherCard from "@/components/PublisherCard";
import EventForm from "@/components/shared/EventForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  HelpCircle,
  Sparkles,
  Plus,
  FileText,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

interface CreateEventPageProps {
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    publisher?: "none" | "pending" | "approved" | "rejected";
  };
}

export default function CreateEventPage({ user }: CreateEventPageProps) {
  const t = useTranslations("createEventPage");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <CreateEventPageSkeleton isRTL={isRTL} />;
  }

  const getPublisherStatus = () => {
    if (!user?.publisher || user.publisher === "none") {
      return "none";
    }
    return user.publisher;
  };

  const publisherStatus = getPublisherStatus();

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div
            className={`flex items-center gap-4 mb-6 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 glass backdrop-blur-sm">
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <h1
                className={`text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("title")}
              </h1>
              <p
                className={`text-muted-foreground mt-2 text-lg ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("subtitle")}
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <span
              className={`text-sm font-medium text-muted-foreground ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {t("status.label")}:
            </span>
            {publisherStatus === "approved" && (
              <Badge className="glass bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span className={isRTL ? "font-arabic" : ""}>
                  {t("status.approved")}
                </span>
              </Badge>
            )}
            {publisherStatus === "pending" && (
              <Badge className="glass bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-300">
                <Clock className="h-3 w-3 mr-1" />
                <span className={isRTL ? "font-arabic" : ""}>
                  {t("status.pending")}
                </span>
              </Badge>
            )}
            {publisherStatus === "rejected" && (
              <Badge className="glass bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30 text-red-700 dark:text-red-300">
                <XCircle className="h-3 w-3 mr-1" />
                <span className={isRTL ? "font-arabic" : ""}>
                  {t("status.rejected")}
                </span>
              </Badge>
            )}
            {publisherStatus === "none" && (
              <Badge className="glass bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-700 dark:text-gray-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span className={isRTL ? "font-arabic" : ""}>
                  {t("status.notApplied")}
                </span>
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Pending Status */}
          {publisherStatus === "pending" && (
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-yellow-200/30 dark:border-yellow-700/30 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/30 dark:to-orange-950/30 border-b border-yellow-100/50 dark:border-yellow-900/30">
                <div
                  className={`flex items-center gap-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-3 rounded-xl bg-yellow-500/20">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <CardTitle
                      className={`text-2xl text-yellow-800 dark:text-yellow-200 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("pending.title")}
                    </CardTitle>
                    <CardDescription
                      className={`text-yellow-600 dark:text-yellow-300 text-lg ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("pending.subtitle")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-2 md:p-8">
                <div className="space-y-6">
                  <p
                    className={`text-muted-foreground leading-relaxed text-lg ${
                      isRTL ? "font-arabic text-right" : ""
                    }`}
                  >
                    {t("pending.description")}
                  </p>

                  <div className="glass bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30 rounded-2xl p-6">
                    <h3
                      className={`font-semibold text-blue-800 dark:text-blue-200 mb-4 ${
                        isRTL ? "font-arabic text-right" : ""
                      }`}
                    >
                      {t("pending.whatHappensNext.title")}
                    </h3>
                    <ul className={`space-y-3 ${isRTL ? "text-right" : ""}`}>
                      <li
                        className={`flex items-start gap-3 text-sm text-muted-foreground ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className={isRTL ? "font-arabic" : ""}>
                          {t("pending.whatHappensNext.step1")}
                        </span>
                      </li>
                      <li
                        className={`flex items-start gap-3 text-sm text-muted-foreground ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className={isRTL ? "font-arabic" : ""}>
                          {t("pending.whatHappensNext.step2")}
                        </span>
                      </li>
                      <li
                        className={`flex items-start gap-3 text-sm text-muted-foreground ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className={isRTL ? "font-arabic" : ""}>
                          {t("pending.whatHappensNext.step3")}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div
                    className={`flex flex-col sm:flex-row gap-4 ${
                      isRTL ? "sm:flex-row-reverse" : ""
                    }`}
                  >
                    <Button
                      variant="outline"
                      className={`glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full transition-all duration-200 hover:scale-105 ${
                        isRTL ? "font-arabic flex-row-reverse" : ""
                      }`}
                      asChild
                    >
                      <Link href="/support">
                        <Mail className="h-4 w-4 mr-2" />
                        {t("pending.actions.contactSupport")}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className={`glass bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full transition-all duration-200 hover:scale-105 ${
                        isRTL ? "font-arabic flex-row-reverse" : ""
                      }`}
                      asChild
                    >
                      <Link href="/help/publisher">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        {t("pending.actions.learnMore")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approved Status - Event Form */}
          {publisherStatus === "approved" && (
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-green-200/30 dark:border-green-700/30 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30 border-b border-green-100/50 dark:border-green-900/30">
                <div
                  className={`flex items-center gap-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <CardTitle
                      className={`text-2xl text-green-800 dark:text-green-200 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("approved.title")}
                    </CardTitle>
                    <CardDescription
                      className={`text-green-600 dark:text-green-300 text-lg ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("approved.subtitle")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="md:p-8 p-2">
                <div className="space-y-6">
                  <div className="glass bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30 rounded-2xl p-6">
                    <div
                      className={`flex items-center gap-3 mb-4 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3
                        className={`font-semibold text-blue-800 dark:text-blue-200 ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t("approved.welcomeMessage")}
                      </h3>
                    </div>
                    <p
                      className={`text-muted-foreground ${
                        isRTL ? "font-arabic text-right" : ""
                      }`}
                    >
                      {t("approved.description")}
                    </p>
                  </div>

                  <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                  {/* Event Form */}
                  <div className="space-y-4">
                    <div
                      className={`flex items-center gap-3 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <h3
                        className={`text-xl font-semibold ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t("approved.formTitle")}
                      </h3>
                    </div>
                    <EventForm userId={user._id} type="Create" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejected Status */}
          {publisherStatus === "rejected" && (
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-red-200/30 dark:border-red-700/30 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-50/50 to-rose-50/50 dark:from-red-950/30 dark:to-rose-950/30 border-b border-red-100/50 dark:border-red-900/30">
                <div
                  className={`flex items-center gap-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-3 rounded-xl bg-red-500/20">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <CardTitle
                      className={`text-2xl text-red-800 dark:text-red-200 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("rejected.title")}
                    </CardTitle>
                    <CardDescription
                      className={`text-red-600 dark:text-red-300 text-lg ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("rejected.subtitle")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="space-y-6">
                  <p
                    className={`text-muted-foreground leading-relaxed text-lg ${
                      isRTL ? "font-arabic text-right" : ""
                    }`}
                  >
                    {t("rejected.description")}
                  </p>

                  <div className="glass bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30 rounded-2xl p-6">
                    <h3
                      className={`font-semibold text-amber-800 dark:text-amber-200 mb-4 ${
                        isRTL ? "font-arabic text-right" : ""
                      }`}
                    >
                      {t("rejected.nextSteps.title")}
                    </h3>
                    <ul className={`space-y-3 ${isRTL ? "text-right" : ""}`}>
                      <li
                        className={`flex items-start gap-3 text-sm text-muted-foreground ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        <span className={isRTL ? "font-arabic" : ""}>
                          {t("rejected.nextSteps.step1")}
                        </span>
                      </li>
                      <li
                        className={`flex items-start gap-3 text-sm text-muted-foreground ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        <span className={isRTL ? "font-arabic" : ""}>
                          {t("rejected.nextSteps.step2")}
                        </span>
                      </li>
                      <li
                        className={`flex items-start gap-3 text-sm text-muted-foreground ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                        <span className={isRTL ? "font-arabic" : ""}>
                          {t("rejected.nextSteps.step3")}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div
                    className={`flex flex-col sm:flex-row gap-4 ${
                      isRTL ? "sm:flex-row-reverse" : ""
                    }`}
                  >
                    <Button
                      className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full transition-all duration-200 hover:scale-105 ${
                        isRTL ? "font-arabic flex-row-reverse" : ""
                      }`}
                      asChild
                    >
                      <Link href="/support">
                        <Mail className="h-4 w-4 mr-2" />
                        {t("rejected.actions.contactSupport")}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className={`glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full transition-all duration-200 hover:scale-105 ${
                        isRTL ? "font-arabic flex-row-reverse" : ""
                      }`}
                      asChild
                    >
                      <Link href="/publisher/reapply">
                        <FileText className="h-4 w-4 mr-2" />
                        {t("rejected.actions.reapply")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Not Applied Status - Publisher Card */}
          {publisherStatus === "none" && (
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-blue-200/30 dark:border-blue-700/30 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-blue-100/50 dark:border-blue-900/30">
                <div
                  className={`flex items-center gap-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <CardTitle
                      className={`text-2xl text-blue-800 dark:text-blue-200 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("notApplied.title")}
                    </CardTitle>
                    <CardDescription
                      className={`text-blue-600 dark:text-blue-300 text-lg ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("notApplied.subtitle")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="space-y-6">
                  <p
                    className={`text-muted-foreground leading-relaxed text-lg ${
                      isRTL ? "font-arabic text-right" : ""
                    }`}
                  >
                    {t("notApplied.description")}
                  </p>

                  <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                  {/* Publisher Card */}
                  <PublisherCard userId={user._id} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <div className="glass bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-6">
            <h3
              className={`text-lg font-semibold mb-2 ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {t("help.title")}
            </h3>
            <p
              className={`text-muted-foreground mb-4 ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {t("help.description")}
            </p>
            <div
              className={`flex flex-col sm:flex-row gap-3 justify-center ${
                isRTL ? "sm:flex-row-reverse" : ""
              }`}
            >
              <Button
                variant="outline"
                size="sm"
                className={`glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${
                  isRTL ? "font-arabic flex-row-reverse" : ""
                }`}
                asChild
              >
                <Link href="/help">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {t("help.actions.helpCenter")}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${
                  isRTL ? "font-arabic flex-row-reverse" : ""
                }`}
                asChild
              >
                <Link href="/support">
                  <Mail className="h-4 w-4 mr-2" />
                  {t("help.actions.contactUs")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function CreateEventPageSkeleton({ isRTL }: { isRTL: boolean }) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div
            className={`flex items-center gap-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="w-64 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 rounded-3xl p-8">
            <div className="space-y-6">
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
              <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
