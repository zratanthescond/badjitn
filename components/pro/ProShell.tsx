"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Building2, CalendarDays, LayoutDashboard, Menu, Settings, TriangleAlert, Users } from "lucide-react";
import { AdminThemeScope } from "@/components/admin/ui/AdminThemeScope";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProShellProps {
  tenant: {
    name: string;
    slug: string;
    logo?: string;
    primaryColor?: string;
    status?: string;
  };
  role: "owner" | "manager" | "viewer";
  children: React.ReactNode;
}

const NAV = [
  { key: "dashboard", href: "/", icon: LayoutDashboard },
  { key: "organisations", href: "/organisations", icon: Building2 },
  { key: "events", href: "/events", icon: CalendarDays },
  { key: "team", href: "/team", icon: Users },
  { key: "settings", href: "/settings", icon: Settings },
] as const;

// "#RRGGBB" -> CSS-variable triplet "H S% L%" (the format used by the theme), plus a readable
// foreground for text drawn on top of it. Returns null for anything that is not a valid hex color.
function themeVarsFromHex(hex?: string): Record<string, string> | null {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const hsl = `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return {
    "--primary": hsl,
    "--ring": hsl,
    "--primary-foreground": luminance > 0.6 ? "220 45% 8%" : "0 0% 100%",
  };
}

export default function ProShell({ tenant, role, children }: ProShellProps) {
  const t = useTranslations("pro");
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  // The browser path is "/organisations"; some Next versions expose the
  // rewritten "/pro/<slug>/organisations" instead. Normalise both.
  const prefix = `/pro/${tenant.slug}`;
  const current = pathname.startsWith(prefix) ? pathname.slice(prefix.length) || "/" : pathname;
  const isActive = (href: string) => (href === "/" ? current === "/" : current.startsWith(href));

  const accent = tenant.primaryColor || undefined;
  const themeVars = themeVarsFromHex(tenant.primaryColor);
  const readOnly = tenant.status === "suspended" || tenant.status === "expired";

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ key, href, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive(href)
              ? "bg-admin-accent-soft text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          aria-current={isActive(href) ? "page" : undefined}
        >
          <Icon className="h-4 w-4" />
          {t(`nav.${key}`)}
        </Link>
      ))}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-3">
      {tenant.logo ? (
        <img src={tenant.logo} alt={tenant.name} className="h-9 w-9 rounded-lg object-cover" />
      ) : (
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
          style={accent ? { backgroundColor: accent } : undefined}
        >
          {tenant.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{tenant.name}</p>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {t(`roles.${role}`)}
        </p>
      </div>
    </div>
  );

  return (
    <AdminThemeScope>
      <div
        className="flex min-h-screen w-full bg-background text-foreground"
        style={themeVars as React.CSSProperties | undefined}
      >
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-card p-4 lg:flex">
          {brand}
          {nav}
          <p className="mt-auto text-[11px] text-muted-foreground">{t("poweredBy")}</p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="flex items-center justify-between gap-3 border-b border-border bg-card p-3 lg:hidden">
            {brand}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" aria-label={t("menu")}>
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 space-y-6">
                <SheetTitle className="sr-only">{tenant.name}</SheetTitle>
                {brand}
                {nav}
              </SheetContent>
            </Sheet>
          </header>

          {readOnly && (
            <div className="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-300">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              {t("readOnlyBanner")}
            </div>
          )}

          <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AdminThemeScope>
  );
}
