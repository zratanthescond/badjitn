"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Type,
    ImageIcon,
    Square,
    Save,
    QrCode,
    Upload,
    RotateCcw,
    Loader2,
    Monitor,
    Smartphone,
    UserCircle,
    Calendar,
    Home,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
} from "lucide-react"
import { createBadgeDesign, updateBadgeDesign } from "@/lib/actions/badge.actions"
import { toast } from "sonner"
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

interface BadgeDesignData {
    front: BadgeElement[]
    back: BadgeElement[]
    backgroundImage?: string
    backBackgroundImage?: string
    orientation: "portrait" | "landscape"
}

interface BadgeDesignerProps {
    eventId: string
    initialDesign?: any
    eventDetails: {
        title: string
        start?: Date
        end?: Date
    }
    onDesignSaved?: () => void
}

export function BadgeDesigner({ eventId, initialDesign, eventDetails, onDesignSaved }: BadgeDesignerProps) {
    const [design, setDesign] = useState<BadgeDesignData>({
        front: initialDesign?.frontElements || [],
        back: initialDesign?.backElements || [],
        backgroundImage: initialDesign?.backgroundImage,
        backBackgroundImage: initialDesign?.backBackgroundImage,
        orientation: initialDesign?.orientation || "portrait",
    })

    const [designId, setDesignId] = useState<string | null>(initialDesign?._id || null)
    const [selectedElement, setSelectedElement] = useState<string | null>(null)
    const [draggedElement, setDraggedElement] = useState<string | null>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [currentSide, setCurrentSide] = useState<"front" | "back">("front")
    const [isSaving, setIsSaving] = useState(false)

    const canvasRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const backgroundInputRef = useRef<HTMLInputElement>(null)

    const currentElements = design[currentSide]

    // Canvas dimensions — A4 proportional (21cm × 29.7cm)
    const CANVAS_WIDTH = design.orientation === "landscape" ? 566 : 400
    const CANVAS_HEIGHT = design.orientation === "landscape" ? 400 : 566

    const handleSaveDesign = async () => {
        setIsSaving(true)
        try {
            const params = {
                eventId,
                name: "Event Badge Design",
                frontElements: design.front,
                backElements: design.back,
                backgroundImage: design.backgroundImage,
                backBackgroundImage: design.backBackgroundImage,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                orientation: design.orientation,
            }

            if (designId) {
                await updateBadgeDesign(designId, params)
                toast.success("Design updated!")
            } else {
                const newDesign = await createBadgeDesign(params)
                setDesignId(newDesign?._id)
                toast.success("Design saved!")
            }
            onDesignSaved?.()
        } catch (error) {
            console.error("Error saving design:", error)
            toast.error("Failed to save design")
        } finally {
            setIsSaving(false)
        }
    }

    const updateElement = (id: string, updates: Partial<BadgeElement>) => {
        setDesign((prev) => ({
            ...prev,
            [currentSide]: prev[currentSide].map((el) => (el.id === id ? { ...el, ...updates } : el)),
        }))
    }

    const handleMouseDown = useCallback(
        (e: React.MouseEvent, elementId: string) => {
            e.preventDefault()
            e.stopPropagation()

            const element = currentElements.find((el) => el.id === elementId)
            if (!element) return

            setDraggedElement(elementId)
            setSelectedElement(elementId)

            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            })
        },
        [currentElements],
    )

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!draggedElement || !canvasRef.current) return

            const canvasRect = canvasRef.current.getBoundingClientRect()
            const newX = e.clientX - canvasRect.left - dragOffset.x
            const newY = e.clientY - canvasRect.top - dragOffset.y

            updateElement(draggedElement, { x: Math.max(0, newX), y: Math.max(0, newY) })
        },
        [draggedElement, dragOffset],
    )

    const handleMouseUp = useCallback(() => {
        setDraggedElement(null)
    }, [])

    const addTextElement = (content = "Sample Text", props: Partial<BadgeElement> = {}) => {
        const newElement: BadgeElement = {
            id: `text-${Date.now()}`,
            type: "text",
            content,
            x: 50,
            y: 50,
            width: 200,
            height: 40,
            fontSize: 16,
            fontWeight: "normal",
            textAlign: "left",
            color: "#000000",
            ...props,
        }
        setDesign((prev) => ({
            ...prev,
            [currentSide]: [...prev[currentSide], newElement],
        }))
    }

    const addDynamicPhoto = () => {
        const newElement: BadgeElement = {
            id: `photo-${Date.now()}`,
            type: "image",
            content: "{photo}",
            x: 50,
            y: 50,
            width: 80,
            height: 80,
            imageUrl: "https://via.placeholder.com/150?text=User+Photo", // Placeholder
            borderRadius: 40,
        }
        setDesign((prev) => ({
            ...prev,
            [currentSide]: [...prev[currentSide], newElement],
        }))
    }

    const addQRElement = () => {
        const newElement: BadgeElement = {
            id: `qr-${Date.now()}`,
            type: "qr",
            content: "{qr_code}",
            x: 100,
            y: 100,
            width: 80,
            height: 80,
            qrData: "{qr_code}",
        }
        setDesign((prev) => ({
            ...prev,
            [currentSide]: [...prev[currentSide], newElement],
        }))
    }

    const addImageElement = () => {
        fileInputRef.current?.click()
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const imageUrl = event.target?.result as string
            const newElement: BadgeElement = {
                id: `image-${Date.now()}`,
                type: "image",
                content: "Image",
                x: 75,
                y: 75,
                width: 150,
                height: 100,
                imageUrl,
            }
            setDesign((prev) => ({
                ...prev,
                [currentSide]: [...prev[currentSide], newElement],
            }))
        }
        reader.readAsDataURL(file)
    }

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const imageUrl = event.target?.result as string
            setDesign((prev) => ({
                ...prev,
                [currentSide === "front" ? "backgroundImage" : "backBackgroundImage"]: imageUrl,
            }))
        }
        reader.readAsDataURL(file)
    }

    const addShapeElement = (shapeType: "rectangle" | "circle") => {
        const newElement: BadgeElement = {
            id: `shape-${Date.now()}`,
            type: "shape",
            content: shapeType,
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            backgroundColor: "#0891b2",
            borderRadius: shapeType === "circle" ? 50 : 8,
        }
        setDesign((prev) => ({
            ...prev,
            [currentSide]: [...prev[currentSide], newElement],
        }))
    }

    const deleteElement = (id: string) => {
        setDesign((prev) => ({
            ...prev,
            [currentSide]: prev[currentSide].filter((el) => el.id !== id),
        }))
        setSelectedElement(null)
    }

    const toggleOrientation = (orientation: "portrait" | "landscape") => {
        setDesign(prev => ({ ...prev, orientation }))
    }

    const selectedEl = currentElements.find((el) => el.id === selectedElement)

    return (
        <div className="flex flex-col lg:flex-row min-h-[600px] gap-6">
            <div className="w-full lg:w-72 space-y-6">
                <Card className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Orientation</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={design.orientation === "portrait" ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleOrientation("portrait")}
                                className="gap-2"
                            >
                                <Smartphone className="w-4 h-4" />
                                Portrait
                            </Button>
                            <Button
                                variant={design.orientation === "landscape" ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleOrientation("landscape")}
                                className="gap-2"
                            >
                                <Monitor className="w-4 h-4 rotate-90" />
                                Landscape
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <Label className="text-sm font-semibold">Badge Side</Label>
                    <Tabs value={currentSide} onValueChange={(v) => setCurrentSide(v as any)}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="front">Front</TabsTrigger>
                            <TabsTrigger value="back">Back</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Separator />

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Background Img</Label>
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => backgroundInputRef.current?.click()}>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                        </Button>
                        {(currentSide === "front" ? design.backgroundImage : design.backBackgroundImage) && (
                            <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600" onClick={() => setDesign(prev => ({ ...prev, [currentSide === "front" ? "backgroundImage" : "backBackgroundImage"]: undefined }))}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Remove
                            </Button>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Add Content</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" onClick={() => addTextElement()} className="flex flex-col gap-1 h-auto py-2">
                                <Type className="w-4 h-4" />
                                <span className="text-[10px]">Text</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={addImageElement} className="flex flex-col gap-1 h-auto py-2">
                                <ImageIcon className="w-4 h-4" />
                                <span className="text-[10px]">Upload Img</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => addShapeElement("rectangle")} className="flex flex-col gap-1 h-auto py-2">
                                <Square className="w-4 h-4" />
                                <span className="text-[10px]">Shape</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={addQRElement} className="flex flex-col gap-1 h-auto py-2">
                                <QrCode className="w-4 h-4" />
                                <span className="text-[10px]">QR Code</span>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-primary">Dynamic Elements</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="secondary" size="sm" onClick={() => addTextElement("{name}", { fontWeight: "bold", fontSize: 20 })} className="flex flex-col gap-1 h-auto py-2">
                                <UserCircle className="w-4 h-4" />
                                <span className="text-[10px]">Name</span>
                            </Button>
                            <Button variant="secondary" size="sm" onClick={addDynamicPhoto} className="flex flex-col gap-1 h-auto py-2">
                                <ImageIcon className="w-4 h-4" />
                                <span className="text-[10px]">Photo</span>
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => addTextElement("{event_title}", { fontSize: 14, textAlign: "center" })} className="flex flex-col gap-1 h-auto py-2">
                                <Home className="w-4 h-4" />
                                <span className="text-[10px]">Event Title</span>
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => addTextElement("{event_date}", { fontSize: 12 })} className="flex flex-col gap-1 h-auto py-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-[10px]">Event Date</span>
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <Button className="w-full" disabled={isSaving} onClick={handleSaveDesign}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Design
                    </Button>
                </Card>

                {selectedEl && (
                    <Card className="p-4 space-y-4">
                        <h3 className="font-semibold text-sm">Properties</h3>
                        {selectedEl.type === "text" && (
                            <>
                                <div className="space-y-1">
                                    <Label className="text-xs">Contenu</Label>
                                    <Input value={selectedEl.content} onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Police</Label>
                                    <select
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                        value={selectedEl.fontFamily || "Arial"}
                                        onChange={(e) => updateElement(selectedEl.id, { fontFamily: e.target.value })}
                                    >
                                        <option value="Arial">Arial</option>
                                        <option value="Helvetica">Helvetica</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Georgia">Georgia</option>
                                        <option value="Verdana">Verdana</option>
                                        <option value="Courier New">Courier New</option>
                                        <option value="Impact">Impact</option>
                                        <option value="Trebuchet MS">Trebuchet MS</option>
                                        <option value="Palatino">Palatino</option>
                                        <option value="Garamond">Garamond</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Taille</Label>
                                        <Input type="number" min={6} max={120} value={selectedEl.fontSize} onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Couleur</Label>
                                        <Input type="color" className="h-10 p-1" value={selectedEl.color} onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Style</Label>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button" variant={selectedEl.fontWeight === "bold" ? "default" : "outline"} size="sm"
                                            className="flex-1 h-8"
                                            onClick={() => updateElement(selectedEl.id, { fontWeight: selectedEl.fontWeight === "bold" ? "normal" : "bold" })}
                                        ><Bold className="w-3.5 h-3.5" /></Button>
                                        <Button
                                            type="button" variant={selectedEl.fontStyle === "italic" ? "default" : "outline"} size="sm"
                                            className="flex-1 h-8"
                                            onClick={() => updateElement(selectedEl.id, { fontStyle: selectedEl.fontStyle === "italic" ? "normal" : "italic" })}
                                        ><Italic className="w-3.5 h-3.5" /></Button>
                                        <Button
                                            type="button" variant={selectedEl.textDecoration === "underline" ? "default" : "outline"} size="sm"
                                            className="flex-1 h-8"
                                            onClick={() => updateElement(selectedEl.id, { textDecoration: selectedEl.textDecoration === "underline" ? "none" : "underline" })}
                                        ><Underline className="w-3.5 h-3.5" /></Button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Alignement</Label>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button" variant={selectedEl.textAlign === "left" ? "default" : "outline"} size="sm"
                                            className="flex-1 h-8"
                                            onClick={() => updateElement(selectedEl.id, { textAlign: "left" })}
                                        ><AlignLeft className="w-3.5 h-3.5" /></Button>
                                        <Button
                                            type="button" variant={selectedEl.textAlign === "center" ? "default" : "outline"} size="sm"
                                            className="flex-1 h-8"
                                            onClick={() => updateElement(selectedEl.id, { textAlign: "center" })}
                                        ><AlignCenter className="w-3.5 h-3.5" /></Button>
                                        <Button
                                            type="button" variant={selectedEl.textAlign === "right" ? "default" : "outline"} size="sm"
                                            className="flex-1 h-8"
                                            onClick={() => updateElement(selectedEl.id, { textAlign: "right" })}
                                        ><AlignRight className="w-3.5 h-3.5" /></Button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Espacement lettres (px)</Label>
                                    <Input type="number" min={-2} max={20} value={selectedEl.letterSpacing ?? 0} onChange={(e) => updateElement(selectedEl.id, { letterSpacing: Number(e.target.value) })} />
                                </div>
                            </>
                        )}
                        {selectedEl.type === "qr" && (
                            <>
                                <div className="space-y-1">
                                    <Label className="text-xs">Contenu du QR Code</Label>
                                    <select
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mb-2"
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) updateElement(selectedEl.id, { qrData: e.target.value })
                                        }}
                                    >
                                        <option value="">— Insérer un modèle —</option>
                                        <option value="{qr_code}">ID participant</option>
                                        <option value="{email}">Email</option>
                                        <option value="{name}">Nom</option>
                                        <option value="{name} - {email}">Nom + Email</option>
                                        <option value="{qr_code}|{name}|{email}">ID + Nom + Email</option>
                                    </select>
                                    <Input value={selectedEl.qrData || "{qr_code}"} onChange={(e) => updateElement(selectedEl.id, { qrData: e.target.value })} placeholder="ex: {qr_code}" />
                                    <p className="text-[10px] text-muted-foreground mt-1">Variables : {"{qr_code}"}, {"{name}"}, {"{email}"}, {"{company}"}, {"{event_title}"}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Marge blanche (quiet zone) : {selectedEl.qrMargin ?? 1}</Label>
                                    <input
                                        type="range"
                                        min={0} max={10} step={1}
                                        value={selectedEl.qrMargin ?? 1}
                                        onChange={(e) => updateElement(selectedEl.id, { qrMargin: Number(e.target.value) })}
                                        className="w-full accent-primary h-2"
                                    />
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>0 (aucune)</span>
                                        <span>10 (large)</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Couleur du QR</Label>
                                    <Input type="color" className="h-10 p-1" value={selectedEl.qrFgColor || "#000000"} onChange={(e) => updateElement(selectedEl.id, { qrFgColor: e.target.value })} />
                                </div>
                            </>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Largeur</Label>
                                <Input type="number" value={selectedEl.width} onChange={(e) => updateElement(selectedEl.id, { width: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Hauteur</Label>
                                <Input type="number" value={selectedEl.height} onChange={(e) => updateElement(selectedEl.id, { height: Number(e.target.value) })} />
                            </div>
                        </div>
                        {selectedEl.type === "shape" && (
                            <div className="space-y-1">
                                <Label className="text-xs">Couleur fond</Label>
                                <Input type="color" className="h-10 p-1" value={selectedEl.backgroundColor} onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })} />
                            </div>
                        )}
                        <Button variant="destructive" size="sm" className="w-full" onClick={() => deleteElement(selectedEl.id)}>Supprimer</Button>
                    </Card>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-4">
                <Card className="flex-1 bg-slate-50 dark:bg-slate-900 border-dashed border-2 flex items-center justify-center p-8 min-h-[600px] overflow-auto">
                    <div
                        ref={canvasRef}
                        className="relative bg-white shadow-2xl overflow-hidden shrink-0"
                        style={{
                            width: `${CANVAS_WIDTH}px`,
                            height: `${CANVAS_HEIGHT}px`,
                            backgroundImage: (currentSide === "front" ? design.backgroundImage : design.backBackgroundImage)
                                ? `url(${currentSide === "front" ? design.backgroundImage : design.backBackgroundImage})`
                                : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                    >
                        {currentElements.map((el) => (
                            <div
                                key={el.id}
                                onMouseDown={(e) => handleMouseDown(e, el.id)}
                                className={`absolute cursor-move select-none ${selectedElement === el.id ? "ring-2 ring-primary ring-offset-2" : "hover:ring-1 hover:ring-primary/50"}`}
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
                                            padding: "4px",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {el.content === "{event_title}" ? eventDetails.title :
                                            el.content === "{event_date}" ? (eventDetails.start ? new Date(eventDetails.start).toLocaleDateString() : "Event Date") :
                                                el.content}
                                    </div>
                                )}
                                {el.type === "image" && (el.imageUrl || el.content === "{photo}") && (
                                    <div className="w-full h-full relative">
                                        {el.content === "{photo}" ? (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300" style={{ borderRadius: el.borderRadius }}>
                                                <UserCircle className="w-1/2 h-1/2 text-slate-400" />
                                            </div>
                                        ) : (
                                            <img
                                                src={el.imageUrl}
                                                alt=""
                                                className="w-full h-full object-cover pointer-events-none"
                                                style={{ borderRadius: el.borderRadius }}
                                            />
                                        )}
                                    </div>
                                )}
                                {el.type === "qr" && (
                                    <div className="w-full h-full bg-white flex items-center justify-center" style={{ borderRadius: el.borderRadius, padding: `${el.qrMargin ?? 1}px` }}>
                                        <QRCode
                                            value={el.qrData || "badge"}
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
                        ))}
                    </div>
                </Card>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <input ref={backgroundInputRef} type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
        </div>
    )
}
