import TenantDashboard from "@/components/pro/TenantDashboard";

export default async function ProHomePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  // Access is enforced by the layout and again by every stats action (checkTenantAccess).
  return <TenantDashboard tenantSlug={tenantSlug} />;
}
