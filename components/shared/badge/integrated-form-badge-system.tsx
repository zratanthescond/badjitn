"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Palette, Users, Printer, Loader2 } from "lucide-react"
import { BadgeDesigner } from "./badge-designer"
import { FormAttendeeManager } from "./form-attendee-manager"
import { BadgePrinter } from "./badge-printer"
import { getBadgeDesignByEvent } from "@/lib/actions/badge.actions"
import { Button } from "@/components/ui/button"

interface IntegratedFormBadgeSystemProps {
    formId: string
    formTitle: string
}

export function IntegratedFormBadgeSystem({ formId, formTitle }: IntegratedFormBadgeSystemProps) {
    const t = useTranslations("badgeManagement")
    const [activeTab, setActiveTab] = useState("design")
    const [badgeDesign, setBadgeDesign] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [printingAttendees, setPrintingAttendees] = useState<any[]>([])
    const [showPrintPreview, setShowPrintPreview] = useState(false)

    // Badge designs are keyed by an arbitrary ObjectId (the `eventId` field on
    // BadgeDesign) — reused as-is here with the form's _id, since the model
    // never populates/validates it against a real Event document.
    const fetchDesign = async () => {
        try {
            const design = await getBadgeDesignByEvent(formId)
            setBadgeDesign(design)
        } catch (error) {
            console.error("Error fetching badge design:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDesign()
    }, [formId])

    const handlePrintBadges = (attendees: any[]) => {
        setPrintingAttendees(attendees)
        setShowPrintPreview(true)
    }

    const handlePrintSingle = (attendee: any) => {
        setPrintingAttendees([attendee])
        setShowPrintPreview(true)
    }

    const closePrintPreview = () => {
        setShowPrintPreview(false)
        setPrintingAttendees([])
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background rounded-xl overflow-hidden border">
            <div className="border-b border-border bg-card">
                <div className="px-4 md:px-6 py-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2 md:gap-4">
                            <h1 className="text-xl md:text-2xl font-bold text-foreground">{t("title")}</h1>
                            <Badge variant="secondary" className="text-xs">
                                {formTitle}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-6 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="design" className="flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            <span>{t("tabs.design")}</span>
                        </TabsTrigger>
                        <TabsTrigger value="attendees" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{t("tabs.attendees")}</span>
                        </TabsTrigger>
                        <TabsTrigger value="print" className="flex items-center gap-2">
                            <Printer className="w-4 h-4" />
                            <span>{t("tabs.print")}</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="design" className="space-y-6">
                        <BadgeDesigner
                            eventId={formId}
                            initialDesign={badgeDesign}
                            eventDetails={{ title: formTitle }}
                            onDesignSaved={fetchDesign}
                        />
                    </TabsContent>

                    <TabsContent value="attendees" className="space-y-6">
                        <FormAttendeeManager
                            formId={formId}
                            onPrintBadges={handlePrintBadges}
                            onPrintSingle={handlePrintSingle}
                        />
                    </TabsContent>

                    <TabsContent value="print" className="space-y-6">
                        <Card className="p-12 text-center">
                            <Printer className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                            <h3 className="text-xl font-semibold mb-2">{t("readyToPrint.title")}</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {t.rich("readyToPrint.description", { b: (chunks) => <strong>{chunks}</strong> })}
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <Button variant="outline" onClick={() => setActiveTab("design")}>
                                    <Palette className="w-4 h-4 mr-2" />
                                    {t("readyToPrint.customizeDesign")}
                                </Button>
                                <Button onClick={() => setActiveTab("attendees")}>
                                    <Users className="w-4 h-4 mr-2" />
                                    {t("readyToPrint.manageAttendees")}
                                </Button>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {showPrintPreview && (
                <BadgePrinter
                    attendees={printingAttendees}
                    badgeElements={badgeDesign?.frontElements || []}
                    backElements={badgeDesign?.backElements || []}
                    backgroundImage={badgeDesign?.backgroundImage}
                    backBackgroundImage={badgeDesign?.backBackgroundImage}
                    width={badgeDesign?.width}
                    height={badgeDesign?.height}
                    orientation={badgeDesign?.orientation || "portrait"}
                    eventDetails={{ title: formTitle }}
                    onClose={closePrintPreview}
                />
            )}
        </div>
    )
}
