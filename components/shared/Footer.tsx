"use client";

import { useTranslations, useLocale } from "next-intl";
import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
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
  ExternalLink,
} from "lucide-react";
import { setUserLocale } from "@/services/locale";
import { Locale } from "@/i18n/config";
import { localeOptions } from "@/lib/constants/locale-options";

const Footer = () => {
  const t = useTranslations("footer");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const currentYear = new Date().getFullYear();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      setUserLocale(newLocale as Locale);
    });
  };

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
    <footer className={`relative mt-20 font-outfit ${isRTL ? "rtl" : "ltr"}`}>
      <div className="glass-panel py-4 px-4 bg-primary/5 border-t border-white/5">
        <div className="wrapper flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-center w-8 h-8 rounded-full bg-primary/20">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-slate-500 font-medium">
              {t("gdpr.message")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-xs hover:bg-white/10" asChild>
              <Link href="/privacy">{t("gdpr.learnMore")}</Link>
            </Button>
            <Button size="sm" className="bg-primary text-white text-xs h-9 px-6 rounded-xl shadow-elite-glow hover:bg-primary-hover">
              {t("gdpr.accept")}
            </Button>
          </div>
        </div>
      </div>

      <div className="glass-panel border-t border-white/10 bg-white/5 dark:bg-elite-charcoal/40 backdrop-blur-3xl">
        <div className="wrapper py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
              <Image
                src="/assets/images/logo.png"
                width={140}
                height={42}
                alt="BadjiTn logo"
                className="object-cover hidden dark:block"
              />
              <Image
                src="/assets/images/logoDark.png"
                width={140}
                height={42}
                alt="BadjiTn logo"
                className="object-cover block dark:hidden"
              />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              {t("description")}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white">
                <div className="flex-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">contact@badji.net</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white">
                <div className="flex-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">+216 29 173 135</span>
              </div>
            </div>
          </div>

          {[
            { title: "company", links: footerLinks.company },
            { title: "support", links: footerLinks.support },
            { title: "product", links: footerLinks.product },
            { title: "legal", links: footerLinks.legal },
          ].map((column) => (
            <div key={column.title} className="space-y-6">
              <h3 className="font-syne font-bold text-sm uppercase tracking-widest text-slate-800 dark:text-white/90">
                {t(`sections.${column.title}`)}
              </h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-3 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all duration-300"
                    >
                      <link.icon className="h-4 w-4 opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:text-primary group-hover:scale-110" />
                      <span className="font-medium">{t(`links.${link.key}`)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="wrapper">
          <Separator className="bg-white/10" />
        </div>

        <div className="wrapper py-8 flex flex-col md:flex-row items-center justify-between gap-8 text-sm">
          <p className="text-slate-500 font-medium">
            {t("copyright", { year: currentYear })}
          </p>

          <div className="flex items-center gap-6">
            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              {t("followUs")}
            </span>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.key}
                  variant="outline"
                  size="icon"
                  className="w-9 h-9 border-white/10 glass-control hover:scale-110 active:scale-90"
                  asChild
                >
                  <Link href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-8">
            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              {t("language")}
            </span>
            <div className="flex items-center gap-1.5 glass-panel p-1 border border-white/5 rounded-2xl">
              {localeOptions.map((item) => (
                <button
                  key={item.value}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-xl transition-all duration-300 ${
                    locale === item.value
                      ? "bg-primary text-white shadow-elite-glow"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                  disabled={isPending}
                  onClick={() => handleLocaleChange(item.value)}
                >
                  <Image
                    src={item.flagSrc}
                    alt={item.flagAlt}
                    width={18}
                    height={12}
                    className="h-3 w-[18px] rounded-[2px] object-cover"
                  />
                  <span>{item.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
