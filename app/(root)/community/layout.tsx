import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community - Connect with Organizers & Creators",
  description:
    "Join the Badgi.net organizer and attendee community. Share event production tips, collaborate on conferences, and discover meetups.",
  alternates: {
    canonical: "/community",
  },
  openGraph: {
    title: "Community | Badgi.net",
    description: "Join the vibrant Badgi.net organizer and creator community.",
    url: "/community",
    images: [{ url: "/api/og?title=Badgi.net%20Community&category=Community" }],
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
