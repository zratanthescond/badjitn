import { getEventFormBySlug } from "@/lib/actions/eventform.actions";
import { IntegratedFormBadgeSystem } from "@/components/shared/badge/integrated-form-badge-system";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/actions/user.actions";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type FormBadgePageProps = {
    params: Promise<{ formSlug: string }>;
};

export default async function FormBadgePage(props: FormBadgePageProps) {
    const params = await props.params;
    const t = await getTranslations("badgePage");

    const user = await useUser();
    if (!user) {
        return redirect("/sign-in");
    }
    const userId = user?._id?.toString();

    const result = await getEventFormBySlug(params.formSlug);
    if (!result.success || !result.data) {
        notFound();
    }
    const form = result.data;

    // Only the form's creator may manage its badges.
    if (form.creator?._id?.toString() !== userId) {
        redirect("/profile");
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/profile">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t("backToProfile")}
                    </Link>
                </Button>
            </div>

            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t("formTitle")}</h1>
                <p className="text-muted-foreground">
                    {t("formDescription")}
                </p>
            </header>

            <IntegratedFormBadgeSystem formId={form._id} formTitle={form.title} />
        </div>
    );
}
