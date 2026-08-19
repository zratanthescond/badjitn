import { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbSchema } from "@/lib/seo/structuredData";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";

export const metadata: Metadata = {
  title: "Features - Event Ticketing, Badges, Analytics & AI Tools",
  description:
    "Explore Badgi.net features: smart badge designer, automated QR code check-ins, multi-tier ticketing, AI event description generators, and real-time attendance analytics.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Features | Badgi.net Event Platform",
    description:
      "All the tools you need to create, promote, ticket, and run unforgettable events.",
    url: `${baseUrl}/features`,
    images: [
      {
        url: `${baseUrl}/api/og?title=Platform%20Features&category=Features`,
        secureUrl: `${baseUrl}/api/og?title=Platform%20Features&category=Features`,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";
  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Features", url: `${baseUrl}/features` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {children}
    </>
  );
}
