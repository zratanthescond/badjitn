"use client";

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Search,
  BookOpen,
  Users,
  Calendar,
  CreditCard,
  Shield,
  Settings,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  Video,
  Download,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function HelpPage() {
  const t = useTranslations("helpPage");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = [
    {
      id: "getting-started",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      bgColor:
        "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      borderColor: "border-blue-200/30 dark:border-blue-700/30",
    },
    {
      id: "events",
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
      bgColor:
        "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      borderColor: "border-green-200/30 dark:border-green-700/30",
    },
    {
      id: "payments",
      icon: CreditCard,
      color: "from-purple-500 to-pink-500",
      bgColor:
        "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      borderColor: "border-purple-200/30 dark:border-purple-700/30",
    },
    {
      id: "account",
      icon: Users,
      color: "from-orange-500 to-red-500",
      bgColor:
        "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
      borderColor: "border-orange-200/30 dark:border-orange-700/30",
    },
    {
      id: "security",
      icon: Shield,
      color: "from-indigo-500 to-purple-500",
      bgColor:
        "from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20",
      borderColor: "border-indigo-200/30 dark:border-indigo-700/30",
    },
    {
      id: "technical",
      icon: Settings,
      color: "from-gray-500 to-slate-500",
      bgColor:
        "from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20",
      borderColor: "border-gray-200/30 dark:border-gray-700/30",
    },
  ];

  const popularArticles = [
    { id: "create-event", category: "events", readTime: 5 },
    { id: "publisher-approval", category: "getting-started", readTime: 3 },
    { id: "payment-methods", category: "payments", readTime: 4 },
    { id: "account-security", category: "security", readTime: 6 },
    { id: "event-promotion", category: "events", readTime: 7 },
    { id: "refund-policy", category: "payments", readTime: 4 },
  ];

  const quickLinks = [
    { id: "contact-support", icon: MessageCircle, external: true },
    { id: "video-tutorials", icon: Video, external: true },
    { id: "download-guides", icon: Download, external: false },
    { id: "community-forum", icon: Users, external: true },
  ];

  const filteredCategories = helpCategories.filter(
    (category) =>
      t(`categories.${category.id}.title`)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      t(`categories.${category.id}.description`)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

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
              <HelpCircle className="h-12 w-12 text-blue-600 dark:text-blue-400" />
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

        {/* Search Section */}
        <div className="mb-12">
          <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="relative">
                <Search
                  className={`absolute top-4 h-5 w-5 text-muted-foreground ${
                    isRTL ? "right-4" : "left-4"
                  }`}
                />
                <Input
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-2xl h-14 text-lg ${
                    isRTL ? "pr-12 font-arabic text-right" : "pl-12"
                  }`}
                />
              </div>
              <div
                className={`flex flex-wrap gap-2 mt-4 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <span
                  className={`text-sm text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("search.popularSearches")}:
                </span>
                {["events", "payments", "account", "publisher"].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(t(`search.terms.${term}`))}
                    className={`glass bg-white/40 dark:bg-slate-800/40 border-white/30 dark:border-slate-700/50 rounded-full text-xs hover:bg-white/60 dark:hover:bg-slate-700/60 ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t(`search.terms.${term}`)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2
            className={`text-2xl font-bold mb-6 text-center ${
              isRTL ? "font-arabic" : ""
            }`}
          >
            {t("quickLinks.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Card
                  key={link.id}
                  className="glass bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  <CardContent className="p-6 text-center">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3
                      className={`font-semibold mb-2 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t(`quickLinks.items.${link.id}.title`)}
                    </h3>
                    <p
                      className={`text-sm text-muted-foreground ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t(`quickLinks.items.${link.id}.description`)}
                    </p>
                    {link.external && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground mt-2 mx-auto" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Help Categories */}
          <div className="lg:col-span-2">
            <h2
              className={`text-2xl font-bold mb-6 ${
                isRTL ? "font-arabic text-right" : ""
              }`}
            >
              {t("categories.title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className={`glass bg-gradient-to-br ${category.bgColor} backdrop-blur-md border ${category.borderColor} rounded-3xl hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden`}
                  >
                    <CardHeader className="pb-4">
                      <div
                        className={`flex items-center gap-4 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-r ${category.color} text-white group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className={isRTL ? "text-right" : ""}>
                          <CardTitle
                            className={`text-lg ${isRTL ? "font-arabic" : ""}`}
                          >
                            {t(`categories.${category.id}.title`)}
                          </CardTitle>
                          <CardDescription
                            className={`${isRTL ? "font-arabic" : ""}`}
                          >
                            {t(`categories.${category.id}.description`)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}
                          >
                            <ChevronRight
                              className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`}
                            />
                            <span className={isRTL ? "font-arabic" : ""}>
                              {t(`categories.${category.id}.articles.${index}`)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        className={`w-full mt-4 glass bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-700/60 rounded-full ${
                          isRTL ? "font-arabic" : ""
                        }`}
                        asChild
                      >
                        <Link href={`/help/${category.id}`}>
                          {t("categories.viewAll")}
                          <ChevronRight
                            className={`h-4 w-4 ml-2 ${
                              isRTL ? "rotate-180 mr-2 ml-0" : ""
                            }`}
                          />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Articles */}
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl">
              <CardHeader>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                    <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <CardTitle
                    className={`text-lg ${isRTL ? "font-arabic" : ""}`}
                  >
                    {t("popularArticles.title")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularArticles.map((article) => (
                  <div
                    key={article.id}
                    className={`flex items-center justify-between p-3 glass bg-white/40 dark:bg-slate-800/40 rounded-xl hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all cursor-pointer group ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                      <h4
                        className={`font-medium text-sm group-hover:text-primary transition-colors ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t(`popularArticles.items.${article.id}.title`)}
                      </h4>
                      <div
                        className={`flex items-center gap-2 mt-1 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span
                          className={`text-xs text-muted-foreground ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          {t("popularArticles.readTime", {
                            minutes: article.readTime,
                          })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ${
                        isRTL ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="glass bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-md border border-green-200/30 dark:border-green-700/30 rounded-3xl">
              <CardHeader>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle
                    className={`text-lg text-green-800 dark:text-green-200 ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("contactSupport.title")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p
                  className={`text-sm text-green-700 dark:text-green-300 ${
                    isRTL ? "font-arabic text-right" : ""
                  }`}
                >
                  {t("contactSupport.description")}
                </p>
                <Button
                  className={`w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full transition-all duration-200 hover:scale-105 ${
                    isRTL ? "font-arabic" : ""
                  }`}
                  asChild
                >
                  <Link href="/support">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t("contactSupport.button")}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* FAQ Preview */}
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl">
              <CardHeader>
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                    <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle
                    className={`text-lg ${isRTL ? "font-arabic" : ""}`}
                  >
                    {t("faq.title")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <AccordionItem
                      key={index}
                      value={`faq-${index}`}
                      className="glass bg-white/40 dark:bg-slate-800/40 rounded-xl border-0 px-4"
                    >
                      <AccordionTrigger
                        className={`text-sm font-medium hover:no-underline ${
                          isRTL ? "font-arabic text-right" : ""
                        }`}
                      >
                        {t(`faq.items.${index}.question`)}
                      </AccordionTrigger>
                      <AccordionContent
                        className={`text-sm text-muted-foreground ${
                          isRTL ? "font-arabic text-right" : ""
                        }`}
                      >
                        {t(`faq.items.${index}.answer`)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <Button
                  variant="ghost"
                  className={`w-full mt-4 glass bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-700/60 rounded-full ${
                    isRTL ? "font-arabic" : ""
                  }`}
                  asChild
                >
                  <Link href="/help/faq">
                    {t("faq.viewAll")}
                    <ChevronRight
                      className={`h-4 w-4 ml-2 ${
                        isRTL ? "rotate-180 mr-2 ml-0" : ""
                      }`}
                    />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Card className="glass bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-md border border-blue-200/30 dark:border-blue-700/30 rounded-3xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3
                className={`text-2xl font-bold mb-4 ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("bottomCta.title")}
              </h3>
              <p
                className={`text-muted-foreground mb-6 ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("bottomCta.description")}
              </p>
              <div
                className={`flex flex-col sm:flex-row gap-4 justify-center ${
                  isRTL ? "sm:flex-row-reverse" : ""
                }`}
              >
                <Button
                  className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full transition-all duration-200 hover:scale-105 ${
                    isRTL ? "font-arabic" : ""
                  }`}
                  asChild
                >
                  <Link href="/support">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t("bottomCta.contactSupport")}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className={`glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full transition-all duration-200 hover:scale-105 ${
                    isRTL ? "font-arabic" : ""
                  }`}
                  asChild
                >
                  <Link href="/help/community">
                    <Users className="h-4 w-4 mr-2" />
                    {t("bottomCta.joinCommunity")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
