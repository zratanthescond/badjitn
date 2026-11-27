// Client (tenant) enums and plan defaults. Kept free of mongoose imports so it is safe in client components.

export const TENANT_MEMBER_ROLES = ["owner", "manager", "viewer"] as const;
export type TenantMemberRole = (typeof TENANT_MEMBER_ROLES)[number];

export const TENANT_PLANS = ["starter", "pro", "enterprise"] as const;
export type TenantPlan = (typeof TENANT_PLANS)[number];

export const TENANT_SUBSCRIPTION_STATUSES = ["trial", "active", "suspended", "expired"] as const;
export type TenantSubscriptionStatus = (typeof TENANT_SUBSCRIPTION_STATUSES)[number];

// Default quotas applied when an admin picks a plan for a client.
// Admins can still override each limit per client.
export const PLAN_DEFAULTS: Record<
  TenantPlan,
  { maxOrganisations: number; maxEventsPerYear: number; maxOrdersPerEvent?: number }
> = {
  starter: { maxOrganisations: 1, maxEventsPerYear: 10, maxOrdersPerEvent: 500 },
  pro: { maxOrganisations: 5, maxEventsPerYear: 50, maxOrdersPerEvent: 5000 },
  enterprise: { maxOrganisations: 50, maxEventsPerYear: 1000 },
};
