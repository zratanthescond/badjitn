"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Search,
    Filter,
    MoreVertical,
    Printer,
    Trash2,
    RefreshCw,
    Loader2,
    CheckCircle2,
    XCircle,
    UserCircle,
    FileSpreadsheet,
} from "lucide-react"
import { getAttendeesByEvent, deleteAttendee } from "@/lib/actions/badge.actions"
import { toast } from "sonner"

interface Attendee {
    _id: string
    number?: number | null
    name: string
    email: string
    company?: string
    title?: string
    photo?: string
    category: string
    badgePrinted: boolean
}

interface AttendeeManagerProps {
    eventId: string
    onPrintBadges: (attendees: Attendee[]) => void
    onPrintSingle: (attendee: Attendee) => void
    refreshKey?: number
}

export function AttendeeManager({ eventId, onPrintBadges, onPrintSingle, refreshKey }: AttendeeManagerProps) {
    const t = useTranslations("attendeeManager")
    const [attendees, setAttendees] = useState<Attendee[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [isLoading, setIsLoading] = useState(true)
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
    const [isExporting, setIsExporting] = useState(false)

    const fetchAttendees = async () => {
        setIsLoading(true)
        try {
            const data = await getAttendeesByEvent(eventId)
            setAttendees(data || [])
        } catch (error) {
            toast.error(t("loadFailedEvent"))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAttendees()
    }, [eventId, refreshKey])

    const handleDelete = async (id: string) => {
        if (!confirm(t("deleteConfirmEvent"))) return
        try {
            const res = await deleteAttendee(id)
            if (res?.success) {
                setAttendees(attendees.filter((a) => a._id !== id))
                toast.success(t("deleteSuccessEvent"))
            }
        } catch (error) {
            toast.error(t("deleteFailedEvent"))
        }
    }

    const BADGE_CATEGORIES = ["attendee", "speaker", "sponsor", "staff"] as const
    const categoryLabel = (category: string) =>
        BADGE_CATEGORIES.includes(category as any)
            ? t(`categories.${category}`)
            : category

    const filteredAttendees = attendees.filter(
        (a) =>
            (categoryFilter === "all" || (a.category || "attendee") === categoryFilter) &&
            (a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.company?.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const printedAttendees = filteredAttendees.filter((a) => a.badgePrinted)

    const handleExportPrinted = async () => {
        if (printedAttendees.length === 0) return
        setIsExporting(true)
        try {
            const exceljsModule = await import("exceljs")
            const ExcelJS: any = (exceljsModule as any).default ?? exceljsModule
            const workbook = new ExcelJS.Workbook()
            const ws = workbook.addWorksheet(t("export.sheetName"))
            const headers = [
                t("columns.number"),
                t("columns.attendee"),
                "Email",
                t("export.company"),
                t("export.jobTitle"),
                t("columns.category"),
                t("columns.status"),
            ]
            const cols = headers.length
            const headerRowNumber = 5
            const border = {
                top: { style: "thin", color: { argb: "FFD1D5DB" } },
                bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
                left: { style: "thin", color: { argb: "FFD1D5DB" } },
                right: { style: "thin", color: { argb: "FFD1D5DB" } },
            }
            const fill = (argb: string) => ({ type: "pattern", pattern: "solid", fgColor: { argb } })

            ws.mergeCells(1, 1, 1, cols)
            const title = ws.getCell(1, 1)
            title.value = t("export.title")
            title.font = { bold: true, size: 14, color: { argb: "FF0F172A" } }
            title.fill = fill("FFDCEBFF")
            title.alignment = { horizontal: "left", vertical: "middle" }
            ws.getRow(1).height = 32

            const meta: [string, string][] = [
                [t("export.exportedOn"), new Date().toLocaleString()],
                [t("export.total"), String(printedAttendees.length)],
            ]
            meta.forEach(([label, value], i) => {
                const r = 2 + i
                ws.getCell(r, 1).value = label
                ws.getCell(r, 1).font = { bold: true }
                ws.getCell(r, 1).fill = fill("FFE5E7EB")
                ws.mergeCells(r, 2, r, cols)
                ws.getCell(r, 2).value = value
                ws.getCell(r, 1).border = border
                ws.getCell(r, 2).border = border
            })

            const header = ws.getRow(headerRowNumber)
            header.values = headers
            header.height = 24
            header.eachCell((c: any) => {
                c.font = { bold: true, color: { argb: "FFFFFFFF" } }
                c.fill = fill("FF2563EB")
                c.alignment = { horizontal: "center", vertical: "middle" }
                c.border = border
            })

            const rows = printedAttendees.map((a) => [
                a.number ?? "",
                a.name,
                a.email,
                a.company || "",
                a.title || "",
                categoryLabel(a.category || "attendee"),
                t("printed"),
            ])
            rows.forEach((values, i) => {
                const row = ws.getRow(headerRowNumber + 1 + i)
                row.values = values
                row.height = 20
                for (let c = 1; c <= cols; c++) {
                    const cell = row.getCell(c)
                    cell.border = border
                    cell.alignment = { horizontal: c === 1 ? "center" : "left", vertical: "middle" }
                    if (i % 2 === 1) cell.fill = fill("FFF8FAFC")
                }
            })

            const widths = [8, 30, 34, 28, 28, 16, 14]
            widths.forEach((w, i) => (ws.getColumn(i + 1).width = w))
            ws.views = [{ state: "frozen", ySplit: headerRowNumber }]
            ws.autoFilter = { from: { row: headerRowNumber, column: 1 }, to: { row: headerRowNumber, column: cols } }
            ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 }

            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `badges_imprimes_${new Date().toISOString().slice(0, 10)}.xlsx`
            a.click()
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error(error)
            toast.error(t("export.error"))
        } finally {
            setIsExporting(false)
        }
    }

    // Changing the category filter drops selections that are no longer visible,
    // so "Print selection" never prints hidden rows.
    const handleCategoryFilterChange = (value: string) => {
        setCategoryFilter(value)
        if (value === "all") return
        setSelectedAttendees((prev) =>
            prev.filter((id) => {
                const a = attendees.find((x) => x._id === id)
                return a && (a.category || "attendee") === value
            })
        )
    }

    const toggleSelect = (id: string) => {
        setSelectedAttendees((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0) {
            setSelectedAttendees([])
        } else {
            setSelectedAttendees(filteredAttendees.map((a) => a._id))
        }
    }

    const handlePrintSelected = () => {
        const selected = attendees.filter((a) => selectedAttendees.includes(a._id))
        if (selected.length === 0) {
            toast.error(t("selectToPrint"))
            return
        }
        onPrintBadges(selected)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={t("searchPlaceholder")}
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-56">
                    <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                        <SelectTrigger>
                            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder={t("categoryFilter.all")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("categoryFilter.all")}</SelectItem>
                            {BADGE_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {categoryLabel(category)} ({attendees.filter((a) => (a.category || "attendee") === category).length})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={handleExportPrinted} disabled={printedAttendees.length === 0 || isExporting} className="flex-1 md:flex-none">
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                        {t("export.button", { count: printedAttendees.length })}
                    </Button>
                    <Button onClick={handlePrintSelected} disabled={selectedAttendees.length === 0} className="flex-1 md:flex-none">
                        <Printer className="w-4 h-4 mr-2" />
                        {t("printSelected", { count: selectedAttendees.length })}
                    </Button>
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    checked={selectedAttendees.length > 0 && selectedAttendees.length === filteredAttendees.length}
                                    onChange={toggleSelectAll}
                                    disabled={filteredAttendees.length === 0}
                                />
                            </TableHead>
                            <TableHead className="w-20">{t("columns.number")}</TableHead>
                            <TableHead>{t("columns.attendee")}</TableHead>
                            <TableHead>{t("columns.companyTitle")}</TableHead>
                            <TableHead>{t("columns.category")}</TableHead>
                            <TableHead>{t("columns.status")}</TableHead>
                            <TableHead className="text-right">{t("columns.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : filteredAttendees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                    {t("emptyEvent")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAttendees.map((attendee) => (
                                <TableRow key={attendee._id}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300"
                                            checked={selectedAttendees.includes(attendee._id)}
                                            onChange={() => toggleSelect(attendee._id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-primary tabular-nums">
                                            {attendee.number ? `N° ${attendee.number}` : "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {attendee.photo ? (
                                                <img
                                                    src={attendee.photo}
                                                    alt={attendee.name}
                                                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                    <UserCircle className="w-5 h-5 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-medium">{attendee.name}</span>
                                                <span className="text-xs text-muted-foreground italic">{attendee.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{attendee.company || "-"}</span>
                                            <span className="text-xs text-muted-foreground italic">{attendee.title || "-"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {categoryLabel(attendee.category)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {attendee.badgePrinted ? (
                                            <div className="flex items-center gap-1 text-green-500 text-xs">
                                                <CheckCircle2 className="w-3 h-3" />
                                                {t("printed")}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                                <XCircle className="w-3 h-3" />
                                                {t("notPrinted")}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{t("actionsLabel")}</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onPrintSingle(attendee)}>
                                                    <Printer className="w-4 h-4 mr-2" />
                                                    {t("printBadge")}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => handleDelete(attendee._id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    {t("delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
