"use client"

import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Mail, Calendar, Scale } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  const t = useTranslations("terms")
  const locale = useLocale()
  const isRTL = locale === "ar"

  const sections = [
    "acceptance",
    "description",
    "user_accounts",
    "acceptable_use",
    "content",
    "payment_terms",
    "privacy",
    "intellectual_property",
    "disclaimers",
    "limitation_liability",
    "indemnification",
    "termination",
    "governing_law",
    "changes",
    "contact",
  ]

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50/80 to-gray-100/80 dark:from-slate-900/80 dark:to-slate-800/80 ${isRTL ? "rtl" : "ltr"}`}
    >
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white w-fit mx-auto mb-6">
              <Scale className="h-8 w-8" />
            </div>
            <h1
              className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${isRTL ? "font-arabic" : ""}`}
            >
              {t("hero.title")}
            </h1>
            <p className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("hero.description")}
            </p>
            <div
              className={`flex items-center justify-center gap-4 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse font-arabic" : ""}`}
            >
              <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Calendar className="h-4 w-4" />
                <span>{t("hero.lastUpdated")}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <FileText className="h-4 w-4" />
                <span>{t("hero.effectiveDate")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl">
              <CardContent className="p-8 md:p-12">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {/* Introduction */}
                  <div className={`mb-12 ${isRTL ? "text-right" : ""}`}>
                    <p className={`text-lg leading-relaxed ${isRTL ? "font-arabic" : ""}`}>{t("introduction")}</p>
                  </div>

                  {/* Sections */}
                  <div className="space-y-12">
                    {sections.map((section, index) => (
                      <div key={section} className={`${isRTL ? "text-right" : ""}`}>
                        <h2
                          className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isRTL ? "flex-row-reverse font-arabic" : ""}`}
                        >
                          <span className="text-purple-600 dark:text-purple-400">{index + 1}.</span>
                          {t(`sections.${section}.title`)}
                        </h2>
                        <div className={`space-y-4 ${isRTL ? "font-arabic" : ""}`}>
                          <p className="leading-relaxed">{t(`sections.${section}.content`)}</p>
                          {t(`sections.${section}.points`) && (
                            <ul className={`list-disc list-inside space-y-2 ml-4 ${isRTL ? "mr-4 ml-0" : ""}`}>
                              {t(`sections.${section}.points`)
                                .split("|")
                                .map((point: string, pointIndex: number) => (
                                  <li key={pointIndex} className="leading-relaxed">
                                    {point.trim()}
                                  </li>
                                ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Contact Section */}
                  <div
                    className={`mt-16 p-8 glass bg-purple-500/10 border border-purple-200/30 dark:border-purple-700/30 rounded-2xl ${isRTL ? "text-right" : ""}`}
                  >
                    <div className={`flex items-center gap-4 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <h3 className={`text-xl font-semibold ${isRTL ? "font-arabic" : ""}`}>{t("contact.title")}</h3>
                    </div>
                    <p className={`mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("contact.description")}</p>
                    <div className={`space-y-2 text-sm ${isRTL ? "font-arabic" : ""}`}>
                      <p>
                        <strong>{t("contact.email")}:</strong> legal@badji.net
                      </p>
                      <p>
                        <strong>{t("contact.address")}:</strong> {t("contact.addressValue")}
                      </p>
                    </div>
                    <Button
                      className={`mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full ${isRTL ? "font-arabic" : ""}`}
                      asChild
                    >
                      <Link href="/contact">{t("contact.button")}</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
