import { Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AdminSectionHeader } from "@/components/admin/ui/AdminSectionHeader";
import TeamManager from "@/components/pro/TeamManager";
import { checkTenantAccess, getTenantTeam } from "@/lib/actions/tenant.actions";

export default async function ProTeamPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const t = await getTranslations("pro.team");
  const { tenant, role, user } = await checkTenantAccess(tenantSlug, "viewer");
  const members = await getTenantTeam(tenantSlug);

  return (
    <div className="space-y-6">
      <AdminSectionHeader icon={<Users className="h-5 w-5" />} title={t("title")} subtitle={t("subtitle")} />
      <TeamManager
        tenantId={tenant._id}
        members={members}
        currentUserId={user._id}
        canManage={role === "owner"}
      />
    </div>
  );
}
