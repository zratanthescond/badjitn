import { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbSchema } from "@/lib/seo/structuredData";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";

export const metadata: Metadata = {
  title: "About Us - The Future of Event Management",
  description:
    "Learn about Badgi.net's mission to empower event organizers and attendees worldwide with modern ticketing, seamless badge credentials, and unforgettable experiences.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Badgi.net",
    description:
      "Learn about Badgi.net's mission to revolutionize event management and community gatherings.",
    url: `${baseUrl}/about`,
    images: [
      {
        url: `${baseUrl}/api/og?title=About%20Badgi.net&category=Company`,
        secureUrl: `${baseUrl}/api/og?title=About%20Badgi.net&category=Company`,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";
  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "About Us", url: `${baseUrl}/about` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {children}
    </>
  );
}
