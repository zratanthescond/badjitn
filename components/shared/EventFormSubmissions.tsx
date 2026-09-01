"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    Users,
    Download,
    Search,
    Clock,
    Mail,
    User,
    FileText,
    ChevronDown,
    ChevronUp,
    Loader2,
    ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getFormSubmissions, getEventFormById } from "@/lib/actions/eventform.actions";
import { toast } from "@/hooks/use-toast";

interface Submission {
    _id: string;
    name: string;
    email: string;
    responses: {
        fieldId: string;
        label: string;
        value: string | string[];
    }[];
    submittedAt: string;
}

interface EventFormSubmissionsProps {
    formId: string;
    formTitle: string;
}

export default function EventFormSubmissions({ formId, formTitle }: EventFormSubmissionsProps) {
    const t = useTranslations("eventFormSubmissions");
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

    useEffect(() => {
        loadSubmissions();
    }, [formId]);

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const result = await getFormSubmissions(formId);
            if (result.success) {
                setSubmissions(result.data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSubmissions = submissions.filter(
        (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Styled the same way as the event registrations export (order-administration.tsx):
    // logo + "BADGI - EXPORT INSCRIPTIONS" banner, a metadata block (rows 3-8), then a
    // blue-header data table with autofilter, frozen header row and zebra striping.
    const exportXLSX = async () => {
        if (submissions.length === 0) return;

        setIsExporting(true);
        try {
            const formResult = await getEventFormById(formId);
            const form = formResult.success ? (formResult.data as any) : null;

            const ensureUniqueHeader = (usedHeaders: Set<string>, header: string) => {
                const normalizedHeader = (header || "").trim() || "Colonne";
                if (!usedHeaders.has(normalizedHeader)) {
                    usedHeaders.add(normalizedHeader);
                    return normalizedHeader;
                }
                let index = 2;
                while (usedHeaders.has(`${normalizedHeader} (${index})`)) index += 1;
                const uniqueHeader = `${normalizedHeader} (${index})`;
                usedHeaders.add(uniqueHeader);
                return uniqueHeader;
            };

            const baseHeaders = ["Nom complet", "Email", "Date d'inscription"];
            const usedHeaders = new Set<string>(baseHeaders);
            const labelToHeader = new Map<string, string>();
            submissions.forEach((s) =>
                s.responses.forEach((r) => {
                    if (!r.label || labelToHeader.has(r.label)) return;
                    labelToHeader.set(r.label, ensureUniqueHeader(usedHeaders, r.label));
                })
            );

            const headers = [...baseHeaders, ...Array.from(labelToHeader.values())];
            const rows = submissions.map((s) => {
                const responseMap = new Map<string, string>();
                s.responses.forEach((r) => {
                    responseMap.set(r.label, Array.isArray(r.value) ? r.value.join(", ") : r.value || "");
                });
                const row: (string | number)[] = [s.name, s.email, new Date(s.submittedAt).toLocaleString()];
                labelToHeader.forEach((_, label) => row.push(responseMap.get(label) || ""));
                return row;
            });

            const eventMeta = {
                title: form?.title || formTitle,
                organisation: form?.organisation?.name || "-",
                createdAt: form?.createdAt ? new Date(form.createdAt).toLocaleString() : "-",
                link:
                    typeof window !== "undefined" && form?.slug
                        ? `${window.location.origin}/forms/${form.slug}`
                        : "-",
                totalSubmissions: submissions.length,
                exportDate: new Date().toLocaleString(),
            };

            const exceljsModule = await import("exceljs");
            const ExcelJS: any = (exceljsModule as any).default ?? exceljsModule;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Submissions");

            const totalColumns = Math.max(headers.length, 1);
            const headerRowNumber = 10;
            const dataStartRowNumber = headerRowNumber + 1;
            const platformLogoUrl = `${(process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net").replace(/\/$/, "")}/assets/images/logoDark.png`;

            if (totalColumns >= 2) {
                worksheet.getCell("B1").value = "BADGI - EXPORT INSCRIPTIONS";
                worksheet.mergeCells(1, 2, 1, totalColumns);
                worksheet.mergeCells(3, 2, 3, totalColumns);
                worksheet.mergeCells(4, 2, 4, totalColumns);
                worksheet.mergeCells(5, 2, 5, totalColumns);
                worksheet.mergeCells(6, 2, 6, totalColumns);
                worksheet.mergeCells(7, 2, 7, totalColumns);
                worksheet.mergeCells(8, 2, 8, totalColumns);
            } else {
                worksheet.getCell("A1").value = "BADGI - EXPORT INSCRIPTIONS";
            }

            worksheet.getCell("A3").value = "Formulaire";
            worksheet.getCell("B3").value = eventMeta.title || "-";
            worksheet.getCell("A4").value = "Organisation";
            worksheet.getCell("B4").value = eventMeta.organisation || "-";
            worksheet.getCell("A5").value = "Créé le";
            worksheet.getCell("B5").value = eventMeta.createdAt || "-";
            worksheet.getCell("A6").value = "Lien";
            worksheet.getCell("B6").value = eventMeta.link || "-";
            worksheet.getCell("A7").value = "Total inscriptions";
            worksheet.getCell("B7").value = eventMeta.totalSubmissions;
            worksheet.getCell("A8").value = "Exporté le";
            worksheet.getCell("B8").value = eventMeta.exportDate || "-";

            try {
                const logoResp = await fetch(platformLogoUrl);
                if (logoResp.ok) {
                    const logoBlob = await logoResp.blob();
                    const logoBase64: string = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(String(reader.result || ""));
                        reader.readAsDataURL(logoBlob);
                    });
                    if (logoBase64.startsWith("data:image")) {
                        const logoImageId = workbook.addImage({ base64: logoBase64, extension: "png" });
                        worksheet.addImage(logoImageId, {
                            tl: { col: 0, row: 0 },
                            ext: { width: 165, height: 50 },
                        });
                    }
                }
            } catch (_logoError) {
                // Non-blocking: continue export even if the logo can't be loaded
            }

            worksheet.getRow(headerRowNumber).values = headers;
            rows.forEach((row, idx) => {
                worksheet.getRow(dataStartRowNumber + idx).values = row as any;
            });

            for (let c = 1; c <= totalColumns; c += 1) {
                const header = String(headers[c - 1] || "");
                const values = rows.map((r) => String(r?.[c - 1] ?? ""));
                const maxLen = [header, ...values].reduce((max, v) => Math.max(max, v.length), 8);
                worksheet.getColumn(c).width = Math.min(48, Math.max(12, maxLen + 2));
            }

            worksheet.views = [{ state: "frozen", ySplit: headerRowNumber }];
            worksheet.autoFilter = {
                from: { row: headerRowNumber, column: 1 },
                to: { row: headerRowNumber, column: totalColumns },
            };

            const borderThin = {
                top: { style: "thin", color: { argb: "FFD1D5DB" } },
                bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
                left: { style: "thin", color: { argb: "FFD1D5DB" } },
                right: { style: "thin", color: { argb: "FFD1D5DB" } },
            };

            const titleCell = worksheet.getCell(totalColumns >= 2 ? "B1" : "A1");
            titleCell.font = { bold: true, size: 14, color: { argb: "FF0F172A" } };
            titleCell.alignment = { horizontal: "left", vertical: "middle" };
            titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCEBFF" } };
            titleCell.border = borderThin as any;
            worksheet.getRow(1).height = 36;

            for (let r = 3; r <= 8; r += 1) {
                const labelCell = worksheet.getCell(r, 1);
                const valueCell = worksheet.getCell(r, 2);
                labelCell.font = { bold: true, color: { argb: "FF1F2937" } };
                labelCell.alignment = { horizontal: "left", vertical: "middle" };
                labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
                labelCell.border = borderThin as any;

                valueCell.alignment = { horizontal: "left", vertical: "middle" };
                valueCell.border = borderThin as any;
                worksheet.getRow(r).height = 22;
            }

            const headerRow = worksheet.getRow(headerRowNumber);
            headerRow.height = 24;
            headerRow.eachCell((cell: any) => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                cell.alignment = { horizontal: "center", vertical: "middle" };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
                cell.border = borderThin as any;
            });

            rows.forEach((_row, rowIndex) => {
                const rowNumber = dataStartRowNumber + rowIndex;
                const excelRow = worksheet.getRow(rowNumber);
                const isZebra = rowIndex % 2 === 1;
                excelRow.height = 20;
                for (let c = 1; c <= totalColumns; c += 1) {
                    const cell = excelRow.getCell(c);
                    cell.border = borderThin as any;
                    cell.alignment = { horizontal: "left", vertical: "middle" } as any;
                    if (isZebra) {
                        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
                    }
                }
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const safeTitle = String(eventMeta.title || "form")
                .trim()
                .replace(/[^a-zA-Z0-9-_ ]/g, "")
                .replace(/\s+/g, "_");
            const safeDate = new Date().toISOString().slice(0, 10);

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${safeTitle || "form"}_${safeDate}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("[EventFormSubmissions] Export error:", err);
            toast({ title: t("exportErrorTitle"), description: t("exportErrorDescription"), variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-muted-foreground/10" />
                <Skeleton className="h-24 w-full bg-muted-foreground/10" />
                <Skeleton className="h-24 w-full bg-muted-foreground/10" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                        <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{formTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t("submissionsCount", { count: submissions.length })}
                        </p>
                    </div>
                </div>

                {submissions.length > 0 && (
                    <Button
                        variant="outline"
                        onClick={exportXLSX}
                        disabled={isExporting}
                        className="rounded-full"
                    >
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        {isExporting ? t("exporting") : t("exportCsv")}
                    </Button>
                )}
            </div>

            {/* Search */}
            {submissions.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("searchPlaceholder")}
                        className="pl-10 bg-white/50 dark:bg-slate-800/50"
                    />
                </div>
            )}

            {/* Empty state */}
            {submissions.length === 0 && (
                <div className="text-center py-12 bg-card/30 rounded-xl border border-dashed border-muted-foreground/20">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-indigo-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{t("noSubmissionsTitle")}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t("noSubmissionsDescription")}
                    </p>
                </div>
            )}

            {/* Submissions list */}
            {filteredSubmissions.map((submission) => {
                const isExpanded = expandedSubmission === submission._id;
                return (
                    <Card
                        key={submission._id}
                        className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 overflow-hidden"
                    >
                        <button
                            onClick={() =>
                                setExpandedSubmission(isExpanded ? null : submission._id)
                            }
                            className="w-full text-left"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {submission.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{submission.name}</p>
                                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {submission.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <Badge variant="secondary" className="text-xs hidden sm:flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(submission.submittedAt).toLocaleDateString()}
                                        </Badge>
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </button>

                        {isExpanded && (
                            <>
                                <Separator />
                                <CardContent className="p-4 bg-slate-50/50 dark:bg-slate-800/20">
                                    <div className="space-y-3">
                                        {submission.responses.map((r, i) => (
                                            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                    {r.label}
                                                </p>
                                                <p className="text-sm sm:col-span-2">
                                                    {Array.isArray(r.value)
                                                        ? r.value.join(", ")
                                                        : r.value || (
                                                            <span className="text-muted-foreground italic">{t("emptyValue")}</span>
                                                        )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                                        {t("submittedLabel")} {new Date(submission.submittedAt).toLocaleString()}
                                    </div>
                                </CardContent>
                            </>
                        )}
                    </Card>
                );
            })}

            {searchQuery && filteredSubmissions.length === 0 && submissions.length > 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                    {t("noSearchResults")}
                </div>
            )}
        </div>
    );
}
