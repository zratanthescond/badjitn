import ShortsScroll from "@/components/shorts/shorts-scroll";
import { getEventBySlug } from "@/lib/actions/event.actions";
import { SearchParamProps } from "@/types";
import { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateEventSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/structuredData";

export async function generateMetadata(props: SearchParamProps): Promise<Metadata> {
  const params = await props.params;
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";

  try {
    const event = await getEventBySlug(params.id);
    if (!event) {
      return {
        title: "Event Not Found | Badgi.net",
        description: "The requested event could not be found on Badgi.net.",
      };
    }

    const title = event.title || "Event Details";
    const description =
      event.description?.slice(0, 160) ||
      `Join ${event.title} on Badgi.net. Get event details, schedule, tickets, and location.`;
    const eventUrl = `${baseUrl}/events/${event.slug || event._id}`;
    const ogImage =
      event.imageUrl ||
      `${baseUrl}/api/og?title=${encodeURIComponent(event.title)}&category=${encodeURIComponent(
        event.category?.name || "Event"
      )}&type=event`;

    return {
      title,
      description,
      alternates: {
        canonical: eventUrl,
      },
      openGraph: {
        title: `${title} | Badgi.net`,
        description,
        url: eventUrl,
        siteName: "Badgi.net",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Badgi.net`,
        description,
        images: [ogImage],
      },
      icons: {
        icon: event.organisation?.logo || "/favicon.ico",
      },
    };
  } catch {
    return {
      title: "Event | Badgi.net",
    };
  }
}

const EventDetails = async (props: SearchParamProps) => {
  const params = await props.params;
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";
  const event = await getEventBySlug(params.id);

  if (!event) {
    return <ShortsScroll videos={{ data: [], totalPages: 0 }} />;
  }

  const eventUrl = `${baseUrl}/events/${event.slug || event._id}`;

  const eventSchema = generateEventSchema({
    name: event.title,
    description: event.description,
    url: eventUrl,
    imageUrl: event.imageUrl,
    startDate: event.startDateTime,
    endDate: event.endDateTime,
    isOnline: event.isOnline,
    locationName: event.location?.name || event.city,
    locationAddress: event.location?.name,
    locationCity: event.city,
    locationCountry: event.country,
    latitude: event.location?.lat,
    longitude: event.location?.lon,
    price: event.price,
    isFree: event.isFree,
    organizerName: event.organisation?.name || `${event.organizer?.firstName || ""} ${event.organizer?.lastName || ""}`.trim() || "Badgi.net",
    organizerLogo: event.organisation?.logo || event.organizer?.photo,
    category: event.category?.name,
  });

  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Events", url: `${baseUrl}` },
    { name: event.title, url: eventUrl },
  ]);

  return (
    <>
      <JsonLd data={[eventSchema, breadcrumbsSchema]} />
      <ShortsScroll videos={{ data: [event], totalPages: 1 }} />
    </>
  );
};

export default EventDetails;

