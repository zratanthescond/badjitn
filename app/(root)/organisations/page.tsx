import { useUser } from "@/lib/actions/user.actions";
import { getOrganisationsByUser } from "@/lib/actions/organisation.actions";
import OrganisationCard from "@/components/shared/OrganisationCard";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function OrganisationsPage() {
    const user = await useUser();
    if (!user) {
        return redirect("/sign-in");
    }

    const t = await getTranslations("profile");
    const orgCardT = {
        noDescription: t("organisationCard.noDescription"),
        member: t("organisationCard.member"),
        members: t("organisationCard.members"),
        owner: t("organisationCard.owner"),
        admin: t("organisationCard.admin"),
    };

    const organisations = await getOrganisationsByUser(user._id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 glass backdrop-blur-sm">
                            <Building2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {t("myOrganisations.title")}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {t("myOrganisations.description")}
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                        <Link href="/organisations/create">
                            <Plus className="h-5 w-5 mr-2" />
                            {t("quickActions.newOrganisation")}
                        </Link>
                    </Button>
                </div>

                {/* Organisation List */}
                {organisations && organisations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {organisations.map((org: any) => (
                            <OrganisationCard
                                key={org._id}
                                organisation={org}
                                isCreator={org.creator?._id === user._id}
                                translations={orgCardT}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-3xl p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                                <Building2 className="h-10 w-10 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t("myOrganisations.empty.title")}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {t("myOrganisations.empty.description")}
                            </p>
                            <Button
                                asChild
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full px-8"
                            >
                                <Link href="/organisations/create">
                                    <Plus className="h-5 w-5 mr-2" />
                                    {t("myOrganisations.empty.button")}
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export const metadata = {
    title: "Organisations Directory - Top Event Organizers & Hosts",
    description: "Discover verified event organizations, conference organizers, community groups, and enterprise hosts on Badgi.net.",
    alternates: {
        canonical: "/organisations",
    },
    openGraph: {
        title: "Organisations Directory | Badgi.net",
        description: "Discover verified event organizations, conference organizers, community groups, and enterprise hosts on Badgi.net.",
        url: "/organisations",
        images: [{ url: "/api/og?title=Event%20Organisations&category=Directory" }],
    },
};
