"use client";
import { IEvent } from "@/lib/database/models/event.model";
import React, { useMemo, useState } from "react";
import Card from "./Card";
import Pagination from "./Pagination";
import { useTranslations } from "next-intl";

type CollectionProps = {
  data: IEvent[];
  emptyTitle: string;
  emptyStateSubtext: string;
  limit: number;
  page: number | string;
  totalPages?: number;
  urlParamName?: string;
  collectionType?: "Events_Organized" | "My_Tickets" | "All_Events";
  userPhoto?: string;
  currentUserId?: string;
};

type SourceFilter = "all" | "badgi" | "external";

const Collection = ({
  data,
  emptyTitle,
  emptyStateSubtext,
  page,
  totalPages = 0,
  collectionType,
  urlParamName,
  userPhoto,
  currentUserId,
}: CollectionProps) => {
  const t = useTranslations("collection");
  const tx = (key: string, fallback: string) => (t.has(key as any) ? t(key as any) : fallback);

  const hasOrderLink = collectionType === "Events_Organized";
  const hidePrice    = collectionType === "My_Tickets";
  const isHomepage   = collectionType === "All_Events";

  const currentYear = new Date().getFullYear();

  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // 1️⃣  Apply source filter
  const sourceFiltered = useMemo<IEvent[]>(() => {
    if (!data?.length) return [];
    if (sourceFilter === "badgi")    return data.filter((e) => !e.isFromOtherPlatform);
    if (sourceFilter === "external") return data.filter((e) => !!e.isFromOtherPlatform);
    return data;
  }, [data, sourceFilter]);

  // 2️⃣  Extract sorted unique years from source-filtered data
  const availableYears = useMemo<number[]>(() => {
    const years = [...new Set(sourceFiltered.map((e) => new Date(e.startDateTime).getFullYear()))];
    return years.sort((a, b) => {
      if (a === currentYear) return -1;
      if (b === currentYear) return 1;
      if (a > currentYear && b > currentYear) return a - b;
      if (a < currentYear && b < currentYear) return b - a;
      return a > currentYear ? -1 : 1;
    });
  }, [sourceFiltered, currentYear]);

  // 3️⃣  Apply year filter on top
  const filtered = useMemo<IEvent[]>(() => {
    if (!selectedYear) return sourceFiltered;
    return sourceFiltered.filter(
      (e) => new Date(e.startDateTime).getFullYear() === selectedYear
    );
  }, [sourceFiltered, selectedYear]);

  // 4️⃣  Group by year (preserving sort order)
  const groupedByYear = useMemo<[number, IEvent[]][]>(() => {
    if (!filtered.length) return [];
    const map = new Map<number, IEvent[]>();
    for (const event of filtered) {
      const year = new Date(event.startDateTime).getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(event);
    }
    return Array.from(map.entries())
      .map(([year, events]): [number, IEvent[]] => [
        year,
        events.sort(
          (a, b) =>
            new Date(b.startDateTime).getTime() -
            new Date(a.startDateTime).getTime()
        ),
      ])
      .sort(([a], [b]) => {
        if (a === currentYear) return -1;
        if (b === currentYear) return 1;
        if (a > currentYear && b > currentYear) return a - b;
        if (a < currentYear && b < currentYear) return b - a;
        return a > currentYear ? -1 : 1;
      });
  }, [filtered, currentYear]);

  const SOURCE_FILTERS: { key: SourceFilter; label: string }[] = [
    { key: "all",      label: tx("filterAll", "Tous") },
    { key: "badgi",    label: tx("filterBadgi", "Badgi Events") },
    { key: "external", label: tx("filterExternal", "Autres Plateformes") },
  ];

  let globalIndex = 0;

  return (
    <>
      {data && data.length > 0 ? (
        <div className="flex flex-col gap-8 font-outfit">

          {/* ── Source filter pills ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {SOURCE_FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setSourceFilter(key); setSelectedYear(null); }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    sourceFilter === key
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Year filter pills (only on homepage, when more than one year) ── */}
            {isHomepage && availableYears.length > 1 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedYear(null)}
                  className={`px-4 py-1 rounded-full text-xs font-bold font-syne tracking-wide transition-all duration-200 border ${
                    selectedYear === null
                      ? "bg-primary/90 text-white border-primary shadow"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {tx("allYears", "Toutes les années")}
                </button>
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                    className={`px-4 py-1 rounded-full text-xs font-bold font-syne tracking-wide transition-all duration-200 border flex items-center gap-1.5 ${
                      selectedYear === year
                        ? "bg-primary/90 text-white border-primary shadow"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {year}
                    {year === currentYear && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Empty state for filtered view ── */}
          {groupedByYear.length === 0 && (
            <div className="flex-center min-h-[200px] w-full flex-col gap-3 rounded-3xl bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-16 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {tx("noEventsInCategory", "Aucun événement dans cette catégorie")}
              </p>
            </div>
          )}

          {/* ── Event sections grouped by year ── */}
          {groupedByYear.map(([year, events]) => (
            <section key={year} className="flex flex-col gap-6">
              {/* Year separator — only when showing all years */}
              {selectedYear === null && (
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
                  <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-sm font-syne font-bold tracking-widest text-primary uppercase">
                      {year}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
                </div>
              )}

              {/* Cards grid */}
              <ul className="grid w-full grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-8">
                {events.map((event) => {
                  const idx = globalIndex++;
                  return (
                    <li
                      key={event?._id}
                      className="flex justify-center animate-in fade-in slide-in-from-bottom-5"
                      style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
                    >
                      <Card
                        event={event}
                        hasOrderLink={hasOrderLink}
                        hidePrice={hidePrice}
                        userPhoto={userPhoto}
                        currentUserId={currentUserId}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          {/* Count-based pagination only for non-homepage views (My Tickets, Organized) */}
          {!isHomepage && totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                urlParamName={urlParamName}
                page={page}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-center wrapper min-h-[300px] w-full flex-col gap-4 rounded-3xl glass-panel bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-28 text-center">
          <h3 className="text-2xl md:text-3xl font-syne font-bold text-slate-800 dark:text-white tracking-tight">
            {emptyTitle}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-anchor">
            {emptyStateSubtext}
          </p>
        </div>
      )}
    </>
  );
};

export default Collection;
