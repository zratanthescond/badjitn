import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HelpPage from "@/components/help-page";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "helpPage" });

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

export default function Help() {
  return <HelpPage />;
}
