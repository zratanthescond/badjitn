"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Shield,
  FileText,
  HelpCircle,
  Users,
  Calendar,
  CreditCard,
  ExternalLink,
} from "lucide-react";

const Footer = () => {
  const t = useTranslations("footer");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { key: "about", href: "/about", icon: Users },
      { key: "careers", href: "/careers", icon: Users },
      { key: "contact", href: "/contact", icon: Mail },
      { key: "blog", href: "/blog", icon: FileText },
    ],
    support: [
      { key: "helpCenter", href: "/help", icon: HelpCircle },
      { key: "documentation", href: "/docs", icon: FileText },
      { key: "community", href: "/community", icon: Users },
      { key: "status", href: "/status", icon: Shield },
    ],
    product: [
      { key: "events", href: "/events", icon: Calendar },
      { key: "pricing", href: "/pricing", icon: CreditCard },
      { key: "features", href: "/features", icon: FileText },
      { key: "integrations", href: "/integrations", icon: ExternalLink },
    ],
    legal: [
      { key: "privacy", href: "/privacy", icon: Shield },
      { key: "terms", href: "/terms", icon: FileText },
      { key: "cookies", href: "/cookies", icon: Shield },
      { key: "gdpr", href: "/gdpr", icon: Shield },
    ],
  };

  const socialLinks = [
    { key: "facebook", href: "https://facebook.com/badjitn", icon: Facebook },
    { key: "twitter", href: "https://twitter.com/badjitn", icon: Twitter },
    {
      key: "instagram",
      href: "https://instagram.com/badjitn",
      icon: Instagram,
    },
    {
      key: "linkedin",
      href: "https://linkedin.com/company/badjitn",
      icon: Linkedin,
    },
    { key: "youtube", href: "https://youtube.com/@badjitn", icon: Youtube },
  ];

  return (
    <footer className={`relative mt-20 ${isRTL ? "rtl" : "ltr"}`}>
      {/* GDPR Banner - if needed */}
      <div className="glass bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-md border-t border-blue-200/30 dark:border-blue-700/30">
        <div className="container mx-auto px-4 py-3">
          <div
            className={`flex items-center justify-between ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p
                className={`text-sm text-muted-foreground ${
                  isRTL ? "font-arabic text-right" : ""
                }`}
              >
                {t("gdpr.message")}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Button
                variant="outline"
                size="sm"
                className={`glass bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full text-xs ${
                  isRTL ? "font-arabic" : ""
                }`}
                asChild
              >
                <Link href="/privacy">{t("gdpr.learnMore")}</Link>
              </Button>
              <Button
                size="sm"
                className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-full text-xs ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("gdpr.accept")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="glass bg-gradient-to-br from-slate-50/80 to-gray-100/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-md border-t border-white/20 dark:border-slate-700/50">
        <div className="container mx-auto px-4 py-12">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
            {/* Brand Section */}
            <div className={`lg:col-span-2 ${isRTL ? "text-right" : ""}`}>
              <Link href="/" className="inline-block mb-4">
                <Image
                  src="/assets/images/logo.png"
                  width={128}
                  height={38}
                  alt="BadjiTn logo"
                  className="object-cover hidden dark:block"
                />
                <Image
                  src="/assets/images/logoDark.png"
                  width={128}
                  height={38}
                  alt="BadjiTn logo"
                  className="object-cover block dark:hidden"
                />
              </Link>
              <p
                className={`text-muted-foreground mb-4 max-w-sm ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("description")}
              </p>

              {/* Contact Info */}
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-2 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={`text-sm text-muted-foreground ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    contact@badji.net
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={`text-sm text-muted-foreground ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    +216 XX XXX XXX
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={`text-sm text-muted-foreground ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("location")}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div className={isRTL ? "text-right" : ""}>
              <h3
                className={`font-semibold mb-4 ${isRTL ? "font-arabic" : ""}`}
              >
                {t("sections.company")}
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.key}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors ${
                          isRTL ? "flex-row-reverse font-arabic" : ""
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {t(`links.${link.key}`)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Support Links */}
            <div className={isRTL ? "text-right" : ""}>
              <h3
                className={`font-semibold mb-4 ${isRTL ? "font-arabic" : ""}`}
              >
                {t("sections.support")}
              </h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.key}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors ${
                          isRTL ? "flex-row-reverse font-arabic" : ""
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {t(`links.${link.key}`)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Product Links */}
            <div className={isRTL ? "text-right" : ""}>
              <h3
                className={`font-semibold mb-4 ${isRTL ? "font-arabic" : ""}`}
              >
                {t("sections.product")}
              </h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.key}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors ${
                          isRTL ? "flex-row-reverse font-arabic" : ""
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {t(`links.${link.key}`)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Legal Links */}
            <div className={isRTL ? "text-right" : ""}>
              <h3
                className={`font-semibold mb-4 ${isRTL ? "font-arabic" : ""}`}
              >
                {t("sections.legal")}
              </h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.key}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors ${
                          isRTL ? "flex-row-reverse font-arabic" : ""
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {t(`links.${link.key}`)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-white/20 dark:bg-slate-700/50" />

          {/* Bottom Section */}
          <div
            className={`flex flex-col md:flex-row items-center justify-between gap-4 ${
              isRTL ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Copyright */}
            <p
              className={`text-sm text-muted-foreground ${
                isRTL ? "font-arabic text-right" : ""
              }`}
            >
              {t("copyright", { year: currentYear })}
            </p>

            {/* Social Links */}
            <div
              className={`flex items-center gap-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <span
                className={`text-sm text-muted-foreground ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("followUs")}
              </span>
              <div
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Button
                      key={social.key}
                      variant="ghost"
                      size="sm"
                      className="glass bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-700/60 rounded-full h-8 w-8 p-0"
                      asChild
                    >
                      <Link
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="sr-only">
                          {t(`social.${social.key}`)}
                        </span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Language Selector */}
            <div
              className={`flex items-center gap-2 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <span
                className={`text-sm text-muted-foreground ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("language")}:
              </span>
              <div
                className={`flex items-center gap-1 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Button
                  variant={locale === "en" ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs rounded-full"
                  asChild
                >
                  <Link href="#">EN</Link>
                </Button>
                <Button
                  variant={locale === "fr" ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs rounded-full"
                  asChild
                >
                  <Link href="#">FR</Link>
                </Button>
                <Button
                  variant={locale === "ar" ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs rounded-full font-arabic"
                  asChild
                >
                  <Link href="#">عر</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
