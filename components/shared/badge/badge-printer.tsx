"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Printer, X } from "lucide-react"
import QRCode from "react-qr-code"

interface BadgeElement {
    id: string
    type: "text" | "image" | "shape" | "qr"
    content: string
    x: number
    y: number
    width: number
    height: number
    fontSize?: number
    fontWeight?: string
    fontFamily?: string
    fontStyle?: string
    textDecoration?: string
    letterSpacing?: number
    textAlign?: "left" | "center" | "right"
    color?: string
    backgroundColor?: string
    borderRadius?: number
    imageUrl?: string
    qrData?: string
    qrMargin?: number
    qrFgColor?: string
    rotation?: number
}

interface BadgePrinterProps {
    attendees: any[]
    badgeElements: BadgeElement[]
    backElements: BadgeElement[]
    backgroundImage?: string
    backBackgroundImage?: string
    orientation: "portrait" | "landscape"
    width?: number
    height?: number
    eventDetails: {
        title: string
        start?: Date
        end?: Date
    }
    onClose: () => void
}

export function BadgePrinter({
    attendees,
    badgeElements,
    backElements,
    backgroundImage,
    backBackgroundImage,
    orientation,
    width,
    height,
    eventDetails,
    onClose
}: BadgePrinterProps) {
    const componentRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Event Badges",
    })

    const replacePlaceholders = (text: string, attendee: any) => {
        if (!text) return ""
        return text
            .replace(/{name}/g, attendee.name || "")
            .replace(/{email}/g, attendee.email || "")
            .replace(/{company}/g, attendee.company || "")
            .replace(/{title}/g, attendee.title || "")
            .replace(/{category}/g, attendee.category || "")
            .replace(/{qr_code}/g, attendee._id || "")
            .replace(/{event_title}/g, eventDetails.title || "")
            .replace(/{event_date}/g, eventDetails.start ? new Date(eventDetails.start).toLocaleDateString() : "")
    }

    // Design canvas dimensions (from saved design or defaults)
    const canvasW = width || 400
    const canvasH = height || 566

    // A4 dimensions at 96 DPI
    const isLandscape = orientation === "landscape"
    const a4WidthPx = isLandscape ? 1123 : 794
    const a4HeightPx = isLandscape ? 794 : 1123

    // Scale factor to fill the full A4 page from design canvas
    const scaleX = a4WidthPx / canvasW
    const scaleY = a4HeightPx / canvasH
    const printScale = Math.min(scaleX, scaleY) // uniform scale to fit

    const hasBackContent = backElements.length > 0 || !!backBackgroundImage

    const renderElements = (elements: BadgeElement[], attendee: any) => {
        return elements.map((el) => (
            <div
                key={el.id}
                className="absolute overflow-hidden"
                style={{
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    transform: el.rotation ? `rotate(${el.rotation}deg)` : "none",
                }}
            >
                {el.type === "text" && (
                    <div
                        className="w-full h-full flex items-center"
                        style={{
                            fontSize: el.fontSize,
                            fontWeight: el.fontWeight,
                            fontFamily: el.fontFamily || "Arial",
                            fontStyle: el.fontStyle || "normal",
                            textDecoration: el.textDecoration || "none",
                            letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                            textAlign: el.textAlign,
                            justifyContent: el.textAlign === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start",
                            color: el.color,
                            wordBreak: "break-word",
                        }}
                    >
                        {replacePlaceholders(el.content, attendee)}
                    </div>
                )}
                {el.type === "image" && (el.imageUrl || el.content === "{photo}") && (
                    <div className="w-full h-full">
                        {el.content === "{photo}" ? (
                            attendee.photo ? (
                                <img
                                    src={attendee.photo}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    style={{ borderRadius: el.borderRadius }}
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-50 flex items-center justify-center border border-slate-200" style={{ borderRadius: el.borderRadius }}>
                                    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                            )
                        ) : (
                            <img
                                src={el.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                style={{ borderRadius: el.borderRadius }}
                            />
                        )}
                    </div>
                )}
                {el.type === "qr" && (
                    <div className="w-full h-full bg-white flex items-center justify-center" style={{ borderRadius: el.borderRadius, padding: `${el.qrMargin ?? 1}px` }}>
                        <QRCode
                            value={replacePlaceholders(el.qrData || "{qr_code}", attendee)}
                            size={Math.min(el.width, el.height) - ((el.qrMargin ?? 1) * 2)}
                            fgColor={el.qrFgColor || "#000000"}
                            className="w-full h-full"
                        />
                    </div>
                )}
                {el.type === "shape" && (
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundColor: el.backgroundColor,
                            borderRadius: el.borderRadius,
                        }}
                    />
                )}
            </div>
        ))
    }

    // Preview scale for screen (fit in viewport)
    const previewScale = 0.55

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
            <div className="bg-card border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold">Print Preview ({attendees.length} badge{attendees.length > 1 ? "s" : ""})</h2>
                    <p className="text-sm text-muted-foreground">
                        Full A4 — 1 badge per page{hasBackContent ? " (front + back)" : " (front only)"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handlePrint()}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print Now
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-slate-200">
                <div ref={componentRef} className="badge-print-root mx-auto flex flex-col items-center gap-8 print:gap-0">
                    {attendees.map((attendee) => (
                        <div key={attendee._id} className="badge-attendee-group">
                            {/* ===== FRONT (RECTO) — Full A4 Page ===== */}
                            <div
                                className="badge-a4-page bg-white shadow-xl print:shadow-none mx-auto"
                                style={{
                                    width: `${a4WidthPx * previewScale}px`,
                                    height: `${a4HeightPx * previewScale}px`,
                                }}
                            >
                                <div
                                    className="badge-canvas-scaler"
                                    style={{
                                        width: `${canvasW}px`,
                                        height: `${canvasH}px`,
                                        transform: `scale(${printScale * previewScale})`,
                                        transformOrigin: "top left",
                                        position: "relative",
                                        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                >
                                    {renderElements(badgeElements, attendee)}
                                </div>
                            </div>

                            {/* ===== BACK (VERSO) — Full A4 Page — Only if back has content ===== */}
                            {hasBackContent && (
                                <div
                                    className="badge-a4-page bg-white shadow-xl print:shadow-none mx-auto mt-8 print:mt-0"
                                    style={{
                                        width: `${a4WidthPx * previewScale}px`,
                                        height: `${a4HeightPx * previewScale}px`,
                                    }}
                                >
                                    <div
                                        className="badge-canvas-scaler"
                                        style={{
                                            width: `${canvasW}px`,
                                            height: `${canvasH}px`,
                                            transform: `scale(${printScale * previewScale})`,
                                            transformOrigin: "top left",
                                            position: "relative",
                                            backgroundImage: backBackgroundImage ? `url(${backBackgroundImage})` : "none",
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                        }}
                                    >
                                        {renderElements(backElements, attendee)}
                                    </div>
                                </div>
                            )}
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
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .badge-print-root {
                        gap: 0 !important;
                    }

                    .badge-a4-page {
                        width: ${isLandscape ? "29.7cm" : "21cm"} !important;
                        height: ${isLandscape ? "21cm" : "29.7cm"} !important;
                        overflow: hidden;
                        page-break-after: always;
                        box-shadow: none !important;
                        margin: 0 !important;
                    }

                    .badge-a4-page:last-child {
                        page-break-after: auto;
                    }

                    .badge-canvas-scaler {
                        transform: scale(${printScale}) !important;
                    }

                    .badge-attendee-group {
                        break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    )
}
