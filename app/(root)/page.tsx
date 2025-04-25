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

export default async function Home({ searchParams }: SearchParamProps) {
  const page = Number(searchParams?.page) || 1;
  const searchText = (searchParams?.query as string) || "";
  const category = (searchParams?.category as string) || "";
  const country = (searchParams?.country as string) || "";

  // const events = await getAllEvents({
  //   country,
  //   query: searchText,
  //   category,
  //   page,
  //   limit: 30,
  // });

  return (
    <>
      <section
        id="events"
        className="wrapper  my-2 flex flex-col gap-8 md:gap-12 rounded-xl  p-2 md:p-3"
      >
        <div className="flex w-full flex-col  gap-5 md:flex-row">
          <div className="flex w-full items-center justify-between   flex-row">
            <CountryFilter />
            <Search slim placeholder="Search events..." />
            <DatePickerWithPresets />
          </div>
          <CategoryFilter />
        </div>

        <CollectionWrapper />
      </section>
    </>
  );
}
