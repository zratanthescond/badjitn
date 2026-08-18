import { MetadataRoute } from "next";

export const revalidate = 86400; // Cache robots for 24 hours

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/events",
          "/events/*",
          "/organisations",
          "/organisations/*",
          "/blog",
          "/blog/*",
          "/about",
          "/features",
          "/pricing",
          "/help",
          "/help/*",
          "/contact",
          "/careers",
          "/community",
          "/documentation",
          "/terms",
          "/privacy",
          "/cookies",
          "/gdpr",
          "/feed.xml",
        ],
        disallow: [
          "/cockpit/",
          "/profile/",
          "/orders/",
          "/sign-in/",
          "/sign-up/",
          "/api/",
          "/banned",
          "/events/*/update",
          "/events/*/scan",
          "/events/*/badge",
          "/events/*/forms",
          "/events/*/submit-work",
          "/events/*/post-purchase",
          "/organisations/*/settings",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/events", "/blog", "/about", "/features", "/pricing"],
        disallow: ["/cockpit/", "/profile/", "/orders/", "/api/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/events", "/blog", "/about", "/features", "/pricing"],
        disallow: ["/cockpit/", "/profile/", "/orders/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
