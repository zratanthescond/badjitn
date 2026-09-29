"use client"

import { useRef } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useReactToPrint } from "react-to-print"
import { Printer, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { certificateCanvasSize, certificateVerifyUrl } from "@/lib/certificate-render"
import { CertificateCanvas, type CertificateTemplateData } from "./certificate-canvas"

export type PrintableCertificate = {
    _id: string
    recipientName: string
    issuedAt?: string | Date
    template: CertificateTemplateData & { name: string }
}

const PREVIEW_SCALE = 0.8

export function CertificatePrinter({
    certificates,
    event,
    onClose,
}: {
    certificates: PrintableCertificate[]
    event: { title: string; start?: string | Date; end?: string | Date }
    onClose: () => void
}) {
    const t = useTranslations("certificates")
    const locale = useLocale()
    const contentRef = useRef<HTMLDivElement>(null)
    const orientation = certificates[0]?.template.orientation || "landscape"
    const isLandscape = orientation === "landscape"
    const { width } = certificateCanvasSize(orientation)
    // A4 width at 96 DPI divided by the 72-DPI design canvas.
    const printScale = (isLandscape ? 1123 : 794) / width

    const handlePrint = useReactToPrint({ contentRef, documentTitle: t("printer.documentTitle") })

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
            <div className="bg-card border-b p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">{t("printer.title", { count: certificates.length })}</h2>
                    <p className="text-sm text-muted-foreground">{t("printer.pdfHint")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handlePrint()} className="gap-2">
                        <Printer className="w-4 h-4" />
                        {t("printer.print")}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-slate-200">
                <div ref={contentRef} className="certificate-print-root flex flex-col items-center gap-8">
                    {certificates.map((cert) => (
                        <div key={cert._id} className="certificate-print-page shadow-xl bg-white">
                            <CertificateCanvas
                                template={cert.template}
                                scale={PREVIEW_SCALE}
                                data={{
                                    name: cert.recipientName,
                                    eventTitle: event.title,
                                    eventStart: event.start,
                                    eventEnd: event.end,
                                    typeName: cert.template.name,
                                    issueDate: cert.issuedAt,
                                    certificateId: cert._id,
                                    verifyUrl: certificateVerifyUrl(cert._id),
                                    locale,
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: ${isLandscape ? "A4 landscape" : "A4 portrait"};
                        margin: 0;
                    }
                    body {
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .certificate-print-root {
                        gap: 0 !important;
                    }
                    .certificate-print-page {
                        box-shadow: none !important;
                        page-break-after: always;
                        break-after: page;
                    }
                    .certificate-print-page:last-child {
                        page-break-after: auto;
                        break-after: auto;
                    }
                    .certificate-print-page > div {
                        width: ${isLandscape ? "29.7cm" : "21cm"} !important;
                        height: ${isLandscape ? "21cm" : "29.7cm"} !important;
                    }
                    .certificate-print-page .certificate-canvas-scaler {
                        transform: scale(${printScale}) !important;
                    }
                }
            `}</style>
        </div>
    )
}
