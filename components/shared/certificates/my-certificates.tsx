"use client"

import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { Award, ExternalLink, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getMyCertificates } from "@/lib/actions/certificate.actions"

type MyCertificate = {
    _id: string
    typeName: string
    eventTitle: string
    eventStart: string | null
    eventImage: string
    issuedAt: string
}

export function MyCertificates() {
    const t = useTranslations("certificates")
    const locale = useLocale()
    const { data: certificates = [], isLoading } = useQuery<MyCertificate[]>({
        queryKey: ["my-certificates"],
        queryFn: () => getMyCertificates(),
    })

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">{t("profile.title")}</h2>
                <p className="text-muted-foreground text-sm mt-1">{t("profile.description")}</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : certificates.length === 0 ? (
                <Card className="p-12 text-center space-y-3">
                    <Award className="w-12 h-12 mx-auto text-muted-foreground opacity-40" />
                    <h3 className="font-semibold">{t("profile.emptyTitle")}</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">{t("profile.emptyDescription")}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((c) => (
                        <Card key={c._id} className="p-4 flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                                {c.eventImage ? (
                                    <img src={c.eventImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Award className="w-8 h-8 text-indigo-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{c.typeName || t("view.defaultTitle")}</p>
                                <p className="text-sm text-muted-foreground truncate">{c.eventTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                    {t("profile.issuedOn", { date: new Date(c.issuedAt).toLocaleDateString(locale) })}
                                </p>
                            </div>
                            <Button size="sm" variant="outline" asChild className="gap-1 shrink-0">
                                <Link href={`/certificates/${c._id}`}>
                                    <ExternalLink className="w-4 h-4" />
                                    {t("profile.open")}
                                </Link>
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
