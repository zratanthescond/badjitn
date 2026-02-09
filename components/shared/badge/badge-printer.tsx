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
    textAlign?: "left" | "center" | "right"
    color?: string
    backgroundColor?: string
    borderRadius?: number
    imageUrl?: string
    qrData?: string
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
                            textAlign: el.textAlign,
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
                    <div className="w-full h-full bg-white p-1" style={{ borderRadius: el.borderRadius }}>
                        <QRCode
                            value={replacePlaceholders(el.qrData || "{qr_code}", attendee)}
                            size={Math.min(el.width, el.height) - 4}
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

    const BADGE_WIDTH = width || (orientation === "landscape" ? 500 : 350)
    const BADGE_HEIGHT = height || (orientation === "landscape" ? 350 : 500)

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
            <div className="bg-card border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold">Print Preview ({attendees.length} badges)</h2>
                    <p className="text-sm text-muted-foreground">Both sides are laid out to print on the same page.</p>
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
                <div ref={componentRef} className="mx-auto flex flex-col items-center gap-8 print:gap-4 print:m-0">
                    {attendees.map((attendee, index) => (
                        <div key={attendee._id} className="flex flex-col gap-4 print:gap-4 print:break-after-page items-center justify-center">
                            <div className={`flex ${orientation === "landscape" ? "flex-col" : "flex-row"} gap-4 print:gap-4`}>
                                {/* Front Side */}
                                <div
                                    className="relative bg-white shadow-xl print:shadow-none border border-slate-200"
                                    style={{
                                        width: `${BADGE_WIDTH}px`,
                                        height: `${BADGE_HEIGHT}px`,
                                        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                >
                                    {renderElements(badgeElements, attendee)}
                                </div>

                                {/* Back Side */}
                                <div
                                    className="relative bg-white shadow-xl print:shadow-none border border-slate-200"
                                    style={{
                                        width: `${BADGE_WIDTH}px`,
                                        height: `${BADGE_HEIGHT}px`,
                                        backgroundImage: backBackgroundImage ? `url(${backBackgroundImage})` : "none",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                >
                                    {backElements.length > 0 ? renderElements(backElements, attendee) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <span>Back Side (Empty)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx global>{`
                @media print {
                    @page {
                        size: auto;
                        margin: 10mm;
                    }
                }
            `}</style>
        </div>
    )
}
