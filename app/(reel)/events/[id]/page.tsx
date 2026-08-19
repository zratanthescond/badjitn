import ShortsScroll from "@/components/shorts/shorts-scroll";
import { getEventBySlug } from "@/lib/actions/event.actions";
import { SearchParamProps } from "@/types";
import { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateEventSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/structuredData";

function getEventOgImage(event: any, baseUrl: string): string {
  const isVideoStream =
    !event.imageUrl ||
    event.imageUrl.includes(".m3u8") ||
    event.imageUrl.includes("/videos/") ||
    /\.(m3u8|mp4|webm|ogg|mov|ts)(\?|$)/i.test(event.imageUrl) ||
    event.imageUrl.includes("/manifest");

  if (event.imageUrl && !isVideoStream) {
    return event.imageUrl.startsWith("http://") || event.imageUrl.startsWith("https://")
      ? event.imageUrl
      : `${baseUrl}${event.imageUrl.startsWith("/") ? "" : "/"}${event.imageUrl}`;
  }

  return `${baseUrl}/api/og?title=${encodeURIComponent(
    event.title || "Event"
  )}&category=${encodeURIComponent(
    event.category?.name || "Event"
  )}&date=${encodeURIComponent(
    event.startDateTime
      ? new Date(event.startDateTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : ""
  )}&type=event`;
}

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
    const ogImageUrl = getEventOgImage(event, baseUrl);

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
            url: ogImageUrl,
            secureUrl: ogImageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: "image/png",
          },
        ],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Badgi.net`,
        description,
        images: [ogImageUrl],
      },
      icons: {
        icon: event.organisation?.logo || "/favicon.ico",
      },
      other: {
        "fb:app_id": process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "966242223397117",
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
  const ogImageUrl = getEventOgImage(event, baseUrl);

  const eventSchema = generateEventSchema({
    name: event.title,
    description: event.description,
    url: eventUrl,
    imageUrl: ogImageUrl,
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

