import { Schema, model, models, Document } from "mongoose";

import {
    TENANT_MEMBER_ROLES,
    TENANT_PLANS,
    TENANT_SUBSCRIPTION_STATUSES,
    type TenantMemberRole,
    type TenantPlan,
    type TenantSubscriptionStatus,
} from "@/constants/plans";

export type { TenantMemberRole, TenantPlan, TenantSubscriptionStatus };

export interface ITenantMember {
    user: Schema.Types.ObjectId;
    role: TenantMemberRole;
    addedAt: Date;
}

export interface ITenant extends Document {
    name: string;
    /** Used as the back office subdomain: <slug>.pro.badgi.net */
    slug: string;
    logo?: string;
    primaryColor?: string;
    members: ITenantMember[];
    plan: TenantPlan;
    limits: {
        maxOrganisations: number;
        maxEventsPerYear: number;
        maxOrdersPerEvent?: number;
    };
    subscription: {
        status: TenantSubscriptionStatus;
        startsAt?: Date;
        endsAt?: Date;
        notes?: string;
    };
    contact?: { name?: string; email?: string; phone?: string };
    billing?: { companyName?: string; taxId?: string; address?: string };
    createdBy: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        logo: { type: String },
        primaryColor: { type: String },
        members: [
            {
                user: { type: Schema.Types.ObjectId, ref: "User", required: true },
                role: { type: String, enum: TENANT_MEMBER_ROLES, default: "manager" },
                addedAt: { type: Date, default: Date.now },
                _id: false,
            },
        ],
        plan: { type: String, enum: TENANT_PLANS, default: "starter" },
        limits: {
            maxOrganisations: { type: Number, default: 1 },
            maxEventsPerYear: { type: Number, default: 10 },
            maxOrdersPerEvent: { type: Number },
        },
        subscription: {
            status: { type: String, enum: TENANT_SUBSCRIPTION_STATUSES, default: "trial" },
            startsAt: { type: Date },
            endsAt: { type: Date },
            notes: { type: String },
        },
        contact: {
            name: { type: String },
            email: { type: String },
            phone: { type: String },
        },
        billing: {
            companyName: { type: String },
            taxId: { type: String },
            address: { type: String },
        },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

TenantSchema.index({ "members.user": 1 });

// In dev, delete cached model so schema changes take effect without full restart
if (process.env.NODE_ENV === "development") delete (models as any).Tenant;

const Tenant = models.Tenant || model<ITenant>("Tenant", TenantSchema);

export default Tenant;
