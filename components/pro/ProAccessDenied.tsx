import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

const MAIN_SITE = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";

// Rendered instead of redirecting: on a tenant subdomain "/" is rewritten back
// to this same layout, so a redirect to "/" would loop.
export default async function ProAccessDenied() {
  const t = await getTranslations("pro.accessDenied");
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
        <ShieldAlert className="h-7 w-7" />
      </span>
      <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{t("description")}</p>
      <Button asChild className="rounded-full">
        <Link href={MAIN_SITE}>{t("back")}</Link>
      </Button>
    </div>
  );
}
