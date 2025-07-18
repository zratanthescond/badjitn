"use client";

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
import { useState, useCallback, useMemo } from "react";
import { differenceInDays, format } from "date-fns";
import { enUS, es, fr, de, ar } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
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
} from "lucide-react";
import EventLocationComponent from "./shared/EventLocationComponent";
import EventPriceComponent from "./shared/EventPriceComponent";
import FeedBackComponent from "./shared/FeedBackComponent";

interface ReelDetailsProps {
  event: Event;
}

type SectionType = "details" | "date" | "location" | "price" | "feedback";

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
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [section, setSection] = useState<SectionType>("details");
  const [isJoining, setIsJoining] = useState(false);

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

  // Language Switcher Component (inline)
  const LanguageSwitcher = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <span className="hidden md:inline">{currentLanguage?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 ${
              locale === language.code ? "bg-accent" : ""
            }`}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const DetailComponent = useCallback(() => {
    return (
      <div className="space-y-6 w-full">
        {/* Header Section */}
        <Card className="border-0 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {event.title}
                </h1>
              </div>
            </div>

            {/* Event Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              {event.attendees && (
                <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded-full px-3 py-1">
                  <Users className="h-4 w-4 text-pink-500" />
                  <span className="font-medium">
                    {t("attendees", { count: event.attendees.length })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded-full px-3 py-1">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="font-medium">
                  {format(event.startDateTime, "MMM d, yyyy", {
                    locale: dateLocale,
                  })}
                </span>
              </div>
            </div>

            {/* Join Button */}
            <Button
              onClick={handleJoinEvent}
              disabled={isJoining}
              size="lg"
              className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold min-w-32 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("joining")}
                </>
              ) : (
                t("joinButton")
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardContent className="p-6">
            <div
              className="prose prose-sm dark:prose-invert max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setSection("price")}
            variant="outline"
            size="lg"
            className="rounded-full border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/20 font-semibold"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {t("viewPricing")}
          </Button>
        </div>
      </div>
    );
  }, [event, handleJoinEvent, isJoining, t, dateLocale]);

  const DateComponent = useCallback(() => {
    const formatDate = (date: Date) => {
      return format(date, "EEE, MMM d, h:mm a", { locale: dateLocale });
    };

    const daysDifference = differenceInDays(
      event.endDateTime,
      event.startDateTime
    );
    const hasDaysDifference = daysDifference > 0;

    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t("schedule")}</h3>
            <Separator className="w-20 mx-auto" />
          </div>

          <div className="space-y-4">
            {/* Doors Open */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <DoorOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium">{t("doorsOpen")}</span>
              </div>
              <Badge variant="secondary" className="font-mono text-sm">
                {format(event.startDateTime, "h:mm a", { locale: dateLocale })}
              </Badge>
            </div>

            {/* Start Date */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">{t("startDate")}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatDate(event.startDateTime)}
                </div>
              </div>
            </div>

            {/* End Date */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                  <CalendarIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="font-medium">{t("endDate")}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatDate(event.endDateTime)}
                </div>
              </div>
            </div>
          </div>

          {hasDaysDifference && (
            <div className="text-center pt-4">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                {t("duration", { days: daysDifference })}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }, [event, t, dateLocale]);

  const RenderComponent = useMemo(() => {
    switch (section) {
      case "details":
        return <DetailComponent />;
      case "date":
        return <DateComponent />;
      case "location":
        return <EventLocationComponent event={event} />;
      case "price":
        return <EventPriceComponent event={event} />;
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
      { value: "price", label: t("tabs.price"), icon: Wallet },
      { value: "feedback", label: t("tabs.feedback"), icon: MessageSquareIcon },
    ],
    [t]
  );

  return (
    <div className="flex md:max-w-4xl md:w-full h-full bg-background items-center flex-col rounded-2xl shadow-lg border">
      {/* Navigation Tabs */}
      <Tabs
        value={section}
        onValueChange={(value) => setSection(value as SectionType)}
        className="w-full rounded-t-2xl sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b"
      >
        <TabsList className="w-full max-w-[97vw] rounded-none bg-transparent p-2">
          <ScrollArea className="w-full">
            <div className="flex w-full flex-row items-center justify-between gap-2 px-2">
              {tabItems.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} asChild>
                  <Button
                    variant={section === value ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-full whitespace-nowrap transition-all duration-200 ${
                      section === value
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                        : "hover:bg-pink-50 dark:hover:bg-pink-950/20"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 mr-2" />
                    {label}
                  </Button>
                </TabsTrigger>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="bg-pink-200/50" />
          </ScrollArea>
        </TabsList>
      </Tabs>

      {/* Content */}
      <div className="flex w-full p-6 min-h-[400px]">
        <div className="w-full animate-in fade-in-50 duration-200">
          {RenderComponent}
        </div>
      </div>
    </div>
  );
}
