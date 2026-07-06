"use server";
import type { ReactElement } from "react";
import { getOrgWithEvents } from "@/lib/actions/org.actions";
import Collection from "@/components/shared/Collection";
import OrgRollingBanner from "@/components/shared/OrgRollingBanner";
import OrgCountdown from "@/components/shared/OrgCountdown";
import OrgPartnersCarousel from "@/components/shared/OrgPartnersCarousel";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ orgSlug: string }> }) {
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

/* ── helpers ── */
const formatDate = (d: string) =>
  new Intl.DateTimeFormat("fr-TN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(d));

/* ── social SVGs ── */
const FB = () => <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
const IG = () => <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;
const LI = () => <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
const TW = () => <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>;

const socialIcons: Record<string, ReactElement> = { facebook: <FB />, instagram: <IG />, linkedin: <LI />, twitter: <TW /> };

/* ── Verified check ── */
const CheckMark = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default async function OrgPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const data = await getOrgWithEvents(orgSlug);
  if (!data) notFound();

  const { org, events } = data;

  const now      = Date.now();
  const nextEvent = [...events].find((e: any) => new Date(e.startDateTime).getTime() > now) ?? null;
  const upcoming  = events.filter((e: any) => new Date(e.startDateTime).getTime() > now);
  const featuredUpcoming  = upcoming[0] ?? null;
  const secondaryUpcoming = upcoming.slice(1, 3);

  const stats = [
    { value: events.length,   label: "Événements organisés" },
    { value: upcoming.length, label: "Événements à venir" },
    { value: org.partners?.length ?? 0, label: "Sponsors & Partenaires" },
    { value: new Date().getFullYear(), label: "Saison en cours" },
  ];

  const socialList = Object.entries(org.socialLinks ?? {}).filter(([, v]) => !!v) as [string, string][];
  const hasPartners = (org.partners?.length ?? 0) > 0;

  /* stat icons */
  const StatIcons = [
    <svg key="cal" className="h-6 w-6" fill="none" stroke="#0059bb" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    <svg key="clk" className="h-6 w-6" fill="none" stroke="#0059bb" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    <svg key="usr" className="h-6 w-6" fill="none" stroke="#0059bb" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    <svg key="vrf" className="h-6 w-6" fill="none" stroke="#0059bb" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  ];

  return (
    <main className="min-h-screen w-full flex flex-col bg-[#f8f9fa] text-[#191c1d] font-outfit scroll-smooth">

      {/* ══════════════════════════════════════════
          STICKY NAV  —  white, clean
      ══════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-16 bg-white border-b border-[#E2E8F0] shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {org.logo
            ? <img src={org.logo} alt={org.name} className="w-8 h-8 rounded-lg object-cover" />
            : <div className="w-8 h-8 rounded-lg bg-[#0a2540] flex items-center justify-center text-white text-sm font-bold">{org.name[0]}</div>
          }
          <span className="font-bold text-[#000f22] text-base leading-none">{org.name}</span>
          {org.isVerified && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0059bb]/8 border border-[#0059bb]/20 text-[11px] font-bold text-[#0059bb] uppercase tracking-wider">
              <CheckMark /> Vérifié
            </span>
          )}
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {[["Accueil","#top"],["Événements","#events"],["À propos","#about"],["Partenaires","#partners"],["Contact","#contact"]].map(([l,h]) => (
            <a key={h} href={h} className="text-[#43474d] hover:text-[#0059bb] transition-colors duration-200">{l}</a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {nextEvent && (
            <Link href={`/events/${nextEvent._id}`}
              className="px-5 py-2 bg-[#0059bb] text-white rounded-lg text-sm font-semibold hover:bg-[#0047a3] transition-colors">
              S&apos;inscrire
            </Link>
          )}
          <Link href="https://badgi.net" target="_blank"
            className="text-xs text-[#94A3B8] hover:text-[#0059bb] transition-colors">
            Propulsé par <span className="font-bold text-[#0059bb]">Badgi.net</span>
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO  —  split layout (text left / image right)
      ══════════════════════════════════════════ */}
      <section id="top" className="relative min-h-[88vh] flex items-center pt-16 px-6 lg:px-16 bg-white overflow-hidden">
        {/* subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage:"radial-gradient(#0059bb 1px,transparent 1px)", backgroundSize:"28px 28px" }} />

        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 py-16 lg:py-0">

          {/* Left */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0059bb]/15 bg-[#0059bb]/5">
              <span className="w-2 h-2 rounded-full bg-[#0059bb] animate-pulse" />
              <span className="text-[#0059bb] text-[11px] font-bold uppercase tracking-widest">Organisation médicale</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-[#000f22] leading-tight tracking-tight">
              {org.bannerTitle || org.name}
            </h1>

            <p className="text-lg text-[#43474d] leading-relaxed max-w-lg">
              {org.bannerContent || org.description || "Découvrez nos congrès, ateliers et formations médicales professionnels."}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#events"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0a2540] text-white rounded-xl font-semibold text-sm hover:bg-[#0059bb] transition-all duration-300 shadow-lg group">
                Découvrir nos événements
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              {org.website && (
                <a href={org.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-[#E2E8F0] text-[#000f22] rounded-xl font-semibold text-sm hover:bg-[#f8f9fa] transition-all">
                  Devenir partenaire
                </a>
              )}
            </div>
          </div>

          {/* Right — cover image + event glass card */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-[#0059bb]/8 rounded-3xl blur-2xl group-hover:bg-[#0059bb]/15 transition-colors duration-500" />
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl border border-[#E2E8F0]">
              <img
                src={org.coverImage || org.bannerImage || "/assets/images/placeholder.png"}
                alt={org.name}
                className="w-full h-full object-cover"
              />
              {/* Glass event card */}
              {nextEvent && (
                <div className="absolute bottom-5 right-5 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/60 w-72">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-[#0059bb]/10 rounded-lg flex-shrink-0">
                      <svg className="h-5 w-5 text-[#0059bb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#000f22] text-sm leading-tight line-clamp-1">{nextEvent.title}</p>
                      <p className="text-xs text-[#43474d] mt-0.5 capitalize">{formatDate(nextEvent.startDateTime)}</p>
                    </div>
                  </div>
                  {/* Countdown — dark bg so white text is visible */}
                  <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                    <p className="text-[9px] uppercase tracking-widest text-[#94A3B8] mb-2">Compte à rebours</p>
                    <div className="rounded-lg bg-[#0a2540] px-3 py-2">
                      <OrgCountdown targetDate={nextEvent.startDateTime} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Rolling banner */}
      {org.bannerContent && <OrgRollingBanner title={org.bannerTitle} content={org.bannerContent} />}

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <section className="py-14 px-6 lg:px-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm divide-x divide-y md:divide-y-0 divide-[#E2E8F0]">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2.5 py-10 px-6 text-center">
                {StatIcons[i]}
                <span className="text-3xl font-bold text-[#000f22]">{s.value}</span>
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MISSION / ABOUT
      ══════════════════════════════════════════ */}
      <section id="about" className="py-24 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
          {/* Image */}
          <div className="w-full lg:w-1/2 relative">
            <img
              src={org.bannerImage || org.coverImage || "/assets/images/placeholder.png"}
              alt="Mission"
              className="rounded-3xl shadow-xl aspect-square object-cover w-full"
            />
          </div>
          {/* Text */}
          <div className="w-full lg:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold text-[#000f22]">Notre Mission</h2>
            <div className="w-16 h-1.5 bg-[#0059bb] rounded-full" />
            <p className="text-[17px] text-[#43474d] leading-relaxed">
              {org.description || "Organisation dédiée à l'excellence médicale et au perfectionnement professionnel continu."}
            </p>
            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              {[
                { icon: "check_circle", title: "Certification", desc: "Programmes accrédités par les autorités compétentes." },
                { icon: "hub",          title: "Réseautage",   desc: "Échanges entre experts régionaux et internationaux." },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-3 items-start">
                  <svg className="h-5 w-5 text-[#0059bb] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <h4 className="font-bold text-[#000f22]">{title}</h4>
                    <p className="text-sm text-[#43474d]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Banner image */}
      {org.bannerImage && (
        <div className="px-6 lg:px-16 py-10 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm">
            <img src={org.bannerImage} alt={`${org.name} bannière`} className="w-full h-auto max-h-[400px] object-cover" />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          UPCOMING EVENTS  —  bento grid
      ══════════════════════════════════════════ */}
      <section id="events" className="py-24 px-6 lg:px-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="flex justify-between items-end mb-14">
            <div className="space-y-2">
              <span className="text-[#0059bb] text-[11px] font-bold uppercase tracking-widest">Calendrier {new Date().getFullYear()}</span>
              <h2 className="text-3xl font-bold text-[#000f22]">Prochains Événements</h2>
            </div>
            <a href="#all-events" className="hidden md:flex items-center gap-1.5 text-[#0059bb] text-sm font-semibold hover:underline">
              Voir tout l&apos;agenda
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </a>
          </div>

          {upcoming.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Featured */}
              {featuredUpcoming && (
                <div className="md:col-span-2 bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0] group flex flex-col md:flex-row">
                  <div className="md:w-5/12 relative overflow-hidden min-h-[220px]">
                    <img
                      src={featuredUpcoming.imageUrl || "/assets/images/placeholder.png"}
                      alt={featuredUpcoming.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-[#0059bb] text-white rounded-full text-xs font-bold uppercase tracking-wide">À venir</span>
                    </div>
                  </div>
                  <div className="md:w-7/12 p-7 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3 text-xs text-[#43474d] font-semibold">
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="capitalize">{formatDate(featuredUpcoming.startDateTime)}</span>
                        </span>
                        {featuredUpcoming.location?.name && (
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                            {featuredUpcoming.location.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-[#000f22] leading-tight">{featuredUpcoming.title}</h3>
                      {featuredUpcoming.category?.name && (
                        <span className="inline-block px-2.5 py-1 bg-[#edeeef] text-[#43474d] rounded text-xs font-semibold">
                          {featuredUpcoming.category.name}
                        </span>
                      )}
                    </div>
                    <Link href={`/events/${featuredUpcoming._id}`}
                      className="mt-6 block w-full py-3 text-center bg-[#0a2540] text-white rounded-xl font-bold text-sm hover:bg-[#0059bb] transition-colors">
                      S&apos;inscrire à l&apos;événement
                    </Link>
                  </div>
                </div>
              )}

              {/* Secondary */}
              <div className="flex flex-col gap-6">
                {secondaryUpcoming.length > 0 ? secondaryUpcoming.map((ev: any) => (
                  <div key={ev._id} className="bg-white rounded-2xl p-7 shadow-sm border border-[#E2E8F0] flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="space-y-4">
                      <div className="p-2.5 bg-[#0059bb]/8 w-fit rounded-xl">
                        <svg className="h-5 w-5 text-[#0059bb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      </div>
                      <h3 className="font-bold text-[#000f22] leading-tight line-clamp-2">{ev.title}</h3>
                      <div className="flex flex-col gap-1.5 text-xs text-[#43474d]">
                        <span className="flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="capitalize">{formatDate(ev.startDateTime)}</span>
                        </span>
                        {ev.pricePlan?.length > 0 && (
                          <span className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Places limitées
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={`/events/${ev._id}`}
                      className="mt-5 block py-2.5 text-center border border-[#0059bb] text-[#0059bb] rounded-xl font-bold text-sm hover:bg-[#0059bb] hover:text-white transition-all">
                      En savoir plus
                    </Link>
                  </div>
                )) : (
                  <div className="bg-white rounded-2xl p-7 border border-[#E2E8F0] flex items-center justify-center min-h-[160px]">
                    <p className="text-sm text-[#94A3B8] text-center">Plus d&apos;événements à venir bientôt</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E8F0]">
              <p className="text-[#43474d]">Aucun événement à venir pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PARTNERS  — carousel or grid
      ══════════════════════════════════════════ */}
      {hasPartners && (
        <section id="partners" className="bg-white overflow-hidden">
          <OrgPartnersCarousel partners={org.partners ?? []} />
        </section>
      )}

      {/* ══════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════ */}
      <section id="contact" className="py-24 px-6 lg:px-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#000f22]">Nous Contacter</h2>
              <p className="text-[#43474d] mt-2">Des questions sur nos événements ou souhaitez devenir partenaire ?</p>
            </div>

            <div className="flex flex-col gap-4">
              {org.website && (
                <a href={org.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className="p-3.5 bg-[#0059bb]/8 rounded-full flex-shrink-0">
                    <svg className="h-5 w-5 text-[#0059bb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-[#000f22]">Site web</p>
                    <p className="text-sm text-[#43474d] group-hover:text-[#0059bb] transition-colors">{org.website.replace(/https?:\/\//, "")}</p>
                  </div>
                </a>
              )}

              {socialList.length > 0 && (
                <div className="p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
                  <p className="font-bold text-[#000f22]">Réseaux sociaux</p>
                  <div className="flex items-center gap-2.5">
                    {socialList.map(([key, href]) => (
                      <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f3f4f5] text-[#43474d] hover:bg-[#0059bb] hover:text-white transition-all duration-200">
                        {socialIcons[key]}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Org logo / placeholder */}
          <div className="w-full aspect-video bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-center">
            {org.logo
              ? <img src={org.logo} alt={org.name} className="w-36 h-36 object-contain opacity-20" />
              : <svg className="h-24 w-24 text-[#E2E8F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            }
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ALL EVENTS
      ══════════════════════════════════════════ */}
      <section id="all-events" className="py-24 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-3 mb-12">
            <span className="text-[#0059bb] text-[11px] font-bold uppercase tracking-widest">Programme</span>
            <h2 className="text-2xl font-bold text-[#000f22]">Tous nos événements</h2>
            <div className="w-10 h-px bg-[#E2E8F0]" />
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

      {/* ══════════════════════════════════════════
          FOOTER  —  dark navy
      ══════════════════════════════════════════ */}
      <footer className="bg-[#000f22] text-white px-6 lg:px-16 pt-14 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              {org.logo
                ? <img src={org.logo} alt={org.name} className="w-8 h-8 rounded-lg object-cover" />
                : <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold">{org.name[0]}</div>
              }
              <span className="font-bold">{org.name}</span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed line-clamp-4">
              {org.description?.slice(0, 130) || "Organisation professionnelle dédiée à l'excellence médicale."}
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Navigation</h4>
            <nav className="flex flex-col gap-2">
              {[["Accueil","#top"],["Événements","#events"],["À propos","#about"],["Partenaires","#partners"],["Contact","#contact"]].map(([l,h])=>(
                <a key={h} href={h} className="text-sm text-[#94A3B8] hover:text-white transition-colors">{l}</a>
              ))}
            </nav>
          </div>

          {/* Légal */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Légal</h4>
            <nav className="flex flex-col gap-2">
              {[["Politique de confidentialité","/privacy"],["Conditions d'utilisation","/terms"],["Cookies","/cookies"]].map(([l,h])=>(
                <Link key={h} href={h} className="text-sm text-[#94A3B8] hover:text-white transition-colors">{l}</Link>
              ))}
            </nav>
          </div>

          {/* Social & powered by */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Suivez-nous</h4>
            {socialList.length > 0 && (
              <div className="flex items-center gap-2">
                {socialList.map(([key, href]) => (
                  <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-[#94A3B8] hover:bg-[#0059bb] hover:text-white transition-all">
                    {socialIcons[key]}
                  </a>
                ))}
              </div>
            )}
            <p className="text-xs text-[#94A3B8]">
              Propulsé par{" "}
              <Link href="https://badgi.net" target="_blank" className="font-bold text-[#0059bb] hover:underline">Badgi.net</Link>
            </p>
          </div>
        </div>

        <div className="pt-6 text-center text-xs text-[#94A3B8]">
          © {new Date().getFullYear()} {org.name}. Tous droits réservés.
        </div>
      </footer>
    </main>
  );
}
