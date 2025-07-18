"use client";

import {
  Shield,
  AlertTriangle,
  Mail,
  ArrowLeft,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

interface BannedPageProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    banDate?: string;
    banReason?: string;
  };
  supportEmail?: string;
  appealAllowed?: boolean;
}

export default function BannedPage({
  user,
  supportEmail = "support@badgi.net",
  appealAllowed = true,
}: BannedPageProps) {
  const t = useTranslations("bannedPage");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const formatBanDate = (dateString?: string) => {
    if (!dateString) return t("dateUnknown");
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-4 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {/* Animated danger stripe */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-red-400/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl w-full mx-auto relative z-10">
        {/* Icon Section */}
        <div
          className={`flex justify-center mb-8 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-2xl opacity-70 animate-pulse scale-150" />
            <div className="relative glass bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full p-6 border border-red-200/50 dark:border-red-800/50 shadow-2xl">
              <Shield className="h-16 w-16 text-red-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-red-200/30 dark:border-red-900/30 shadow-2xl rounded-3xl overflow-hidden">
          {/* Header */}
          <CardHeader className="pb-6 border-b border-red-100/50 dark:border-red-900/30 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-950/30 dark:to-orange-950/30">
            <div
              className={`flex items-center gap-3 mb-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <Badge
                variant="destructive"
                className="glass bg-red-500/90 text-white border-0 font-semibold"
              >
                <span className={isRTL ? "font-arabic" : ""}>
                  {t("status.suspended")}
                </span>
              </Badge>
            </div>

            <CardTitle
              className={`text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent ${
                isRTL ? "font-arabic text-right" : ""
              }`}
            >
              {t("title")}
            </CardTitle>

            <CardDescription
              className={`text-lg text-muted-foreground leading-relaxed ${
                isRTL ? "font-arabic text-right" : ""
              }`}
            >
              {t("description")}
            </CardDescription>
          </CardHeader>

          {/* Content */}
          <CardContent className="pt-8 space-y-6">
            {/* User Information */}
            {user?.firstName && (
              <div className="glass bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30 rounded-2xl p-6">
                <div
                  className={`flex items-center gap-3 mb-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3
                    className={`font-semibold text-blue-800 dark:text-blue-200 ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("accountInfo.title")}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div
                    className={`flex justify-between items-center ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span
                      className={`text-sm font-medium text-muted-foreground ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("accountInfo.name")}
                    </span>
                    <span
                      className={`font-medium ${isRTL ? "font-arabic" : ""}`}
                    >
                      {user.firstName} {user.lastName}
                    </span>
                  </div>

                  {user.email && (
                    <div
                      className={`flex justify-between items-center ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <span
                        className={`text-sm font-medium text-muted-foreground ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t("accountInfo.email")}
                      </span>
                      <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {user.email}
                      </span>
                    </div>
                  )}

                  {user.banDate && (
                    <div
                      className={`flex justify-between items-center ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <span
                        className={`text-sm font-medium text-muted-foreground ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t("accountInfo.banDate")}
                      </span>
                      <div
                        className={`flex items-center gap-2 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span
                          className={`text-sm ${isRTL ? "font-arabic" : ""}`}
                        >
                          {formatBanDate(user.banDate)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ban Reason */}
            <div className="glass bg-gradient-to-r from-red-50/50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/20 backdrop-blur-sm border border-red-200/30 dark:border-red-700/30 rounded-2xl p-6">
              <div
                className={`flex items-center gap-3 mb-4 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3
                  className={`font-semibold text-red-800 dark:text-red-200 ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("banReason.title")}
                </h3>
              </div>

              <p
                className={`text-muted-foreground leading-relaxed ${
                  isRTL ? "font-arabic text-right" : ""
                }`}
              >
                {user?.banReason || t("banReason.default")}
              </p>
            </div>

            {/* Information Box */}
            <div className="glass bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30 rounded-2xl p-6">
              <h3
                className={`font-semibold text-amber-800 dark:text-amber-200 mb-4 ${
                  isRTL ? "font-arabic text-right" : ""
                }`}
              >
                {t("consequences.title")}
              </h3>

              <ul className={`space-y-3 ${isRTL ? "text-right" : ""}`}>
                <li
                  className={`flex items-start gap-3 text-sm text-muted-foreground ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <span className={isRTL ? "font-arabic" : ""}>
                    {t("consequences.noAccess")}
                  </span>
                </li>
                <li
                  className={`flex items-start gap-3 text-sm text-muted-foreground ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <span className={isRTL ? "font-arabic" : ""}>
                    {t("consequences.noNewAccounts")}
                  </span>
                </li>
                <li
                  className={`flex items-start gap-3 text-sm text-muted-foreground ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <span className={isRTL ? "font-arabic" : ""}>
                    {t("consequences.permanentDecision")}
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex flex-col space-y-6 pt-6 bg-gradient-to-r from-slate-50/50 to-gray-50/50 dark:from-slate-950/30 dark:to-gray-950/30">
            {appealAllowed && (
              <>
                <Button
                  className={`w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full transition-all duration-200 hover:scale-105 shadow-lg ${
                    isRTL ? "font-arabic" : ""
                  }`}
                  size="lg"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  {t("actions.appeal")}
                </Button>

                <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
              </>
            )}

            {/* Support Contact */}
            <div
              className={`text-center space-y-3 ${isRTL ? "font-arabic" : ""}`}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("support.description")}
              </p>

              <div
                className={`flex items-center justify-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Mail className="h-4 w-4 text-primary" />
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-primary hover:underline font-medium transition-colors duration-200 hover:text-primary/80"
                >
                  {supportEmail}
                </a>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>

            {/* Return Home */}
            <div className="pt-4 w-full">
              <Link href="/" passHref>
                <Button
                  variant="ghost"
                  className={`w-full glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full transition-all duration-200 hover:scale-105 ${
                    isRTL ? "font-arabic flex-row-reverse" : ""
                  }`}
                  size="lg"
                >
                  <ArrowLeft
                    className={`h-5 w-5 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`}
                  />
                  {t("actions.returnHome")}
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Help */}
        <div className={`mt-8 text-center ${isRTL ? "font-arabic" : ""}`}>
          <p className="text-sm text-muted-foreground">
            {t("additionalHelp.text")}{" "}
            <Link
              href="/help"
              className="text-primary hover:underline font-medium"
            >
              {t("additionalHelp.helpCenter")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
