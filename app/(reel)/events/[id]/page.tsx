import CheckoutButton from "@/components/shared/CheckoutButton";
import Collection from "@/components/shared/Collection";
import HomePostContainer from "@/components/shared/HomePostContainer";
import ShortsScroll from "@/components/shorts/shorts-scroll";
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

  return <ShortsScroll videos={relatedEvents} />;
  // return <></>;
};

export default EventDetails;
