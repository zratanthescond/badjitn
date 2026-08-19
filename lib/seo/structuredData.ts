/**
 * JSON-LD Structured Data Generators for Badgi.net
 * Conforms to schema.org specifications for Google Rich Results (Event cards, Sitelinks Search Box, Breadcrumbs, FAQs, etc.)
 */

export interface EventSchemaProps {
  name: string;
  description?: string;
  url: string;
  imageUrl?: string;
  startDate: string | Date;
  endDate?: string | Date;
  isOnline?: boolean;
  locationName?: string;
  locationAddress?: string;
  locationCity?: string;
  locationCountry?: string;
  latitude?: number;
  longitude?: number;
  price?: number | string;
  currency?: string;
  isFree?: boolean;
  organizerName?: string;
  organizerUrl?: string;
  organizerLogo?: string;
  category?: string;
}

export function generateEventSchema({
  name,
  description,
  url,
  imageUrl,
  startDate,
  endDate,
  isOnline,
  locationName,
  locationAddress,
  locationCity,
  locationCountry,
  latitude,
  longitude,
  price,
  currency = "USD",
  isFree,
  organizerName = "Badgi.net",
  organizerUrl,
  organizerLogo,
}: EventSchemaProps) {
  const startISO = typeof startDate === "string" ? startDate : startDate?.toISOString();
  const endISO = endDate ? (typeof endDate === "string" ? endDate : endDate.toISOString()) : undefined;

  const locationObject = isOnline
    ? {
        "@type": "VirtualLocation",
        url: url,
      }
    : {
        "@type": "Place",
        name: locationName || "Event Venue",
        address: {
          "@type": "PostalAddress",
          streetAddress: locationAddress || locationName || "",
          addressLocality: locationCity || "",
          addressCountry: locationCountry || "",
        },
        ...(latitude && longitude
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude,
                longitude,
              },
            }
          : {}),
      };

  const offerPrice = isFree ? "0" : typeof price === "number" ? price.toString() : (price || "0");

  const isVideoOrInvalid =
    !imageUrl ||
    imageUrl.includes(".m3u8") ||
    imageUrl.includes("/videos/") ||
    /\.(mp4|webm|ogg|mov|m3u8|ts)(\?|$)/i.test(imageUrl);

  const cleanImageUrl = isVideoOrInvalid
    ? undefined
    : imageUrl.startsWith("http://") || imageUrl.startsWith("https://")
    ? imageUrl
    : `https://badgi.net${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description: description || name,
    image: cleanImageUrl ? [cleanImageUrl] : undefined,
    startDate: startISO,
    ...(endISO ? { endDate: endISO } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: locationObject,
    offers: {
      "@type": "Offer",
      url,
      price: offerPrice,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      validFrom: startISO,
    },
    organizer: {
      "@type": "Organization",
      name: organizerName,
      ...(organizerUrl ? { url: organizerUrl } : {}),
      ...(organizerLogo ? { logo: organizerLogo } : {}),
    },
  };
}

export function generateOrganizationSchema(baseUrl: string = "https://badgi.net") {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Badgi.net",
    alternateName: "Badgi",
    url: baseUrl,
    logo: `${baseUrl}/assets/images/logo.png`,
    description: "Badgi.net is an all-in-one event management, ticketing, badge generation, and discovery platform.",
    sameAs: [
      "https://twitter.com/badgi_net",
      "https://www.linkedin.com/company/badginet",
      "https://facebook.com/badginet",
      "https://instagram.com/badginet",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "contact@badgi.net",
      url: `${baseUrl}/contact`,
    },
  };
}

export function generateWebSiteSchema(baseUrl: string = "https://badgi.net") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Badgi.net",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  publisherName?: string;
  publisherLogo?: string;
}

export function generateArticleSchema({
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  publisherName = "Badgi.net",
  publisherLogo = "https://badgi.net/assets/images/logo.png",
}: ArticleSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: publisherName,
      logo: {
        "@type": "ImageObject",
        url: publisherLogo,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}
