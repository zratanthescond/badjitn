import { getTranslations } from "next-intl/server";
import { ShieldAlert } from "lucide-react";
import { getCertificateForView } from "@/lib/actions/certificate.actions";
import { CertificateViewer } from "@/components/shared/certificates/certificate-viewer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const view = await getCertificateForView(id);
  const t = await getTranslations("certificates");
  if (!view) return { title: t("view.notFoundTitle") };
  return {
    title: `${view.template?.name || t("view.defaultTitle")} — ${view.certificate.recipientName}`,
    robots: { index: false, follow: false },
  };
}

export default async function CertificatePage({ params }: Props) {
  const { id } = await params;
  const view = await getCertificateForView(id);

  if (!view) {
    const t = await getTranslations("certificates");
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <ShieldAlert className="w-14 h-14 mx-auto text-red-500" />
        <h1 className="text-2xl font-bold">{t("view.notFoundTitle")}</h1>
        <p className="text-muted-foreground">{t("view.notFoundDescription")}</p>
      </div>
    );
  }

  return <CertificateViewer view={view} />;
}
