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
    Search,
    MoreVertical,
    Printer,
    Trash2,
    RefreshCw,
    Loader2,
    CheckCircle2,
    XCircle,
    UserCircle,
} from "lucide-react"
import { getAttendeesByEvent, deleteAttendee } from "@/lib/actions/badge.actions"
import { toast } from "sonner"

interface Attendee {
    _id: string
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
}

export function AttendeeManager({ eventId, onPrintBadges, onPrintSingle }: AttendeeManagerProps) {
    const t = useTranslations("attendeeManager")
    const [attendees, setAttendees] = useState<Attendee[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])

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
    }, [eventId])

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

    const filteredAttendees = attendees.filter(
        (a) =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                <div className="flex items-center gap-2 w-full md:w-auto">
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
                                <TableCell colSpan={6} className="text-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : filteredAttendees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
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
                                            {attendee.category}
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
