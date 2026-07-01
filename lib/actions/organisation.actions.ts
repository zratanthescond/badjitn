"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Organisation from "@/lib/database/models/organisation.model";
import User from "@/lib/database/models/user.model";
import { handleError } from "@/lib/utils";
import { verifyAdmin } from "./auth.actions";

// ==========================================
// HELPER: generate a URL-safe slug
// ==========================================
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// ==========================================
// CREATE ORGANISATION
// ==========================================
export async function createOrganisation({
    userId,
    name,
    description,
    logo,
    website,
    subdomain,
    coverImage,
    socialLinks,
}: {
    userId: string;
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    subdomain?: string;
    coverImage?: string;
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
    };
}) {
    try {
        await connectToDatabase();

        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        // Generate a unique slug
        let slug = generateSlug(name);
        const existingSlug = await Organisation.findOne({ slug });
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        // Validate subdomain uniqueness
        const sub = subdomain?.trim().toLowerCase() || undefined;
        if (sub) {
            const conflict = await Organisation.findOne({ subdomain: sub });
            if (conflict) throw new Error("Ce sous-domaine est déjà utilisé.");
        }

        const newOrganisation = await Organisation.create({
            name,
            slug,
            description: description || "",
            logo: logo || "",
            website: website || "",
            coverImage: coverImage || "",
            ...(sub ? { subdomain: sub } : {}),
            socialLinks: socialLinks || {},
            creator: userId,
            admins: [userId],
        });

        revalidatePath("/organisations");

        return JSON.parse(JSON.stringify(newOrganisation));
    } catch (error) {
        handleError(error);
    }
}

// ==========================================
// GET ORGANISATION BY ID
// ==========================================
export async function getOrganisationById(organisationId: string) {
    try {
        await connectToDatabase();

        const organisation = await Organisation.findById(organisationId)
            .populate({
                path: "creator",
                model: User,
                select: "_id firstName lastName photo email username",
            })
            .populate({
                path: "admins",
                model: User,
                select: "_id firstName lastName photo email username",
            });

        if (!organisation) throw new Error("Organisation not found");

        return JSON.parse(JSON.stringify(organisation));
    } catch (error) {
        handleError(error);
    }
}

// ==========================================
// GET ORGANISATION BY SLUG
// ==========================================
export async function getOrganisationBySlug(slug: string) {
    try {
        await connectToDatabase();

        const organisation = await Organisation.findOne({ slug })
            .populate({
                path: "creator",
                model: User,
                select: "_id firstName lastName photo email username",
            })
            .populate({
                path: "admins",
                model: User,
                select: "_id firstName lastName photo email username",
            });

        if (!organisation) throw new Error("Organisation not found");

        return JSON.parse(JSON.stringify(organisation));
    } catch (error) {
        handleError(error);
    }
}

// ==========================================
// GET ORGANISATIONS BY USER (orgs the user created OR is admin of)
// ==========================================
export async function getOrganisationsByUser(userId: string) {
    try {
        await connectToDatabase();

        const organisations = await Organisation.find({
            $or: [{ creator: userId }, { admins: userId }],
        })
            .select("name slug logo description isVerified creator admins createdAt")
            .populate({
                path: "creator",
                model: User,
                select: "_id firstName lastName photo",
            })
            .sort({ createdAt: "desc" });

        return JSON.parse(JSON.stringify(organisations));
    } catch (error) {
        handleError(error);
    }
}

// ==========================================
// UPDATE ORGANISATION
// ==========================================
export async function updateOrganisation({
    organisationId,
    userId,
    updateData,
}: {
    organisationId: string;
    userId: string;
    updateData: {
        name?: string;
        description?: string;
        logo?: string;
        website?: string;
        coverImage?: string;
        subdomain?: string;
        socialLinks?: {
            facebook?: string;
            twitter?: string;
            instagram?: string;
            linkedin?: string;
        };
    };
}) {
    try {
        await connectToDatabase();

        const organisation = await Organisation.findById(organisationId);
        if (!organisation) throw new Error("Organisation not found");

        // Only creator or admins can update
        const isCreator = organisation.creator.toString() === userId;
        const isAdmin = organisation.admins.some(
            (adminId: any) => adminId.toString() === userId
        );

        if (!isCreator && !isAdmin) {
            throw new Error("Unauthorized: You do not have permission to update this organisation");
        }

        // Validate subdomain uniqueness
        if (updateData.subdomain !== undefined) {
            const sub = updateData.subdomain.trim().toLowerCase();
            if (sub) {
                const conflict = await Organisation.findOne({
                    subdomain: sub,
                    _id: { $ne: organisationId },
                });
                if (conflict) throw new Error("Ce sous-domaine est déjà utilisé par une autre organisation.");
                updateData.subdomain = sub;
            } else {
                updateData.subdomain = undefined; // clear it
            }
        }

        // Update slug if name changed
        if (updateData.name && updateData.name !== organisation.name) {
            let slug = generateSlug(updateData.name);
            const existingSlug = await Organisation.findOne({
                slug,
                _id: { $ne: organisationId },
            });
            if (existingSlug) {
                slug = `${slug}-${Date.now()}`;
            }
            (updateData as any).slug = slug;
        }

        const updatedOrganisation = await Organisation.findByIdAndUpdate(
            organisationId,
            updateData,
            { new: true }
        );

        revalidatePath(`/organisations/${updatedOrganisation.slug}`);

        return JSON.parse(JSON.stringify(updatedOrganisation));
    } catch (error) {
        handleError(error);
    }
}

// ==========================================
// DELETE ORGANISATION
// ==========================================
export async function deleteOrganisation({
    organisationId,
    userId,
}: {
    organisationId: string;
    userId: string;
}) {
    try {
        await connectToDatabase();

        const organisation = await Organisation.findById(organisationId);
        if (!organisation) throw new Error("Organisation not found");

        // Only the creator can delete
        if (organisation.creator.toString() !== userId) {
            throw new Error("Unauthorized: Only the creator can delete this organisation");
        }

        await Organisation.findByIdAndDelete(organisationId);
        revalidatePath("/organisations");

        return { success: true };
    } catch (error) {
        handleError(error);
    }
}

// ==========================================
// ADD ADMIN TO ORGANISATION
// ==========================================
export async function addAdminToOrganisation({
    organisationId,
    userId,
    adminIdentifier,
}: {
    organisationId: string;
    userId: string;
    adminIdentifier: string; // email or username of the user to add
}) {
    try {
        await connectToDatabase();

        const organisation = await Organisation.findById(organisationId);
        if (!organisation) throw new Error("Organisation not found");

        // Only creator can add admins
        if (organisation.creator.toString() !== userId) {
            throw new Error("Unauthorized: Only the creator can add admins");
        }

        // Find the user to add by email or username
        const userToAdd = await User.findOne({
            $or: [
                { email: adminIdentifier },
                { username: adminIdentifier },
            ],
        });

        if (!userToAdd) throw new Error("User not found with that email or username");

        // Check if already an admin
        if (
            organisation.admins.some(
                (adminId: any) => adminId.toString() === userToAdd._id.toString()
            )
        ) {
            throw new Error("User is already an admin of this organisation");
        }

        organisation.admins.push(userToAdd._id);
        await organisation.save();

        revalidatePath(`/organisations/${organisation.slug}/settings`);

        return JSON.parse(JSON.stringify(organisation));
    } catch (error) {
        handleError(error);
        return { error: (error as Error).message };
    }
}

// ==========================================
// REMOVE ADMIN FROM ORGANISATION
// ==========================================
export async function removeAdminFromOrganisation({
    organisationId,
    userId,
    adminId,
}: {
    organisationId: string;
    userId: string;
    adminId: string;
}) {
    try {
        await connectToDatabase();

        const organisation = await Organisation.findById(organisationId);
        if (!organisation) throw new Error("Organisation not found");

        // Only creator can remove admins
        if (organisation.creator.toString() !== userId) {
            throw new Error("Unauthorized: Only the creator can remove admins");
        }

        // Cannot remove the creator from admins
        if (adminId === organisation.creator.toString()) {
            throw new Error("Cannot remove the creator from admins");
        }

        organisation.admins = organisation.admins.filter(
            (id: any) => id.toString() !== adminId
        );
        await organisation.save();

        revalidatePath(`/organisations/${organisation.slug}/settings`);

        return JSON.parse(JSON.stringify(organisation));
    } catch (error) {
        handleError(error);
        return { error: (error as Error).message };
    }
}

// ==========================================
// CHECK IF USER HAS PERMISSION IN ORG
// ==========================================
export async function checkOrgPermission(
    organisationId: string,
    userId: string
): Promise<{ isCreator: boolean; isAdmin: boolean; hasAccess: boolean }> {
    try {
        await connectToDatabase();

        const organisation = await Organisation.findById(organisationId);
        if (!organisation) {
            return { isCreator: false, isAdmin: false, hasAccess: false };
        }

        const isCreator = organisation.creator.toString() === userId;
        const isAdmin = organisation.admins.some(
            (adminId: any) => adminId.toString() === userId
        );

        return {
            isCreator,
            isAdmin,
            hasAccess: isCreator || isAdmin,
        };
    } catch (error) {
        return { isCreator: false, isAdmin: false, hasAccess: false };
    }
}

// ==========================================
// GET ALL ORGANISATIONS (admin cockpit)
// ==========================================
export async function adminGetAllOrganisations() {
    try {
        await verifyAdmin();
        await connectToDatabase();

        const organisations = await Organisation.find({})
            .populate({
                path: "creator",
                model: User,
                select: "_id firstName lastName email",
            })
            .sort({ createdAt: "desc" });

        return JSON.parse(JSON.stringify(organisations));
    } catch (error) {
        handleError(error);
    }
}

// ==========================================
// VERIFY / UNVERIFY ORGANISATION (admin)
// ==========================================
export async function toggleOrganisationVerification(organisationId: string) {
    try {
        await verifyAdmin();
        await connectToDatabase();

        const organisation = await Organisation.findById(organisationId);
        if (!organisation) throw new Error("Organisation not found");

        organisation.isVerified = !organisation.isVerified;
        await organisation.save();

        revalidatePath("/cockpit");

        return JSON.parse(JSON.stringify(organisation));
    } catch (error) {
        handleError(error);
    }
}
