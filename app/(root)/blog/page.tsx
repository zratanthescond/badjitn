"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, User, Search, ArrowRight, Tag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function BlogPage() {
  const t = useTranslations("blog")
  const locale = useLocale()
  const isRTL = locale === "ar"
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", "product", "engineering", "events", "tutorials", "company"]

  const posts = [
    {
      id: 1,
      title: "The Future of Event Management",
      excerpt: "Exploring how technology is reshaping the events industry and what it means for organizers.",
      category: "product",
      author: "Ahmed Ben Ali",
      date: "2024-01-15",
      readTime: 5,
      image: "/placeholder.svg?height=300&width=500",
      featured: true,
    },
    {
      id: 2,
      title: "Building Scalable Event Platforms",
      excerpt: "Technical insights into how we built our platform to handle millions of events.",
      category: "engineering",
      author: "Sarah Johnson",
      date: "2024-01-10",
      readTime: 8,
      image: "/placeholder.svg?height=300&width=500",
      featured: false,
    },
    {
      id: 3,
      title: "10 Tips for Successful Virtual Events",
      excerpt: "Learn how to create engaging virtual experiences that keep attendees coming back.",
      category: "events",
      author: "Mohamed Trabelsi",
      date: "2024-01-05",
      readTime: 6,
      image: "/placeholder.svg?height=300&width=500",
      featured: false,
    },
    {
      id: 4,
      title: "Getting Started with Event APIs",
      excerpt: "A comprehensive guide to integrating with our API for custom event solutions.",
      category: "tutorials",
      author: "Lisa Chen",
      date: "2024-01-01",
      readTime: 12,
      image: "/placeholder.svg?height=300&width=500",
      featured: false,
    },
    {
      id: 5,
      title: "Our Journey to Series A",
      excerpt: "Reflecting on our growth journey and what's next for Badji.net.",
      category: "company",
      author: "Ahmed Ben Ali",
      date: "2023-12-28",
      readTime: 4,
      image: "/placeholder.svg?height=300&width=500",
      featured: false,
    },
    {
      id: 6,
      title: "Event Security Best Practices",
      excerpt: "How to keep your events and attendee data secure in an increasingly digital world.",
      category: "events",
      author: "Sarah Johnson",
      date: "2023-12-20",
      readTime: 7,
      image: "/placeholder.svg?height=300&width=500",
      featured: false,
    },
  ]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredPost = posts.find((post) => post.featured)
  const regularPosts = filteredPosts.filter((post) => !post.featured)

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

      {/* Search and Filter */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl">
            <CardContent className="p-6">
              <div className={`flex flex-col md:flex-row gap-4 ${isRTL ? "md:flex-row-reverse" : ""}`}>
                <div className="relative flex-1">
                  <Search className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                  <Input
                    placeholder={t("search.placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 rounded-xl h-12 ${
                      isRTL ? "pr-10 font-arabic text-right" : "pl-10"
                    }`}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full ${isRTL ? "font-arabic" : ""}`}
                    >
                      {t(`categories.${category}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === "all" && !searchQuery && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-0">
                <div className={`grid grid-cols-1 lg:grid-cols-2 ${isRTL ? "lg:grid-cols-2" : ""}`}>
                  <div className={`${isRTL ? "lg:order-2" : ""}`}>
                    <Image
                      src={featuredPost.image || "/placeholder.svg"}
                      alt={featuredPost.title}
                      width={500}
                      height={300}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                  </div>
                  <div className={`p-8 flex flex-col justify-center ${isRTL ? "lg:order-1 text-right" : ""}`}>
                    <Badge className={`w-fit mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("featured")}</Badge>
                    <h2 className={`text-3xl font-bold mb-4 ${isRTL ? "font-arabic" : ""}`}>{featuredPost.title}</h2>
                    <p className={`text-muted-foreground mb-6 ${isRTL ? "font-arabic" : ""}`}>{featuredPost.excerpt}</p>
                    <div className={`flex items-center gap-4 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                          {featuredPost.author}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                          {new Date(featuredPost.date).toLocaleDateString(locale)}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                          {t("readTime", { minutes: featuredPost.readTime })}
                        </span>
                      </div>
                    </div>
                    <Button
                      className={`w-fit bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full ${
                        isRTL ? "font-arabic flex-row-reverse" : ""
                      }`}
                      asChild
                    >
                      <Link href={`/blog/${featuredPost.id}`}>
                        {t("readMore")}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Card
                key={post.id}
                className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300"
              >
                <CardContent className="p-0">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    width={500}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <Badge variant="secondary" className={`text-xs ${isRTL ? "font-arabic" : ""}`}>
                        {t(`categories.${post.category}`)}
                      </Badge>
                    </div>
                    <h3 className={`text-xl font-semibold mb-3 ${isRTL ? "font-arabic text-right" : ""}`}>
                      {post.title}
                    </h3>
                    <p className={`text-muted-foreground mb-4 ${isRTL ? "font-arabic text-right" : ""}`}>
                      {post.excerpt}
                    </p>
                    <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className={`text-xs text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                            {post.author}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className={`text-xs text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                            {t("readTime", { minutes: post.readTime })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-full ${isRTL ? "font-arabic flex-row-reverse" : ""}`}
                        asChild
                      >
                        <Link href={`/blog/${post.id}`}>
                          {t("readMore")}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className={`text-lg font-semibold mb-2 ${isRTL ? "font-arabic" : ""}`}>{t("noResults.title")}</h3>
                <p className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("noResults.description")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
