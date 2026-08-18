import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation & Developer API Reference",
  description:
    "Learn how to integrate with the Badgi.net API, embed event ticketing widgets, customize webhooks, and automate attendee check-ins.",
  alternates: {
    canonical: "/documentation",
  },
  openGraph: {
    title: "Documentation & Developer API | Badgi.net",
    description: "Complete API reference, webhooks, SDKs, and developer guides for Badgi.net.",
    url: "/documentation",
    images: [{ url: "/api/og?title=Developer%20Documentation&category=Docs" }],
  },
};

export default function DocumentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
