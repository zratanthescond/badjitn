"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { Award, ExternalLink, Loader2, Mail, Pencil, Printer, Search, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import {
    deleteIssuedCertificates,
    getIssuedCertificates,
    queueCertificateEmails,
    updateIssuedCertificate,
} from "@/lib/actions/certificate.actions"
import { CertificatePrinter, type PrintableCertificate } from "@/components/shared/certificates/certificate-printer"
import { AssignCertificatesDialog } from "./AssignCertificatesDialog"
import { ALL_PLANS, PlanFilterSelect, matchesPlanFilter, type PlanChoice } from "./PlanFilterSelect"
import type { CertificateEventDetails } from "./CertificateManager"

type Issued = {
    _id: string
    templateId: string
    orderId: string | null
    plans: PlanChoice[]
    recipientName: string
    recipientEmail: string
    emailStatus: "none" | "queued" | "sent" | "failed"
    emailSentAt: string | null
    emailError: string
    hasAccount: boolean
    createdAt: string
}

const STATUS_STYLE: Record<Issued["emailStatus"], string> = {
    none: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    queued: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    sent: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

export function IssuedCertificatesPanel({
    eventId,
    event,
    templates,
    onGoToTypes,
}: {
    eventId: string
    event: CertificateEventDetails
    templates: any[]
    onGoToTypes: () => void
}) {
    const t = useTranslations("certificates")
    const [templateId, setTemplateId] = useState<string>("")
    const [search, setSearch] = useState("")
    const [planFilter, setPlanFilter] = useState(ALL_PLANS)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [assignOpen, setAssignOpen] = useState(false)
    const [editing, setEditing] = useState<Issued | null>(null)
    const [editName, setEditName] = useState("")
    const [editEmail, setEditEmail] = useState("")
    const [printing, setPrinting] = useState<PrintableCertificate[] | null>(null)
    const [busy, setBusy] = useState(false)

    const activeTemplateId = templateId || templates[0]?._id || ""
    const activeTemplate = templates.find((tpl) => tpl._id === activeTemplateId)

    const { data: issued = [], isLoading, refetch } = useQuery<Issued[]>({
        queryKey: ["issued-certificates", eventId],
        queryFn: () => getIssuedCertificates(eventId),
    })

    const forTemplate = useMemo(() => issued.filter((c) => c.templateId === activeTemplateId), [issued, activeTemplateId])
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return forTemplate.filter(
            (c) =>
                matchesPlanFilter(c.plans, planFilter) &&
                (!q || c.recipientName.toLowerCase().includes(q) || c.recipientEmail.includes(q))
        )
    }, [forTemplate, search, planFilter])
    const issuedOrderIds = useMemo(() => new Set(forTemplate.map((c) => c.orderId).filter(Boolean) as string[]), [forTemplate])
    const selectedRows = filtered.filter((c) => selected.has(c._id))
    const allSelected = filtered.length > 0 && filtered.every((c) => selected.has(c._id))

    if (templates.length === 0) {
        return (
            <Card className="p-12 text-center space-y-4">
                <Award className="w-12 h-12 mx-auto text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">{t("issued.noTypes")}</p>
                <Button onClick={onGoToTypes}>{t("issued.createType")}</Button>
            </Card>
        )
    }

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })

    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((c) => c._id)))

    const refresh = async () => {
        setSelected(new Set())
        await refetch()
    }

    const openPrint = (rows: Issued[]) => {
        if (!activeTemplate) return
        setPrinting(rows.map((c) => ({ _id: c._id, recipientName: c.recipientName, issuedAt: c.createdAt, template: activeTemplate })))
    }

    const sendEmails = async (rows: Issued[]) => {
        const alreadySent = rows.filter((c) => c.emailStatus === "sent").length
        if (alreadySent > 0 && !confirm(t("issued.confirmResend", { count: alreadySent }))) return
        setBusy(true)
        const result = await queueCertificateEmails(rows.map((c) => c._id))
        setBusy(false)
        if (!result || "error" in result) {
            toast({ title: t("issued.actionFailed"), variant: "destructive" })
            return
        }
        toast({
            title: t("issued.emailsQueued", { count: result.queued }),
            description: result.missingEmail > 0 ? t("issued.missingEmail", { count: result.missingEmail }) : t("issued.queueHint"),
        })
        refresh()
    }

    const remove = async (rows: Issued[]) => {
        if (!confirm(t("issued.confirmDelete", { count: rows.length }))) return
        setBusy(true)
        const result = await deleteIssuedCertificates(rows.map((c) => c._id))
        setBusy(false)
        if (!result || "error" in result) {
            toast({ title: t("issued.actionFailed"), variant: "destructive" })
            return
        }
        toast({ title: t("issued.deleted", { count: result.deleted }) })
        refresh()
    }

    const saveEdit = async () => {
        if (!editing) return
        setBusy(true)
        const result = await updateIssuedCertificate(editing._id, { recipientName: editName, recipientEmail: editEmail })
        setBusy(false)
        if (!result || "error" in result) {
            toast({ title: t("issued.actionFailed"), variant: "destructive" })
            return
        }
        setEditing(null)
        refresh()
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                <div className="space-y-1 w-full sm:w-80">
                    <Label>{t("issued.type")}</Label>
                    <Select value={activeTemplateId} onValueChange={(v) => { setTemplateId(v); setPlanFilter(ALL_PLANS); setSelected(new Set()) }}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map((tpl) => (
                                <SelectItem key={tpl._id} value={tpl._id}>{tpl.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => setAssignOpen(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    {t("issued.assign")}
                </Button>
            </div>

            <Card className="p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("issued.search")} className="pl-9" />
                        </div>
                        <PlanFilterSelect rows={forTemplate} value={planFilter} onChange={setPlanFilter} className="w-full sm:w-64" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t("issued.selectedCount", { count: selectedRows.length, total: filtered.length })}</span>
                        <Button size="sm" variant="outline" className="gap-1" disabled={selectedRows.length === 0 || busy} onClick={() => openPrint(selectedRows)}>
                            <Printer className="w-4 h-4" />
                            {t("issued.print")}
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1" disabled={selectedRows.length === 0 || busy} onClick={() => sendEmails(selectedRows)}>
                            <Mail className="w-4 h-4" />
                            {t("issued.sendEmail")}
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-1 text-red-500 hover:text-red-600" disabled={selectedRows.length === 0 || busy} onClick={() => remove(selectedRows)}>
                            <Trash2 className="w-4 h-4" />
                            {t("issued.delete")}
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="text-left">
                                <th className="p-3 w-10">
                                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} disabled={filtered.length === 0} />
                                </th>
                                <th className="p-3">{t("issued.colName")}</th>
                                <th className="p-3">{t("issued.colEmail")}</th>
                                <th className="p-3">{t("issued.colEmailStatus")}</th>
                                <th className="p-3 text-right">{t("issued.colActions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">{t("issued.empty")}</td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr key={c._id} className="border-t hover:bg-muted/30">
                                        <td className="p-3">
                                            <Checkbox checked={selected.has(c._id)} onCheckedChange={() => toggle(c._id)} />
                                        </td>
                                        <td className="p-3 font-medium">
                                            {c.recipientName}
                                            {c.hasAccount && <Badge variant="outline" className="ml-2 text-[10px]">{t("issued.hasAccount")}</Badge>}
                                        </td>
                                        <td className="p-3 text-muted-foreground">{c.recipientEmail || "—"}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[c.emailStatus]}`} title={c.emailError || undefined}>
                                                {t(`issued.emailStatus.${c.emailStatus}`)}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" title={t("issued.view")} asChild>
                                                    <a href={`/certificates/${c._id}`} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" title={t("issued.print")} onClick={() => openPrint([c])}>
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" title={t("issued.sendEmail")} disabled={!c.recipientEmail || busy} onClick={() => sendEmails([c])}>
                                                    <Mail className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    title={t("issued.edit")}
                                                    onClick={() => { setEditing(c); setEditName(c.recipientName); setEditEmail(c.recipientEmail) }}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" title={t("issued.delete")} disabled={busy} onClick={() => remove([c])}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {activeTemplate && (
                <AssignCertificatesDialog
                    open={assignOpen}
                    onOpenChange={setAssignOpen}
                    eventId={eventId}
                    template={activeTemplate}
                    alreadyIssuedOrderIds={issuedOrderIds}
                    onIssued={refresh}
                />
            )}

            <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("issued.editTitle")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label>{t("issued.colName")}</Label>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>{t("issued.colEmail")}</Label>
                            <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditing(null)}>{t("common.cancel")}</Button>
                        <Button onClick={saveEdit} disabled={!editName.trim() || busy}>{t("common.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {printing && (
                <CertificatePrinter
                    certificates={printing}
                    event={{ title: event.title, start: event.start, end: event.end }}
                    onClose={() => setPrinting(null)}
                />
            )}
        </div>
    )
}
