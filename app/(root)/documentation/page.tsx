"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Book, Code, Zap, Users, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function DocumentationPage() {
  const t = useTranslations("documentation")
  const locale = useLocale()
  const isRTL = locale === "ar"
  const [searchQuery, setSearchQuery] = useState("")

  const sections = [
    {
      key: "getting_started",
      icon: Zap,
      color: "from-green-500 to-emerald-500",
      articles: ["quick_start", "installation", "first_event", "basic_concepts"],
    },
    {
      key: "api_reference",
      icon: Code,
      color: "from-blue-500 to-cyan-500",
      articles: ["authentication", "events_api", "users_api", "webhooks"],
    },
    {
      key: "guides",
      icon: Book,
      color: "from-purple-500 to-pink-500",
      articles: ["event_management", "payment_setup", "analytics", "integrations"],
    },
    {
      key: "community",
      icon: Users,
      color: "from-orange-500 to-red-500",
      articles: ["contributing", "support", "examples", "best_practices"],
    },
  ]

  const quickLinks = [
    { key: "api_docs", href: "/api/docs", external: true },
    { key: "sdk", href: "/sdk", external: false },
    { key: "examples", href: "/examples", external: false },
    { key: "changelog", href: "/changelog", external: false },
  ]

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50/80 to-gray-100/80 dark:from-slate-900/80 dark:to-slate-800/80 ${isRTL ? "rtl" : "ltr"}`}
    >
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ${isRTL ? "font-arabic" : ""}`}
            >
              {t("hero.title")}
            </h1>
            <p className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("hero.description")}
            </p>

            {/* Search */}
            <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl max-w-md mx-auto">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                  <Input
                    placeholder={t("hero.search")}
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
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}>{t("quickLinks.title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {quickLinks.map((link) => (
              <Button
                key={link.key}
                variant="outline"
                className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-xl h-auto p-4 ${
                  isRTL ? "font-arabic flex-row-reverse" : ""
                }`}
                asChild
              >
                <Link href={link.href} target={link.external ? "_blank" : undefined}>
                  <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <span>{t(`quickLinks.${link.key}`)}</span>
                    {link.external && <ExternalLink className="h-4 w-4" />}
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <Card
                  key={section.key}
                  className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl"
                >
                  <CardContent className="p-8">
                    <div className={`flex items-center gap-4 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className={isRTL ? "text-right" : ""}>
                        <h3 className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}>
                          {t(`sections.${section.key}.title`)}
                        </h3>
                        <p className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                          {t(`sections.${section.key}.description`)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {section.articles.map((article) => (
                        <Link
                          key={article}
                          href={`/docs/${section.key}/${article}`}
                          className={`flex items-center justify-between p-4 glass bg-white/40 dark:bg-slate-800/40 rounded-xl hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all group ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div className={isRTL ? "text-right" : ""}>
                            <h4
                              className={`font-medium group-hover:text-primary transition-colors ${isRTL ? "font-arabic" : ""}`}
                            >
                              {t(`sections.${section.key}.articles.${article}.title`)}
                            </h4>
                            <p className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                              {t(`sections.${section.key}.articles.${article}.description`)}
                            </p>
                          </div>
                          <ArrowRight
                            className={`h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ${isRTL ? "rotate-180" : ""}`}
                          />
                        </Link>
                      ))}
                    </div>

                    <Button
                      className={`w-full mt-6 bg-gradient-to-r ${section.color} hover:opacity-90 text-white border-0 rounded-full ${isRTL ? "font-arabic" : ""}`}
                      asChild
                    >
                      <Link href={`/docs/${section.key}`}>{t(`sections.${section.key}.viewAll`)}</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="glass bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-md border border-blue-200/30 dark:border-blue-700/30 rounded-3xl">
            <CardContent className="p-12 text-center">
              <h2 className={`text-3xl font-bold mb-6 ${isRTL ? "font-arabic" : ""}`}>{t("cta.title")}</h2>
              <p className={`text-lg text-muted-foreground mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
                {t("cta.description")}
              </p>
              <div className={`flex items-center justify-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button
                  size="lg"
                  className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full ${isRTL ? "font-arabic" : ""}`}
                  asChild
                >
                  <Link href="/signup">{t("cta.getStarted")}</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic" : ""}`}
                  asChild
                >
                  <Link href="/contact">{t("cta.contact")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
