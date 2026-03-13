export type Locale = (typeof locales)[number];

export const locales = ["en", "fr", "ar", "es"] as const;
export const defaultLocale: Locale = "fr";
