"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Tenant, { TenantMemberRole, TenantPlan, TenantSubscriptionStatus } from "@/lib/database/models/tenant.model";
import Organisation from "@/lib/database/models/organisation.model";
import Event from "@/lib/database/models/event.model";
import User from "@/lib/database/models/user.model";
import { handleError } from "@/lib/utils";
import { verifyAdmin, verifyUser } from "./auth.actions";

const ROLE_RANK: Record<TenantMemberRole, number> = { viewer: 1, manager: 2, owner: 3 };

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// ==========================================
// ACCESS CHECK (back office guard)
// Returns the tenant and the caller's role in it, or throws.
// Platform admins get "owner" rights on every tenant.
// ==========================================
export async function checkTenantAccess(tenantSlug: string, minRole: TenantMemberRole = "viewer") {
    const user = await verifyUser();
    await connectToDatabase();

    const tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase() }).lean<any>();
    if (!tenant) throw new Error("Tenant not found");

    const isPlatformAdmin = user.role === "admin";
    let role: TenantMemberRole | null = isPlatformAdmin ? "owner" : null;

    if (!role) {
        if (user.role !== "sup_organ") throw new Error("Forbidden: Sup-organ access required.");
        const member = (tenant.members || []).find((m: any) => m.user.toString() === user._id.toString());
        if (!member) throw new Error("Forbidden: You are not a member of this client.");
        role = member.role as TenantMemberRole;
    }

    if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
        throw new Error("Forbidden: Insufficient permissions.");
    }

    // A suspended/expired client is read-only: block anything above viewer for non-admins.
    const status = tenant.subscription?.status;
    if (!isPlatformAdmin && (status === "suspended" || status === "expired") && minRole !== "viewer") {
        throw new Error("Forbidden: This client's subscription is not active.");
    }

    return { tenant: JSON.parse(JSON.stringify(tenant)), role, user, isPlatformAdmin };
}

// Ids of the organisations owned by a tenant (used to scope every back office query).
export async function getTenantOrganisationIds(tenantId: string): Promise<string[]> {
    await connectToDatabase();
    const orgs = await Organisation.find({ tenant: tenantId }).select("_id").lean<any[]>();
    return orgs.map((o) => o._id.toString());
}

// True when the user is an owner/manager of the client (tenant) that owns this organisation.
// Used to open existing organiser pages (e.g. /orders) to client managers only.
export async function isTenantManagerOfOrganisation(organisationId: string, userId: string): Promise<boolean> {
    await connectToDatabase();
    const org = await Organisation.findById(organisationId).select("tenant").lean<any>();
    if (!org?.tenant) return false;
    return !!(await Tenant.exists({
        _id: org.tenant,
        members: { $elemMatch: { user: userId, role: { $in: ["owner", "manager"] } } },
    }));
}

// Non-throwing helper for page-level guards: returns null when the caller has no access.
export async function getTenantForCurrentUser(tenantSlug: string, minRole: TenantMemberRole = "viewer") {
    try {
        return await checkTenantAccess(tenantSlug, minRole);
    } catch {
        return null;
    }
}

// Tenants the current user belongs to (used to redirect after sign-in).
export async function getMyTenants() {
    try {
        const user = await verifyUser();
        await connectToDatabase();
        const filter = user.role === "admin" ? {} : { "members.user": user._id };
        const tenants = await Tenant.find(filter).select("name slug logo plan subscription").lean();
        return JSON.parse(JSON.stringify(tenants));
    } catch (error) {
        handleError(error);
        return [];
    }
}

// ==========================================
// BACK OFFICE READS (scoped to the caller's tenant)
// ==========================================
export async function getTenantOrganisations(tenantSlug: string) {
    const { tenant } = await checkTenantAccess(tenantSlug, "viewer");
    await connectToDatabase();

    const organisations = await Organisation.find({ tenant: tenant._id })
        .select("name slug subdomain logo isVerified createdAt")
        .sort({ name: 1 })
        .lean<any[]>();

    const counts = await Event.aggregate([
        { $match: { organisation: { $in: organisations.map((o) => o._id) } } },
        {
            $group: {
                _id: "$organisation",
                total: { $sum: 1 },
                upcoming: { $sum: { $cond: [{ $gte: ["$startDateTime", new Date()] }, 1, 0] } },
            },
        },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c]));

    return JSON.parse(
        JSON.stringify(
            organisations.map((o) => ({
                ...o,
                eventCount: countMap.get(o._id.toString())?.total || 0,
                upcomingEventCount: countMap.get(o._id.toString())?.upcoming || 0,
            }))
        )
    );
}

export async function getTenantTeam(tenantSlug: string) {
    const { tenant } = await checkTenantAccess(tenantSlug, "viewer");
    await connectToDatabase();
    const doc = await Tenant.findById(tenant._id)
        .populate("members.user", "firstName lastName email photo")
        .select("members")
        .lean<any>();
    return JSON.parse(JSON.stringify(doc?.members || []));
}

// ==========================================
// ADMIN: list / create / update / delete
// ==========================================
export async function adminGetAllTenants() {
    try {
        await verifyAdmin();
        await connectToDatabase();
        const tenants = await Tenant.find()
            .populate("members.user", "firstName lastName email photo")
            .sort({ createdAt: -1 })
            .lean<any[]>();

        const counts = await Organisation.aggregate([
            { $match: { tenant: { $ne: null } } },
            { $group: { _id: "$tenant", count: { $sum: 1 } } },
        ]);
        const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

        return JSON.parse(
            JSON.stringify(tenants.map((t) => ({ ...t, organisationCount: countMap.get(t._id.toString()) || 0 })))
        );
    } catch (error) {
        handleError(error);
        return [];
    }
}

export async function adminGetTenantById(tenantId: string) {
    try {
        await verifyAdmin();
        await connectToDatabase();
        const tenant = await Tenant.findById(tenantId)
            .populate("members.user", "firstName lastName email photo role")
            .lean();
        if (!tenant) return null;
        const organisations = await Organisation.find({ tenant: tenantId })
            .select("name slug logo isVerified")
            .lean();
        return JSON.parse(JSON.stringify({ ...tenant, organisations }));
    } catch (error) {
        handleError(error);
        return null;
    }
}

export async function adminCreateTenant(params: {
    name: string;
    slug?: string;
    plan?: TenantPlan;
    limits?: { maxOrganisations?: number; maxEventsPerYear?: number; maxOrdersPerEvent?: number };
    subscription?: { status?: TenantSubscriptionStatus; startsAt?: string; endsAt?: string; notes?: string };
    contact?: { name?: string; email?: string; phone?: string };
    billing?: { companyName?: string; taxId?: string; address?: string };
}) {
    try {
        const admin = await verifyAdmin();
        await connectToDatabase();

        const slug = generateSlug(params.slug || params.name);
        if (!slug) throw new Error("Invalid slug");
        // Reserved by the platform / existing subdomain routing
        if (["www", "api", "app", "pro", "badgi", "localhost"].includes(slug)) {
            throw new Error("Ce nom de sous-domaine est réservé.");
        }
        if (await Tenant.findOne({ slug })) throw new Error("Ce sous-domaine est déjà utilisé par un client.");
        // Avoid clashing with an organisation public subdomain
        if (await Organisation.findOne({ $or: [{ subdomain: slug }, { slug }] })) {
            throw new Error("Ce sous-domaine est déjà utilisé par une organisation.");
        }

        const tenant = await Tenant.create({
            name: params.name.trim(),
            slug,
            plan: params.plan,
            limits: params.limits,
            subscription: params.subscription,
            contact: params.contact,
            billing: params.billing,
            createdBy: admin._id,
        });

        revalidatePath("/cockpit");
        return JSON.parse(JSON.stringify(tenant));
    } catch (error) {
        handleError(error);
    }
}

export async function adminUpdateTenant(
    tenantId: string,
    updates: {
        name?: string;
        logo?: string;
        primaryColor?: string;
        plan?: TenantPlan;
        limits?: { maxOrganisations?: number; maxEventsPerYear?: number; maxOrdersPerEvent?: number };
        subscription?: { status?: TenantSubscriptionStatus; startsAt?: string; endsAt?: string; notes?: string };
        contact?: { name?: string; email?: string; phone?: string };
        billing?: { companyName?: string; taxId?: string; address?: string };
    }
) {
    try {
        await verifyAdmin();
        await connectToDatabase();
        // slug is intentionally not updatable: it is the public subdomain.
        const tenant = await Tenant.findByIdAndUpdate(tenantId, { $set: updates }, { new: true, runValidators: true });
        if (!tenant) throw new Error("Tenant not found");
        revalidatePath("/cockpit");
        return JSON.parse(JSON.stringify(tenant));
    } catch (error) {
        handleError(error);
    }
}

export async function adminDeleteTenant(tenantId: string) {
    try {
        await verifyAdmin();
        await connectToDatabase();
        // Organisations are kept; they simply become regular organisations again.
        await Organisation.updateMany({ tenant: tenantId }, { $unset: { tenant: "" } });
        await Tenant.findByIdAndDelete(tenantId);
        revalidatePath("/cockpit");
        return { success: true };
    } catch (error) {
        handleError(error);
    }
}

// ==========================================
// ADMIN: organisations attach / detach (quota enforced)
// ==========================================
export async function adminAttachOrganisation(tenantId: string, organisationId: string) {
    try {
        await verifyAdmin();
        await connectToDatabase();

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) throw new Error("Tenant not found");

        const org = await Organisation.findById(organisationId);
        if (!org) throw new Error("Organisation not found");
        if (org.tenant && org.tenant.toString() !== tenantId) {
            throw new Error("Cette organisation appartient déjà à un autre client.");
        }
        if (org.tenant) return { success: true };

        const current = await Organisation.countDocuments({ tenant: tenantId });
        if (current >= tenant.limits.maxOrganisations) {
            throw new Error(`Quota atteint : ${tenant.limits.maxOrganisations} organisation(s) maximum pour ce plan.`);
        }

        org.tenant = tenant._id;
        await org.save();
        revalidatePath("/cockpit");
        return { success: true };
    } catch (error) {
        handleError(error);
    }
}

export async function adminDetachOrganisation(tenantId: string, organisationId: string) {
    try {
        await verifyAdmin();
        await connectToDatabase();
        await Organisation.updateOne({ _id: organisationId, tenant: tenantId }, { $unset: { tenant: "" } });
        revalidatePath("/cockpit");
        return { success: true };
    } catch (error) {
        handleError(error);
    }
}

// ==========================================
// MEMBERS (admin, or tenant owner for their own tenant)
// ==========================================
export async function addTenantMember(tenantId: string, userId: string, role: TenantMemberRole = "manager") {
    try {
        const caller = await verifyUser();
        await connectToDatabase();

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) throw new Error("Tenant not found");

        if (caller.role !== "admin") {
            const me = tenant.members.find((m: any) => m.user.toString() === caller._id.toString());
            if (!me || me.role !== "owner") throw new Error("Forbidden: Owner access required.");
        }

        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const existing = tenant.members.find((m: any) => m.user.toString() === userId);
        if (existing) {
            if (existing.role === "owner" && role !== "owner" && caller.role !== "admin") {
                const owners = tenant.members.filter((m: any) => m.role === "owner").length;
                if (owners <= 1) throw new Error("Impossible de rétrograder le dernier propriétaire.");
            }
            existing.role = role;
        } else {
            tenant.members.push({ user: user._id, role, addedAt: new Date() });
        }
        await tenant.save();

        // Promote regular users; never touch platform admins.
        if (user.role === "user") {
            user.role = "sup_organ";
            await user.save();
        }

        revalidatePath("/cockpit");
        return { success: true };
    } catch (error) {
        handleError(error);
    }
}

export async function removeTenantMember(tenantId: string, userId: string) {
    try {
        const caller = await verifyUser();
        await connectToDatabase();

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) throw new Error("Tenant not found");

        if (caller.role !== "admin") {
            const me = tenant.members.find((m: any) => m.user.toString() === caller._id.toString());
            if (!me || me.role !== "owner") throw new Error("Forbidden: Owner access required.");
        }

        const target = tenant.members.find((m: any) => m.user.toString() === userId);
        if (!target) return { success: true };
        if (target.role === "owner" && caller.role !== "admin") {
            const owners = tenant.members.filter((m: any) => m.role === "owner").length;
            if (owners <= 1) throw new Error("Impossible de retirer le dernier propriétaire.");
        }

        tenant.members = tenant.members.filter((m: any) => m.user.toString() !== userId);
        await tenant.save();

        // Demote to regular user when no longer in any tenant.
        const stillMember = await Tenant.exists({ "members.user": userId });
        if (!stillMember) {
            await User.updateOne({ _id: userId, role: "sup_organ" }, { $set: { role: "user" } });
        }

        revalidatePath("/cockpit");
        return { success: true };
    } catch (error) {
        handleError(error);
    }
}
