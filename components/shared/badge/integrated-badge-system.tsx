"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Palette, Users, Printer, Loader2 } from "lucide-react"
import { BadgeDesigner } from "./badge-designer"
import { AttendeeManager } from "./attendee-manager"
import { BadgePrinter } from "./badge-printer"
import { getBadgeDesignByEvent } from "@/lib/actions/badge.actions"
import { Button } from "@/components/ui/button"

interface IntegratedBadgeSystemProps {
    eventId: string
    eventTitle: string
    eventStart?: Date
    eventEnd?: Date
}

export function IntegratedBadgeSystem({ eventId, eventTitle, eventStart, eventEnd }: IntegratedBadgeSystemProps) {
    const [activeTab, setActiveTab] = useState("design")
    const [badgeDesign, setBadgeDesign] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [printingAttendees, setPrintingAttendees] = useState<any[]>([])
    const [showPrintPreview, setShowPrintPreview] = useState(false)

    const fetchDesign = async () => {
        try {
            const design = await getBadgeDesignByEvent(eventId)
            setBadgeDesign(design)
        } catch (error) {
            console.error("Error fetching badge design:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDesign()
    }, [eventId])

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
                            <h1 className="text-xl md:text-2xl font-bold text-foreground">Badge Management</h1>
                            <Badge variant="secondary" className="text-xs">
                                {eventTitle}
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
                            <span>Design</span>
                        </TabsTrigger>
                        <TabsTrigger value="attendees" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Attendees</span>
                        </TabsTrigger>
                        <TabsTrigger value="print" className="flex items-center gap-2">
                            <Printer className="w-4 h-4" />
                            <span>Print Info</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="design" className="space-y-6">
                        <BadgeDesigner
                            eventId={eventId}
                            initialDesign={badgeDesign}
                            eventDetails={{ title: eventTitle, start: eventStart, end: eventEnd }}
                            onDesignSaved={fetchDesign}
                        />
                    </TabsContent>

                    <TabsContent value="attendees" className="space-y-6">
                        <AttendeeManager
                            eventId={eventId}
                            onPrintBadges={handlePrintBadges}
                            onPrintSingle={handlePrintSingle}
                        />
                    </TabsContent>

                    <TabsContent value="print" className="space-y-6">
                        <Card className="p-12 text-center">
                            <Printer className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                            <h3 className="text-xl font-semibold mb-2">Ready to Print?</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Go to the **Attendees** tab to select ticket holders and print their badges. You can also customize your badge layout in the **Design** tab.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <Button variant="outline" onClick={() => setActiveTab("design")}>
                                    <Palette className="w-4 h-4 mr-2" />
                                    Customize Design
                                </Button>
                                <Button onClick={() => setActiveTab("attendees")}>
                                    <Users className="w-4 h-4 mr-2" />
                                    Manage Attendees
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
                    eventDetails={{ title: eventTitle, start: eventStart, end: eventEnd }}
                    onClose={closePrintPreview}
                />
            )}
        </div>
    )
}
