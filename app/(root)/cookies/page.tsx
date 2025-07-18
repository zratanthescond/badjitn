"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Cookie, Settings, Shield, BarChart3, Users } from "lucide-react"

export default function CookiesPage() {
  const t = useTranslations("cookies")
  const locale = useLocale()
  const isRTL = locale === "ar"

  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  })

  const cookieTypes = [
    {
      key: "necessary",
      icon: Shield,
      color: "text-green-600 dark:text-green-400",
      required: true,
    },
    {
      key: "analytics",
      icon: BarChart3,
      color: "text-blue-600 dark:text-blue-400",
      required: false,
    },
    {
      key: "marketing",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      required: false,
    },
    {
      key: "functional",
      icon: Settings,
      color: "text-orange-600 dark:text-orange-400",
      required: false,
    },
  ]

  const handlePreferenceChange = (key: string, value: boolean) => {
    if (key === "necessary") return // Can't disable necessary cookies
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const acceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    })
  }

  const acceptNecessary = () => {
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    })
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50/80 to-gray-100/80 dark:from-slate-900/80 dark:to-slate-800/80 ${isRTL ? "rtl" : "ltr"}`}
    >
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white w-fit mx-auto mb-6">
              <Cookie className="h-8 w-8" />
            </div>
            <h1
              className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent ${isRTL ? "font-arabic" : ""}`}
            >
              {t("hero.title")}
            </h1>
            <p className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("hero.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Preferences */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl mb-8">
              <CardContent className="p-8">
                <h2 className={`text-2xl font-bold mb-6 ${isRTL ? "font-arabic text-right" : ""}`}>
                  {t("preferences.title")}
                </h2>
                <p className={`text-muted-foreground mb-8 ${isRTL ? "font-arabic text-right" : ""}`}>
                  {t("preferences.description")}
                </p>

                <div className="space-y-6">
                  {cookieTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <div
                        key={type.key}
                        className={`flex items-center justify-between p-6 glass bg-white/40 dark:bg-slate-800/40 rounded-2xl ${isRTL ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`flex items-center gap-4 flex-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Icon className={`h-6 w-6 ${type.color}`} />
                          <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                            <h3 className={`text-lg font-semibold mb-2 ${isRTL ? "font-arabic" : ""}`}>
                              {t(`types.${type.key}.title`)}
                              {type.required && (
                                <span
                                  className={`ml-2 text-sm text-green-600 dark:text-green-400 ${isRTL ? "mr-2 ml-0" : ""}`}
                                >
                                  ({t("required")})
                                </span>
                              )}
                            </h3>
                            <p className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                              {t(`types.${type.key}.description`)}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences[type.key as keyof typeof preferences]}
                          onCheckedChange={(value) => handlePreferenceChange(type.key, value)}
                          disabled={type.required}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className={`flex items-center gap-4 mt-8 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Button
                    onClick={acceptAll}
                    className={`bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full ${isRTL ? "font-arabic" : ""}`}
                  >
                    {t("preferences.acceptAll")}
                  </Button>
                  <Button
                    onClick={acceptNecessary}
                    variant="outline"
                    className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic" : ""}`}
                  >
                    {t("preferences.acceptNecessary")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cookie Information */}
            <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl">
              <CardContent className="p-8">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className={`space-y-8 ${isRTL ? "text-right" : ""}`}>
                    <div>
                      <h2 className={`text-2xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>
                        {t("info.whatAreCookies.title")}
                      </h2>
                      <p className={`leading-relaxed ${isRTL ? "font-arabic" : ""}`}>
                        {t("info.whatAreCookies.content")}
                      </p>
                    </div>

                    <div>
                      <h2 className={`text-2xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>
                        {t("info.howWeUse.title")}
                      </h2>
                      <p className={`leading-relaxed mb-4 ${isRTL ? "font-arabic" : ""}`}>
                        {t("info.howWeUse.content")}
                      </p>
                      <ul className={`list-disc list-inside space-y-2 ml-4 ${isRTL ? "mr-4 ml-0 font-arabic" : ""}`}>
                        <li>{t("info.howWeUse.point1")}</li>
                        <li>{t("info.howWeUse.point2")}</li>
                        <li>{t("info.howWeUse.point3")}</li>
                        <li>{t("info.howWeUse.point4")}</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className={`text-2xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>
                        {t("info.thirdParty.title")}
                      </h2>
                      <p className={`leading-relaxed ${isRTL ? "font-arabic" : ""}`}>{t("info.thirdParty.content")}</p>
                    </div>

                    <div>
                      <h2 className={`text-2xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>
                        {t("info.control.title")}
                      </h2>
                      <p className={`leading-relaxed ${isRTL ? "font-arabic" : ""}`}>{t("info.control.content")}</p>
                    </div>
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
