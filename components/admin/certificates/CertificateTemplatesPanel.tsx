"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Award, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { deleteCertificateTemplate, setDefaultCertificateTemplate } from "@/lib/actions/certificate.actions"
import { CertificateCanvas } from "@/components/shared/certificates/certificate-canvas"
import { CertificateDesigner } from "@/components/shared/certificates/certificate-designer"
import type { CertificateEventDetails } from "./CertificateManager"

export function CertificateTemplatesPanel({
    eventId,
    event,
    templates,
    isLoading,
    onChanged,
}: {
    eventId: string
    event: CertificateEventDetails
    templates: any[]
    isLoading: boolean
    onChanged: () => void
}) {
    const t = useTranslations("certificates")
    const locale = useLocale()
    const [editing, setEditing] = useState<any | "new" | null>(null)
    const [busyId, setBusyId] = useState<string | null>(null)

    if (editing) {
        return (
            <CertificateDesigner
                eventId={eventId}
                template={editing === "new" ? undefined : editing}
                eventDetails={{ title: event.title, start: event.start, end: event.end }}
                onSaved={(saved) => {
                    setEditing(saved)
                    onChanged()
                }}
                onBack={() => setEditing(null)}
            />
        )
    }

    const handleSetDefault = async (id: string) => {
        setBusyId(id)
        const result = await setDefaultCertificateTemplate(id)
        setBusyId(null)
        if (result && "error" in result) {
            toast({ title: t("types.actionFailed"), variant: "destructive" })
            return
        }
        onChanged()
    }

    const handleDelete = async (template: any) => {
        if (!confirm(t("types.confirmDelete", { name: template.name }))) return
        setBusyId(template._id)
        const result = await deleteCertificateTemplate(template._id)
        setBusyId(null)
        if (result && "error" in result) {
            toast({
                title: result.error === "HAS_CERTIFICATES" ? t("types.cannotDelete", { count: result.count ?? 0 }) : t("types.actionFailed"),
                variant: "destructive",
            })
            return
        }
        toast({ title: t("types.deleted") })
        onChanged()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold">{t("types.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("types.subtitle")}</p>
                </div>
                <Button onClick={() => setEditing("new")} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t("types.new")}
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : templates.length === 0 ? (
                <Card className="p-12 text-center space-y-3">
                    <Award className="w-12 h-12 mx-auto text-muted-foreground opacity-40" />
                    <h4 className="font-semibold">{t("types.emptyTitle")}</h4>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">{t("types.emptyDescription")}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {templates.map((template) => {
                        const thumbScale = template.orientation === "portrait" ? 0.3 : 0.38
                        return (
                            <Card key={template._id} className="overflow-hidden flex flex-col">
                                <div className="bg-slate-100 dark:bg-slate-900 flex justify-center p-3 overflow-hidden">
                                    <div className="shadow-md pointer-events-none">
                                        <CertificateCanvas
                                            template={template}
                                            scale={thumbScale}
                                            data={{
                                                name: "Dr Prénom Nom",
                                                eventTitle: event.title,
                                                eventStart: event.start,
                                                eventEnd: event.end,
                                                typeName: template.name,
                                                issueDate: new Date(),
                                                certificateId: template._id,
                                                verifyUrl: "https://badgi.net",
                                                locale,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h4 className="font-semibold truncate">{template.name}</h4>
                                            {template.description && <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>}
                                        </div>
                                        {template.isDefault && (
                                            <Badge variant="secondary" className="shrink-0 gap-1" title={t("types.defaultHint")}>
                                                <Star className="w-3 h-3 fill-current" />
                                                {t("types.default")}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{t("types.issuedCount", { count: template.issuedCount || 0 })}</p>
                                    <div className="mt-auto flex flex-wrap gap-2">
                                        <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(template)}>
                                            <Pencil className="w-3.5 h-3.5" />
                                            {t("types.edit")}
                                        </Button>
                                        {!template.isDefault && (
                                            <Button size="sm" variant="ghost" className="gap-1" disabled={busyId === template._id} onClick={() => handleSetDefault(template._id)}>
                                                <Star className="w-3.5 h-3.5" />
                                                {t("types.makeDefault")}
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" className="gap-1 text-red-500 hover:text-red-600" disabled={busyId === template._id} onClick={() => handleDelete(template)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                            {t("types.delete")}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
