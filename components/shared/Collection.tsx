"use client";
import { IEvent } from "@/lib/database/models/event.model";
import React, { useMemo } from "react";
import Card from "./Card";
import Pagination from "./Pagination";

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
  const hasOrderLink = collectionType === "Events_Organized";
  const hidePrice   = collectionType === "My_Tickets";

  // Group events by year (startDateTime), current year first, future years ascending, past years descending
  const groupedByYear = useMemo(() => {
    if (!data?.length) return [];

    const currentYear = new Date().getFullYear();
    const map = new Map<number, IEvent[]>();
    for (const event of data) {
      const year = new Date(event.startDateTime).getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(event);
    }

    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === currentYear) return -1;
      if (b === currentYear) return 1;
      if (a > currentYear && b > currentYear) return a - b; // future: ascending
      if (a < currentYear && b < currentYear) return b - a; // past: most recent first
      return a > currentYear ? -1 : 1; // future before past
    });
  }, [data]);

  let globalIndex = 0;

  return (
    <>
      {data && data.length > 0 ? (
        <div className="flex flex-col gap-12 font-outfit">
          {groupedByYear.map(([year, events]) => (
            <section key={year}>
              {/* ── Year separator ── */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
                <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-sm font-syne font-bold tracking-widest text-primary uppercase">
                    {year}
                  </span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
              </div>

              {/* ── Event cards grid ── */}
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

          {totalPages > 1 && (
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
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
            {emptyStateSubtext}
          </p>
        </div>
      )}
    </>
  );
};

export default Collection;
