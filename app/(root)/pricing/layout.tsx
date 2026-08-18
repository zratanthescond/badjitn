import { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { generateFAQSchema } from "@/lib/seo/structuredData";

export const metadata: Metadata = {
  title: "Pricing Plans - Affordable Event Management & Ticketing",
  description:
    "Explore transparent pricing plans for Badgi.net. Start free with up to 3 events, or unlock unlimited events, smart badges, and advanced analytics with Pro & Enterprise.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing Plans | Badgi.net",
    description:
      "Simple, transparent pricing for event organizers of all sizes. Free, Pro, and Enterprise options available.",
    url: "/pricing",
    images: [{ url: "/api/og?title=Pricing%20Plans&category=Pricing" }],
  },
};

const pricingFaqs = [
  {
    question: "Can I try Badgi.net for free?",
    answer: "Yes, our Starter plan is 100% free forever and lets you create up to 3 events with basic ticketing and analytics.",
  },
  {
    question: "What payment methods are supported for ticket sales?",
    answer: "We support major credit cards via Stripe, direct bank transfers, and on-door cash payments depending on your event preferences.",
  },
  {
    question: "Can I cancel or upgrade my subscription anytime?",
    answer: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your organizer settings.",
  },
  {
    question: "Do you offer discounts for non-profits and universities?",
    answer: "Yes! Contact our sales team to receive our special discounted pricing for academic institutions and non-profit organizations.",
  },
];

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqSchema = generateFAQSchema(pricingFaqs);

  return (
    <>
      <JsonLd data={faqSchema} />
      {children}
    </>
  );
}
