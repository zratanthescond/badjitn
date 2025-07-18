"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Clock, Briefcase, Search, Heart, Coffee, Zap, Globe, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function CareersPage() {
  const t = useTranslations("careers")
  const locale = useLocale()
  const isRTL = locale === "ar"
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  const benefits = [
    { key: "health", icon: Heart },
    { key: "flexible", icon: Clock },
    { key: "remote", icon: Globe },
    { key: "growth", icon: TrendingUp },
    { key: "coffee", icon: Coffee },
    { key: "innovation", icon: Zap },
  ]

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "engineering",
      location: "Remote",
      type: "full-time",
      experience: "senior",
      description: "Join our frontend team to build amazing user experiences.",
    },
    {
      id: 2,
      title: "Product Manager",
      department: "product",
      location: "Tunis, Tunisia",
      type: "full-time",
      experience: "mid",
      description: "Lead product strategy and development for our core platform.",
    },
    {
      id: 3,
      title: "UX/UI Designer",
      department: "design",
      location: "Remote",
      type: "full-time",
      experience: "mid",
      description: "Design beautiful and intuitive user interfaces.",
    },
    {
      id: 4,
      title: "DevOps Engineer",
      department: "engineering",
      location: "Hybrid",
      type: "full-time",
      experience: "senior",
      description: "Build and maintain our cloud infrastructure.",
    },
    {
      id: 5,
      title: "Marketing Specialist",
      department: "marketing",
      location: "Tunis, Tunisia",
      type: "full-time",
      experience: "junior",
      description: "Drive growth through creative marketing campaigns.",
    },
    {
      id: 6,
      title: "Customer Success Manager",
      department: "support",
      location: "Remote",
      type: "full-time",
      experience: "mid",
      description: "Help our customers succeed with our platform.",
    },
  ]

  const departments = ["all", "engineering", "product", "design", "marketing", "support"]

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || job.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

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
            <div className={`flex items-center justify-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Button
                size="lg"
                className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full ${isRTL ? "font-arabic" : ""}`}
              >
                {t("hero.cta")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("benefits.title")}</h2>
            <p className={`text-lg text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("benefits.description")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <Card
                  key={benefit.key}
                  className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl"
                >
                  <CardContent className="p-6">
                    <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className={isRTL ? "text-right" : ""}>
                        <h3 className={`text-lg font-semibold mb-2 ${isRTL ? "font-arabic" : ""}`}>
                          {t(`benefits.items.${benefit.key}.title`)}
                        </h3>
                        <p className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                          {t(`benefits.items.${benefit.key}.description`)}
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

      {/* Jobs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("jobs.title")}</h2>
            <p className={`text-lg text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("jobs.description")}</p>
          </div>

          {/* Search and Filter */}
          <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl mb-8">
            <CardContent className="p-6">
              <div className={`flex flex-col md:flex-row gap-4 ${isRTL ? "md:flex-row-reverse" : ""}`}>
                <div className="relative flex-1">
                  <Search className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                  <Input
                    placeholder={t("jobs.search.placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl h-12 ${
                      isRTL ? "pr-10 font-arabic text-right" : "pl-10"
                    }`}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {departments.map((dept) => (
                    <Button
                      key={dept}
                      variant={selectedDepartment === dept ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDepartment(dept)}
                      className={`rounded-full ${isRTL ? "font-arabic" : ""}`}
                    >
                      {t(`jobs.departments.${dept}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Listings */}
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRTL ? "md:flex-row-reverse" : ""}`}
                  >
                    <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                      <h3 className={`text-xl font-semibold mb-2 ${isRTL ? "font-arabic" : ""}`}>{job.title}</h3>
                      <p className={`text-muted-foreground mb-4 ${isRTL ? "font-arabic" : ""}`}>{job.description}</p>
                      <div className={`flex flex-wrap gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                            {t(`jobs.departments.${job.department}`)}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                            {job.location}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                            {t(`jobs.types.${job.type}`)}
                          </span>
                        </div>
                        <Badge variant="secondary" className={`${isRTL ? "font-arabic" : ""}`}>
                          {t(`jobs.experience.${job.experience}`)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full ${isRTL ? "font-arabic" : ""}`}
                      asChild
                    >
                      <Link href={`/careers/${job.id}`}>{t("jobs.apply")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl">
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className={`text-lg font-semibold mb-2 ${isRTL ? "font-arabic" : ""}`}>
                  {t("jobs.noResults.title")}
                </h3>
                <p className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                  {t("jobs.noResults.description")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
