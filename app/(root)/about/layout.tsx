import { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbSchema } from "@/lib/seo/structuredData";

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
    url: "/about",
    images: [{ url: "/api/og?title=About%20Badgi.net&category=Company" }],
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
