"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Event } from "@/types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { differenceInDays, format } from "date-fns";
import { enUS, es, fr, de, ar } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { SignedIn, SignedOut } from "./shared/AuthWrappers";
import { useRouter, usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarIcon,
  DoorOpen,
  MapPin,
  Menu,
  MessageSquareIcon,
  Wallet,
  Clock,
  Users,
  Loader2,
  Globe,
  ArrowUp,
} from "lucide-react";
import EventLocationComponent from "./shared/eventLocationComponent";
import EventPriceComponent from "./shared/EventPriceComponent";
import FeedBackComponent from "./shared/FeedBackComponent";
import { TiptapRenderer } from "./shared/TiptapRenderer";

interface ReelDetailsProps {
  event: Event;
}

type SectionType = "details" | "date" | "location" | "registration" | "feedback";

// Date locales mapping
const dateLocales = {
  en: enUS,
  es: es,
  fr: fr,
  de: de,
  ar: ar,
} as const;

// Language options
const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

export default function ReelDetails({ event }: ReelDetailsProps) {
  const t = useTranslations("event");
  const tx = (key: string, fallback: string) => (t.has(key as any) ? t(key as any) : fallback);
  const registrationTabLabel = t.has("tabs.registration")
    ? t("tabs.registration")
    : "Registration";
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [section, setSection] = useState<SectionType>("details");
  const [isJoining, setIsJoining] = useState(false);
  const isPast = new Date(event.endDateTime) < new Date();
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const scrollPanelToTop = useCallback(() => {
    const scrollable = rootRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
    if (scrollable) {
      scrollable.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Only reveal the scroll-to-top button once the user has scrolled down a
  // bit within the registration panel — no point showing it right at the top.
  // The panel auto-scrolls a little when switching tabs, so the "top" we
  // compare against is wherever it settles right after switching, not 0.
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const scrollable = rootRef.current?.closest(".overflow-y-auto") as HTMLElement | null;

    if (section !== "registration") {
      setShowScrollTop(false);
      // Restore the default hidden scrollbar on every other tab.
      scrollable?.classList.remove("thin-scrollbar");
      scrollable?.classList.add("no-scrollbar");
      return;
    }
    if (!scrollable) return;

    // Show a small, subtle scrollbar only while browsing the registration form.
    scrollable.classList.remove("no-scrollbar");
    scrollable.classList.add("thin-scrollbar");

    let baseline = scrollable.scrollTop;
    const settle = window.setTimeout(() => {
      baseline = scrollable.scrollTop;
    }, 300);

    const handleScroll = () => setShowScrollTop(scrollable.scrollTop > baseline + 200);
    scrollable.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.clearTimeout(settle);
      scrollable.removeEventListener("scroll", handleScroll);
      scrollable.classList.remove("thin-scrollbar");
      scrollable.classList.add("no-scrollbar");
    };
  }, [section]);

  // Get the appropriate date-fns locale object
  const dateLocale =
    dateLocales[locale as keyof typeof dateLocales] || dateLocales.en;
  const currentLanguage = languages.find((lang) => lang.code === locale);

  const handleLanguageChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const handleJoinEvent = useCallback(async () => {
    if (isJoining) return;
    setIsJoining(true);
    try {
      console.log("Joining event:", event._id);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Failed to join event:", error);
    } finally {
      setIsJoining(false);
    }
  }, [event._id, isJoining]);

  const DetailComponent = useCallback(() => {
    return (
      <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="glass-panel p-3 md:p-4 text-center space-y-3 rounded-3xl overflow-hidden relative w-full max-w-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-elite-cyan to-elite-violet opacity-50" />
          
          <div className="space-y-2 w-full max-w-full">
            <h1 className="text-2xl md:text-3xl font-syne font-extrabold tracking-tighter text-slate-900 dark:text-white leading-tight break-words max-w-full">
              {event.title}
            </h1>
            <p className="text-xs md:text-sm font-outfit font-bold uppercase tracking-widest text-primary/80">
              {event.organisation?.name ? `${tx("hostedBy", "Hosted by")} ${event.organisation.name}` : `${tx("organizer", "Organizer")}: @${event.organizer.username}`}
            </p>
          </div>

          {/* Event Stats */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-sm w-full">
            {event.attendees && (
              <div className="glass-control rounded-full px-5 py-2 flex items-center gap-2 shadow-elite-soft">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-outfit font-bold text-slate-700 dark:text-slate-200">
                  {t("attendees", { count: event.attendees.length })}
                </span>
              </div>
            )}
            <div className="glass-control rounded-full px-5 py-2 flex items-center gap-2 shadow-elite-soft">
              <CalendarDays className="h-4 w-4 text-elite-cyan" />
              <span className="font-outfit font-bold text-slate-700 dark:text-slate-200">
                {format(new Date(event.startDateTime), "MMM d, yyyy", {
                  locale: dateLocale,
                })}
              </span>
            </div>
          </div>

          {/* Join Button */}
          <div className="pt-4">
            {isPast ? (
              <Button
                disabled
                size="lg"
                className="rounded-2xl min-w-[200px] h-14 text-lg cursor-not-allowed opacity-60 bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                {t("pastEvent")}
              </Button>
            ) : event.url ? (
              <a href={event.url} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="elite" className="rounded-2xl min-w-[200px] h-14 text-lg">
                  {t("joinButton")}
                </Button>
              </a>
            ) : (
              <>
                <SignedIn>
                  <Button
                    onClick={() => setSection("registration")}
                    size="lg"
                    variant="elite"
                    className="rounded-2xl min-w-[200px] h-14 text-lg"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        {t("joining")}
                      </>
                    ) : (
                      t("joinButton")
                    )}
                  </Button>
                </SignedIn>
                <SignedOut>
                  <Button
                    onClick={() => setSection("registration")}
                    size="lg"
                    variant="elite"
                    className="rounded-2xl min-w-[200px] h-14 text-lg"
                  >
                    {t("joinButton")}
                  </Button>
                </SignedOut>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="glass-panel p-3 md:p-4 rounded-3xl w-full overflow-hidden">
           <div className="prose prose-slate dark:prose-invert max-w-none break-all text-sm md:text-base">
             <TiptapRenderer content={event.description} />
           </div>
        </div>
      </div>
    );
  }, [event, handleJoinEvent, isJoining, t, dateLocale, router]);

  const DateComponent = useCallback(() => {
    const formatDate = (date: Date | string) => {
      const d = typeof date === "string" ? new Date(date) : date;
      return format(d, "EEE, MMM d, h:mm a", { locale: dateLocale });
    };

    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const daysDifference = differenceInDays(end, start);
    const hasDaysDifference = daysDifference > 0;

    return (
      <div className="space-y-6 w-full animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-syne font-bold text-slate-900 dark:text-white">{t("schedule")}</h3>
            <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Doors Open */}
            <div className="glass-control p-5 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <DoorOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-0.5">{t("doorsOpen")}</p>
                  <p className="font-outfit font-bold text-slate-900 dark:text-white">{tx("checkInBegins", "Check-in begins")}</p>
                </div>
              </div>
              <Badge variant="outline" className="h-10 px-4 font-mono text-base border-primary/20 bg-primary/5 text-primary">
                {format(start, "h:mm a", { locale: dateLocale })}
              </Badge>
            </div>

            {/* Start Date */}
            <div className="glass-control p-5 rounded-2xl flex items-center justify-between group hover:border-elite-cyan/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-elite-cyan/10 flex items-center justify-center text-elite-cyan group-hover:scale-110 transition-transform">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-0.5">{t("startDate")}</p>
                  <p className="font-outfit font-bold text-slate-900 dark:text-white">{formatDate(event.startDateTime)}</p>
                </div>
              </div>
            </div>

            {/* End Date */}
            <div className="glass-control p-5 rounded-2xl flex items-center justify-between group hover:border-destructive/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-0.5">{t("endDate")}</p>
                  <p className="font-outfit font-bold text-slate-900 dark:text-white">{formatDate(event.endDateTime)}</p>
                </div>
              </div>
            </div>
          </div>

          {hasDaysDifference && (
            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-elite-gradient text-white text-sm font-bold shadow-elite-glow">
                <Clock className="h-4 w-4" />
                {t("duration", { days: daysDifference })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [event, t, dateLocale]);

  const RenderComponent = useMemo(() => {
    switch (section) {
      case "details":
        return <DetailComponent />;
      case "date":
        return <DateComponent />;
      case "location":
        return <EventLocationComponent event={event as any} />;
      case "registration":
        return <EventPriceComponent event={event as any} />;
      case "feedback":
        return <FeedBackComponent eventId={event._id.toString()} />;
      default:
        return <DetailComponent />;
    }
  }, [section, event, DetailComponent, DateComponent]);

  const tabItems = useMemo(
    () => [
      { value: "details", label: t("tabs.details"), icon: Menu },
      { value: "date", label: t("tabs.date"), icon: CalendarDays },
      { value: "location", label: t("tabs.location"), icon: MapPin },
      ...(!event.url ? [{ value: "registration", label: registrationTabLabel, icon: Wallet }] : []),
      { value: "feedback", label: t("tabs.feedback"), icon: MessageSquareIcon },
    ],
    [registrationTabLabel, t, event.url]
  );

  return (
    <div ref={rootRef} className="flex w-full h-full bg-transparent items-center flex-col relative">
      {/* Navigation Tabs */}
      <div className="w-full sticky top-0 z-50 py-2 px-2 bg-background/95 backdrop-blur-xl border-b border-border/10">
        <Tabs
          value={section}
          onValueChange={(value) => setSection(value as SectionType)}
          className="w-full"
        >
          <ScrollArea className="w-full">
            <TabsList className="flex w-full h-12 items-center justify-start gap-2 bg-transparent p-0 mb-2">
              {tabItems.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} asChild>
                  <Button
                    variant={section === value ? "default" : "ghost"}
                    size="sm"
                    className={`h-10 rounded-2xl whitespace-nowrap px-4 transition-all duration-300 font-bold tracking-tight shadow-sm ${
                      section === value
                        ? "bg-primary text-white shadow-elite-glow scale-105"
                        : "glass-control text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-2 ${section === value ? "animate-pulse" : ""}`} />
                    {label}
                  </Button>
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="h-1.5 bg-slate-900/10 dark:bg-white/10" />
          </ScrollArea>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex w-full px-1 py-4 md:p-4 min-h-[500px]">
        <div className="w-full">
          {RenderComponent}
        </div>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {section === "registration" && showScrollTop && (
            <motion.button
              type="button"
              onClick={scrollPanelToTop}
              aria-label={tx("scrollToTop", "Retour en haut")}
              title={tx("scrollToTop", "Retour en haut")}
              initial={{ opacity: 0, y: 24, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              whileHover={{ scale: 1.12, rotate: -6 }}
              whileTap={{ scale: 0.9 }}
              className="fixed bottom-6 right-4 z-50 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary via-elite-cyan to-elite-violet text-white shadow-lg shadow-primary/40 ring-2 ring-white/40 dark:ring-white/10"
            >
              <span className="absolute inset-0 rounded-full bg-primary/60 animate-ping" />
              <ArrowUp className="relative h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
