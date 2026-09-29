"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Plus, Search, Trash2, UserPlus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { getCertificateCandidates, issueCertificates, type IssueRecipient } from "@/lib/actions/certificate.actions"

type Candidate = { orderId: string; name: string; email: string; category: string }

export function AssignCertificatesDialog({
    open,
    onOpenChange,
    eventId,
    template,
    alreadyIssuedOrderIds,
    onIssued,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    eventId: string
    template: any
    alreadyIssuedOrderIds: Set<string>
    onIssued: () => void
}) {
    const t = useTranslations("certificates")
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [manual, setManual] = useState<{ name: string; email: string }[]>([])
    const [manualName, setManualName] = useState("")
    const [manualEmail, setManualEmail] = useState("")
    const [isIssuing, setIsIssuing] = useState(false)

    const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
        queryKey: ["certificate-candidates", eventId],
        queryFn: () => getCertificateCandidates(eventId),
        enabled: open,
    })

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return candidates
        return candidates.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    }, [candidates, search])

    const selectable = filtered.filter((c) => !alreadyIssuedOrderIds.has(c.orderId))
    const allFilteredSelected = selectable.length > 0 && selectable.every((c) => selected.has(c.orderId))

    const toggle = (orderId: string) =>
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(orderId)) next.delete(orderId)
            else next.add(orderId)
            return next
        })

    const toggleAllFiltered = () =>
        setSelected((prev) => {
            const next = new Set(prev)
            if (allFilteredSelected) selectable.forEach((c) => next.delete(c.orderId))
            else selectable.forEach((c) => next.add(c.orderId))
            return next
        })

    const addManual = () => {
        const name = manualName.trim()
        if (!name) return
        setManual((prev) => [...prev, { name, email: manualEmail.trim() }])
        setManualName("")
        setManualEmail("")
    }

    const reset = () => {
        setSelected(new Set())
        setManual([])
        setSearch("")
        setManualName("")
        setManualEmail("")
    }

    const total = selected.size + manual.length

    const handleIssue = async () => {
        const recipients: IssueRecipient[] = [
            ...candidates.filter((c) => selected.has(c.orderId)).map((c) => ({ orderId: c.orderId, name: c.name, email: c.email })),
            ...manual,
        ]
        setIsIssuing(true)
        const result = await issueCertificates({ eventId, templateId: template._id, recipients })
        setIsIssuing(false)
        if (!result || "error" in result) {
            toast({ title: t("assign.failed"), variant: "destructive" })
            return
        }
        toast({ title: t("assign.done", { created: result.created, skipped: result.skipped }) })
        reset()
        onIssued()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t("assign.title", { type: template?.name || "" })}</DialogTitle>
                    <DialogDescription>{t("assign.description")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 flex-1 min-h-0 flex flex-col">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("assign.search")} className="pl-9" />
                        </div>
                        <Button variant="outline" size="sm" onClick={toggleAllFiltered} disabled={selectable.length === 0}>
                            {allFilteredSelected ? t("assign.unselectAll") : t("assign.selectAll", { count: selectable.length })}
                        </Button>
                    </div>

                    <ScrollArea className="h-[340px] rounded-md border">
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <p className="p-6 text-center text-sm text-muted-foreground">{t("assign.noParticipants")}</p>
                        ) : (
                            <div className="divide-y">
                                {filtered.map((c) => {
                                    const issued = alreadyIssuedOrderIds.has(c.orderId)
                                    return (
                                        <label
                                            key={c.orderId}
                                            className={`flex items-center gap-3 px-3 py-2 text-sm ${issued ? "opacity-50" : "cursor-pointer hover:bg-muted/50"}`}
                                        >
                                            <Checkbox checked={issued || selected.has(c.orderId)} disabled={issued} onCheckedChange={() => toggle(c.orderId)} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{c.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{c.email || t("assign.noEmail")}</p>
                                            </div>
                                            {issued ? (
                                                <Badge variant="secondary">{t("assign.alreadyIssued")}</Badge>
                                            ) : (
                                                <Badge variant="outline" className="capitalize">{c.category}</Badge>
                                            )}
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="rounded-md border p-3 space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            {t("assign.manualTitle")}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder={t("assign.manualName")} onKeyDown={(e) => e.key === "Enter" && addManual()} />
                            <Input type="email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} placeholder={t("assign.manualEmail")} onKeyDown={(e) => e.key === "Enter" && addManual()} />
                            <Button variant="outline" onClick={addManual} disabled={!manualName.trim()} className="gap-1 shrink-0">
                                <Plus className="w-4 h-4" />
                                {t("assign.add")}
                            </Button>
                        </div>
                        {manual.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {manual.map((m, i) => (
                                    <Badge key={`${m.name}-${i}`} variant="secondary" className="gap-1 pr-1">
                                        {m.name}
                                        {m.email && <span className="text-muted-foreground">· {m.email}</span>}
                                        <button type="button" onClick={() => setManual((prev) => prev.filter((_, idx) => idx !== i))} className="ml-1 rounded hover:bg-muted p-0.5">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
                    <Button onClick={handleIssue} disabled={total === 0 || isIssuing} className="gap-2">
                        {isIssuing && <Loader2 className="w-4 h-4 animate-spin" />}
                        {t("assign.confirm", { count: total })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
