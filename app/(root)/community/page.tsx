"use client"

import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  MessageSquare,
  Github,
  Twitter,
  DiscIcon as Discord,
  Calendar,
  Award,
  Heart,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CommunityPage() {
  const t = useTranslations("community")
  const locale = useLocale()
  const isRTL = locale === "ar"

  const platforms = [
    {
      key: "discord",
      icon: Discord,
      color: "from-indigo-500 to-purple-500",
      href: "https://discord.gg/badjitn",
      members: "5.2K",
    },
    {
      key: "github",
      icon: Github,
      color: "from-gray-500 to-slate-500",
      href: "https://github.com/badjitn",
      members: "2.1K",
    },
    {
      key: "twitter",
      icon: Twitter,
      color: "from-blue-500 to-cyan-500",
      href: "https://twitter.com/badjitn",
      members: "8.7K",
    },
    {
      key: "forum",
      icon: MessageSquare,
      color: "from-green-500 to-emerald-500",
      href: "/forum",
      members: "3.4K",
    },
  ]

  const events = [
    {
      title: "Monthly Community Call",
      date: "2024-02-15",
      time: "15:00 UTC",
      type: "virtual",
      attendees: 150,
    },
    {
      title: "Badji.net Developer Meetup",
      date: "2024-02-20",
      time: "18:00 CET",
      type: "in-person",
      attendees: 50,
    },
    {
      title: "API Workshop",
      date: "2024-02-25",
      time: "14:00 UTC",
      type: "virtual",
      attendees: 200,
    },
  ]

  const contributors = [
    {
      name: "Ahmed Ben Ali",
      role: "Core Maintainer",
      contributions: 245,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Sarah Johnson",
      role: "Documentation Lead",
      contributions: 189,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Mohamed Trabelsi",
      role: "Community Manager",
      contributions: 156,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Lisa Chen",
      role: "UX Contributor",
      contributions: 134,
      avatar: "/placeholder.svg?height=60&width=60",
    },
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
              className={`glass bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 mb-6 ${isRTL ? "font-arabic" : ""}`}
            >
              {t("hero.badge")}
            </Badge>
            <h1
              className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${isRTL ? "font-arabic" : ""}`}
            >
              {t("hero.title")}
            </h1>
            <p className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("hero.description")}
            </p>
            <div className={`flex items-center justify-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Button
                size="lg"
                className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full ${isRTL ? "font-arabic" : ""}`}
                asChild
              >
                <Link href="https://discord.gg/badjitn" target="_blank">
                  {t("hero.cta.join")}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic" : ""}`}
                asChild
              >
                <Link href="/documentation">{t("hero.cta.contribute")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Platforms */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("platforms.title")}</h2>
            <p className={`text-lg text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
              {t("platforms.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform) => {
              const Icon = platform.icon
              return (
                <Card
                  key={platform.key}
                  className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-6 text-center">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${platform.color} text-white w-fit mx-auto mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${isRTL ? "font-arabic" : ""}`}>
                      {t(`platforms.items.${platform.key}.title`)}
                    </h3>
                    <p className={`text-muted-foreground mb-4 ${isRTL ? "font-arabic" : ""}`}>
                      {t(`platforms.items.${platform.key}.description`)}
                    </p>
                    <div className={`flex items-center justify-center gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                        {platform.members} {t("platforms.members")}
                      </span>
                    </div>
                    <Button
                      className={`w-full bg-gradient-to-r ${platform.color} hover:opacity-90 text-white border-0 rounded-full ${
                        isRTL ? "font-arabic flex-row-reverse" : ""
                      }`}
                      asChild
                    >
                      <Link href={platform.href} target={platform.href.startsWith("http") ? "_blank" : undefined}>
                        {t("platforms.join")}
                        {platform.href.startsWith("http") && <ExternalLink className="h-4 w-4 ml-2" />}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("events.title")}</h2>
            <p className={`text-lg text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("events.description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <Card
                key={index}
                className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Badge
                      variant={event.type === "virtual" ? "default" : "secondary"}
                      className={`text-xs ${isRTL ? "font-arabic" : ""}`}
                    >
                      {t(`events.types.${event.type}`)}
                    </Badge>
                  </div>
                  <h3 className={`text-lg font-semibold mb-3 ${isRTL ? "font-arabic text-right" : ""}`}>
                    {event.title}
                  </h3>
                  <div className={`space-y-2 mb-4 ${isRTL ? "text-right font-arabic" : ""}`}>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString(locale)} • {event.time}
                    </p>
                    <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {event.attendees} {t("events.attendees")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className={`w-full glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic" : ""}`}
                  >
                    {t("events.register")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Contributors */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("contributors.title")}</h2>
            <p className={`text-lg text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
              {t("contributors.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contributors.map((contributor, index) => (
              <Card
                key={index}
                className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl text-center"
              >
                <CardContent className="p-6">
                  <Image
                    src={contributor.avatar || "/placeholder.svg"}
                    alt={contributor.name}
                    width={60}
                    height={60}
                    className="rounded-full mx-auto mb-4"
                  />
                  <h3 className={`text-lg font-semibold mb-2 ${isRTL ? "font-arabic" : ""}`}>{contributor.name}</h3>
                  <p className={`text-sm text-blue-600 dark:text-blue-400 mb-3 ${isRTL ? "font-arabic" : ""}`}>
                    {contributor.role}
                  </p>
                  <div className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                      {contributor.contributions} {t("contributors.contributions")}
                    </span>
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
          <Card className="glass bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-purple-200/30 dark:border-purple-700/30 rounded-3xl">
            <CardContent className="p-12 text-center">
              <Heart className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-6" />
              <h2 className={`text-3xl font-bold mb-6 ${isRTL ? "font-arabic" : ""}`}>{t("cta.title")}</h2>
              <p className={`text-lg text-muted-foreground mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
                {t("cta.description")}
              </p>
              <div className={`flex items-center justify-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button
                  size="lg"
                  className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full ${isRTL ? "font-arabic" : ""}`}
                  asChild
                >
                  <Link href="https://github.com/badjitn" target="_blank">
                    {t("cta.contribute")}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic" : ""}`}
                  asChild
                >
                  <Link href="/help">{t("cta.help")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
