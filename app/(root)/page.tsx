import CategoryFilter from "@/components/shared/CategoryFilter";
import Collection from "@/components/shared/Collection";
import CollectionWrapper from "@/components/shared/Collectionwrapper";
import CountryFilter from "@/components/shared/CountryFilter";
import { DatePickerWithPresets } from "@/components/shared/DateFilter";
import { HomeEventCardSkeleton } from "@/components/shared/HomeEventSkeleton";
import Search from "@/components/shared/Search";
import { Button } from "@/components/ui/button";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { getAllEvents } from "@/lib/actions/event.actions";
import { useUser } from "@/lib/actions/user.actions";
import { SearchParamProps } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home(props: SearchParamProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const searchText = (searchParams?.query as string) || "";
  const category = (searchParams?.category as string) || "";
  const country = (searchParams?.country as string) || "";
  const date = (searchParams?.date as string) || "";
  const initialEvents =
    page === 1 && !searchText && !category && !country && !date
      ? await getAllEvents({
          country,
          query: searchText,
          category,
          page,
          limit: 30,
          date,
        })
      : undefined;

  return (
    <main className="relative min-h-screen bg-background pb-20 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 dark:bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-elite-violet/10 dark:bg-elite-violet/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <section
        id="events"
        className="wrapper relative z-10 mt-2 mb-12 flex flex-col gap-10 md:gap-14 px-4 md:px-6"
      >
        {/* Unified Search & Filter Pill */}
        <div className="flex w-full flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 bg-white/5 dark:bg-elite-charcoal/40 backdrop-blur-3xl p-2.5 lg:px-6 lg:py-2.5 rounded-2xl lg:rounded-full border border-white/5 shadow-elite-soft">
          <div className="flex flex-col md:flex-row items-center gap-3 justify-center shrink-0">
            <div className="flex items-center gap-3">
              <CountryFilter />
              <Search slim placeholder="Search events..." />
            </div>
            <DatePickerWithPresets slim />
          </div>
          
          <div className="h-8 w-px bg-white/10 hidden lg:block mx-1 shrink-0" />
          
          <div className="w-full flex-1 min-w-0">
            <CategoryFilter />
          </div>
        </div>

        {/* Content Section */}
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-elite-spring">
          <CollectionWrapper initialData={initialEvents} />
        </div>
      </section>
    </main>
  );
}
