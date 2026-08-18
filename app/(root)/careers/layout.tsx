import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers - Join the Badgi.net Team",
  description:
    "Explore open roles at Badgi.net and help us build the next generation of event technology, ticketing, and live engagement tools.",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers | Badgi.net",
    description: "Join our fast-growing remote team building the future of event management.",
    url: "/careers",
    images: [{ url: "/api/og?title=Careers%20at%20Badgi.net&category=Jobs" }],
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
