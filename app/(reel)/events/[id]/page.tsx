import CheckoutButton from "@/components/shared/CheckoutButton";
import Collection from "@/components/shared/Collection";
import HomePostContainer from "@/components/shared/HomePostContainer";
import ShortsScroll from "@/components/shared/ScrollShorts";
import {
  getEventById,
  getRelatedEventsByCategory,
} from "@/lib/actions/event.actions";
import { formatDateTime } from "@/lib/utils";
import { SearchParamProps } from "@/types";
import Image from "next/image";

const EventDetails = async ({
  params: { id },
  searchParams,
}: SearchParamProps) => {
  const event = await getEventById(id);

  const relatedEvents = await getRelatedEventsByCategory({
    categoryId: event?.category?._id,
    eventId: event._id,
    page: searchParams.page as string,
  });
  relatedEvents?.data.unshift(event);

  return (
    <>
      <ShortsScroll videos={relatedEvents} />

      {/* EVENTS with the same category */}
      {/* <section className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <h2 className="h2-bold">Related Events</h2>

        <Collection
          data={relatedEvents?.data}
          emptyTitle="No Events Found"
          emptyStateSubtext="Come back later"
          collectionType="All_Events"
          limit={3}
          page={searchParams.page as string}
          totalPages={relatedEvents?.totalPages}
        />
      </section> */}
    </>
  );
};

export default EventDetails;
