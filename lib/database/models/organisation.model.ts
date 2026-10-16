import { Schema, model, models, Document } from "mongoose";

export interface IOrganisation extends Document {
    name: string;
    slug: string;
    subdomain?: string;
    description: string;
    logo: string;
    website: string;
    coverImage: string;
    /** When true, the hero no longer shows the logo, name, description and links over the cover image. */
    hideHeroInfo?: boolean;
    bannerTitle?: string;
    bannerContent?: string;
    bannerImage?: string;
    bannerImageTitle?: string;
    bannerItems?: { image: string; title?: string; displayMode?: "cover" | "contain" }[];
    partners?: { name: string; logo?: string; website?: string }[];
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
    hideHeroInfo: { type: Boolean, default: false },
    bannerTitle: { type: String },
    bannerContent: { type: String },
    bannerImage: { type: String },
    bannerImageTitle: { type: String },
    bannerItems: [{
        image: { type: String, required: true },
        title: { type: String },
        displayMode: { type: String, enum: ["cover", "contain"], default: "cover" },
    }],
    partners: [{
        name: { type: String },
        logo: { type: String },
        website: { type: String },
    }],
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
