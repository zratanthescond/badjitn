"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle, Globe, Users, Headphones } from "lucide-react"

export default function ContactPage() {
  const t = useTranslations("contact")
  const locale = useLocale()
  const isRTL = locale === "ar"
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contactMethods = [
    {
      key: "email",
      icon: Mail,
      value: "contact@badji.net",
      href: "mailto:contact@badji.net",
    },
    {
      key: "phone",
      icon: Phone,
      value: "+216 XX XXX XXX",
      href: "tel:+216XXXXXXX",
    },
    {
      key: "address",
      icon: MapPin,
      value: "Tunis, Tunisia",
      href: "#",
    },
  ]

  const supportOptions = [
    { key: "general", icon: MessageCircle },
    { key: "technical", icon: Headphones },
    { key: "sales", icon: Users },
    { key: "partnerships", icon: Globe },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    // Handle form submission here
  }

  if (isSubmitted) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-slate-50/80 to-gray-100/80 dark:from-slate-900/80 dark:to-slate-800/80 flex items-center justify-center ${isRTL ? "rtl" : "ltr"}`}
      >
        <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="p-4 rounded-full bg-green-500/10 border border-green-500/30 w-fit mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("success.title")}</h2>
            <p className={`text-muted-foreground mb-6 ${isRTL ? "font-arabic" : ""}`}>{t("success.description")}</p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full ${isRTL ? "font-arabic" : ""}`}
            >
              {t("success.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method) => {
              const Icon = method.icon
              return (
                <Card
                  key={method.key}
                  className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-6 text-center">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isRTL ? "font-arabic" : ""}`}>
                      {t(`methods.${method.key}.title`)}
                    </h3>
                    <p className={`text-muted-foreground mb-4 ${isRTL ? "font-arabic" : ""}`}>
                      {t(`methods.${method.key}.description`)}
                    </p>
                    <a
                      href={method.href}
                      className={`text-blue-600 dark:text-blue-400 hover:underline ${isRTL ? "font-arabic" : ""}`}
                    >
                      {method.value}
                    </a>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl">
              <CardHeader>
                <CardTitle className={`text-2xl ${isRTL ? "font-arabic text-right" : ""}`}>{t("form.title")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className={isRTL ? "font-arabic text-right block" : ""}>
                        {t("form.fields.firstName")}
                      </Label>
                      <Input
                        id="firstName"
                        required
                        className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl ${
                          isRTL ? "font-arabic text-right" : ""
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className={isRTL ? "font-arabic text-right block" : ""}>
                        {t("form.fields.lastName")}
                      </Label>
                      <Input
                        id="lastName"
                        required
                        className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl ${
                          isRTL ? "font-arabic text-right" : ""
                        }`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className={isRTL ? "font-arabic text-right block" : ""}>
                      {t("form.fields.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl ${
                        isRTL ? "font-arabic text-right" : ""
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className={isRTL ? "font-arabic text-right block" : ""}>
                      {t("form.fields.subject")}
                    </Label>
                    <Input
                      id="subject"
                      required
                      className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl ${
                        isRTL ? "font-arabic text-right" : ""
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className={isRTL ? "font-arabic text-right block" : ""}>
                      {t("form.fields.message")}
                    </Label>
                    <Textarea
                      id="message"
                      rows={5}
                      required
                      className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl resize-none ${
                        isRTL ? "font-arabic text-right" : ""
                      }`}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className={`w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full ${
                      isRTL ? "font-arabic flex-row-reverse" : ""
                    }`}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {t("form.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Support Options */}
            <div className="space-y-6">
              <div className={isRTL ? "text-right" : ""}>
                <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("support.title")}</h2>
                <p className={`text-lg text-muted-foreground mb-8 ${isRTL ? "font-arabic" : ""}`}>
                  {t("support.description")}
                </p>
              </div>

              <div className="space-y-4">
                {supportOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <Card
                      key={option.key}
                      className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl hover:scale-[1.02] transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                            <h3 className={`text-lg font-semibold mb-2 ${isRTL ? "font-arabic" : ""}`}>
                              {t(`support.options.${option.key}.title`)}
                            </h3>
                            <p className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                              {t(`support.options.${option.key}.description`)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Business Hours */}
              <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl">
                <CardContent className="p-6">
                  <div className={`flex items-center gap-4 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h3 className={`text-lg font-semibold ${isRTL ? "font-arabic" : ""}`}>{t("hours.title")}</h3>
                  </div>
                  <div className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                    <p className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("hours.weekdays")}</p>
                    <p className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("hours.weekends")}</p>
                    <p className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                      {t("hours.timezone")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
