import ReactQueryProvider from "@/components/contexts/ReactQueryProvider";
import ProShell from "@/components/pro/ProShell";
import ProAccessDenied from "@/components/pro/ProAccessDenied";
import { getTenantForCurrentUser } from "@/lib/actions/tenant.actions";

export const metadata = {
  title: "Badgi Pro",
  robots: { index: false, follow: false },
};

export default async function ProLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;

  // Authorisation lives here (not in the middleware, which cannot reach the DB).
  const access = await getTenantForCurrentUser(tenantSlug, "viewer");
  if (!access) {
    return <ProAccessDenied />;
  }

  const { tenant, role } = access;

  return (
    <ReactQueryProvider>
      <ProShell
        tenant={{
          name: tenant.name,
          slug: tenant.slug,
          logo: tenant.logo,
          primaryColor: tenant.primaryColor,
          status: tenant.subscription?.status,
        }}
        role={role}
      >
        {children}
      </ProShell>
    </ReactQueryProvider>
  );
}
