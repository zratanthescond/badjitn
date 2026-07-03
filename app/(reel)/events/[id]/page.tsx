import ShortsScroll from "@/components/shorts/shorts-scroll";
import { getEventById } from "@/lib/actions/event.actions";
import { extractEventId } from "@/lib/utils";
import { SearchParamProps } from "@/types";
import { Metadata } from "next";

export async function generateMetadata(props: SearchParamProps): Promise<Metadata> {
  const params = await props.params;
  const event = await getEventById(extractEventId(params.id));

  return {
    title: event?.title || "Event",
    icons: {
      icon: event?.organisation?.logo || "/favicon.ico",
    },
  };
}

const EventDetails = async (props: SearchParamProps) => {
  const params = await props.params;
  const event = await getEventById(extractEventId(params.id));

  return <ShortsScroll videos={{ data: [event], totalPages: 1 }} />;
};

export default EventDetails;
