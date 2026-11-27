"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarClock,
  CalendarDays,
  Loader2,
  ScanLine,
  Ticket,
  Wallet,
} from "lucide-react";
import TimelineChart from "@/components/pro/TimelineChart";
import { StatCard } from "@/components/admin/ui/StatCard";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getTenantDashboardStats } from "@/lib/actions/tenant-stats.actions";

type Period = "7" | "30" | "90" | "365" | "all";
type Money = { currency: string; amount: number };

const PERIODS: Period[] = ["7", "30", "90", "365", "all"];
const ALL = "__all__";

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

function periodRange(period: Period) {
  if (period === "all") return {};
  const to = new Date();
  const from = new Date(to.getTime() - (Number(period) - 1) * 86400000);
  return { from: isoDay(from), to: isoDay(to) };
}

export default function TenantDashboard({ tenantSlug }: { tenantSlug: string }) {
  const t = useTranslations("pro.dashboard");
  const locale = useLocale();
  const [period, setPeriod] = useState<Period>("30");
  const [orgId, setOrgId] = useState<string>(ALL);

  // Round "to" to the day so the query key is stable between renders.
  const range = useMemo(() => periodRange(period), [period]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["tenant-stats", tenantSlug, period, orgId, range.from, range.to],
    queryFn: () =>
      getTenantDashboardStats(tenantSlug, {
        ...range,
        orgId: orgId === ALL ? undefined : orgId,
      }),
    placeholderData: (previous) => previous,
  });

  const money = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const fullDate = (value: string | Date) =>
    new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  const labelOf = (ns: "types" | "categories", key: string) => (t.has(`${ns}.${key}`) ? t(`${ns}.${key}`) : key);
  const moneyList = (items: Money[]) =>
    items.length ? items.map((m) => money(m.amount, m.currency)).join(" · ") : "—";

  if (isLoading && !data) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isError || !data) {
    return <p className="py-12 text-center text-sm text-destructive">{t("error")}</p>;
  }

  const { kpis, timeline, byOrganisation, byType, byCategory, topEvents, upcoming } = data;
  const primary = data.primaryCurrency as string;
  const primaryRevenue = (kpis.revenueByCurrency as Money[]).find((m) => m.currency === primary)?.amount || 0;
  const otherRevenue = (kpis.revenueByCurrency as Money[]).filter((m) => m.currency !== primary);

  return (
    <div className={cn("space-y-6", isFetching && "opacity-90 transition-opacity")}>
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-44" aria-label={t("filters.period")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p} value={p}>
                  {t(`filters.periods.${p}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={orgId} onValueChange={setOrgId}>
            <SelectTrigger className="w-52" aria-label={t("filters.organisation")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("filters.allOrganisations")}</SelectItem>
              {(data.organisationOptions as { id: string; name: string }[]).map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={t("kpis.organisations")}
          value={number(kpis.organisations)}
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          label={t("kpis.events")}
          value={number(kpis.events)}
          icon={<CalendarDays className="h-4 w-4" />}
          accent="green"
          hint={t("kpis.eventsHint", { upcoming: kpis.upcomingEvents, past: kpis.pastEvents })}
        />
        <StatCard
          label={t("kpis.orders")}
          value={number(kpis.orders)}
          icon={<Ticket className="h-4 w-4" />}
          accent="amber"
        />
        <StatCard
          label={t("kpis.revenue")}
          value={money(primaryRevenue, primary)}
          icon={<Wallet className="h-4 w-4" />}
          accent="green"
          hint={
            otherRevenue.length
              ? t("kpis.otherCurrencies", { list: moneyList(otherRevenue) })
              : t("kpis.averageOrder", { value: money(kpis.averageOrderValue, primary) })
          }
        />
        <StatCard
          label={t("kpis.attendance")}
          value={`${kpis.attendanceRate.toFixed(0)}%`}
          icon={<ScanLine className="h-4 w-4" />}
          progress={kpis.attendanceRate}
          hint={t("kpis.attended", { count: kpis.attended })}
        />
        <StatCard
          label={t("kpis.upcoming")}
          value={number(kpis.upcomingEvents)}
          icon={<CalendarClock className="h-4 w-4" />}
          accent="blue"
        />
      </div>

      {/* Timeline */}
      <TimelineChart timeline={timeline} currency={primary} primaryOnlyNote={otherRevenue.length > 0} />

      {/* Breakdowns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Breakdown
          title={t("breakdown.organisation")}
          empty={t("noData")}
          rows={(byOrganisation as any[]).map((o) => ({
            key: o.id,
            label: o.name,
            value: o.orders,
            detail: moneyList(o.revenueByCurrency),
          }))}
        />
        <Breakdown
          title={t("breakdown.type")}
          empty={t("noData")}
          rows={(byType as any[]).map((r) => ({ key: r.key, label: labelOf("types", r.key), value: r.orders }))}
        />
        <Breakdown
          title={t("breakdown.category")}
          empty={t("noData")}
          rows={(byCategory as any[]).map((r) => ({ key: r.key, label: labelOf("categories", r.key), value: r.orders }))}
        />
      </div>

      {/* Events lists */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EventList
          title={t("topEvents")}
          empty={t("noData")}
          events={topEvents}
          meta={(e) => `${number(e.orders)} · ${money(e.revenue, e.currency)}`}
        />
        <EventList
          title={t("upcomingEvents")}
          empty={t("noUpcoming")}
          events={upcoming}
          meta={(e) => fullDate(e.startDateTime)}
        />
      </div>
    </div>
  );
}

function Breakdown({
  title,
  rows,
  empty,
}: {
  title: string;
  empty: string;
  rows: { key: string; label: string; value: number; detail?: string }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.key}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate text-foreground">{r.label}</span>
                <span className="stat-figure shrink-0 text-foreground">{r.value}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
              {r.detail && <p className="mt-0.5 text-[11px] text-muted-foreground">{r.detail}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EventList({
  title,
  events,
  empty,
  meta,
}: {
  title: string;
  empty: string;
  events: any[];
  meta: (e: any) => string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      {events.length === 0 ? (
        <AdminEmptyState icon={<CalendarDays className="h-8 w-8" />} title={empty} className="py-8" />
      ) : (
        <ul className="divide-y divide-border">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <Link href={`/events/${e.id}`} className="block truncate font-medium text-foreground hover:underline">
                  {e.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{e.organisation}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{meta(e)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
