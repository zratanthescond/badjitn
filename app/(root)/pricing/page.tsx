"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Star, Zap, Crown, Users, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const t = useTranslations("pricing")
  const locale = useLocale()
  const isRTL = locale === "ar"
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      id: "starter",
      name: "Starter",
      icon: Users,
      popular: false,
      monthlyPrice: 0,
      annualPrice: 0,
      features: ["up_to_3_events", "basic_analytics", "email_support", "standard_templates", "basic_registration"],
    },
    {
      id: "professional",
      name: "Professional",
      icon: Zap,
      popular: true,
      monthlyPrice: 29,
      annualPrice: 290,
      features: [
        "unlimited_events",
        "advanced_analytics",
        "priority_support",
        "custom_branding",
        "payment_processing",
        "marketing_tools",
        "api_access",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Crown,
      popular: false,
      monthlyPrice: 99,
      annualPrice: 990,
      features: [
        "everything_in_pro",
        "dedicated_support",
        "custom_integrations",
        "advanced_security",
        "team_management",
        "white_label",
        "sla_guarantee",
      ],
    },
  ]

  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, all paid plans come with a 14-day free trial. No credit card required.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans.",
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
            <h1
              className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ${isRTL ? "font-arabic" : ""}`}
            >
              {t("hero.title")}
            </h1>
            <p className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("hero.description")}
            </p>

            {/* Billing Toggle */}
            <div className={`flex items-center justify-center gap-4 mb-12 ${isRTL ? "flex-row-reverse" : ""}`}>
              <span className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("billing.monthly")}</span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("billing.annual")}</span>
              <Badge className="bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30">
                {t("billing.save20")}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
              const originalPrice = isAnnual ? plan.monthlyPrice * 12 : null

              return (
                <Card
                  key={plan.id}
                  className={`glass backdrop-blur-md border rounded-3xl relative overflow-hidden hover:scale-105 transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200/30 dark:border-blue-700/30 scale-105"
                      : "bg-white/70 dark:bg-slate-900/70 border-white/20 dark:border-slate-700/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center py-2">
                      <div className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <Star className="h-4 w-4" />
                        <span className={`text-sm font-medium ${isRTL ? "font-arabic" : ""}`}>
                          {t("plans.popular")}
                        </span>
                      </div>
                    </div>
                  )}

                  <CardHeader className={`text-center ${plan.popular ? "pt-12" : "pt-6"}`}>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className={`text-2xl ${isRTL ? "font-arabic" : ""}`}>
                      {t(`plans.${plan.id}.name`)}
                    </CardTitle>
                    <div className="mt-4">
                      <div className={`flex items-baseline justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span className="text-4xl font-bold">${price}</span>
                        <span className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                          /{isAnnual ? t("billing.year") : t("billing.month")}
                        </span>
                      </div>
                      {isAnnual && originalPrice && originalPrice > 0 && (
                        <div className={`text-sm text-muted-foreground mt-1 ${isRTL ? "font-arabic" : ""}`}>
                          {t("billing.was")} ${originalPrice}/{t("billing.year")}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-6">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className={`text-sm ${isRTL ? "font-arabic text-right" : ""}`}>
                            {t(`features.${feature}`)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full rounded-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
                          : "glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80"
                      } ${isRTL ? "font-arabic" : ""}`}
                      asChild
                    >
                      <Link href={plan.id === "starter" ? "/signup" : `/checkout?plan=${plan.id}`}>
                        {plan.id === "starter" ? t("plans.getStarted") : t("plans.startTrial")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("comparison.title")}</h2>
            <p className={`text-lg text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
              {t("comparison.description")}
            </p>
          </div>

          <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20 dark:border-slate-700/50">
                      <th className={`p-6 text-left ${isRTL ? "text-right font-arabic" : ""}`}>
                        {t("comparison.feature")}
                      </th>
                      <th className={`p-6 text-center ${isRTL ? "font-arabic" : ""}`}>{t("plans.starter.name")}</th>
                      <th className={`p-6 text-center ${isRTL ? "font-arabic" : ""}`}>
                        {t("plans.professional.name")}
                      </th>
                      <th className={`p-6 text-center ${isRTL ? "font-arabic" : ""}`}>{t("plans.enterprise.name")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "events", starter: "3", pro: "Unlimited", enterprise: "Unlimited" },
                      { feature: "attendees", starter: "100", pro: "Unlimited", enterprise: "Unlimited" },
                      { feature: "analytics", starter: "Basic", pro: "Advanced", enterprise: "Advanced" },
                      { feature: "support", starter: "Email", pro: "Priority", enterprise: "Dedicated" },
                      { feature: "branding", starter: false, pro: true, enterprise: true },
                      { feature: "api", starter: false, pro: true, enterprise: true },
                      { feature: "integrations", starter: false, pro: "Standard", enterprise: "Custom" },
                    ].map((row, index) => (
                      <tr
                        key={row.feature}
                        className={`border-b border-white/10 dark:border-slate-700/30 ${
                          index % 2 === 0 ? "bg-white/20 dark:bg-slate-800/20" : ""
                        }`}
                      >
                        <td className={`p-6 font-medium ${isRTL ? "text-right font-arabic" : ""}`}>
                          {t(`comparison.features.${row.feature}`)}
                        </td>
                        <td className="p-6 text-center">
                          {typeof row.starter === "boolean" ? (
                            row.starter ? (
                              <Check className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )
                          ) : (
                            <span className={isRTL ? "font-arabic" : ""}>{row.starter}</span>
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {typeof row.pro === "boolean" ? (
                            row.pro ? (
                              <Check className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )
                          ) : (
                            <span className={isRTL ? "font-arabic" : ""}>{row.pro}</span>
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {typeof row.enterprise === "boolean" ? (
                            row.enterprise ? (
                              <Check className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )
                          ) : (
                            <span className={isRTL ? "font-arabic" : ""}>{row.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("faq.title")}</h2>
            <p className={`text-lg text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("faq.description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl"
              >
                <CardContent className="p-6">
                  <h3 className={`text-lg font-semibold mb-3 ${isRTL ? "font-arabic text-right" : ""}`}>
                    {faq.question}
                  </h3>
                  <p className={`text-muted-foreground ${isRTL ? "font-arabic text-right" : ""}`}>{faq.answer}</p>
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
              <MessageCircle className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
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
