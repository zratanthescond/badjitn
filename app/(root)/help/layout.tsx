import type React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import JsonLd from "@/components/seo/JsonLd";
import { generateFAQSchema } from "@/lib/seo/structuredData";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: "helpPage" });

  return {
    title: {
      template: `%s | ${t("title") || "Help Center"}`,
      default: t("title") || "Help Center & FAQ",
    },
    description: t("subtitle") || "Find answers to frequently asked questions about Badgi.net event management and ticketing.",
    alternates: {
      canonical: "/help",
    },
  };
}

const helpFaqs = [
  {
    question: "How do I create an event on Badgi.net?",
    answer: "Click 'Create Event' from the navigation bar, enter your event details, configure ticket pricing, customize the registration fields, and publish.",
  },
  {
    question: "How does the QR badge scanning work?",
    answer: "Attendees receive a QR code badge via email and in their profile. Organizers can use the in-app scanner to scan badges in real-time at the entrance.",
  },
  {
    question: "How do I withdraw earnings from ticket sales?",
    answer: "Ticket payouts are processed directly through Stripe Connect or recorded bank transfers depending on your account setup.",
  },
];

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqSchema = generateFAQSchema(helpFaqs);

  return (
    <>
      <JsonLd data={faqSchema} />
      {children}
    </>
  );
}
