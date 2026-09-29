"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useReactToPrint } from "react-to-print"
import generatePDF from "react-to-pdf"
import { BadgeCheck, Download, Loader2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { certificateCanvasSize, certificateVerifyUrl, type CertificateRenderData } from "@/lib/certificate-render"
import { CertificateCanvas, type CertificateTemplateData } from "./certificate-canvas"

// Used when an event approved a request before any certificate type was designed.
const FALLBACK_TEMPLATE: CertificateTemplateData & { name: string } = {
    name: "Certificat de participation",
    orientation: "landscape",
    elements: [
        { id: "title", type: "shape", x: 0, y: 0, width: 842, height: 16, backgroundColor: "#4f46e5" },
        { id: "heading", type: "text", content: "CERTIFICAT", x: 121, y: 90, width: 600, height: 60, fontSize: 44, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center", color: "#1e1b4b" },
        { id: "type", type: "text", content: "{certificate_type}", x: 121, y: 160, width: 600, height: 30, fontSize: 18, fontFamily: "Georgia", textAlign: "center", color: "#4f46e5" },
        { id: "name", type: "text", content: "{name}", x: 71, y: 240, width: 700, height: 50, fontSize: 32, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center", color: "#111827" },
        { id: "event", type: "text", content: "{event_title}", x: 71, y: 320, width: 700, height: 40, fontSize: 18, fontFamily: "Georgia", textAlign: "center", color: "#374151" },
        { id: "date", type: "text", content: "{event_date}", x: 121, y: 365, width: 600, height: 30, fontSize: 14, fontFamily: "Georgia", textAlign: "center", color: "#6b7280" },
        { id: "qr", type: "qr", qrData: "{verify_url}", x: 736, y: 489, width: 80, height: 80 },
    ],
}

export type CertificateViewData = {
    certificate: { _id: string; recipientName: string; issuedAt: string }
    template: (CertificateTemplateData & { name: string }) | null
    event: { title: string; startDateTime?: string; endDateTime?: string; locationName?: string } | null
}

export function CertificateViewer({ view }: { view: CertificateViewData }) {
    const t = useTranslations("certificates")
    const locale = useLocale()
    const template = view.template || FALLBACK_TEMPLATE
    const { width } = certificateCanvasSize(template.orientation)
    const containerRef = useRef<HTMLDivElement>(null)
    const printRef = useRef<HTMLDivElement>(null)
    const pdfRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const observer = new ResizeObserver(([entry]) => setScale(Math.min(1.2, entry.contentRect.width / width)))
        observer.observe(el)
        return () => observer.disconnect()
    }, [width])

    const data: CertificateRenderData = {
        name: view.certificate.recipientName,
        eventTitle: view.event?.title || "",
        eventStart: view.event?.startDateTime,
        eventEnd: view.event?.endDateTime,
        typeName: template.name,
        issueDate: view.certificate.issuedAt,
        certificateId: view.certificate._id,
        verifyUrl: certificateVerifyUrl(view.certificate._id),
        locale,
    }

    const isLandscape = template.orientation !== "portrait"
    const fileName = `certificat_${view.certificate.recipientName.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "_")}.pdf`
    const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: fileName.replace(/\.pdf$/, "") })

    const handleDownload = async () => {
        setIsDownloading(true)
        try {
            await generatePDF(pdfRef, {
                filename: fileName,
                method: "save",
                resolution: 3,
                page: { format: "a4", orientation: isLandscape ? "landscape" : "portrait", margin: 0 },
                canvas: { mimeType: "image/jpeg", qualityRatio: 0.95 },
            })
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <BadgeCheck className="w-8 h-8 text-green-600 shrink-0" />
                    <div>
                        <h1 className="text-xl font-bold">{t("view.authentic")}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t("view.issuedTo", { name: view.certificate.recipientName, type: template.name, event: view.event?.title || "" })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handlePrint()} className="gap-2">
                        <Printer className="w-4 h-4" />
                        {t("view.print")}
                    </Button>
                    <Button onClick={handleDownload} disabled={isDownloading} className="gap-2">
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {t("view.download")}
                    </Button>
                </div>
            </div>

            <div ref={containerRef} className="w-full flex justify-center">
                <div className="shadow-2xl">
                    <CertificateCanvas template={template} data={data} scale={scale} />
                </div>
            </div>

            {/* Off-screen full-size copies: one for the print dialog, one captured for the PDF. */}
            <div aria-hidden="true" style={{ position: "absolute", left: -10000, top: 0 }}>
                <div ref={printRef} className="certificate-single-print">
                    <CertificateCanvas template={template} data={data} />
                </div>
                <div ref={pdfRef}>
                    <CertificateCanvas template={template} data={data} />
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
                    .certificate-single-print > div {
                        width: ${isLandscape ? "29.7cm" : "21cm"} !important;
                        height: ${isLandscape ? "21cm" : "29.7cm"} !important;
                    }
                    .certificate-single-print .certificate-canvas-scaler {
                        transform: scale(${(isLandscape ? 1123 : 794) / width}) !important;
                    }
                }
            `}</style>
        </div>
    )
}
