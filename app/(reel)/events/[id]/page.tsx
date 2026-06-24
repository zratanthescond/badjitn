import Collection from "@/components/shared/Collection";
import HomePostContainer from "@/components/shared/HomePostContainer";
import ShortsScroll from "@/components/shorts/shorts-scroll";
import {
  getEventById,
  getRelatedEventsByCategory,
} from "@/lib/actions/event.actions";
import { formatDateTime } from "@/lib/utils";
import { SearchParamProps } from "@/types";
import { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata(props: SearchParamProps): Promise<Metadata> {
  const params = await props.params;
  const event = await getEventById(params.id);

  return {
    title: event?.title || "Event",
    icons: {
      icon: event?.organisation?.logo || "/favicon.ico",
    },
  };
}

const EventDetails = async (props: SearchParamProps) => {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const {
    id
  } = params;

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
