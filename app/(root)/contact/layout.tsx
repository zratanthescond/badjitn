import { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbSchema } from "@/lib/seo/structuredData";

export const metadata: Metadata = {
  title: "Contact Us - Support, Sales & Inquiries",
  description:
    "Get in touch with the Badgi.net team. We are here to answer questions about event hosting, enterprise custom integrations, partnerships, and platform support.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Badgi.net",
    description:
      "Have questions or need assistance? Contact the Badgi.net team for sales and support.",
    url: "/contact",
    images: [{ url: "/api/og?title=Contact%20Badgi.net&category=Support" }],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";
  const breadcrumb = generateBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Contact Us", url: `${baseUrl}/contact` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {children}
    </>
  );
}
