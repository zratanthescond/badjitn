import { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbSchema } from "@/lib/seo/structuredData";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";

export const metadata: Metadata = {
  title: "Blog - Event Trends, Organizing Guides & Industry Insights",
  description:
    "Read the latest articles, tutorials, and expert tips on event management, marketing, hybrid conference production, and badge credentialing on the Badgi.net blog.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | Badgi.net Insights & Guides",
    description:
      "Articles, guides, and tips for event organizers, conference planners, and community leaders.",
    url: `${baseUrl}/blog`,
    images: [
      {
        url: `${baseUrl}/api/og?title=Event%20Insights%20%26%20Guides&category=Blog`,
        secureUrl: `${baseUrl}/api/og?title=Event%20Insights%20%26%20Guides&category=Blog`,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";
  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Blog", url: `${baseUrl}/blog` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {children}
    </>
  );
}
