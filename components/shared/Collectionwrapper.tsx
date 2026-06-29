"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Collection from "./Collection";
import { HomeEventCardSkeleton } from "./HomeEventSkeleton";
import { useGetAllEvents } from "@/hooks/useGetAllEvent";
import { useTranslations } from "next-intl";

export default function CollectionWrapper({
  initialData,
  currentUserId,
  userPhoto,
}: {
  initialData?: { data: any[]; totalPages: number };
  currentUserId?: string;
  userPhoto?: string;
}) {
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
    limit: 500,
    country,
    category,
    query,
    date,
    initialData:
      page === 1 &&
      !query &&
      !category &&
      !country &&
      !date
        ? initialData
        : undefined,
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
      limit={500}
      page={page}
      totalPages={events?.totalPages}
      currentUserId={currentUserId}
      userPhoto={userPhoto}
    />
  );
}
