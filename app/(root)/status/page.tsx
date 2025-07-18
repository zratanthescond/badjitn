"use client"

import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, Clock, Activity, Server, Database, Globe } from "lucide-react"

export default function StatusPage() {
  const t = useTranslations("status")
  const locale = useLocale()
  const isRTL = locale === "ar"

  const services = [
    {
      name: "API Gateway",
      status: "operational",
      uptime: "99.99%",
      responseTime: "45ms",
      icon: Server,
    },
    {
      name: "Database",
      status: "operational",
      uptime: "99.98%",
      responseTime: "12ms",
      icon: Database,
    },
    {
      name: "CDN",
      status: "operational",
      uptime: "99.97%",
      responseTime: "23ms",
      icon: Globe,
    },
    {
      name: "Payment Processing",
      status: "degraded",
      uptime: "99.85%",
      responseTime: "156ms",
      icon: Activity,
    },
  ]

  const incidents = [
    {
      title: "Increased API Response Times",
      status: "investigating",
      severity: "minor",
      startTime: "2024-01-15T14:30:00Z",
      description: "We are investigating reports of increased response times for API requests.",
    },
    {
      title: "Payment Processing Delays",
      status: "resolved",
      severity: "major",
      startTime: "2024-01-14T09:15:00Z",
      endTime: "2024-01-14T11:45:00Z",
      description: "Payment processing experienced delays. This issue has been resolved.",
    },
    {
      title: "Scheduled Maintenance",
      status: "completed",
      severity: "maintenance",
      startTime: "2024-01-13T02:00:00Z",
      endTime: "2024-01-13T04:00:00Z",
      description: "Scheduled database maintenance completed successfully.",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case "outage":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30"
      case "degraded":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"
      case "outage":
        return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30"
      case "investigating":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
      case "resolved":
        return "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30"
      case "maintenance":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/30"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30"
      case "major":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30"
      case "minor":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"
      case "maintenance":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/30"
    }
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
              className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent ${isRTL ? "font-arabic" : ""}`}
            >
              {t("hero.title")}
            </h1>
            <p className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {t("hero.description")}
            </p>
            <div className={`flex items-center justify-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <span className={`text-lg font-medium ${isRTL ? "font-arabic" : ""}`}>
                {t("hero.allSystemsOperational")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-2xl font-bold mb-8 ${isRTL ? "font-arabic text-right" : ""}`}>
              {t("services.title")}
            </h2>

            <div className="space-y-4">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <Card
                    key={index}
                    className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl"
                  >
                    <CardContent className="p-6">
                      <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Icon className="h-6 w-6 text-muted-foreground" />
                          <div className={isRTL ? "text-right" : ""}>
                            <h3 className={`text-lg font-semibold ${isRTL ? "font-arabic" : ""}`}>{service.name}</h3>
                            <div className={`flex items-center gap-4 mt-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                                {t("services.uptime")}: {service.uptime}
                              </span>
                              <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                                {t("services.responseTime")}: {service.responseTime}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                          {getStatusIcon(service.status)}
                          <Badge className={`${getStatusColor(service.status)} ${isRTL ? "font-arabic" : ""}`}>
                            {t(`services.status.${service.status}`)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-2xl font-bold mb-8 ${isRTL ? "font-arabic text-right" : ""}`}>
              {t("incidents.title")}
            </h2>

            <div className="space-y-6">
              {incidents.map((incident, index) => (
                <Card
                  key={index}
                  className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl"
                >
                  <CardHeader>
                    <div className={`flex items-start justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                        <CardTitle className={`text-lg mb-2 ${isRTL ? "font-arabic" : ""}`}>{incident.title}</CardTitle>
                        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                          <Badge className={`${getStatusColor(incident.status)} ${isRTL ? "font-arabic" : ""}`}>
                            {t(`incidents.status.${incident.status}`)}
                          </Badge>
                          <Badge className={`${getSeverityColor(incident.severity)} ${isRTL ? "font-arabic" : ""}`}>
                            {t(`incidents.severity.${incident.severity}`)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-muted-foreground mb-4 ${isRTL ? "font-arabic text-right" : ""}`}>
                      {incident.description}
                    </p>
                    <div className={`text-sm text-muted-foreground ${isRTL ? "text-right font-arabic" : ""}`}>
                      <p>
                        {t("incidents.started")}: {new Date(incident.startTime).toLocaleString(locale)}
                      </p>
                      {incident.endTime && (
                        <p>
                          {t("incidents.resolved")}: {new Date(incident.endTime).toLocaleString(locale)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="glass bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-md border border-blue-200/30 dark:border-blue-700/30 rounded-3xl">
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
                <h2 className={`text-3xl font-bold mb-6 ${isRTL ? "font-arabic" : ""}`}>{t("subscribe.title")}</h2>
                <p className={`text-lg text-muted-foreground mb-8 ${isRTL ? "font-arabic" : ""}`}>
                  {t("subscribe.description")}
                </p>
                <div className={`space-y-4 ${isRTL ? "font-arabic" : ""}`}>
                  <p className="text-sm text-muted-foreground">
                    <strong>{t("subscribe.email")}:</strong> status-updates@badji.net
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>{t("subscribe.rss")}:</strong> /status/rss
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>{t("subscribe.webhook")}:</strong> {t("subscribe.webhookDescription")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
