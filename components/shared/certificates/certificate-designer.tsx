"use client"

import type React from "react"
import { useCallback, useRef, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
    AlignCenter,
    AlignCenterHorizontal,
    AlignLeft,
    AlignRight,
    ArrowLeft,
    Bold,
    Calendar,
    Home,
    ImageIcon,
    Italic,
    Loader2,
    Monitor,
    QrCode,
    RotateCcw,
    Save,
    Smartphone,
    Square,
    Tag,
    Trash2,
    Type,
    Underline,
    Upload,
    UserCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { saveCertificateTemplate } from "@/lib/actions/certificate.actions"
import { certificateCanvasSize, type CertificateRenderData } from "@/lib/certificate-render"
import { CertificateElementView, type CertificateElement } from "./certificate-canvas"

const FONTS = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Garamond", "Palatino", "Trebuchet MS", "Courier New", "Impact"]

// Keeps saved documents light while staying sharp on an A4 print (~210 DPI).
const resizeImage = (file: File, maxSide: number, mime: "image/jpeg" | "image/png"): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = reject
        reader.onload = () => {
            const img = new Image()
            img.onerror = reject
            img.onload = () => {
                const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
                const canvas = document.createElement("canvas")
                canvas.width = Math.round(img.naturalWidth * ratio)
                canvas.height = Math.round(img.naturalHeight * ratio)
                const ctx = canvas.getContext("2d")
                if (!ctx) return reject(new Error("canvas"))
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                resolve(canvas.toDataURL(mime, 0.9))
            }
            img.src = reader.result as string
        }
        reader.readAsDataURL(file)
    })

interface CertificateDesignerProps {
    eventId: string
    template?: any
    eventDetails: { title: string; start?: string | Date; end?: string | Date }
    onSaved: (template: any) => void
    onBack: () => void
}

export function CertificateDesigner({ eventId, template, eventDetails, onSaved, onBack }: CertificateDesignerProps) {
    const t = useTranslations("certificates")
    const locale = useLocale()
    const [name, setName] = useState<string>(template?.name || "")
    const [description, setDescription] = useState<string>(template?.description || "")
    const [orientation, setOrientation] = useState<"portrait" | "landscape">(template?.orientation || "landscape")
    const [backgroundImage, setBackgroundImage] = useState<string>(template?.backgroundImage || "")
    const [elements, setElements] = useState<CertificateElement[]>(template?.elements || [])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [dragging, setDragging] = useState<{ id: string; dx: number; dy: number } | null>(null)
    const [showPreview, setShowPreview] = useState(true)
    const [sampleName, setSampleName] = useState("Dr Prénom Nom")
    const [isSaving, setIsSaving] = useState(false)
    const [templateId, setTemplateId] = useState<string | undefined>(template?._id)

    const canvasRef = useRef<HTMLDivElement>(null)
    const backgroundInputRef = useRef<HTMLInputElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)

    const { width: CANVAS_W, height: CANVAS_H } = certificateCanvasSize(orientation)
    const selected = elements.find((el) => el.id === selectedId)

    const previewData: CertificateRenderData = {
        name: sampleName,
        eventTitle: eventDetails.title,
        eventStart: eventDetails.start,
        eventEnd: eventDetails.end,
        typeName: name || t("designer.typeNamePlaceholder"),
        issueDate: new Date(),
        certificateId: "000000000000000000000000",
        verifyUrl: "https://badgi.net/certificates/…",
        locale,
    }

    const updateElement = (id: string, updates: Partial<CertificateElement>) =>
        setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)))

    const addElement = (el: Omit<CertificateElement, "id">) => {
        const id = `${el.type}-${Date.now()}`
        setElements((prev) => [...prev, { ...el, id }])
        setSelectedId(id)
    }

    const addText = (content: string, props: Partial<CertificateElement> = {}) =>
        addElement({
            type: "text",
            content,
            x: Math.round(CANVAS_W / 2 - 200),
            y: Math.round(CANVAS_H / 2 - 20),
            width: 400,
            height: 40,
            fontSize: 20,
            fontWeight: "normal",
            fontFamily: "Georgia",
            textAlign: "center",
            color: "#1e1b4b",
            ...props,
        })

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        setSelectedId(id)
        setDragging({ id, dx: e.clientX - rect.left, dy: e.clientY - rect.top })
    }

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!dragging || !canvasRef.current) return
            const rect = canvasRef.current.getBoundingClientRect()
            updateElement(dragging.id, {
                x: Math.round(Math.max(0, e.clientX - rect.left - dragging.dx)),
                y: Math.round(Math.max(0, e.clientY - rect.top - dragging.dy)),
            })
        },
        [dragging],
    )

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ""
        if (!file) return
        try {
            setBackgroundImage(await resizeImage(file, 2480, "image/jpeg"))
        } catch {
            toast({ title: t("designer.imageError"), variant: "destructive" })
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ""
        if (!file) return
        try {
            const imageUrl = await resizeImage(file, 1000, "image/png")
            addElement({ type: "image", content: "image", imageUrl, x: 60, y: 60, width: 150, height: 100 })
        } catch {
            toast({ title: t("designer.imageError"), variant: "destructive" })
        }
    }

    const handleSave = async () => {
        if (!name.trim()) {
            toast({ title: t("designer.nameRequired"), variant: "destructive" })
            return
        }
        setIsSaving(true)
        const result = await saveCertificateTemplate({
            eventId,
            templateId,
            name,
            description,
            elements,
            backgroundImage,
            orientation,
        })
        setIsSaving(false)
        if (!result || "error" in result) {
            toast({ title: t("designer.saveFailed"), variant: "destructive" })
            return
        }
        setTemplateId(result.template._id)
        toast({ title: t("designer.saved") })
        onSaved(result.template)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {t("designer.back")}
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t("designer.save")}
                </Button>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                <div className="w-full xl:w-80 space-y-4 shrink-0">
                    <Card className="p-4 space-y-4">
                        <div className="space-y-1">
                            <Label>{t("designer.typeName")}</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("designer.typeNamePlaceholder")} />
                        </div>
                        <div className="space-y-1">
                            <Label>{t("designer.description")}</Label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("designer.descriptionPlaceholder")} />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label>{t("designer.orientation")}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button size="sm" variant={orientation === "landscape" ? "default" : "outline"} onClick={() => setOrientation("landscape")} className="gap-2">
                                    <Monitor className="w-4 h-4" />
                                    {t("designer.landscape")}
                                </Button>
                                <Button size="sm" variant={orientation === "portrait" ? "default" : "outline"} onClick={() => setOrientation("portrait")} className="gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    {t("designer.portrait")}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("designer.background")}</Label>
                            <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => backgroundInputRef.current?.click()}>
                                <Upload className="w-4 h-4" />
                                {t("designer.uploadBackground")}
                            </Button>
                            {backgroundImage && (
                                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-red-500" onClick={() => setBackgroundImage("")}>
                                    <RotateCcw className="w-4 h-4" />
                                    {t("designer.removeBackground")}
                                </Button>
                            )}
                            <p className="text-[11px] text-muted-foreground">{t("designer.backgroundHint")}</p>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label className="text-primary">{t("designer.dynamicFields")}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="secondary" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => addText("{name}", { fontSize: 28, fontWeight: "bold" })}>
                                    <UserCircle className="w-4 h-4" />
                                    <span className="text-[10px]">{t("designer.fieldName")}</span>
                                </Button>
                                <Button variant="secondary" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => addText("{name_no_title}", { fontSize: 28, fontWeight: "bold" })}>
                                    <UserCircle className="w-4 h-4" />
                                    <span className="text-[10px]">{t("designer.fieldNameNoTitle")}</span>
                                </Button>
                                <Button variant="secondary" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => addText("{event_title}")}>
                                    <Home className="w-4 h-4" />
                                    <span className="text-[10px]">{t("designer.fieldEventTitle")}</span>
                                </Button>
                                <Button variant="secondary" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => addText("{event_date}", { fontSize: 16 })}>
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-[10px]">{t("designer.fieldEventDate")}</span>
                                </Button>
                                <Button variant="secondary" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => addText("{certificate_type}", { fontSize: 18 })}>
                                    <Tag className="w-4 h-4" />
                                    <span className="text-[10px]">{t("designer.fieldType")}</span>
                                </Button>
                                <Button variant="secondary" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => addText("{issue_date}", { fontSize: 12 })}>
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-[10px]">{t("designer.fieldIssueDate")}</span>
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("designer.addContent")}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => addText(t("designer.sampleText"), { fontSize: 16 })}>
                                    <Type className="w-4 h-4" />
                                    <span className="text-[10px]">{t("designer.text")}</span>
                                </Button>
                                <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => imageInputRef.current?.click()}>
                                    <ImageIcon className="w-4 h-4" />
                                    <span className="text-[10px]">{t("designer.image")}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-auto py-2 flex-col gap-1"
                                    onClick={() => addElement({ type: "shape", content: "rectangle", x: 100, y: 100, width: 200, height: 40, backgroundColor: "#ffffff", borderRadius: 0 })}
                                >
                                    <Square className="w-4 h-4" />
                                    <span className="text-[10px]">{t("designer.shape")}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-auto py-2 flex-col gap-1"
                                    onClick={() => addElement({ type: "qr", content: "qr", qrData: "{verify_url}", x: CANVAS_W - 120, y: CANVAS_H - 120, width: 90, height: 90 })}
                                >
                                    <QrCode className="w-4 h-4" />
                                    <span className="text-[10px]">{t("designer.qr")}</span>
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="cert-preview">{t("designer.preview")}</Label>
                                <Switch id="cert-preview" checked={showPreview} onCheckedChange={setShowPreview} />
                            </div>
                            {showPreview && (
                                <Input value={sampleName} onChange={(e) => setSampleName(e.target.value)} placeholder={t("designer.sampleNamePlaceholder")} />
                            )}
                        </div>
                    </Card>

                    {selected && (
                        <Card className="p-4 space-y-3">
                            <h3 className="font-semibold text-sm">{t("designer.properties")}</h3>

                            {selected.type === "text" && (
                                <>
                                    <div className="space-y-1">
                                        <Label className="text-xs">{t("designer.content")}</Label>
                                        <Input value={selected.content || ""} onChange={(e) => updateElement(selected.id, { content: e.target.value })} />
                                        <p className="text-[10px] text-muted-foreground">{t("designer.variablesHint")}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">{t("designer.font")}</Label>
                                        <select
                                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                            value={selected.fontFamily || "Arial"}
                                            onChange={(e) => updateElement(selected.id, { fontFamily: e.target.value })}
                                        >
                                            {FONTS.map((f) => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">{t("designer.size")}</Label>
                                            <Input type="number" min={6} max={160} value={selected.fontSize || 16} onChange={(e) => updateElement(selected.id, { fontSize: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">{t("designer.color")}</Label>
                                            <Input type="color" className="h-10 p-1" value={selected.color || "#000000"} onChange={(e) => updateElement(selected.id, { color: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="sm" className="flex-1 h-8" variant={selected.fontWeight === "bold" ? "default" : "outline"} onClick={() => updateElement(selected.id, { fontWeight: selected.fontWeight === "bold" ? "normal" : "bold" })}>
                                            <Bold className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button size="sm" className="flex-1 h-8" variant={selected.fontStyle === "italic" ? "default" : "outline"} onClick={() => updateElement(selected.id, { fontStyle: selected.fontStyle === "italic" ? "normal" : "italic" })}>
                                            <Italic className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button size="sm" className="flex-1 h-8" variant={selected.textDecoration === "underline" ? "default" : "outline"} onClick={() => updateElement(selected.id, { textDecoration: selected.textDecoration === "underline" ? "none" : "underline" })}>
                                            <Underline className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-1">
                                        {(["left", "center", "right"] as const).map((align) => {
                                            const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight
                                            return (
                                                <Button key={align} size="sm" className="flex-1 h-8" variant={selected.textAlign === align ? "default" : "outline"} onClick={() => updateElement(selected.id, { textAlign: align })}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </>
                            )}

                            {selected.type === "qr" && (
                                <div className="space-y-1">
                                    <Label className="text-xs">{t("designer.qrContent")}</Label>
                                    <Input value={selected.qrData || "{verify_url}"} onChange={(e) => updateElement(selected.id, { qrData: e.target.value })} />
                                    <p className="text-[10px] text-muted-foreground">{t("designer.qrHint")}</p>
                                    <Label className="text-xs">{t("designer.color")}</Label>
                                    <Input type="color" className="h-10 p-1" value={selected.qrFgColor || "#000000"} onChange={(e) => updateElement(selected.id, { qrFgColor: e.target.value })} />
                                </div>
                            )}

                            {selected.type === "shape" && (
                                <div className="space-y-1">
                                    <Label className="text-xs">{t("designer.fillColor")}</Label>
                                    <Input type="color" className="h-10 p-1" value={selected.backgroundColor || "#ffffff"} onChange={(e) => updateElement(selected.id, { backgroundColor: e.target.value })} />
                                    <p className="text-[10px] text-muted-foreground">{t("designer.shapeHint")}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                {(["x", "y", "width", "height"] as const).map((key) => (
                                    <div key={key} className="space-y-1">
                                        <Label className="text-xs">{t(`designer.${key}`)}</Label>
                                        <Input type="number" value={selected[key]} onChange={(e) => updateElement(selected.id, { [key]: Number(e.target.value) })} />
                                    </div>
                                ))}
                            </div>

                            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => updateElement(selected.id, { x: Math.round((CANVAS_W - selected.width) / 2) })}>
                                <AlignCenterHorizontal className="w-4 h-4" />
                                {t("designer.centerHorizontally")}
                            </Button>
                            <Button variant="destructive" size="sm" className="w-full gap-2" onClick={() => { setElements((prev) => prev.filter((el) => el.id !== selected.id)); setSelectedId(null) }}>
                                <Trash2 className="w-4 h-4" />
                                {t("designer.deleteElement")}
                            </Button>
                        </Card>
                    )}
                </div>

                <Card className="flex-1 bg-slate-100 dark:bg-slate-900 border-dashed border-2 p-4 md:p-8 overflow-auto">
                    <div
                        ref={canvasRef}
                        className="relative bg-white shadow-2xl mx-auto overflow-hidden shrink-0"
                        style={{
                            width: CANVAS_W,
                            height: CANVAS_H,
                            backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                            backgroundSize: "100% 100%",
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={() => setDragging(null)}
                        onMouseLeave={() => setDragging(null)}
                        onMouseDown={() => setSelectedId(null)}
                    >
                        {elements.map((el) => (
                            <div
                                key={el.id}
                                onMouseDown={(e) => handleMouseDown(e, el.id)}
                                className={`absolute cursor-move select-none overflow-hidden ${selectedId === el.id ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"}`}
                                style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
                            >
                                <CertificateElementView el={el} data={showPreview ? previewData : null} />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <input ref={backgroundInputRef} type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
    )
}
