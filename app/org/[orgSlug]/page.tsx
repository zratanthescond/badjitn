import { getOrgWithEvents } from "@/lib/actions/org.actions";
import Collection from "@/components/shared/Collection";
import OrgRollingBanner from "@/components/shared/OrgRollingBanner";
import OrgCountdown from "@/components/shared/OrgCountdown";
import OrgPartnersCarousel from "@/components/shared/OrgPartnersCarousel";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const data = await getOrgWithEvents(orgSlug);
  if (!data) return { title: "Organisation introuvable" };
  const { org } = data;
  return {
    title: `${org.name} | Badgi.net`,
    description: org.description,
    icons: org.logo
      ? [{ rel: "icon", url: org.logo }, { rel: "apple-touch-icon", url: org.logo }]
      : undefined,
  };
}

const formatDate = (d: string) =>
  new Intl.DateTimeFormat("fr-TN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));

/* ── shared tiny components ─────────────────────────────── */

const GradientLine = () => (
  <div className="h-[2px] w-full" style={{ background: "linear-gradient(to right, #624CF5, #20D5EC)" }} />
);

const EyebrowLabel = ({ children }: { children: React.ReactNode }) => (
  <span
    className="text-[10px] font-syne font-bold uppercase tracking-[0.18em]"
    style={{
      background: "linear-gradient(to right, #624CF5, #20D5EC)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}
  >
    {children}
  </span>
);

/* ── SVG icons ───────────────────────────────────────────── */
const IconCalendar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconClock = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconStar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
const IconGlobe = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
  </svg>
);
const IconArrow = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);
const IconPin = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconLink = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const SocialIconFB = () => <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
const SocialIconIG = () => <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;
const SocialIconLI = () => <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
const SocialIconTW = () => <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>;

/* ── Page ────────────────────────────────────────────────── */

export default async function OrgPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const data = await getOrgWithEvents(orgSlug);
  if (!data) notFound();

  const { org, events } = data;
  const domain = org.subdomain ? `${org.subdomain}.badgi.net` : `${org.slug}.badgi.net`;
  const hasPartners = org.partners && org.partners.length > 0;

  const now = Date.now();
  const nextEvent =
    [...events].reverse().find((e: any) => new Date(e.startDateTime).getTime() > now) || null;
  const upcomingCount = events.filter((e: any) => new Date(e.startDateTime).getTime() > now).length;
  const partnersCount = org.partners?.length || 0;

  const stats = [
    { value: events.length, label: "Événements organisés", icon: <IconCalendar /> },
    { value: upcomingCount, label: "Événements à venir", icon: <IconClock /> },
    { value: partnersCount, label: "Sponsors & Partenaires", icon: <IconUsers /> },
    { value: new Date().getFullYear(), label: "Saison en cours", icon: <IconStar /> },
  ];

  const socialList = [
    { href: org.socialLinks?.facebook, icon: <SocialIconFB /> },
    { href: org.socialLinks?.instagram, icon: <SocialIconIG /> },
    { href: org.socialLinks?.linkedin, icon: <SocialIconLI /> },
    { href: org.socialLinks?.twitter, icon: <SocialIconTW /> },
  ].filter((s) => !!s.href);

  return (
    <main className="min-h-screen w-full flex flex-col bg-white dark:bg-elite-charcoal font-outfit">

      {/* ── Sticky nav ───────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07]"
        style={{ background: "rgba(10,10,12,0.6)", backdropFilter: "blur(20px) saturate(1.8)" }}
      >
        {/* Gradient micro-line signature */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(to right, #624CF5, #20D5EC)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {org.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo} alt={org.name} width={30} height={30}
                className="rounded-full object-cover ring-1 ring-white/20" />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold font-syne"
                style={{ background: "linear-gradient(135deg, #624CF5, #20D5EC)" }}
              >
                {org.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-syne font-semibold text-white/90 text-sm truncate max-w-[200px] sm:max-w-xs">
              {org.name}
            </span>
            {org.isVerified && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-700/40">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Vérifié
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {nextEvent && (
              <Link
                href={`/events/${nextEvent._id}`}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-1.5 rounded-full transition-all hover:opacity-90"
                style={{ background: "linear-gradient(to right, #624CF5, #4f8ef7)", boxShadow: "0 2px 12px rgba(98,76,245,0.4)" }}
              >
                S&apos;inscrire
              </Link>
            )}
            <Link href="https://badgi.net" target="_blank"
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
              Propulsé par{" "}
              <span
                className="font-bold ml-0.5"
                style={{ background: "linear-gradient(to right, #624CF5, #20D5EC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >
                Badgi.net
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO — cinematic full screen
      ══════════════════════════════════════════════ */}
      <section className="relative flex flex-col min-h-[78vh] sm:min-h-[88vh] lg:min-h-[92vh]">

        {/* BG layers */}
        <div className="absolute inset-0">
          {org.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0A0A0C 0%, #1a0a2e 50%, #0d1a3d 100%)" }} />
          )}
          {/* Cinematic multi-layer overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.88) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 65%)" }} />
          {/* Violet glow — bottom left */}
          <div className="absolute bottom-0 left-0 w-[600px] h-[400px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at bottom left, rgba(98,76,245,0.2) 0%, transparent 70%)" }} />
          {/* Cyan glow — top right */}
          <div className="absolute top-0 right-0 w-[400px] h-[300px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at top right, rgba(32,213,236,0.08) 0%, transparent 70%)" }} />
          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
              backgroundSize: "200px 200px",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-end max-w-7xl mx-auto w-full px-4 sm:px-6 pb-10 sm:pb-16 pt-24 sm:pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-10 items-end">

            {/* Left 3/5 — Org identity */}
            <div className="lg:col-span-3 flex flex-col gap-5">

              {/* Logo + name */}
              <div
                className="flex items-end gap-4"
                style={{ animation: "fade-in-up 0.6s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                {org.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0"
                    style={{ border: "2px solid rgba(255,255,255,0.18)", boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)" }}
                  />
                )}
                <div className="flex flex-col gap-1.5">
                  {org.isVerified && (
                    <span
                      className="self-start inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/50"
                      style={{ background: "rgba(16,185,129,0.1)" }}
                    >
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Organisation vérifiée
                    </span>
                  )}
                  <h1
                    className="text-2xl sm:text-3xl font-syne font-bold text-white leading-snug line-clamp-2"
                    style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
                  >
                    {org.name}
                  </h1>
                </div>
              </div>

              {/* Description */}
              {org.description && (
                <p
                  className="text-white/60 text-sm sm:text-[15px] leading-relaxed max-w-lg line-clamp-2"
                  style={{ animation: "fade-in-up 0.6s 100ms cubic-bezier(0.16,1,0.3,1) both" }}
                >
                  {org.description}
                </p>
              )}

              {/* Website + social links */}
              <div
                className="flex flex-wrap items-center gap-2"
                style={{ animation: "fade-in-up 0.6s 200ms cubic-bezier(0.16,1,0.3,1) both" }}
              >
                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white px-3.5 py-1.5 rounded-full transition-all"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
                  >
                    <IconGlobe />
                    {org.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {socialList.map((s, i) => (
                  <a
                    key={i}
                    href={s.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-all hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Right 2/5 — Next event glass card */}
            {nextEvent && (
              <div
                className="lg:col-span-2 rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(28px) saturate(1.5)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(98,76,245,0.12)",
                  animation: "fade-in-up 0.6s 300ms cubic-bezier(0.16,1,0.3,1) both",
                }}
              >
                {/* Gradient top accent */}
                <div className="h-[2px]" style={{ background: "linear-gradient(to right, #624CF5, #20D5EC)" }} />

                <div className="p-6 sm:p-7 flex flex-col gap-5">
                  {/* Eyebrow */}
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#20D5EC" }} />
                    <EyebrowLabel>Prochain événement</EyebrowLabel>
                  </div>

                  {/* Event title */}
                  <h2 className="text-white font-syne font-semibold text-lg leading-snug line-clamp-3">
                    {nextEvent.title}
                  </h2>

                  {/* Date + location */}
                  <div className="flex flex-col gap-2">
                    <span className="flex items-center gap-2 text-white/50 text-xs">
                      <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "#624CF5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="capitalize">{formatDate(nextEvent.startDateTime)}</span>
                    </span>
                    {nextEvent.location?.name && (
                      <span className="flex items-center gap-2 text-white/50 text-xs">
                        <span style={{ color: "#624CF5" }}><IconPin /></span>
                        {nextEvent.location.name}
                      </span>
                    )}
                  </div>

                  {/* Countdown */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-white/30">Compte à rebours</span>
                    <OrgCountdown targetDate={nextEvent.startDateTime} />
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/events/${nextEvent._id}`}
                    className="inline-flex items-center justify-center gap-2 w-full text-sm font-semibold text-white py-3 rounded-xl transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(to right, #624CF5, #4f8ef7)", boxShadow: "0 4px 20px rgba(98,76,245,0.4)" }}
                  >
                    S&apos;inscrire à cet événement
                    <IconArrow />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 animate-bounce z-10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Rolling banner ── */}
      {org.bannerContent && (
        <OrgRollingBanner title={org.bannerTitle} content={org.bannerContent} />
      )}

      {/* ── Banner image ── */}
      {org.bannerImage && (
        <section className="w-full bg-white dark:bg-elite-charcoal overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 8px 40px rgba(98,76,245,0.12), 0 0 0 1px rgba(98,76,245,0.08)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={org.bannerImage}
                alt={`${org.name} – bannière`}
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          CHIFFRES CLÉS
      ══════════════════════════════════════════════ */}
      <section className="w-full bg-white dark:bg-elite-charcoal border-b border-slate-100 dark:border-white/[0.06]">
        <GradientLine />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-white/[0.06]">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-3 py-10 px-6 text-center group">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(98,76,245,0.08)", color: "#624CF5" }}
                >
                  {stat.icon}
                </div>
                <span
                  className="text-3xl sm:text-4xl font-syne font-bold tabular-nums"
                  style={{ color: "#624CF5" }}
                >
                  {stat.value}
                </span>
                <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          EVENTS SECTION
      ══════════════════════════════════════════════ */}
      <section className="flex-1 w-full py-16 bg-white dark:bg-elite-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12 flex flex-col items-center gap-3">
            <EyebrowLabel>Programme</EyebrowLabel>
            <h2 className="text-2xl sm:text-3xl font-syne font-bold text-slate-900 dark:text-white">
              Tous nos événements
            </h2>
            <div className="w-10 h-px" style={{ background: "linear-gradient(to right, #624CF5, #20D5EC)" }} />
          </div>

          <Collection
            data={events}
            emptyTitle="Aucun événement pour le moment"
            emptyStateSubtext="Cette organisation n'a pas encore publié d'événements sur Badgi."
            collectionType="All_Events"
            limit={500}
            page={1}
            totalPages={1}
          />
        </div>
      </section>

      {/* ── Partners carousel ── */}
      {hasPartners && <OrgPartnersCarousel partners={org.partners ?? []} />}

      {/* ══════════════════════════════════════════════
          ORG FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="relative">
        <GradientLine />
        <div className="glass-panel border-t-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-12">

            {/* Col 1 — Identity */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                {org.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={org.logo} alt={org.name} className="w-10 h-10 rounded-xl object-cover border border-white/20" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                    style={{ background: "rgba(98,76,245,0.12)" }}
                  >
                    <span className="font-syne font-black text-lg" style={{ color: "#624CF5" }}>{org.name.charAt(0)}</span>
                  </div>
                )}
                <span className="font-syne font-bold text-slate-800 dark:text-white text-base">{org.name}</span>
              </div>
              {org.description && (
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-4">{org.description}</p>
              )}
              {org.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Organisation vérifiée
                </span>
              )}
            </div>

            {/* Col 2 — Contact & social */}
            <div className="space-y-5">
              <h3 className="font-syne font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-white/90">Contact</h3>
              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 shrink-0">
                    <svg className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                    </svg>
                  </div>
                  <span>{org.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              {socialList.length > 0 && (
                <div className="space-y-2">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Réseaux sociaux</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {socialList.map((s, i) => (
                      <a
                        key={i}
                        href={s.href!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-[#624CF5] hover:border-[#624CF5]/30 hover:scale-110 active:scale-90 transition-all duration-200"
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Col 3 — Domain & CTA */}
            <div className="space-y-5">
              <h3 className="font-syne font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-white/90">Agenda en ligne</h3>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <span style={{ color: "#624CF5" }}><IconLink /></span>
                <span className="text-sm text-slate-500 font-mono">{domain}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cette page est propulsée par{" "}
                <a
                  href="https://badgi.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline"
                  style={{ color: "#624CF5" }}
                >
                  Badgi.net
                </a>
                , la plateforme tunisienne d&apos;inscription et de badging pour événements médicaux.
              </p>
              <a
                href="https://badgi.net"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white px-5 py-2.5 rounded-full transition-all hover:opacity-90"
                style={{ background: "linear-gradient(to right, #624CF5, #4f8ef7)", boxShadow: "0 4px 16px rgba(98,76,245,0.35)" }}
              >
                <IconPlus />
                Créer votre espace
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-xs">© {new Date().getFullYear()} {org.name}. Tous droits réservés.</p>
            <p className="text-slate-500 text-xs flex items-center gap-1.5">
              Agenda propulsé par{" "}
              <a
                href="https://badgi.net"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:underline"
                style={{ color: "#624CF5" }}
              >
                Badgi.net
              </a>{" "}
              · Plateforme d&apos;inscription et de badging pour événements médicaux en Tunisie
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
