"use client";

import { useLocale, useTranslations } from "next-intl";
import { localeOptions } from "@/lib/constants/locale-options";
import LocaleSwitcherSelect from "./LocaleSwitcherSelect";

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      items={localeOptions.map((item) => ({
        value: item.value,
        label:
          item.value === "en"
            ? t("en")
            : item.value === "fr"
              ? t("fr")
              : item.value === "ar"
                ? t("ar")
                : t("es"),
        flagSrc: item.flagSrc,
        flagAlt: item.flagAlt,
      }))}
      label={t("label")}
    />
  );
}
