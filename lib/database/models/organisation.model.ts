import { Schema, model, models, Document } from "mongoose";

export interface IOrganisation extends Document {
    name: string;
    slug: string;
    subdomain?: string; // short custom subdomain, e.g. "awgho" for awgho.badgi.net
    description: string;
    logo: string;
    website: string;
    coverImage: string;
    socialLinks: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
    };
    creator: Schema.Types.ObjectId;
    admins: Schema.Types.ObjectId[];
    isVerified: boolean;
    createdAt: Date;
}

const OrganisationSchema = new Schema<IOrganisation>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subdomain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    description: { type: String },
    logo: { type: String },
    website: { type: String },
    coverImage: { type: String },
    socialLinks: {
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        linkedin: { type: String },
    },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

// In dev, delete cached model so schema changes take effect without full restart
if (process.env.NODE_ENV === "development") delete (models as any).Organisation;

const Organisation =
    models.Organisation || model<IOrganisation>("Organisation", OrganisationSchema);

export default Organisation;
