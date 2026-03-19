"use client";
import { IEvent } from "@/lib/database/models/event.model";
import React from "react";
import Card from "./Card";
import Pagination from "./Pagination";
import { da } from "date-fns/locale";

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
}: CollectionProps) => {
  return (
    <>
      {data && data.length > 0 ? (
        <div className="flex flex-col items-center gap-12 font-outfit">
          <ul className="grid w-full grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-8">
            {data.map((event, index) => {
              const hasOrderLink = collectionType === "Events_Organized";
              const hidePrice = collectionType === "My_Tickets";

              return (
                <li
                  key={event?._id}
                  className="flex justify-center animate-in fade-in slide-in-from-bottom-5"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                  <Card
                    event={event}
                    hasOrderLink={hasOrderLink}
                    hidePrice={hidePrice}
                    userPhoto={userPhoto}
                  />
                </li>
              );
            })}
          </ul>
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
