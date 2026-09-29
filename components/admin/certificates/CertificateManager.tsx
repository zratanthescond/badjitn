"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { Inbox, Palette, Send } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CertificationAdministration from "@/components/admin/certification-administration"
import { getCertificateTemplates } from "@/lib/actions/certificate.actions"
import { CertificateTemplatesPanel } from "./CertificateTemplatesPanel"
import { IssuedCertificatesPanel } from "./IssuedCertificatesPanel"

export type CertificateEventDetails = {
    title: string
    start?: string | Date
    end?: string | Date
}

export default function CertificateManager({
    eventId,
    searchString,
    event,
}: {
    eventId: string
    searchString: string
    event: CertificateEventDetails
}) {
    const t = useTranslations("certificates")
    const [tab, setTab] = useState("issued")

    const { data: templates = [], isLoading, refetch } = useQuery<any[]>({
        queryKey: ["certificate-templates", eventId],
        queryFn: () => getCertificateTemplates(eventId),
        enabled: !!eventId,
    })

    return (
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="issued" className="gap-2 py-2">
                    <Send className="w-4 h-4" />
                    <span className="truncate">{t("tabs.issued")}</span>
                </TabsTrigger>
                <TabsTrigger value="types" className="gap-2 py-2">
                    <Palette className="w-4 h-4" />
                    <span className="truncate">{t("tabs.types")}</span>
                </TabsTrigger>
                <TabsTrigger value="requests" className="gap-2 py-2">
                    <Inbox className="w-4 h-4" />
                    <span className="truncate">{t("tabs.requests")}</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="issued">
                <IssuedCertificatesPanel eventId={eventId} event={event} templates={templates} onGoToTypes={() => setTab("types")} />
            </TabsContent>

            <TabsContent value="types">
                <CertificateTemplatesPanel eventId={eventId} event={event} templates={templates} isLoading={isLoading} onChanged={() => refetch()} />
            </TabsContent>

            <TabsContent value="requests">
                <CertificationAdministration eventId={eventId} searchString={searchString} />
            </TabsContent>
        </Tabs>
    )
}
