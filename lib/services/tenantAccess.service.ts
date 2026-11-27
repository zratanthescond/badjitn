import { connectToDatabase } from "@/lib/database";
import Tenant from "@/lib/database/models/tenant.model";
import Organisation from "@/lib/database/models/organisation.model";

// Server-internal helpers. They live outside any "use server" file on purpose: everything exported
// from a server-actions file is callable by any client, and these take a userId argument.

/** True when the user is an owner/manager of the client (tenant) that owns this organisation. */
export async function isTenantManagerOfOrganisation(organisationId: string, userId: string): Promise<boolean> {
  await connectToDatabase();
  const org = await Organisation.findById(organisationId).select("tenant").lean<any>();
  if (!org?.tenant) return false;
  return !!(await Tenant.exists({
    _id: org.tenant,
    members: { $elemMatch: { user: userId, role: { $in: ["owner", "manager"] } } },
  }));
}
