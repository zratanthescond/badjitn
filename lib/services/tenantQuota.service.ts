import Tenant from "@/lib/database/models/tenant.model";
import Organisation from "@/lib/database/models/organisation.model";
import Event from "@/lib/database/models/event.model";
import Order from "@/lib/database/models/order.model";

// Plan/subscription enforcement for organisations owned by a client (tenant).
// Organisations without a tenant are never restricted. Callers must already be connected to the DB.

async function getTenantOfOrganisation(organisationId: string) {
  const org = await Organisation.findById(organisationId).select("tenant").lean<any>();
  if (!org?.tenant) return null;
  return Tenant.findById(org.tenant).lean<any>();
}

export function isSubscriptionActive(tenant: {
  subscription?: { status?: string; endsAt?: Date | string };
}) {
  const status = tenant.subscription?.status;
  if (status === "suspended" || status === "expired") return false;
  const endsAt = tenant.subscription?.endsAt;
  if (endsAt && new Date(endsAt).getTime() < Date.now()) return false;
  return true;
}

/** Blocks event creation when the client's subscription is inactive or its yearly quota is used up. */
export async function assertTenantCanCreateEvent(organisationId: string, startDateTime?: Date | string) {
  const tenant = await getTenantOfOrganisation(organisationId);
  if (!tenant) return;

  if (!isSubscriptionActive(tenant)) {
    throw new Error("L'abonnement de ce client n'est pas actif : impossible de créer un événement.");
  }

  const max = tenant.limits?.maxEventsPerYear;
  if (typeof max !== "number") return;

  const year = (startDateTime ? new Date(startDateTime) : new Date()).getFullYear();
  const orgIds = (await Organisation.find({ tenant: tenant._id }).select("_id").lean<any[]>()).map((o) => o._id);
  const used = await Event.countDocuments({
    organisation: { $in: orgIds },
    startDateTime: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) },
  });
  if (used >= max) {
    throw new Error(`Quota atteint : ${max} événement(s) maximum en ${year} pour ce plan.`);
  }
}

/** Blocks a new registration when the event reached the client plan's per-event limit. */
export async function assertTenantAllowsRegistration(eventId: string) {
  const event = await Event.findById(eventId).select("organisation").lean<any>();
  if (!event?.organisation) return;
  const tenant = await getTenantOfOrganisation(event.organisation.toString());
  const max = tenant?.limits?.maxOrdersPerEvent;
  if (typeof max !== "number") return;

  const used = await Order.countDocuments({ event: eventId });
  if (used >= max) {
    throw new Error("Les inscriptions sont complètes pour cet événement.");
  }
}
