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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Search,
  Clock,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Users,
  Calendar,
  CreditCard,
  Shield,
  Settings,
  ChevronRight,
  Star,
  MessageCircle,
} from "lucide-react";
import { useTranslations, useLocale, useMessages } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function HelpCategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const t = useTranslations("helpCategoryPage");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const messages = useMessages();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const categoryIcons = {
    "getting-started": BookOpen,
    events: Calendar,
    payments: CreditCard,
    account: Users,
    security: Shield,
    technical: Settings,
  };

  const categoryColors = {
    "getting-started": {
      color: "from-blue-500 to-cyan-500",
      bgColor:
        "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      borderColor: "border-blue-200/30 dark:border-blue-700/30",
    },
    events: {
      color: "from-green-500 to-emerald-500",
      bgColor:
        "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      borderColor: "border-green-200/30 dark:border-green-700/30",
    },
    payments: {
      color: "from-purple-500 to-pink-500",
      bgColor:
        "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      borderColor: "border-purple-200/30 dark:border-purple-700/30",
    },
    account: {
      color: "from-orange-500 to-red-500",
      bgColor:
        "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
      borderColor: "border-orange-200/30 dark:border-orange-700/30",
    },
    security: {
      color: "from-indigo-500 to-purple-500",
      bgColor:
        "from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20",
      borderColor: "border-indigo-200/30 dark:border-indigo-700/30",
    },
    technical: {
      color: "from-gray-500 to-slate-500",
      bgColor:
        "from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20",
      borderColor: "border-gray-200/30 dark:border-gray-700/30",
    },
  };

  const Icon =
    categoryIcons[category as keyof typeof categoryIcons] || BookOpen;
  const colors =
    categoryColors[category as keyof typeof categoryColors] ||
    categoryColors["getting-started"];

  // Helper function to get raw message content without interpolation
  const getRawMessage = (path: string, fallback = "") => {
    try {
      const pathParts = path.split(".");
      let current: any = messages;

      for (const part of pathParts) {
        if (current && typeof current === "object" && part in current) {
          current = current[part];
        } else {
          console.warn(`Path not found: ${path}`);
          return fallback;
        }
      }

      return typeof current === "string" ? current : fallback;
    } catch (error) {
      console.error(`Error accessing message path: ${path}`, error);
      return fallback;
    }
  };

  // Helper function to safely get translation with fallback
  const getTranslation = (key: string, fallback = "") => {
    try {
      const translation = t(key);
      console.log(`Translation for "${key}":`, translation);

      // Check if translation actually exists (not just returning the key)
      if (translation && translation !== key && translation.trim() !== "") {
        return translation;
      } else {
        console.warn(`Translation missing or empty for key: ${key}`);
        return fallback;
      }
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return fallback;
    }
  };

  // Generate articles data with proper string indices for translations
  const articles = Array.from({ length: 8 }, (_, index) => {
    const articleIndex = index.toString(); // Convert to string for translation keys
    const articleKey = `categories.${category}.articles.${articleIndex}`;

    // Debug logging
    console.log(`Accessing translation key: ${articleKey}`);
    console.log(`Category: ${category}, Article Index: ${articleIndex}`);

    // Use getRawMessage for content to avoid interpolation issues
    const contentPath = `helpCategoryPage.${articleKey}.content`;
    const content = getRawMessage(
      contentPath,
      `<h2>Content for Article ${
        index + 1
      }</h2><p>This article content is not yet available in the current language.</p>`
    );

    return {
      id: `article-${index}`,
      title: getTranslation(`${articleKey}.title`, `Article ${index + 1}`),
      description: getTranslation(
        `${articleKey}.description`,
        `Description for article ${index + 1}`
      ),
      content: content,
      readTime: Math.floor(Math.random() * 10) + 2,
      helpful: Math.floor(Math.random() * 50) + 10,
      lastUpdated: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ),
      difficulty: ["beginner", "intermediate", "advanced"][
        Math.floor(Math.random() * 3)
      ] as "beginner" | "intermediate" | "advanced",
    };
  });

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedArticle) {
    const articleIndex = Number.parseInt(selectedArticle.split("-")[1]);
    const article = articles[articleIndex];

    if (!article) {
      console.error(`Article not found for index: ${articleIndex}`);
      return null;
    }

    console.log(`Selected article:`, article);
    console.log(`Article content length:`, article.content.length);

    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${colors.bgColor} ${
          isRTL ? "rtl" : "ltr"
        }`}
      >
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setSelectedArticle(null)}
            className={`mb-6 glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${
              isRTL ? "font-arabic flex-row-reverse" : ""
            }`}
          >
            <ArrowLeft
              className={`h-4 w-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`}
            />
            {t("article.backToCategory")}
          </Button>

          {/* Article Content */}
          <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-xl">
            <CardHeader className="pb-6">
              <div
                className={`flex items-start gap-4 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${colors.color} text-white flex-shrink-0`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                  <CardTitle
                    className={`text-2xl mb-2 ${isRTL ? "font-arabic" : ""}`}
                  >
                    {article.title}
                  </CardTitle>
                  <CardDescription
                    className={`text-lg ${isRTL ? "font-arabic" : ""}`}
                  >
                    {article.description}
                  </CardDescription>
                  <div
                    className={`flex flex-wrap items-center gap-4 mt-4 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
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
                        {t("article.readTime", { minutes: article.readTime })}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`glass bg-white/60 dark:bg-slate-800/60 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t(`article.difficulty.${article.difficulty}`)}
                    </Badge>
                    <span
                      className={`text-sm text-muted-foreground ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("article.lastUpdated", {
                        date: article.lastUpdated.toLocaleDateString(locale),
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="prose prose-lg dark:prose-invert max-w-none">
              <div
                className={`${isRTL ? "prose-rtl font-arabic text-right" : ""}`}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: article.content }}
                  className={`prose-content ${isRTL ? "text-right" : ""}`}
                />
              </div>

              <Separator className="my-8" />

              {/* Article Feedback */}
              <div
                className={`flex items-center justify-between ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className={isRTL ? "text-right" : ""}>
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("article.feedback.title")}
                  </h3>
                  <p
                    className={`text-muted-foreground ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("article.feedback.description")}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className={`glass bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 hover:bg-green-500/20 rounded-full ${
                      isRTL ? "font-arabic flex-row-reverse" : ""
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {t("article.feedback.helpful")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`glass bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-500/20 rounded-full ${
                      isRTL ? "font-arabic flex-row-reverse" : ""
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {t("article.feedback.notHelpful")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl mt-8">
            <CardHeader>
              <CardTitle
                className={`text-xl ${isRTL ? "font-arabic text-right" : ""}`}
              >
                {t("article.relatedArticles")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.slice(0, 4).map((relatedArticle, index) => (
                  <div
                    key={relatedArticle.id}
                    onClick={() => setSelectedArticle(`article-${index}`)}
                    className={`p-4 glass bg-white/40 dark:bg-slate-800/40 rounded-xl hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all cursor-pointer group ${
                      isRTL ? "text-right" : ""
                    }`}
                  >
                    <h4
                      className={`font-medium mb-2 group-hover:text-primary transition-colors ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {relatedArticle.title}
                    </h4>
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span
                        className={`text-xs text-muted-foreground ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t("article.readTime", {
                          minutes: relatedArticle.readTime,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${colors.bgColor} ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className={`mb-6 glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${
              isRTL ? "font-arabic flex-row-reverse" : ""
            }`}
          >
            <Link href="/help">
              <ArrowLeft
                className={`h-4 w-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`}
              />
              {t("backToHelp")}
            </Link>
          </Button>

          <div
            className={`flex items-center gap-4 mb-6 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`p-4 rounded-2xl bg-gradient-to-r ${colors.color} text-white`}
            >
              <Icon className="h-8 w-8" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <h1
                className={`text-4xl font-bold mb-2 ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {getTranslation(
                  `categories.${category}.title`,
                  "Help Category"
                )}
              </h1>
              <p
                className={`text-xl text-muted-foreground ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {getTranslation(
                  `categories.${category}.description`,
                  "Category description"
                )}
              </p>
            </div>
          </div>

          {/* Search */}
          <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="relative">
                <Search
                  className={`absolute top-3 h-5 w-5 text-muted-foreground ${
                    isRTL ? "right-3" : "left-3"
                  }`}
                />
                <Input
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl h-12 ${
                    isRTL ? "pr-10 font-arabic text-right" : "pl-10"
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <Card
              key={article.id}
              onClick={() => setSelectedArticle(article.id)}
              className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <CardHeader className="pb-4">
                <div
                  className={`flex items-start justify-between ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                    <CardTitle
                      className={`text-lg mb-2 group-hover:text-primary transition-colors ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {article.title}
                    </CardTitle>
                    <CardDescription
                      className={`${isRTL ? "font-arabic" : ""}`}
                    >
                      {article.description}
                    </CardDescription>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ${
                      isRTL ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CardHeader>

              <CardContent>
                <div
                  className={`flex items-center justify-between ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex items-center gap-4 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={`text-sm text-muted-foreground ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t("article.readTime", { minutes: article.readTime })}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span
                        className={`text-sm text-muted-foreground ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {article.helpful}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`glass bg-white/60 dark:bg-slate-800/60 text-xs ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t(`article.difficulty.${article.difficulty}`)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3
                className={`text-lg font-semibold mb-2 ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("search.noResults.title")}
              </h3>
              <p
                className={`text-muted-foreground mb-6 ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("search.noResults.description")}
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className={`glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("search.noResults.clearSearch")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact Support CTA */}
        <Card className="glass bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-md border border-blue-200/30 dark:border-blue-700/30 rounded-3xl mt-12">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3
              className={`text-2xl font-bold mb-4 ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {t("contactSupport.title")}
            </h3>
            <p
              className={`text-muted-foreground mb-6 ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {t("contactSupport.description")}
            </p>
            <Button
              className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full transition-all duration-200 hover:scale-105 ${
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
      </div>
    </div>
  );
}
