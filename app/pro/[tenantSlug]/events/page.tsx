import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminSectionHeader } from "@/components/admin/ui/AdminSectionHeader";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTenantEvents } from "@/lib/actions/tenant-stats.actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";
const STATUSES = ["all", "upcoming", "past"] as const;

export default async function ProEventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: SearchParams;
}) {
  const { tenantSlug } = await params;
  const sp = await searchParams;
  const t = await getTranslations("pro.events");
  const locale = await getLocale();

  const orgId = first(sp.org);
  const q = first(sp.q);
  const status = (STATUSES as readonly string[]).includes(first(sp.status))
    ? (first(sp.status) as (typeof STATUSES)[number])
    : "all";
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const data = await getTenantEvents(tenantSlug, { orgId: orgId || undefined, status, q, page });

  const date = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" });
  const money = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);

  const href = (nextPage: number) => {
    const qs = new URLSearchParams();
    if (orgId) qs.set("org", orgId);
    if (q) qs.set("q", q);
    if (status !== "all") qs.set("status", status);
    if (nextPage > 1) qs.set("page", String(nextPage));
    const s = qs.toString();
    return s ? `/events?${s}` : "/events";
  };

  const field = "h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground";

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        icon={<CalendarDays className="h-5 w-5" />}
        title={t("title")}
        subtitle={t("count", { count: data.total })}
      />

      {/* Plain GET form: filters live in the URL, no client JS needed. */}
      <form method="get" className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t("search")}
          aria-label={t("search")}
          className={`${field} min-w-[12rem] flex-1`}
        />
        <select name="org" defaultValue={orgId} aria-label={t("organisation")} className={field}>
          <option value="">{t("allOrganisations")}</option>
          {data.organisationOptions.map((o: any) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} aria-label={t("statusLabel")} className={field}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
        <Button type="submit" className="rounded-full">
          {t("apply")}
        </Button>
      </form>

      {data.events.length === 0 ? (
        <AdminEmptyState
          icon={<CalendarDays className="h-10 w-10" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {data.events.map((e: any) => {
            const upcoming = new Date(e.startDateTime).getTime() >= Date.now();
            return (
              <li key={e.id}>
                <Link
                  href={`/events/${e.id}`}
                  className="flex items-center gap-4 p-3 transition-colors hover:bg-muted/50 sm:p-4"
                >
                  {e.imageUrl ? (
                    <img src={e.imageUrl} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="h-14 w-20 shrink-0 rounded-lg bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{e.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.organisation} · {date.format(new Date(e.startDateTime))}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="stat-figure text-lg text-foreground">{e.orders}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {e.revenue > 0 ? money(e.revenue, e.currency) : t("free")}
                    </p>
                  </div>
                  <Badge
                    className={
                      upcoming
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-500/30 bg-slate-500/15 text-slate-600 dark:text-slate-400"
                    }
                  >
                    {upcoming ? t("status.upcoming") : t("status.past")}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {data.pages > 1 && (
        <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
          {data.page > 1 ? (
            <Link href={href(data.page - 1)} className="flex items-center gap-1 text-primary hover:underline">
              <ChevronLeft className="h-4 w-4" />
              {t("previous")}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">{t("pageOf", { page: data.page, pages: data.pages })}</span>
          {data.page < data.pages ? (
            <Link href={href(data.page + 1)} className="flex items-center gap-1 text-primary hover:underline">
              {t("next")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
