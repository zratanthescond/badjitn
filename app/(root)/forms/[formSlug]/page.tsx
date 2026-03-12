import { getEventFormBySlug } from "@/lib/actions/eventform.actions";
import PublicEventForm from "@/components/shared/PublicEventForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface FormPageProps {
    params: Promise<{ formSlug: string }>;
}

export default async function PublicFormPage(props: FormPageProps) {
    const params = await props.params;
    const result = await getEventFormBySlug(params.formSlug);

    if (!result.success || !result.data) {
        notFound();
    }

    return <PublicEventForm formData={result.data} />;
}
