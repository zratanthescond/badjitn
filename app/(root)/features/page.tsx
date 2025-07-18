"use client"

import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  Shield,
  Smartphone,
  Globe,
  Zap,
  Mail,
  QrCode,
  Video,
  MessageSquare,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function FeaturesPage() {
  const t = useTranslations("features")
  const locale = useLocale()
  const isRTL = locale === "ar"

  const mainFeatures = [
    {
      key: "event_management",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
    },
    {
      key: "attendee_management",
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
    {
      key: "payment_processing",
      icon: CreditCard,
      color: "from-purple-500 to-pink-500",
    },
    {
      key: "analytics",
      icon: BarChart3,
      color: "from-orange-500 to-red-500",
    },
    {
      key: "security",
      icon: Shield,
      color: "from-indigo-500 to-purple-500",
    },
    {
      key: "mobile_app",
      icon: Smartphone,
      color: "from-teal-500 to-cyan-500",
    },
  ]

  const additionalFeatures = [
    { key: "multi_language", icon: Globe },
    { key: "real_time", icon: Zap },
    { key: "email_marketing", icon: Mail },
    { key: "qr_codes", icon: QrCode },
    { key: "live_streaming", icon: Video },
    { key: "chat_support", icon: MessageSquare },
  ]

  const benefits = [
    "save_time",
    "increase_engagement",
    "boost_revenue",
    "reduce_costs",
    "improve_experience",
    "scale_easily",
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
            <div className={`flex items-center justify-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Button
                size="lg"
                className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full ${isRTL ? "font-arabic" : ""}`}
                asChild
              >
                <Link href="/signup">{t("hero.cta.start")}</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic" : ""}`}
                asChild
              >
                <Link href="/demo">{t("hero.cta.demo")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-6 ${isRTL ? "font-arabic" : ""}`}>{t("main.title")}</h2>
            <p className={`text-lg text-muted-foreground max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("main.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.key}
                  className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-8">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-r ${feature.color} text-white w-fit mb-6 ${isRTL ? "mr-auto" : ""}`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className={`text-2xl font-bold mb-4 ${isRTL ? "font-arabic text-right" : ""}`}>
                      {t(`main.features.${feature.key}.title`)}
                    </h3>
                    <p className={`text-muted-foreground mb-6 ${isRTL ? "font-arabic text-right" : ""}`}>
                      {t(`main.features.${feature.key}.description`)}
                    </p>
                    <ul className="space-y-2">
                      {["point1", "point2", "point3"].map((point) => (
                        <li key={point} className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className={`text-sm ${isRTL ? "font-arabic text-right" : ""}`}>
                            {t(`main.features.${feature.key}.${point}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className={isRTL ? "lg:order-2" : ""}>
              <Badge
                className={`glass bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 mb-4 ${isRTL ? "font-arabic" : ""}`}
              >
                {t("showcase.event.badge")}
              </Badge>
              <h2 className={`text-4xl font-bold mb-6 ${isRTL ? "font-arabic text-right" : ""}`}>
                {t("showcase.event.title")}
              </h2>
              <p className={`text-lg text-muted-foreground mb-8 ${isRTL ? "font-arabic text-right" : ""}`}>
                {t("showcase.event.description")}
              </p>
              <div className="space-y-4 mb-8">
                {["drag_drop", "templates", "customization", "publishing"].map((item) => (
                  <div key={item} className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className={`${isRTL ? "font-arabic text-right" : ""}`}>
                      {t(`showcase.event.features.${item}`)}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                className={`bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full ${
                  isRTL ? "font-arabic flex-row-reverse" : ""
                }`}
                asChild
              >
                <Link href="/signup">
                  {t("showcase.event.cta")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className={`${isRTL ? "lg:order-1" : ""}`}>
              <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Event Creation"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Analytics Dashboard"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <Badge
                className={`glass bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 mb-4 ${isRTL ? "font-arabic" : ""}`}
              >
                {t("showcase.analytics.badge")}
              </Badge>
              <h2 className={`text-4xl font-bold mb-6 ${isRTL ? "font-arabic" : ""}`}>
                {t("showcase.analytics.title")}
              </h2>
              <p className={`text-lg text-muted-foreground mb-8 ${isRTL ? "font-arabic" : ""}`}>
                {t("showcase.analytics.description")}
              </p>
              <div className="space-y-4 mb-8">
                {["real_time", "insights", "reports", "export"].map((item) => (
                  <div key={item} className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className={`${isRTL ? "font-arabic text-right" : ""}`}>
                      {t(`showcase.analytics.features.${item}`)}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full ${
                  isRTL ? "font-arabic flex-row-reverse" : ""
                }`}
                asChild
              >
                <Link href="/demo">
                  {t("showcase.analytics.cta")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-6 ${isRTL ? "font-arabic" : ""}`}>{t("additional.title")}</h2>
            <p className={`text-lg text-muted-foreground max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("additional.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.key}
                  className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className={isRTL ? "text-right" : ""}>
                        <h3 className={`text-lg font-semibold mb-2 ${isRTL ? "font-arabic" : ""}`}>
                          {t(`additional.features.${feature.key}.title`)}
                        </h3>
                        <p className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                          {t(`additional.features.${feature.key}.description`)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-6 ${isRTL ? "font-arabic" : ""}`}>{t("benefits.title")}</h2>
            <p className={`text-lg text-muted-foreground max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("benefits.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card
                key={benefit}
                className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className={`text-lg font-semibold mb-3 ${isRTL ? "font-arabic" : ""}`}>
                    {t(`benefits.items.${benefit}.title`)}
                  </h3>
                  <p className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                    {t(`benefits.items.${benefit}.description`)}
                  </p>
                </CardContent>
              </Card>
            ))}
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
                  <Link href="/signup">{t("cta.start")}</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic" : ""}`}
                  asChild
                >
                  <Link href="/pricing">{t("cta.pricing")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
