import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";

  try {
    await connectToDatabase();

    const events = await Event.find({ restricted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const itemsXml = events
      .map((event: any) => {
        const eventUrl = `${baseUrl}/events/${event.slug || event._id.toString()}`;
        const title = (event.title || "Event").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const description = (event.description || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const pubDate = event.createdAt ? new Date(event.createdAt).toUTCString() : new Date().toUTCString();

        return `
    <item>
      <title>${title}</title>
      <link>${eventUrl}</link>
      <guid isPermaLink="true">${eventUrl}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      ${event.imageUrl ? `<enclosure url="${event.imageUrl}" type="image/jpeg" />` : ""}
    </item>`;
      })
      .join("");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Badgi.net - Events Feed</title>
    <link>${baseUrl}</link>
    <description>Latest upcoming events, conferences, workshops, and gatherings on Badgi.net</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("RSS feed generation error:", error);
    return new NextResponse("<error>Failed to generate feed</error>", {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
