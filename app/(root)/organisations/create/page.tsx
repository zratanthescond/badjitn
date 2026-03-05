import { useUser } from "@/lib/actions/user.actions";
import OrganisationForm from "@/components/shared/OrganisationForm";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CreateOrganisationPage() {
    const user = await useUser();
    if (!user) {
        return redirect("/sign-in");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <OrganisationForm userId={user._id} type="Create" />
            </div>
        </div>
    );
}

export const metadata = {
    title: "Create Organisation",
    description: "Create a new organisation to publish events",
};
