"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { Event } from "@/types";
import { Button } from "./ui/button";
import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { enUS, es, fr, de, ar } from "date-fns/locale";

// Scoped to the event page only — the rest of the app keeps its glass/dark theme.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CalendarIcon,
  DoorOpen,
  MapPin,
  Clock,
  Loader2,
  ArrowUp,
  ChevronRight,
} from "lucide-react";
import EventLocationComponent from "./shared/eventLocationComponent";
import EventPriceComponent from "./shared/EventPriceComponent";
import FeedBackComponent from "./shared/FeedBackComponent";
import { TiptapRenderer } from "./shared/TiptapRenderer";
import { ImagePreviewDialog } from "./shared/ImagePreviewDialog";
import HLSPlayer from "./shared/phone/HlsPlayer";
import { formatPriceByCountry } from "@/lib/utils";

interface ReelDetailsProps {
  event: Event;
  /**
   * "panel" (default) — compact single-column rendering for the narrow,
   * already-scrollable side panel of the swipeable reel feed.
   * "page" — full standalone landing page (header/footer live in the parent
   * route), two-column hero + sticky registration card on desktop, matching
   * the redesign spec.
   */
  variant?: "panel" | "page";
}

type ViewType = "page" | "registration";
type SectionId = "about" | "programme" | "authorsCv" | "date";

// Date locales mapping
const dateLocales = {
  en: enUS,
  es: es,
  fr: fr,
  de: de,
  ar: ar,
} as const;

const isHlsStream = (url?: string | null) => !!url && (url.includes(".m3u8") || url.includes("/manifest"));
const isVideoFile = (url?: string | null) => !!url && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);

export default function ReelDetails({ event, variant = "panel" }: ReelDetailsProps) {
  const isPage = variant === "page";
  const t = useTranslations("event");
  const tx = (key: string, fallback: string) => (t.has(key as any) ? t(key as any) : fallback);
  const locale = useLocale();
  const router = useRouter();
  const [view, setView] = useState<ViewType>("page");
  const [activeSection, setActiveSection] = useState<SectionId>("about");
  const [isJoining, setIsJoining] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const isPast = new Date(event.endDateTime) < new Date();
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const enterAnim = (classes: string) => (prefersReducedMotion ? "" : classes);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const getScrollable = useCallback(
    () => rootRef.current?.closest(".overflow-y-auto") as HTMLElement | null,
    []
  );

  const scrollPanelToTop = useCallback(() => {
    const scrollable = getScrollable();
    if (scrollable) {
      scrollable.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    } else if (isPage) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    } else {
      rootRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }
  }, [getScrollable, prefersReducedMotion, isPage]);

  const goToSection = useCallback(
    (id: SectionId) => {
      setActiveSection(id);
      const el = document.getElementById(`event-section-${id}`);
      el?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    },
    [prefersReducedMotion]
  );

  // Reveal the scroll-to-top button once the user has scrolled down a bit —
  // meaningful in the registration view (one long form) and, for the full
  // standalone page, on the main view too (it's a genuinely long page there).
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const scrollable = getScrollable();
    const relevant = view === "registration" || isPage;
    if (!relevant) {
      setShowScrollTop(false);
      scrollable?.classList.remove("thin-scrollbar");
      scrollable?.classList.add("no-scrollbar");
      return;
    }

    if (scrollable) {
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
    }

    // No panel ancestor (standalone page) — track window scroll instead.
    const getScrollY = () => window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const handleWindowScroll = () => setShowScrollTop(getScrollY() > 200);
    handleWindowScroll(); // in case the page mounts already scrolled
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [view, isPage, getScrollable]);

  // Keep the tab bar in sync with whichever section is currently in view —
  // observed against the shorts panel's own scroll container, not window,
  // since this page is embedded in a scrollable side panel (see spec note).
  useEffect(() => {
    if (view !== "page") return;
    const scrollable = getScrollable();
    const sections = contentRef.current?.querySelectorAll("[data-section-id]");
    if (!sections || sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          setActiveSection(visible.target.getAttribute("data-section-id") as SectionId);
        }
      },
      { root: scrollable || null, rootMargin: "-120px 0px -60% 0px", threshold: 0.01 }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [view, getScrollable, event.programme, event.authorsCv]);

  const dateLocale = dateLocales[locale as keyof typeof dateLocales] || dateLocales.en;

  const handleJoinEvent = useCallback(async () => {
    if (isJoining) return;
    setIsJoining(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setView("registration");
      window.setTimeout(scrollPanelToTop, 0);
    } finally {
      setIsJoining(false);
    }
  }, [isJoining, scrollPanelToTop]);

  const hasProgramme = !!event.programme && event.programme.length > 0;
  const hasAuthorsCv = !!event.authorsCv && event.authorsCv.length > 0;
  const canRegister = !event.url;

  const priceLabel = event.isFree
    ? tx("free", "Gratuit")
    : event.price
    ? formatPriceByCountry(event.price, event.country, "en-US", event.location)
    : tx("paid", "Payant");

  const tabItems = useMemo(
    () =>
      [
        { id: "about" as const, label: tx("about", "Aperçu") },
        ...(hasProgramme ? [{ id: "programme" as const, label: t("tabs.programme") }] : []),
        ...(hasAuthorsCv ? [{ id: "authorsCv" as const, label: tx("speakersTab", "Conférenciers") }] : []),
        { id: "date" as const, label: tx("dateAndLocation", "Date & lieu") },
      ] as { id: SectionId; label: string }[],
    [t, tx, hasProgramme, hasAuthorsCv]
  );

  const navLabel = tx("tabsNavLabel", "Sections de l'événement");

  // Keep the active tab visible inside the horizontally scrolling tab row as
  // the page scrolls (scrolls only the row, never the page itself).
  const tabRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = tabRowRef.current;
    const tab = row?.querySelector<HTMLElement>(`[data-tab-id="${activeSection}"]`);
    if (!row || !tab) return;
    const left = tab.offsetLeft - 16;
    const right = tab.offsetLeft + tab.offsetWidth + 16;
    if (left < row.scrollLeft || right > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  }, [activeSection, prefersReducedMotion]);

  // ---- Registration view ---------------------------------------------------
  if (view === "registration") {
    return (
      <div
        ref={rootRef}
        className={
          isPage
            ? `${jakarta.className} w-full bg-[#F6F6FB] px-4 md:px-8 py-6 max-w-[1200px] mx-auto`
            : `${jakarta.className} w-full bg-[#F6F6FB] rounded-[20px] p-2 md:p-4`
        }
      >
        <button
          type="button"
          onClick={() => setView("page")}
          className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-bold text-[#4338CA] hover:text-[#2E2699] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#A5B4FC] focus-visible:ring-offset-1 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {tx("backToEvent", "Retour à l'événement")}
        </button>
        <EventPriceComponent event={event as any} />

        {mounted &&
          createPortal(
            <AnimatePresence>
              {showScrollTop && (
                <motion.button
                  type="button"
                  onClick={scrollPanelToTop}
                  aria-label={tx("scrollToTop", "Retour en haut")}
                  title={tx("scrollToTop", "Retour en haut")}
                  initial={{ opacity: 0, y: 24, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.5 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 24 }}
                  className="fixed bottom-6 right-4 z-50 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4338CA] text-white shadow-lg ring-2 ring-white/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#A5B4FC]"
                >
                  <ArrowUp className="relative h-5 w-5" aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>,
            document.body
          )}
      </div>
    );
  }

  // ---- Main event page (continuous scroll, section anchors) ---------------
  const sections = (
    <>
      <Section id="about">
        <h2 className="text-xl font-bold text-[#15152B] mb-3">{tx("about", "À propos")}</h2>
        <div className="prose prose-slate max-w-none break-all text-sm md:text-base text-[#3B3D55] leading-[1.65]">
          <TiptapRenderer content={event.description} />
        </div>
      </Section>

      {hasProgramme && (
        <Section id="programme">
          <h2 className="text-xl font-bold text-[#15152B] mb-4">{t("tabs.programme")}</h2>
          <div className="grid grid-cols-1 gap-4">
            {(event.programme || []).map((item, index) => (
              <div key={index} className="border border-[#E4E4EF] rounded-2xl overflow-hidden">
                {item.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage({ src: item.imageUrl as string, alt: item.title || "" })}
                    className="block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#A5B4FC] focus-visible:ring-offset-1"
                    aria-label={`${tx("zoomImage", "Agrandir l'image")}${item.title ? ` — ${item.title}` : ""}`}
                  >
                    <img src={item.imageUrl} alt={item.title || ""} className="w-full h-auto object-contain" />
                  </button>
                )}
                {(item.title || item.text) && (
                  <div className="p-5 space-y-2">
                    {item.title && <h3 className="font-bold text-lg text-[#15152B]">{item.title}</h3>}
                    {item.text && (
                      <p className="text-sm text-[#3B3D55] whitespace-pre-line leading-relaxed">{item.text}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {hasAuthorsCv && (
        <Section id="authorsCv">
          <h2 className="text-xl font-bold text-[#15152B]">{t("tabs.authorsCv")}</h2>
          <p className="text-xs text-[#55576B] mb-4 mt-1">{tx("tapToEnlarge", "Touchez une carte pour l'agrandir")}</p>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {(event.authorsCv || [])
              .filter((item) => item.imageUrl)
              .map((item, index) => (
                <div key={index} className="border border-[#E4E4EF] rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPreviewImage({ src: item.imageUrl as string, alt: item.name || "" })}
                    className="block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#A5B4FC] focus-visible:ring-offset-1"
                    aria-label={`${tx("zoomImage", "Agrandir l'image")}${item.name ? ` — ${item.name}` : ""}`}
                  >
                    <img src={item.imageUrl} alt={item.name || ""} className="w-full h-[220px] object-cover" />
                  </button>
                  {item.name && (
                    <div className="p-4">
                      <h3 className="font-bold text-base text-[#15152B]">{item.name}</h3>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Section>
      )}

      <Section id="date">
        <h2 className="text-xl font-bold text-[#15152B] mb-4">{tx("dateAndLocation", "Date & lieu")}</h2>
        <DateInfo event={event} dateLocale={dateLocale} t={t} tx={tx} />
        <div className="mt-4">
          <EventLocationComponent event={event as any} />
        </div>
      </Section>

      {/* Feedback stays reachable but out of the tab bar — spec issue #10:
          no tab wasted on an empty "Comments" section. */}
      <Section id="feedback" bare>
        <FeedBackComponent eventId={event._id.toString()} />
      </Section>
    </>
  );

  const showRegistrationCta = canRegister && !isPast;

  // Hero media — the event's imageUrl can be a static poster, an HLS stream
  // or an mp4/webm file (same field the swipeable reels feed plays from).
  const heroMedia = isHlsStream(event.imageUrl) ? (
    <HLSPlayer
      manifest={event.imageUrl}
      isActive={isPage}
      autoPlay={false}
      controls
      muted
      className="w-full h-full object-contain"
    />
  ) : isVideoFile(event.imageUrl) ? (
    <video
      src={event.imageUrl}
      controls
      muted
      playsInline
      className="w-full h-full object-contain"
    />
  ) : (
    <img
      src={event.imageUrl || "/assets/images/placeholder.png"}
      alt={event.title}
      className="w-full h-full object-contain"
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/assets/images/placeholder.png";
      }}
    />
  );

  const registrationCard = (
    <div className="rounded-[20px] border border-[#E4E4EF] bg-white p-5 space-y-4">
      {/* Text is uppercased in JS, not via the `uppercase` CSS class — that
          class combined with `tracking-*` clipped the leading glyph of
          short, bold, letter-spaced labels in some mobile renderers. */}
      <p className="text-xs font-bold tracking-wide text-[#55576B]">{tx("inscription", "Inscription").toUpperCase()}</p>
      <p className="text-[28px] font-extrabold text-[#15152B]">{priceLabel}</p>
      <div className="space-y-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-[#3B3D55]">
          <CalendarDays className="h-4 w-4 text-[#4338CA]" aria-hidden="true" />
          {format(new Date(event.startDateTime), "d MMMM yyyy", { locale: dateLocale })}
        </span>
        {(event.city || event.location?.name) && (
          <span className="flex items-center gap-1.5 font-semibold text-[#3B3D55]">
            <MapPin className="h-4 w-4 text-[#4338CA]" aria-hidden="true" />
            {event.city || event.location?.name}
          </span>
        )}
      </div>
      <Button
        onClick={handleJoinEvent}
        className="w-full h-12 rounded-xl text-base font-extrabold bg-[#4338CA] hover:bg-[#2E2699] text-white"
      >
        {isJoining ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
            {t("joining")}
          </>
        ) : (
          tx("registerNow", "Je m'inscris")
        )}
      </Button>
      <p className="text-xs text-[#55576B] leading-relaxed">
        {tx("registrationHelp", "Inscription en quelques étapes rapides. Badge et QR code envoyés par e-mail.")}
      </p>
    </div>
  );

  if (!isPage) {
    return (
      <div
        ref={rootRef}
        className={`${jakarta.className} flex w-full bg-[#F6F6FB] flex-col relative rounded-[20px] overflow-hidden`}
      >
        {/* Hero */}
        <div className={enterAnim("bg-white p-5 md:p-8 space-y-4 w-full animate-in fade-in duration-500")}>
          <p className="text-xs font-bold tracking-wide text-[#55576B]">
            {tx("events", "Événements").toUpperCase()} <ChevronRight className="inline h-3 w-3 mx-0.5" aria-hidden="true" /> {event.category?.name?.toUpperCase()}
          </p>
          <span className="inline-flex items-center rounded-full bg-[#EEF0FF] px-3 py-1 text-xs font-bold tracking-wide text-[#3730A3]">
            {event.category?.name?.toUpperCase()}
          </span>
          <h1 className="text-[28px] md:text-[40px] font-extrabold leading-[1.05] tracking-tight text-[#15152B] break-words">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-[#3B3D55]">
              <CalendarDays className="h-4 w-4 text-[#4338CA]" aria-hidden="true" />
              {format(new Date(event.startDateTime), "EEEE d MMMM yyyy", { locale: dateLocale })}
            </span>
            {(event.city || event.location?.name) && (
              <span className="flex items-center gap-1.5 font-semibold text-[#3B3D55]">
                <MapPin className="h-4 w-4 text-[#4338CA]" aria-hidden="true" />
                {event.city || event.location?.name}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold tracking-widest text-[#55576B]">
              {(event.organisation?.name
                ? `${tx("hostedBy", "Organisé par")} ${event.organisation.name}`
                : `${tx("organizer", "Organisateur")} : @${event.organizer.username}`
              ).toUpperCase()}
            </p>
            {isPast && (
              <span className="inline-flex items-center rounded-full bg-[#E4E4EF] px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[#55576B]">
                {t("pastEvent").toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Tab bar — anchors to the sections below. The registration CTA lives
            once, in the sticky summary bar just under this nav (spec issue #1:
            no duplicate CTAs). */}
        <nav
          aria-label={navLabel}
          className="w-full sticky top-0 z-30 bg-white border-y border-[#E4E4EF] px-2 min-w-0"
        >
          <div ref={tabRowRef} className="relative flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0">
            {tabItems.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                data-tab-id={id}
                onClick={() => goToSection(id)}
                aria-current={activeSection === id ? "true" : undefined}
                className={`h-11 shrink-0 whitespace-nowrap px-3 flex items-center font-semibold text-sm border-b-[3px] transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-[#A5B4FC] ${
                  activeSection === id
                    ? "text-[#4338CA] border-[#4338CA]"
                    : "text-[#55576B] border-transparent hover:text-[#15152B]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Sticky registration summary — the "card" from the spec, adapted to
            this single-column panel: price + CTA, pinned under the tab bar. */}
        {showRegistrationCta && (
          <div className="sticky top-[44px] z-20 flex items-center justify-between gap-3 bg-[#EEF0FF] px-4 py-2 border-b border-[#E4E4EF]">
            <span className="text-sm font-bold text-[#3730A3]">{priceLabel}</span>
            <Button
              onClick={handleJoinEvent}
              size="sm"
              className="h-9 rounded-lg px-4 font-bold bg-[#4338CA] hover:bg-[#2E2699] text-white"
            >
              {tx("registerNow", "Je m'inscris")}
            </Button>
          </div>
        )}

        {/* Sections, stacked in one continuous scroll */}
        <div ref={contentRef} className="flex flex-col gap-4 w-full p-2 md:p-4">
          {sections}
        </div>

        {previewImage && (
          <ImagePreviewDialog
            src={previewImage.src}
            alt={previewImage.alt}
            isOpen={!!previewImage}
            onClose={() => setPreviewImage(null)}
          />
        )}

        {mounted &&
          createPortal(
            <AnimatePresence>
              {showScrollTop && (
                <motion.button
                  type="button"
                  onClick={scrollPanelToTop}
                  aria-label={tx("scrollToTop", "Retour en haut")}
                  title={tx("scrollToTop", "Retour en haut")}
                  initial={{ opacity: 0, y: 24, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.5 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 24 }}
                  className="fixed bottom-6 right-4 z-50 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4338CA] text-white shadow-lg ring-2 ring-white/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#A5B4FC]"
                >
                  <ArrowUp className="relative h-5 w-5" aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>,
            document.body
          )}
      </div>
    );
  }

  // ---- Standalone page variant (header/footer live in the parent route) ---
  // overflow-x-clip, not -hidden: `hidden` makes the root a scroll container,
  // which stops the tab bar and sidebar card from sticking to the viewport.
  return (
    <div ref={rootRef} className={`${jakarta.className} w-full max-w-full bg-[#F6F6FB] overflow-x-clip`}>
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-8">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 lg:items-start min-w-0">
          <div className={enterAnim("space-y-4 animate-in fade-in duration-500 min-w-0")}>
            <p className="text-xs font-bold tracking-wide text-[#55576B] break-words">
              {tx("events", "Événements").toUpperCase()} <ChevronRight className="inline h-3 w-3 mx-0.5" aria-hidden="true" /> {event.category?.name?.toUpperCase()}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#EEF0FF] px-3 py-1 text-xs font-bold tracking-wide text-[#3730A3]">
                {event.category?.name?.toUpperCase()}
              </span>
              {isPast && (
                <span className="inline-flex items-center rounded-full bg-[#E4E4EF] px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[#55576B]">
                  {t("pastEvent").toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-[32px] md:text-[48px] lg:text-[52px] font-extrabold leading-[1.05] tracking-tight text-[#15152B] break-words">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-[#3B3D55]">
                <CalendarDays className="h-4 w-4 text-[#4338CA]" aria-hidden="true" />
                {format(new Date(event.startDateTime), "EEEE d MMMM yyyy", { locale: dateLocale })}
              </span>
              {(event.city || event.location?.name) && (
                <span className="flex items-center gap-1.5 font-semibold text-[#3B3D55]">
                  <MapPin className="h-4 w-4 text-[#4338CA]" aria-hidden="true" />
                  {event.city || event.location?.name}
                </span>
              )}
            </div>

            <p className="text-xs font-bold tracking-widest text-[#55576B] break-words">
              {(event.organisation?.name
                ? `${tx("hostedBy", "Organisé par")} ${event.organisation.name}`
                : `${tx("organizer", "Organisateur")} : @${event.organizer.username}`
              ).toUpperCase()}
            </p>
          </div>

          <div className="w-full rounded-3xl bg-[#DCE6FB] overflow-hidden aspect-[4/5]">
            {heroMedia}
          </div>
        </div>
      </div>

      {/* Tab bar — sits under the fixed site header; the registration CTA
          lives here AND in the sticky sidebar card below, matching the
          spec's two-column desktop layout. */}
      <nav
        aria-label={navLabel}
        className="w-full sticky top-14 md:top-20 z-30 bg-white border-y border-[#E4E4EF]"
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex items-center justify-between gap-2 min-w-0">
          <div ref={tabRowRef} className="relative flex items-center sm:gap-1 overflow-x-auto no-scrollbar min-w-0 -mx-2 sm:mx-0">
            {tabItems.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                data-tab-id={id}
                onClick={() => goToSection(id)}
                aria-current={activeSection === id ? "true" : undefined}
                className={`h-12 shrink-0 whitespace-nowrap px-2 sm:px-3 flex items-center font-semibold text-[13px] sm:text-sm border-b-[3px] transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-[#A5B4FC] ${
                  activeSection === id
                    ? "text-[#4338CA] border-[#4338CA]"
                    : "text-[#55576B] border-transparent hover:text-[#15152B]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {showRegistrationCta && (
            <Button
              onClick={handleJoinEvent}
              size="sm"
              className="hidden lg:inline-flex h-9 shrink-0 rounded-lg px-4 font-bold bg-[#4338CA] hover:bg-[#2E2699] text-white"
            >
              {tx("registerNow", "S'inscrire")}
            </Button>
          )}
        </div>
      </nav>

      {/* Two-column body: sections on the left, sticky registration card on
          the right (desktop only — mobile uses the bottom sticky bar). */}
      <div className={`max-w-[1200px] mx-auto px-4 md:px-8 py-8 ${showRegistrationCta ? "pb-24 lg:pb-8" : ""}`}>
        <div className={`flex flex-col lg:grid gap-8 lg:items-start ${showRegistrationCta ? "lg:grid-cols-[1fr_340px]" : ""}`}>
          <div ref={contentRef} className="flex flex-col gap-6 min-w-0">
            {sections}
          </div>

          {showRegistrationCta && (
            <div className="hidden lg:block sticky top-[140px]">{registrationCard}</div>
          )}
        </div>
      </div>

      {/* Mobile sticky registration bar — replaces the sidebar card below lg */}
      {showRegistrationCta && (
        <div
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-between gap-3 bg-white border-t border-[#E4E4EF] px-4 py-3"
          style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
        >
          <div className="text-sm">
            <p className="font-extrabold text-[#15152B]">{priceLabel}</p>
            <p className="text-xs text-[#55576B]">
              {format(new Date(event.startDateTime), "d MMM yyyy", { locale: dateLocale })}
              {(event.city || event.location?.name) ? ` · ${event.city || event.location?.name}` : ""}
            </p>
          </div>
          <Button
            onClick={handleJoinEvent}
            className="h-11 shrink-0 rounded-xl px-5 font-extrabold bg-[#4338CA] hover:bg-[#2E2699] text-white"
          >
            {tx("registerNow", "S'inscrire")}
          </Button>
        </div>
      )}

      {previewImage && (
        <ImagePreviewDialog
          src={previewImage.src}
          alt={previewImage.alt}
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                type="button"
                onClick={scrollPanelToTop}
                aria-label={tx("scrollToTop", "Retour en haut")}
                title={tx("scrollToTop", "Retour en haut")}
                initial={{ opacity: 0, y: 24, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.5 }}
                transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 24 }}
                className={`fixed right-4 z-50 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4338CA] text-white shadow-lg ring-2 ring-white/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#A5B4FC] ${
                  showRegistrationCta
                    ? "bottom-[calc(80px+env(safe-area-inset-bottom))] lg:bottom-6"
                    : "bottom-6"
                }`}
              >
                <ArrowUp className="relative h-5 w-5" aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

function Section({ id, children, bare = false }: { id: string; children: ReactNode; bare?: boolean }) {
  return (
    <div id={`event-section-${id}`} data-section-id={id} className="scroll-mt-28 md:scroll-mt-36">
      {bare ? children : <div className="bg-white p-5 md:p-8 rounded-[20px] border border-[#E4E4EF]">{children}</div>}
    </div>
  );
}

function DateInfo({
  event,
  dateLocale,
  t,
  tx,
}: {
  event: Event;
  dateLocale: Locale;
  t: ReturnType<typeof useTranslations>;
  tx: (key: string, fallback: string) => string;
}) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "EEE, MMM d, h:mm a", { locale: dateLocale });
  };
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);
  // `differenceInDays` counts elapsed 24h periods, which under-counts an
  // event that spans two calendar days by less than 24h (e.g. Sat 14:00 →
  // Sun 14:00 reports 1 day instead of 2). Count calendar days spanned
  // instead: the number of distinct calendar days the event touches.
  const daysSpanned = differenceInCalendarDays(end, start) + 1;
  const hasDaysDifference = daysSpanned > 1;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="border border-[#E4E4EF] p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center text-[#4338CA] shrink-0">
            <DoorOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs tracking-widest text-[#55576B] font-bold">{t("doorsOpen").toUpperCase()}</p>
            <p className="font-bold text-[#15152B] text-sm">{format(start, "h:mm a", { locale: dateLocale })}</p>
          </div>
        </div>
        <div className="border border-[#E4E4EF] p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center text-[#4338CA] shrink-0">
            <CalendarIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs tracking-widest text-[#55576B] font-bold">{t("startDate").toUpperCase()}</p>
            <p className="font-bold text-[#15152B] text-sm">{formatDate(event.startDateTime)}</p>
          </div>
        </div>
        <div className="border border-[#E4E4EF] p-4 rounded-2xl flex items-center gap-3 sm:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] flex items-center justify-center text-[#B42318] shrink-0">
            <CalendarIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs tracking-widest text-[#55576B] font-bold">{t("endDate").toUpperCase()}</p>
            <p className="font-bold text-[#15152B] text-sm">{formatDate(event.endDateTime)}</p>
          </div>
        </div>
      </div>

      {hasDaysDifference && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF0FF] text-[#3730A3] text-sm font-bold">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {t("duration", { days: daysSpanned })}
        </div>
      )}
    </div>
  );
}

type Locale = (typeof dateLocales)[keyof typeof dateLocales];
