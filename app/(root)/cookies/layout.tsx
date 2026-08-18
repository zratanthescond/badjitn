import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Information about how Badgi.net uses cookies and tracking technologies to optimize user experience.",
  alternates: {
    canonical: "/cookies",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
