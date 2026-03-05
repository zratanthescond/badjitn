import { Schema, model, models, Document } from "mongoose";

export interface IOrganisation extends Document {
    name: string;
    slug: string;
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

const Organisation =
    models.Organisation || model<IOrganisation>("Organisation", OrganisationSchema);

export default Organisation;
