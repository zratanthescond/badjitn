"use client"

import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Globe, Heart, Shield, Rocket, Star, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  const t = useTranslations("about")
  const locale = useLocale()
  const isRTL = locale === "ar"

  const stats = [
    { key: "events", value: "50K+", icon: Calendar },
    { key: "users", value: "1M+", icon: Users },
    { key: "countries", value: "150+", icon: Globe },
    { key: "satisfaction", value: "98%", icon: Star },
  ]

  const values = [
    { key: "innovation", icon: Rocket },
    { key: "community", icon: Heart },
    { key: "excellence", icon: Award },
    { key: "security", icon: Shield },
  ]

  const team = [
    { key: "ceo", role: "CEO & Founder", image: "/placeholder.svg?height=200&width=200" },
    { key: "cto", role: "CTO", image: "/placeholder.svg?height=200&width=200" },
    { key: "cmo", role: "CMO", image: "/placeholder.svg?height=200&width=200" },
    { key: "head_product", role: "Head of Product", image: "/placeholder.svg?height=200&width=200" },
  ]

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50/80 to-gray-100/80 dark:from-slate-900/80 dark:to-slate-800/80 ${isRTL ? "rtl" : "ltr"}`}
    >
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
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
                <Link href="/contact">{t("hero.cta.contact")}</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic" : ""}`}
                asChild
              >
                <Link href="/careers">{t("hero.cta.careers")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card
                  key={stat.key}
                  className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl text-center"
                >
                  <CardContent className="p-6">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <p className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t(`stats.${stat.key}`)}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={isRTL ? "lg:order-2" : ""}>
              <h2 className={`text-4xl font-bold mb-6 ${isRTL ? "font-arabic text-right" : ""}`}>
                {t("mission.title")}
              </h2>
              <p className={`text-lg text-muted-foreground mb-6 ${isRTL ? "font-arabic text-right" : ""}`}>
                {t("mission.description")}
              </p>
              <div className="space-y-4">
                {["accessibility", "innovation", "community"].map((item) => (
                  <div key={item} className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className={`${isRTL ? "font-arabic text-right" : ""}`}>{t(`mission.points.${item}`)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${isRTL ? "lg:order-1" : ""}`}>
              <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Mission"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-6 ${isRTL ? "font-arabic" : ""}`}>{t("values.title")}</h2>
            <p className={`text-lg text-muted-foreground max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("values.description")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card
                  key={value.key}
                  className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-6 text-center">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className={`text-xl font-semibold mb-3 ${isRTL ? "font-arabic" : ""}`}>
                      {t(`values.items.${value.key}.title`)}
                    </h3>
                    <p className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                      {t(`values.items.${value.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-6 ${isRTL ? "font-arabic" : ""}`}>{t("team.title")}</h2>
            <p className={`text-lg text-muted-foreground max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("team.description")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <Card
                key={member.key}
                className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300"
              >
                <CardContent className="p-0">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={t(`team.members.${member.key}.name`)}
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 text-center">
                    <h3 className={`text-xl font-semibold mb-2 ${isRTL ? "font-arabic" : ""}`}>
                      {t(`team.members.${member.key}.name`)}
                    </h3>
                    <p className={`text-blue-600 dark:text-blue-400 mb-3 ${isRTL ? "font-arabic" : ""}`}>
                      {t(`team.members.${member.key}.role`)}
                    </p>
                    <p className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                      {t(`team.members.${member.key}.bio`)}
                    </p>
                  </div>
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
                  <Link href="/contact">{t("cta.contact")}</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic" : ""}`}
                  asChild
                >
                  <Link href="/careers">{t("cta.careers")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
