import { Settings } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminSectionHeader } from "@/components/admin/ui/AdminSectionHeader";
import SettingsForm from "@/components/pro/SettingsForm";
import { Badge } from "@/components/ui/badge";
import { getTenantSettings } from "@/lib/actions/tenant.actions";

const STATUS_STYLES: Record<string, string> = {
  trial: "border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-300",
  active: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  suspended: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
  expired: "border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-300",
};

function Usage({ label, used, max }: { label: string; used: number; max?: number }) {
  const pct = max ? Math.min(100, (used / max) * 100) : 0;
  const full = !!max && used >= max;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="stat-figure text-foreground">
          {used}
          {typeof max === "number" ? ` / ${max}` : ""}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${full ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function ProSettingsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const t = await getTranslations("pro.settings");
  const locale = await getLocale();
  const data = await getTenantSettings(tenantSlug);
  const { plan, usage, settings } = data;

  const date = (v: string | Date) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(v));

  return (
    <div className="space-y-6">
      <AdminSectionHeader icon={<Settings className="h-5 w-5" />} title={t("title")} subtitle={t("subtitle")} />

      <SettingsForm
        tenantSlug={tenantSlug}
        canEdit={data.role === "owner"}
        initial={{ logo: settings.logo, primaryColor: settings.primaryColor, contact: settings.contact }}
      />

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t("plan.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("plan.description")}</p>
        </div>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("plan.plan")}</dt>
            <dd className="mt-1 text-sm font-medium capitalize text-foreground">{plan.plan}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("plan.status")}</dt>
            <dd className="mt-1">
              <Badge className={STATUS_STYLES[plan.status] || ""}>{t(`plan.statuses.${plan.status}`)}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("plan.endsAt")}</dt>
            <dd className="mt-1 text-sm text-foreground">{plan.endsAt ? date(plan.endsAt) : t("plan.noEnd")}</dd>
          </div>
        </dl>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Usage label={t("plan.organisations")} used={usage.organisations} max={plan.limits?.maxOrganisations} />
          <Usage
            label={t("plan.eventsYear", { year: data.year })}
            used={usage.eventsThisYear}
            max={plan.limits?.maxEventsPerYear}
          />
        </div>
        {typeof plan.limits?.maxOrdersPerEvent === "number" && (
          <p className="text-xs text-muted-foreground">{t("plan.ordersPerEvent", { max: plan.limits.maxOrdersPerEvent })}</p>
        )}
        <p className="text-xs text-muted-foreground">{t("plan.contactUs")}</p>
      </section>
    </div>
  );
}
