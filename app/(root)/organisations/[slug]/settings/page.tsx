import { notFound, redirect } from "next/navigation";
import {
    getOrganisationBySlug,
    checkOrgPermission,
} from "@/lib/actions/organisation.actions";
import { useUser } from "@/lib/actions/user.actions";
import OrganisationSettingsClient from "./client";

export const dynamic = "force-dynamic";

export default async function OrganisationSettingsPage({
    params,
}: {
    params: { slug: string };
}) {
    const user = await useUser();
    if (!user) return redirect("/sign-in");

    let organisation;
    try {
        organisation = await getOrganisationBySlug(params.slug);
    } catch {
        notFound();
    }

    if (!organisation) notFound();

    const permission = await checkOrgPermission(organisation._id, user._id);
    if (!permission.hasAccess) {
        return redirect(`/organisations/${params.slug}`);
    }

    return (
        <OrganisationSettingsClient
            organisation={organisation}
            userId={user._id}
            isCreator={permission.isCreator}
        />
    );
}

export const metadata = {
    title: "Organisation Settings",
    description: "Manage your organisation settings",
};
