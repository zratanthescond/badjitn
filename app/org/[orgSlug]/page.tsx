import { getOrgWithEvents } from "@/lib/actions/org.actions";
import Collection from "@/components/shared/Collection";
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
  return {
    title: `${data.org.name} | Badgi.net`,
    description: data.org.description,
  };
}

export default async function OrgPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const data = await getOrgWithEvents(orgSlug);

  if (!data) notFound();

  const { org, events } = data;

  return (
    <main className="min-h-screen w-full flex flex-col bg-white dark:bg-elite-charcoal">

      {/* ── Top nav ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-elite-charcoal/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {org.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={org.logo}
                alt={org.name}
                width={32}
                height={32}
                className="rounded-full object-cover border border-slate-200 dark:border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {org.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-syne font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
              {org.name}
            </span>
            {org.isVerified && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Vérifié
              </span>
            )}
          </div>
          <Link
            href="https://badgi.net"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors"
          >
            <span>Propulsé par</span>
            <span className="font-bold text-primary">Badgi.net</span>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "220px",
          backgroundImage: org.coverImage ? `url(${org.coverImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className={`absolute inset-0 ${
            org.coverImage
              ? "bg-gradient-to-b from-black/30 via-black/40 to-black/70"
              : "bg-gradient-to-br from-primary/80 via-primary/60 to-indigo-900"
          }`}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {org.logo && (
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={org.logo}
                alt={org.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-xl"
              />
            </div>
          )}
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-syne font-black text-white leading-tight drop-shadow">
              {org.name}
            </h1>
            {org.description && (
              <p className="text-white/80 text-sm max-w-xl line-clamp-2">{org.description}</p>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-1">
              {org.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-900/50 px-2.5 py-1 rounded-full border border-emerald-700">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Organisation vérifiée
                </span>
              )}
              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {org.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <span>
            <strong className="text-slate-800 dark:text-white font-semibold">{events.length}</strong>{" "}
            événement{events.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Events grid ── */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        <Collection
          data={events}
          emptyTitle="Aucun événement pour le moment"
          emptyStateSubtext="Cette organisation n'a pas encore publié d'événements sur Badgi."
          collectionType="All_Events"
          limit={500}
          page={1}
          totalPages={1}
        />
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-6 text-center text-xs text-slate-400">
        Agenda propulsé par{" "}
        <Link href="https://badgi.net" className="text-primary font-semibold hover:underline">
          Badgi.net
        </Link>{" "}
        · Plateforme d&apos;inscription et de badging pour événements médicaux en Tunisie
      </footer>
    </main>
  );
}
