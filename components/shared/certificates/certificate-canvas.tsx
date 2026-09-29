"use client"

import QRCode from "react-qr-code"
import {
    certificateCanvasSize,
    fillCertificatePlaceholders,
    type CertificateOrientation,
    type CertificateRenderData,
} from "@/lib/certificate-render"

export type CertificateElement = {
    id: string
    type: "text" | "image" | "shape" | "qr"
    content?: string
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
    qrFgColor?: string
    rotation?: number
}

export type CertificateTemplateData = {
    elements: CertificateElement[]
    backgroundImage?: string
    orientation?: CertificateOrientation
}

export function CertificateElementView({ el, data }: { el: CertificateElement; data: CertificateRenderData | null }) {
    const fill = (text: string) => (data ? fillCertificatePlaceholders(text, data) : text)

    if (el.type === "text") {
        return (
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
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                }}
            >
                {fill(el.content || "")}
            </div>
        )
    }
    if (el.type === "image" && el.imageUrl) {
        return <img src={el.imageUrl} alt="" className="w-full h-full object-contain pointer-events-none" style={{ borderRadius: el.borderRadius }} />
    }
    if (el.type === "qr") {
        return (
            <div className="w-full h-full bg-white flex items-center justify-center p-1" style={{ borderRadius: el.borderRadius }}>
                <QRCode
                    value={fill(el.qrData || "{verify_url}") || "badgi.net"}
                    size={Math.max(16, Math.min(el.width, el.height) - 8)}
                    fgColor={el.qrFgColor || "#000000"}
                    className="w-full h-full"
                />
            </div>
        )
    }
    if (el.type === "shape") {
        return <div className="w-full h-full" style={{ backgroundColor: el.backgroundColor, borderRadius: el.borderRadius }} />
    }
    return null
}

export function CertificateCanvas({
    template,
    data,
    scale = 1,
}: {
    template: CertificateTemplateData
    data: CertificateRenderData | null
    scale?: number
}) {
    const { width, height } = certificateCanvasSize(template.orientation)
    return (
        <div style={{ width: width * scale, height: height * scale, overflow: "hidden", position: "relative" }}>
            <div
                className="certificate-canvas-scaler"
                style={{
                    width,
                    height,
                    position: "relative",
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    backgroundColor: "#ffffff",
                    backgroundImage: template.backgroundImage ? `url(${template.backgroundImage})` : "none",
                    backgroundSize: "100% 100%",
                    backgroundPosition: "center",
                }}
            >
                {template.elements.map((el) => (
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
                        <CertificateElementView el={el} data={data} />
                    </div>
                ))}
            </div>
        </div>
    )
}
