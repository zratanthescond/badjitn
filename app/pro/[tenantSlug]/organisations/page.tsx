import { BadgeCheck, Building2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AdminSectionHeader } from "@/components/admin/ui/AdminSectionHeader";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { checkTenantAccess, getTenantOrganisations } from "@/lib/actions/tenant.actions";

export default async function ProOrganisationsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const t = await getTranslations("pro.organisations");
  const { tenant } = await checkTenantAccess(tenantSlug, "viewer");
  const organisations = await getTenantOrganisations(tenantSlug);

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        icon={<Building2 className="h-5 w-5" />}
        title={t("title")}
        subtitle={t("quota", { used: organisations.length, max: tenant.limits?.maxOrganisations ?? 0 })}
      />

      {organisations.length === 0 ? (
        <AdminEmptyState
          icon={<Building2 className="h-10 w-10" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {organisations.map((org: any) => (
            <div key={org._id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                {org.logo ? (
                  <img src={org.logo} alt={org.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-accent-soft text-primary">
                    <Building2 className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate text-sm font-semibold text-foreground">
                    {org.name}
                    {org.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{org.subdomain || org.slug}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-muted/50 p-2">
                  <dd className="stat-figure text-xl text-foreground">{org.eventCount}</dd>
                  <dt className="text-[11px] text-muted-foreground">{t("events")}</dt>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <dd className="stat-figure text-xl text-foreground">{org.upcomingEventCount}</dd>
                  <dt className="text-[11px] text-muted-foreground">{t("upcoming")}</dt>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
