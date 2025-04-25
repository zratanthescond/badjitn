import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
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
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Badgi.net",
  description: "Badgi.net is a platform for event management.",
  icons: {
    icon: "/assets/images/logo.png",
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
  const loccale = await getLocale();
  return (
    <html lang={loccale}>
      <body
        className={
          (inter.className,
          " flex flex-1 min-h-screen flex-col items-center justify-center  antialiased text-slate-500 dark:text-slate-200 bg-white dark:bg-slate-900")
        }
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
                className="w-[71.75rem] flex-none max-w-none dark:hidden"
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
                className="w-[90rem] flex-none max-w-none hidden dark:block"
                decoding="async"
              />
            </picture>
          </div>
        </div>
        <NextIntlClientProvider>
          <ClerkProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              //disableTransitionOnChange
            >
              <TooltipProvider>{children}</TooltipProvider>
            </ThemeProvider>
            <Toaster />{" "}
          </ClerkProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
