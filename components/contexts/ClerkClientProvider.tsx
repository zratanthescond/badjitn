"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import React from "react";

export function ClientProvider({
  children,
  clerkLocale,
}: {
  children: React.ReactNode;
  clerkLocale: () => Record<string, string>;
}) {
  const { resolvedTheme, theme } = useTheme();
  const [userTheme, setUserTheme] = React.useState<typeof dark | undefined>();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted || !resolvedTheme) return;
    //alert("Theme changed to: " + resolvedTheme);
    setUserTheme(resolvedTheme === "dark" ? dark : undefined);
  }, [resolvedTheme, mounted, theme]);

  return (
    <ClerkProvider
      localization={clerkLocale}
      appearance={{
        baseTheme: userTheme,

        elements: {
          card: "bg-background text-foreground border rounded-2xl shadow-xl",
          formButtonPrimary:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          headerTitle: "text-2xl font-semibold text-foreground",
          headerSubtitle: "text-sm text-muted-foreground",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
