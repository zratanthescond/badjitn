import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";
import { ClientProvider } from "@/components/contexts/ClerkClientProvider";
import { ThemeProvider } from "@/components/themeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React from "react";
import localFont from "next/font/local";
import { getLocale, getMessages } from "next-intl/server";
import { useUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

import { Syne, Outfit } from "next/font/google";
import NextIntlProvider from "@/components/providers/NextIntlProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

import { arSA, enUS, frFR } from "@clerk/localizations";
import { dark } from "@clerk/themes";
const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Badgi.net | Event Management, Ticketing & Discovery Platform",
    template: "%s | Badgi.net",
  },
  description:
    "Badgi.net is the all-in-one event management platform. Discover upcoming conferences, workshops, and concerts, create events, sell tickets, and generate smart badge credentials.",
  keywords: [
    "event management",
    "event ticketing",
    "conference platform",
    "badge generator",
    "ticket booking",
    "online events",
    "hybrid events",
    "event discovery",
    "Badgi",
    "Badgi.net",
    "event check-in",
    "organizer dashboard",
  ],
  authors: [{ name: "Badgi.net Team", url: baseUrl }],
  creator: "Badgi.net",
  publisher: "Badgi.net",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "fr-FR": "/fr",
      "ar-SA": "/ar",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "Badgi.net | Event Management, Ticketing & Discovery Platform",
    description:
      "Create, manage, and discover world-class events. Sell tickets, customize smart badges, and streamline attendee check-ins.",
    url: baseUrl,
    siteName: "Badgi.net",
    images: [
      {
        url: `${baseUrl}/api/og?title=Badgi.net%20-%20Event%20Management%20Platform`,
        secureUrl: `${baseUrl}/api/og?title=Badgi.net%20-%20Event%20Management%20Platform`,
        width: 1200,
        height: 630,
        alt: "Badgi.net Event Management Platform",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Badgi.net | Event Management, Ticketing & Discovery Platform",
    description:
      "Create, manage, and discover world-class events. Sell tickets, customize smart badges, and streamline attendee check-ins.",
    images: [`${baseUrl}/api/og?title=Badgi.net%20-%20Event%20Management%20Platform`],
    creator: "@badgi_net",
    site: "@badgi_net",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
    },
  ],
  category: "events",
  other: {
    "fb:app_id": process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "966242223397117",
  },
};
const inter = localFont({
  src: [
    {
      path: "../public/fonts/youtube-sans/YouTubeSansRegular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/youtube-sans/YouTubeSansMedium.otf",
      weight: "500",
      style: "medium",
    },
    {
      path: "../public/fonts/youtube-sans/YouTubeSansBold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "../public/fonts/youtube-sans/YouTubeSansBlack.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-youtube-sans",
  display: "swap",
});
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const localization = locale === "ar" ? arSA : locale === "fr" ? frFR : enUS;

  // Efficiency: Get the user once at the root layout
  const user = await useUser();
  if (user?.isBanned) {
    return redirect("/banned");
  }

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${syne.variable} ${outfit.variable} font-outfit flex flex-1 min-h-screen flex-col items-center justify-center antialiased text-slate-500 underline-offset-4 selection:bg-elite-violet/30 dark:text-slate-200 bg-white dark:bg-elite-charcoal transition-colors duration-500`}
      >
        <div className="absolute z-20 top-0 inset-x-0 flex justify-center overflow-hidden pointer-events-none">
          <div className="w-full flex-none flex justify-end">
            <picture>
              <source
                srcSet="/assets/images//docs@30.8b9a76a2.avif"
                type="image/avif"
              />
                <img
                  src="/assets/images/docs@tinypng.d9e4dcdc.png"
                  alt=""
                  className="w-0 md:w-[71.75rem] flex-none max-w-none dark:hidden animate-in fade-in duration-1000"
                  decoding="async"
                />
              </picture>
              <picture>
                <source
                  srcSet="/assets/images//docs-dark@30.1a9f8cbf.avif"
                  type="image/avif"
                />
                <img
                  src="/assets/images//docs-dark@tinypng.1bbe175e.png"
                  alt=""
                  className="w-0 md:w-[90rem] flex-none max-w-none hidden dark:block animate-in fade-in duration-1000"
                  decoding="async"
                />
            </picture>
          </div>
        </div>
        <NextIntlProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <ClientProvider clerkLocale={localization}>
              <TooltipProvider>{children}</TooltipProvider>

              <Toaster />
            </ClientProvider>
          </ThemeProvider>
        </NextIntlProvider>
      </body>
    </html>
  );
}
