"use client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import Collection from "./Collection";
import { getAllEvents } from "@/lib/actions/event.actions";
import { HomeEventCardSkeleton } from "./HomeEventSkeleton";
import { useGetAllEvents } from "@/hooks/useGetAllEvent";
import { date } from "zod";
import { useTranslations } from "next-intl";

export default function CollectionWrapper() {
  const searchParams = useSearchParams();

  // Extract values with fallback
  const page = Number(searchParams.get("page")) || 1;
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";
  const country = searchParams.get("country") || "";
  const date = searchParams.get("date") || "";
  const t = useTranslations("homePage");
  const { data: events, isPending } = useGetAllEvents({
    page,
    limit: 30,
    country,
    category,
    query,
    date,
  });

  useEffect(() => {
    if (events?.data?.length === 0) {
      window.scrollTo(0, 0);
    }
  }, [events?.data]);

  return isPending ? (
    <HomeEventCardSkeleton />
  ) : (
    <Collection
      data={events?.data}
      emptyTitle={t("noEvents")}
      emptyStateSubtext={t("noEventsDescription")}
      collectionType="All_Events"
      limit={30}
      page={page}
      totalPages={events?.totalPages}
    />
  );
}
