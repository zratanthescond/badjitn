import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SupportPage from "@/components/support-page";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: "supportPage" });

  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      type: "website",
    },
  };
}

export default function Support() {
  return <SupportPage />;
}
