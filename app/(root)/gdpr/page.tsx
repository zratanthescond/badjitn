"use client"

import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Download, Trash2, Edit, Eye, Mail, FileText } from "lucide-react"
import Link from "next/link"

export default function GDPRPage() {
  const t = useTranslations("gdpr")
  const locale = useLocale()
  const isRTL = locale === "ar"

  const rights = [
    {
      key: "access",
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
    },
    {
      key: "rectification",
      icon: Edit,
      color: "from-green-500 to-emerald-500",
    },
    {
      key: "erasure",
      icon: Trash2,
      color: "from-red-500 to-pink-500",
    },
    {
      key: "portability",
      icon: Download,
      color: "from-purple-500 to-indigo-500",
    },
    {
      key: "restriction",
      icon: Shield,
      color: "from-orange-500 to-yellow-500",
    },
    {
      key: "objection",
      icon: FileText,
      color: "from-teal-500 to-cyan-500",
    },
  ]

  const dataTypes = [
    "personal_information",
    "account_data",
    "event_data",
    "payment_information",
    "usage_analytics",
    "communication_data",
  ]

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50/80 to-gray-100/80 dark:from-slate-900/80 dark:to-slate-800/80 ${isRTL ? "rtl" : "ltr"}`}
    >
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge
              className={`glass bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300 mb-6 ${isRTL ? "font-arabic" : ""}`}
            >
              {t("hero.badge")}
            </Badge>
            <h1
              className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ${isRTL ? "font-arabic" : ""}`}
            >
              {t("hero.title")}
            </h1>
            <p className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("hero.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("rights.title")}</h2>
            <p className={`text-lg text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("rights.description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rights.map((right) => {
              const Icon = right.icon
              return (
                <Card
                  key={right.key}
                  className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${right.color} text-white w-fit mb-4 ${isRTL ? "mr-auto" : ""}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className={`text-lg font-semibold mb-3 ${isRTL ? "font-arabic text-right" : ""}`}>
                      {t(`rights.items.${right.key}.title`)}
                    </h3>
                    <p className={`text-muted-foreground ${isRTL ? "font-arabic text-right" : ""}`}>
                      {t(`rights.items.${right.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data We Collect */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("data.title")}</h2>
            <p className={`text-lg text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("data.description")}</p>
          </div>

          <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dataTypes.map((dataType) => (
                  <div
                    key={dataType}
                    className={`p-6 glass bg-white/40 dark:bg-slate-800/40 rounded-2xl ${isRTL ? "text-right" : ""}`}
                  >
                    <h3 className={`text-lg font-semibold mb-3 ${isRTL ? "font-arabic" : ""}`}>
                      {t(`data.types.${dataType}.title`)}
                    </h3>
                    <p className={`text-muted-foreground mb-4 ${isRTL ? "font-arabic" : ""}`}>
                      {t(`data.types.${dataType}.description`)}
                    </p>
                    <div className={`space-y-2 ${isRTL ? "font-arabic" : ""}`}>
                      <p className="text-sm font-medium">{t("data.includes")}:</p>
                      <ul className={`text-sm text-muted-foreground space-y-1 ${isRTL ? "mr-4" : "ml-4"}`}>
                        {t(`data.types.${dataType}.examples`)
                          .split("|")
                          .map((example: string, index: number) => (
                            <li key={index}>• {example.trim()}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Legal Basis */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("legal.title")}</h2>
            <p className={`text-lg text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("legal.description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["consent", "contract", "legitimate_interest"].map((basis) => (
              <Card
                key={basis}
                className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl"
              >
                <CardContent className="p-6">
                  <h3 className={`text-lg font-semibold mb-3 ${isRTL ? "font-arabic text-right" : ""}`}>
                    {t(`legal.basis.${basis}.title`)}
                  </h3>
                  <p className={`text-muted-foreground ${isRTL ? "font-arabic text-right" : ""}`}>
                    {t(`legal.basis.${basis}.description`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Exercise Your Rights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="glass bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-md border border-blue-200/30 dark:border-blue-700/30 rounded-3xl">
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
              <h2 className={`text-3xl font-bold mb-6 ${isRTL ? "font-arabic" : ""}`}>{t("exercise.title")}</h2>
              <p className={`text-lg text-muted-foreground mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
                {t("exercise.description")}
              </p>
              <div className={`space-y-4 mb-8 text-left max-w-md mx-auto ${isRTL ? "text-right font-arabic" : ""}`}>
                <p>
                  <strong>{t("exercise.email")}:</strong> privacy@badji.net
                </p>
                <p>
                  <strong>{t("exercise.response")}:</strong> {t("exercise.responseTime")}
                </p>
                <p>
                  <strong>{t("exercise.verification")}:</strong> {t("exercise.verificationNote")}
                </p>
              </div>
              <div className={`flex items-center justify-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button
                  size="lg"
                  className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full ${isRTL ? "font-arabic" : ""}`}
                  asChild
                >
                  <Link href="/contact">{t("exercise.contact")}</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic" : ""}`}
                  asChild
                >
                  <Link href="/privacy">{t("exercise.privacy")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
