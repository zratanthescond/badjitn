import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR Compliance & Data Rights",
  description: "Badgi.net commitment to European Union General Data Protection Regulation (GDPR) standards and user data rights.",
  alternates: {
    canonical: "/gdpr",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GDPRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
