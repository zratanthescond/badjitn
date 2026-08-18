import { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import Organisation from "@/lib/database/models/organisation.model";

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";

  // Static marketing & public pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}`,
          fr: `${baseUrl}`,
          ar: `${baseUrl}`,
        },
      },
    },
    {
      url: `${baseUrl}/organisations`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/documentation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/gdpr`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  let eventPages: MetadataRoute.Sitemap = [];
  let orgPages: MetadataRoute.Sitemap = [];

  try {
    await connectToDatabase();

    // Fetch dynamic events
    const events = await Event.find({ restricted: { $ne: true } })
      .select("_id slug createdAt startDateTime")
      .sort({ createdAt: -1 })
      .limit(2000)
      .lean();

    eventPages = events.map((event: any) => ({
      url: `${baseUrl}/events/${event.slug || event._id.toString()}`,
      lastModified: event.createdAt ? new Date(event.createdAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    // Fetch dynamic organisations
    const organisations = await Organisation.find({})
      .select("slug createdAt")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    orgPages = organisations.map((org: any) => ({
      url: `${baseUrl}/organisations/${org.slug}`,
      lastModified: org.createdAt ? new Date(org.createdAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));
  } catch (error) {
    console.error("Failed to generate dynamic sitemap entries:", error);
  }

  return [...staticPages, ...eventPages, ...orgPages];
}
