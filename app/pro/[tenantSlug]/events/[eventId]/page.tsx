import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, ScanLine, Ticket, Users, Wallet } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { StatCard } from "@/components/admin/ui/StatCard";
import BarList from "@/components/pro/BarList";
import TimelineChart from "@/components/pro/TimelineChart";
import { Button } from "@/components/ui/button";
import { checkTenantAccess } from "@/lib/actions/tenant.actions";
import { getTenantEventDetail } from "@/lib/actions/tenant-stats.actions";

const MAIN_SITE = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";

export default async function ProEventDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; eventId: string }>;
}) {
  const { tenantSlug, eventId } = await params;
  const t = await getTranslations("pro.eventDetail");
  const td = await getTranslations("pro.dashboard");
  const locale = await getLocale();

  const { role } = await checkTenantAccess(tenantSlug, "viewer");
  const data = await getTenantEventDetail(tenantSlug, eventId);
  if (!data) notFound();

  const { event, stats, scanPoints, timeline, currency } = data;
  const money = (amount: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const label = (ns: "types" | "categories", key: string) => (td.has(`${ns}.${key}`) ? td(`${ns}.${key}`) : key);

  const toRows = (record: Record<string, number>, ns: "types" | "categories") =>
    Object.entries(record || {})
      .map(([key, value]) => ({ key, label: label(ns, key), value: value as number }))
      .sort((a, b) => b.value - a.value);

  const hours = Object.entries(stats.scanActivityByHour as Record<string, number>)
    .filter(([, count]) => count > 0)
    .map(([hour, count]) => ({ key: hour, label: `${hour}:00`, value: count }));

  const canManage = role === "owner" || role === "manager";

  return (
    <div className="space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {event.imageUrl && <img src={event.imageUrl} alt="" className="h-24 w-40 shrink-0 rounded-xl object-cover" />}
        <div className="min-w-0 flex-1">
          <h1 className="font-outfit text-2xl font-semibold text-foreground">{event.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
            <span>{event.organisation}</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {date.format(new Date(event.startDateTime))}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <a href={`${MAIN_SITE}/events/${event.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-4 w-4" />
              {t("publicPage")}
            </a>
          </Button>
          {canManage && (
            <Button asChild className="rounded-full">
              <a href={`${MAIN_SITE}/orders?eventId=${event.id}`} target="_blank" rel="noopener noreferrer">
                <Ticket className="mr-1 h-4 w-4" />
                {t("manage")}
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={t("kpis.orders")}
          value={stats.totalOrders}
          icon={<Ticket className="h-4 w-4" />}
          accent="amber"
        />
        <StatCard
          label={t("kpis.participants")}
          value={stats.uniqueBuyers}
          icon={<Users className="h-4 w-4" />}
          accent="blue"
        />
        <StatCard
          label={t("kpis.revenue")}
          value={money(stats.totalRevenue)}
          icon={<Wallet className="h-4 w-4" />}
          accent="green"
          hint={t("kpis.averageOrder", { value: money(stats.averageOrderValue) })}
        />
        <StatCard
          label={t("kpis.attendance")}
          value={`${Number(stats.attendanceRate).toFixed(0)}%`}
          icon={<ScanLine className="h-4 w-4" />}
          progress={stats.attendanceRate}
          hint={t("kpis.scanned", { count: stats.uniqueScannedAttendees })}
        />
      </div>

      <TimelineChart timeline={timeline} currency={currency} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BarList title={t("byType")} empty={td("noData")} rows={toRows(stats.ordersByType, "types")} />
        <BarList title={t("byCategory")} empty={td("noData")} rows={toRows(stats.ordersByCategory, "categories")} />
        <BarList
          title={t("byPlan")}
          empty={td("noData")}
          rows={(stats.topPricePlans as any[]).map((p) => ({
            key: p.name,
            label: p.name,
            value: p.orders,
            detail: money(p.revenue),
          }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarList
          title={t("scanPoints")}
          empty={t("noScans")}
          rows={(scanPoints as any[]).map((s) => ({ key: s.name, label: s.name, value: s.count }))}
        />
        <BarList title={t("scansByHour")} empty={t("noScans")} rows={hours} />
      </div>
    </div>
  );
}
