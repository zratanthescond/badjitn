"use client";

import { useMemo, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Checkbox } from "@/components/ui/checkbox";
import Search from "../shared/Search";
import { getUserWorkByEventId } from "@/lib/actions/user.actions";
import { WorkEmailDialog, type WorkEmailPayload } from "./WorkEmailDialog";
import { useQuery } from "@tanstack/react-query";
import TableSkeleton from "../shared/table-skeleton";
import { formatDateTime } from "@/lib/utils";
import {
  CheckCheck,
  Download,
  Briefcase,
  Calendar,
  Clock,
  ImageDown,
  Loader2,
  MailCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { WorkDetailsDialog } from "./WorkDetailsDialog";
import { CardSkeleton } from "./CardSkeleton";
import { AdminSectionHeader } from "./ui/AdminSectionHeader";
import { StatCard } from "./ui/StatCard";
import { AdminToolbar } from "./ui/AdminToolbar";
import { AdminDataTable, type AdminColumn } from "./ui/AdminDataTable";
import { AdminPagination } from "./ui/AdminPagination";
import { AdminEmptyState } from "./ui/AdminEmptyState";
import { Button } from "../ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const KEPT_TAGS = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "UL", "OL", "LI", "SUB", "SUP"]);
const BLOCK_TAGS = new Set(["P", "DIV", "LI", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "TR"]);

// Submission fields come either as plain text or as rich-text-editor HTML; exports need
// readable text (PDF) and a whitelisted HTML subset (Word), never the raw markup.
const richTextToExport = (raw: string): { text: string; html: string } => {
  const value = String(raw || "");
  const isHtml = /<\/?[a-z][^>]*>/i.test(value);
  const body = new DOMParser().parseFromString(`<body>${value}</body>`, "text/html").body;

  if (!isHtml) {
    const text = (body.textContent || "").trim();
    return { text, html: escapeHtml(text).replace(/\r?\n/g, "<br/>") };
  }

  let text = "";
  let html = "";
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const chunk = (node.textContent || "").replace(/\s+/g, " ");
      text += chunk;
      html += escapeHtml(chunk);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = (node as Element).tagName;
    if (tag === "SCRIPT" || tag === "STYLE") return;
    if (tag === "BR") {
      text += "\n";
      html += "<br/>";
      return;
    }
    if (tag === "LI") text += "• ";
    const kept = KEPT_TAGS.has(tag);
    if (kept) html += `<${tag.toLowerCase()}>`;
    node.childNodes.forEach(walk);
    if (kept) html += `</${tag.toLowerCase()}>`;
    if (BLOCK_TAGS.has(tag)) text += "\n";
  };
  body.childNodes.forEach(walk);

  text = text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { text, html };
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function WorkAdministration({
  eventId,
  searchString,
}: {
  eventId: string;
  searchString: string;
}) {
  const t = useTranslations("workAdministration");
  const tx = (key: string, fallback: string) =>
    t.has(key as any) ? t(key as any) : fallback;
  const locale = useLocale();
  const isRTL = locale === "ar";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPosters, setSelectedPosters] = useState<Set<string>>(new Set());
  const [isExportingPosters, setIsExportingPosters] = useState(false);
  const [isBulkEmailDialogOpen, setIsBulkEmailDialogOpen] = useState(false);
  const [isBulkEmailing, setIsBulkEmailing] = useState(false);
  // "all" = every approved résumé; "noPoster" = approved résumés still without an e-poster (reminder).
  const [bulkFilter, setBulkFilter] = useState<"all" | "noPoster">("all");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // New: a client-side status filter (including the synthetic
  // "pending-registration" works parsed out of orders) plus pagination.
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const { isPending, data } = useQuery({
    queryKey: ["works", eventId, searchString],
    queryFn: async () => {
      const response = await getUserWorkByEventId({ eventId, searchString });
      return response;
    },
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: t("status.submitted"),
      approved: t("status.approved"),
      reviewed: t("status.reviewed"),
      rejected: t("status.rejected"),
      draft: t("status.pending"),
      pending: t("status.pending"),
    };
    return labels[status] || labels.submitted;
  };

  // Permanent N° de soumission stored on the work (never a list position);
  // a résumé not yet materialized has none, hence the dash.
  const submissionNumber = (item: any) => item?.number ?? "—";

  const hasPoster = (item: any) => Array.isArray(item?.fileUrls) && item.fileUrls.length > 0;
  const postersAvailable = (data || []).filter(hasPoster);
  const allPostersSelected =
    postersAvailable.length > 0 && postersAvailable.every((item: any) => selectedPosters.has(String(item._id)));
  const togglePoster = (item: any, checked: boolean) =>
    setSelectedPosters((prev) => {
      const next = new Set(prev);
      if (checked) next.add(String(item._id));
      else next.delete(String(item._id));
      return next;
    });
  const toggleAllPosters = (checked: boolean) =>
    setSelectedPosters(checked ? new Set(postersAvailable.map((item: any) => String(item._id))) : new Set());

  // Exports the selected e-posters in the chosen format; each file is named after the
  // submission number (same numbering as the list / Word / PDF export).
  const handleExportPosters = async (format: "jpeg" | "pdf" | "pptx") => {
    const items = (data || [])
      .filter((item: any) => selectedPosters.has(String(item._id)) && hasPoster(item))
      .map((item: any) => ({ number: submissionNumber(item), urls: item.fileUrls as string[] }));
    if (items.length === 0) {
      toast({ title: "Export e-posters", description: "Sélectionnez au moins un e-poster.", variant: "destructive" });
      return;
    }
    setIsExportingPosters(true);
    try {
      const res = await fetch("/api/work/export-posters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, format }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Échec de l'export");
      }
      const blob = await res.blob();
      const filename = res.headers.get("X-Filename") || "e-posters.zip";
      const failed = decodeURIComponent(res.headers.get("X-Export-Errors") || "");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({
        title: "Export e-posters",
        description: failed ? `Terminé avec des erreurs : ${failed}` : `${items.length} e-poster(s) exporté(s).`,
        variant: failed ? "destructive" : undefined,
      });
    } catch (e) {
      toast({
        title: "Export e-posters",
        description: e instanceof Error ? e.message : "Échec de l'export",
        variant: "destructive",
      });
    } finally {
      setIsExportingPosters(false);
    }
  };

  const toneForStatus: Record<string, string> = {
    submitted: "bg-admin-accent-soft text-admin-accent-soft-foreground",
    approved: "bg-admin-success-soft text-admin-success",
    reviewed: "bg-admin-success-soft text-admin-success",
    rejected: "bg-admin-critical-soft text-destructive",
    draft: "bg-admin-warning-soft text-admin-warning",
    pending: "bg-admin-warning-soft text-admin-warning",
  };

  const getStatusBadge = (status: string) => (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        toneForStatus[status] || toneForStatus.submitted
      } ${isRTL ? "font-arabic" : ""}`}
    >
      {getStatusLabel(status)}
    </span>
  );

  const filteredData = useMemo(() => {
    const base = data || [];
    if (!statusFilter) return base;
    if (statusFilter === "pending-registration") {
      return base.filter((item: any) => item.isPendingRegistration === true);
    }
    return base.filter((item: any) => (item.status || "submitted") === statusFilter);
  }, [data, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns: AdminColumn[] = [
    {
      header: (
        <Checkbox
          aria-label="Tout sélectionner"
          checked={allPostersSelected}
          disabled={postersAvailable.length === 0}
          onCheckedChange={(v) => toggleAllPosters(v === true)}
        />
      ),
      accessor: "root",
      cell: (value: any) =>
        hasPoster(value) ? (
          <Checkbox
            aria-label="Sélectionner l'e-poster"
            checked={selectedPosters.has(String(value._id))}
            onCheckedChange={(v) => togglePoster(value, v === true)}
          />
        ) : null,
    },
    {
      header: "N°",
      accessor: "root",
      cell: (value: any) => (
        <span className="font-semibold tabular-nums">{submissionNumber(value)}</span>
      ),
    },
    {
      header: t("table.headers.id"),
      accessor: "_id",
      cell: (value: string) => (
        <span className="font-mono text-xs font-semibold text-primary">#{String(value).slice(-8)}</span>
      ),
    },
    {
      header: t("table.headers.eventTitle"),
      accessor: "eventTitle",
      cell: (value: string) => (
        <span className={`font-medium text-foreground ${isRTL ? "font-arabic" : ""}`}>{value}</span>
      ),
    },
    {
      header: t("table.headers.submitter"),
      accessor: "buyer",
      cell: (value: string) => (
        <div className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {value.charAt(0).toUpperCase()}
          </div>
          <span className={isRTL ? "font-arabic" : ""}>{value}</span>
        </div>
      ),
    },
    {
      header: t("table.headers.status"),
      accessor: "status",
      cell: (value: string) => getStatusBadge(value || "submitted"),
    },
    {
      header: t("table.headers.submitted"),
      accessor: "createdAt",
      cell: (value: Date) => (
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
            {formatDateTime(value).dateTime}
          </span>
        </div>
      ),
    },
    {
      header: t("table.headers.actions"),
      accessor: "root",
      align: "right" as const,
      cell: (value: any) => <WorkDetailsDialog value={value} />,
    },
  ];

  const renderMobileCard = (item: any) => (
    <Card key={item._id} className="border-border">
      <CardHeader className="pb-3">
        <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          <CardTitle className={`text-base ${isRTL ? "font-arabic" : ""}`}>{item.eventTitle}</CardTitle>
          {getStatusBadge(item.status || "submitted")}
        </div>
        <CardDescription className={`font-mono text-xs ${isRTL ? "text-right font-arabic" : ""}`}>
          {hasPoster(item) && (
            <Checkbox
              className="mr-2 align-middle"
              aria-label="Sélectionner l'e-poster"
              checked={selectedPosters.has(String(item._id))}
              onCheckedChange={(v) => togglePoster(item, v === true)}
            />
          )}
          N° {submissionNumber(item)} · {t("workIdLabel")}: {String(item._id).slice(-8)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground">
            {item.buyer.charAt(0).toUpperCase()}
          </div>
          <div className={isRTL ? "text-right" : ""}>
            <p className={`font-medium ${isRTL ? "font-arabic" : ""}`}>{item.buyer}</p>
            <p className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>{t("submitter")}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
            {formatDateTime(item.createdAt).dateTime}
          </span>
        </div>
      </CardContent>
      <CardFooter className={`flex justify-center border-t border-border pt-4 ${isRTL ? "flex-row-reverse" : ""}`}>
        <WorkDetailsDialog value={item} />
      </CardFooter>
    </Card>
  );

  const stats = data
    ? {
        total: data.length,
        submitted: data.filter(
          (item: any) => (item.status || item.summaryStatus || "submitted") === "submitted"
        ).length,
        reviewed: data.filter(
          (item: any) => item.status === "reviewed" || item.status === "approved" || item.summaryStatus === "approved"
        ).length,
        pending: data.filter(
          (item: any) => item.status === "pending" || item.summaryStatus === "draft"
        ).length,
      }
    : { total: 0, submitted: 0, reviewed: 0, pending: 0 };

  // Only materialized EventWork rows can be approved, which is exactly what the
  // bulk server action targets; the search filter does not narrow the bulk send.
  const approvedCount = (data || []).filter(
    (item: any) => item.summaryStatus === "approved" && !item.isPendingRegistration
  ).length;

  // Approved résumés with no e-poster yet. The reminder is sent once per author
  // (server de-duplicates by email), so count distinct authors alongside résumés.
  const noPosterItems = (data || []).filter(
    (item: any) =>
      item.summaryStatus === "approved" &&
      !item.isPendingRegistration &&
      (item.fileUrls || []).length === 0
  );
  const noPosterCount = noPosterItems.length;
  const noPosterAuthors = new Set(
    noPosterItems.map((item: any) => String(item.userId || item.buyerEmail || item._id))
  ).size;
  const isNoPoster = bulkFilter === "noPoster";
  const recipientCount = isNoPoster ? noPosterAuthors : approvedCount;

  const handleBulkEmail = async (payload: WorkEmailPayload) => {
    setIsBulkEmailing(true);
    try {
      // Routes, not server actions: a tab opened before a deployment would
      // otherwise fail with "Server Action ... was not found on the server".
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/work/send-email-approved`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, filter: bulkFilter, ...payload }),
        }
      );
      const result: {
        success: boolean;
        error?: string;
        total: number;
        sent: number;
        failed: { workId: string; title: string; reason: string }[];
      } = await res.json();
      if (!result.success) throw new Error(result.error || "");
      if (result.failed.length === 0) {
        toast({
          title: t("bulkEmail.toastTitle"),
          description: t("bulkEmail.toastDescription", { sent: result.sent }),
        });
      } else {
        toast({
          title: t("bulkEmail.toastPartialTitle"),
          description: t("bulkEmail.toastPartialDescription", {
            sent: result.sent,
            failed: result.failed.length,
            titles: result.failed.map((f) => f.title).slice(0, 5).join(", "),
          }),
          variant: "destructive",
        });
      }
      setIsBulkEmailDialogOpen(false);
    } catch (err) {
      toast({
        title: t("bulkEmail.toastErrorTitle"),
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setIsBulkEmailing(false);
    }
  };

  const handleBulkTestEmail = async (payload: WorkEmailPayload, to: string) => {
    setIsSendingTestEmail(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/work/send-test-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, to, summaryStatus: "approved", ...payload }),
        }
      );
      const result: { success: boolean; email?: string; error?: string } = await res.json();
      if (!result.success) throw new Error(result.error || "");
      toast({
        title: t("bulkEmail.testToastTitle"),
        description: t("bulkEmail.testToastDescription", { email: result.email || "" }),
      });
    } catch (err) {
      toast({
        title: t("bulkEmail.testToastErrorTitle"),
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  type ExportFormat = "csv" | "xlsx" | "word" | "pdf";

  const getExportPayload = () => {
    const works = data || [];

    // One column per configured abstract section label (e.g. "Introduction",
    // "Méthodes"...), gathered across all works so the export stays complete
    // even if only some rows have that section filled in.
    const sectionLabels: string[] = Array.from(
      new Set(
        works.flatMap((w: any) => (w.sections || []).map((s: any) => s.label))
      )
    );
    const hasNote = sectionLabels.length === 0 && works.some((w: any) => w.note);
    const hasCoAuthors = works.some(
      (w: any) => (w.coAuthors || []).length > 0 || w.clientInfo?.coAuthors
    );

    const headers = [
      t("table.headers.id"),
      t("table.headers.eventTitle"),
      t("table.headers.submitter"),
      t("table.headers.email"),
      t("table.headers.status"),
      t("table.headers.submitted"),
      t("table.headers.title"),
      ...sectionLabels,
      ...(hasNote ? [t("table.headers.summary")] : []),
      ...(hasCoAuthors ? [t("table.headers.coAuthors")] : []),
    ];

    const rows = works.map((work: any) => {
      const contentByLabel: Record<string, string> = {};
      (work.sections || []).forEach((s: any) => {
        contentByLabel[s.label] = s.content || "";
      });
      const coAuthorsText = (work.coAuthors || []).length
        ? work.coAuthors
            .map((c: any) =>
              [c.firstName, c.lastName, c.affiliation ? `(${c.affiliation})` : ""]
                .filter(Boolean)
                .join(" ")
            )
            .join("; ")
        : work.clientInfo?.coAuthors || "";

      return [
        work?._id ?? "",
        work?.eventTitle ?? "",
        work?.buyer ?? "",
        work?.buyerEmail ?? "",
        getStatusLabel(work?.status || "submitted"),
        work?.createdAt ? formatDateTime(work.createdAt).dateTime : "",
        work?.title ?? "",
        ...sectionLabels.map((label) => contentByLabel[label] || ""),
        ...(hasNote ? [work?.note || ""] : []),
        ...(hasCoAuthors ? [coAuthorsText] : []),
      ];
    });

    return { headers, rows };
  };

  // Word/PDF are read as documents: one sheet per submission instead of a wide table.
  type ExportDocument = {
    name: string;
    email: string;
    date: string;
    title: string;
    sections: { label: string; text: string; html: string }[];
    coAuthors: string;
    number?: number;
  };

  const getExportDocuments = (): ExportDocument[] =>
    (data || []).map((work: any): ExportDocument => {
      const sections = (work.sections || [])
        .map((s: any) => ({ label: String(s.label || ""), ...richTextToExport(s.content) }))
        .filter((s: { text: string }) => s.text);
      if (sections.length === 0 && work.note) {
        const note = richTextToExport(work.note);
        if (note.text) sections.push({ label: t("table.headers.summary"), ...note });
      }
      const coAuthors = (work.coAuthors || []).length
        ? work.coAuthors
            .map((c: any) =>
              [c.firstName, c.lastName].filter(Boolean).join(" ") + (c.affiliation ? ` (${c.affiliation})` : "")
            )
            .join(" ; ")
        : String(work.clientInfo?.coAuthors || "");
      return {
        name: richTextToExport(work.buyer).text,
        email: String(work.buyerEmail || "").trim(),
        date: work.createdAt
          ? new Date(work.createdAt).toLocaleString(locale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
          : "",
        title: richTextToExport(work.title).text,
        sections,
        coAuthors: richTextToExport(coAuthors).text.replace(/\s*\n\s*/g, " "),
        number: work.number,
      };
    });

  const handleExportWorks = async (format: ExportFormat) => {
    if (!data || data.length === 0) {
      toast({ title: "Export", description: t("export.noData"), variant: "destructive" });
      return;
    }

    const safeDate = new Date().toISOString().slice(0, 10);
    const safeEventTitle = String(data[0]?.eventTitle || "works")
      .trim()
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .replace(/\s+/g, "_");
    const baseFileName = `${safeEventTitle || "works"}_${safeDate}`;
    const { headers, rows } = getExportPayload();

    const downloadBlob = (blob: Blob, fileName: string) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    try {
      setIsExporting(true);

      if (format === "csv") {
        const delimiter = locale === "fr" || locale === "ar" ? ";" : ",";
        const escapeCell = (value: unknown) => {
          const text = value == null ? "" : String(value);
          return `"${text.replace(/"/g, '""')}"`;
        };
        const csvContent = [
          headers.map(escapeCell).join(delimiter),
          ...rows.map((row: any) => row.map(escapeCell).join(delimiter)),
        ].join("\n");
        const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
        downloadBlob(blob, `${baseFileName}.csv`);
      }

      if (format === "xlsx") {
        const exceljsModule = await import("exceljs");
        const ExcelJS: any = (exceljsModule as any).default ?? exceljsModule;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Travaux");

        const totalColumns = Math.max(headers.length, 1);
        const headerRowNumber = 10;
        const dataStartRowNumber = headerRowNumber + 1;
        const platformLogoUrl = `${
          (process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net").replace(/\/$/, "")
        }/assets/images/logoDark.png`;

        if (totalColumns >= 2) {
          worksheet.getCell("B1").value = "BADGI - EXPORT TRAVAUX";
          worksheet.mergeCells(1, 2, 1, totalColumns);
          worksheet.mergeCells(3, 2, 3, totalColumns);
          worksheet.mergeCells(4, 2, 4, totalColumns);
          worksheet.mergeCells(5, 2, 5, totalColumns);
          worksheet.mergeCells(6, 2, 6, totalColumns);
          worksheet.mergeCells(7, 2, 7, totalColumns);
          worksheet.mergeCells(8, 2, 8, totalColumns);
        } else {
          worksheet.getCell("A1").value = "BADGI - EXPORT TRAVAUX";
        }

        worksheet.getCell("A3").value = "Événement";
        worksheet.getCell("B3").value = data[0]?.eventTitle || "-";
        worksheet.getCell("A4").value = "Total des travaux";
        worksheet.getCell("B4").value = stats.total;
        worksheet.getCell("A5").value = "Soumis";
        worksheet.getCell("B5").value = stats.submitted;
        worksheet.getCell("A6").value = "Examinés";
        worksheet.getCell("B6").value = stats.reviewed;
        worksheet.getCell("A7").value = "En attente";
        worksheet.getCell("B7").value = stats.pending;
        worksheet.getCell("A8").value = "Exporté le";
        worksheet.getCell("B8").value = new Date().toLocaleString();

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
              const logoImageId = workbook.addImage({
                base64: logoBase64,
                extension: "png",
              });
              worksheet.addImage(logoImageId, {
                tl: { col: 0, row: 0 },
                ext: { width: 165, height: 50 },
              });
            }
          }
        } catch (_logoError) {
          // Non-blocking
        }

        worksheet.getRow(headerRowNumber).values = headers;
        rows.forEach((row: any, idx: number) => {
          worksheet.getRow(dataStartRowNumber + idx).values = row as any;
        });

        for (let c = 1; c <= totalColumns; c += 1) {
          const header = String(headers[c - 1] || "");
          const values = rows.map((r: any[]) => String(r?.[c - 1] ?? ""));
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
        titleCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDCEBFF" },
        };
        titleCell.border = borderThin as any;
        worksheet.getRow(1).height = 36;

        for (let r = 3; r <= 8; r += 1) {
          const labelCell = worksheet.getCell(r, 1);
          const valueCell = worksheet.getCell(r, 2);
          labelCell.font = { bold: true, color: { argb: "FF1F2937" } };
          labelCell.alignment = { horizontal: "left", vertical: "middle" };
          labelCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE5E7EB" },
          };
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
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF2563EB" },
          };
          cell.border = borderThin as any;
        });

        rows.forEach((_row: any, rowIndex: number) => {
          const rowNumber = dataStartRowNumber + rowIndex;
          const excelRow = worksheet.getRow(rowNumber);
          const isZebra = rowIndex % 2 === 1;
          excelRow.height = 20;
          for (let c = 1; c <= totalColumns; c += 1) {
            const cell = excelRow.getCell(c);
            cell.border = borderThin as any;
            cell.alignment = { horizontal: "left", vertical: "middle" } as any;
            if (isZebra) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF8FAFC" },
              };
            }
          }
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const xlsxBlob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        downloadBlob(xlsxBlob, `${baseFileName}.xlsx`);
      }

      const documents = getExportDocuments();
      const eventTitle = String(data[0]?.eventTitle || "");
      const exportedOn = formatDateTime(new Date(), locale).dateOnly;
      const noName = t("export.noName");
      const untitled = t("export.untitled");
      const coAuthorsLabel = t("table.headers.coAuthors");

      if (format === "word") {
        const esc = (value: string) =>
          value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/\r?\n/g, "<br/>");

        const body = documents
          .map((d, index) => {
            const meta = [
              `<b>${esc(d.name || noName)}</b>`,
              d.email ? `<a href="mailto:${esc(d.email)}" style="color:#2563eb;text-decoration:none;">${esc(d.email)}</a>` : "",
              d.date ? `${esc(t("export.submittedOn"))} ${esc(d.date)}` : "",
            ]
              .filter(Boolean)
              .join(" &nbsp;\u00B7&nbsp; ");
            const sections = d.sections
              .map(
                (s) =>
                  `<h3 style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1e3a8a;margin:14pt 0 4pt 0;">${esc(s.label)}</h3>` +
                  `<div class="content">${s.html}</div>`
              )
              .join("");
            const coAuthors = d.coAuthors
              ? `<p style="font-family:Calibri,Arial,sans-serif;font-size:10pt;color:#475569;margin:16pt 0 0 0;"><b>${esc(coAuthorsLabel)} :</b> <i>${esc(d.coAuthors)}</i></p>`
              : "";
            return (
              `<div${index > 0 ? ' style="page-break-before:always;"' : ""}>` +
              `<p style="font-family:Calibri,Arial,sans-serif;font-size:9pt;color:#64748b;margin:0 0 6pt 0;">${esc(t("export.submissionNumber", { number: d.number ?? index + 1, total: documents.length }))}</p>` +
              `<h2 style="font-family:Calibri,Arial,sans-serif;font-size:15pt;color:#0f172a;margin:0 0 6pt 0;">${esc(d.title || untitled)}</h2>` +
              `<p style="font-family:Calibri,Arial,sans-serif;font-size:10pt;color:#334155;margin:0 0 4pt 0;padding-bottom:8pt;border-bottom:1.5pt solid #2563eb;">${meta}</p>` +
              sections +
              coAuthors +
              `</div>`
            );
          })
          .join("");

        const cover =
          `<h1 style="font-family:Calibri,Arial,sans-serif;font-size:20pt;color:#1e3a8a;margin:0 0 4pt 0;">${esc(eventTitle)}</h1>` +
          `<p style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#475569;margin:0 0 24pt 0;">${esc(t("export.docSubtitle", { count: documents.length, date: exportedOn }))}</p>`;

        const htmlDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(eventTitle)}</title><style>@page{size:21cm 29.7cm;margin:2cm;} .content, .content p, .content li{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.4;text-align:justify;color:#1e293b;} .content p{margin:0 0 6pt 0;}</style></head><body>${cover}${body}</body></html>`;
        const blob = new Blob(["\uFEFF" + htmlDoc], {
          type: "application/msword;charset=utf-8",
        });
        downloadBlob(blob, `${baseFileName}.doc`);
      }

      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 50;
        const contentWidth = pageWidth - margin * 2;
        const bottomLimit = pageHeight - 50;
        // Built-in PDF fonts are WinAnsi only: decode stray entities and replace unsupported symbols.
        const clean = (value: string) =>
          value
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/\u2265/g, ">=")
            .replace(/\u2264/g, "<=")
            .replace(/[\u2010-\u2012]/g, "-")
            .replace(/\u00A0/g, " ")
            .replace(/[^\u0000-\u00FF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u20AC]/g, "");

        let y = margin;
        const ensureSpace = (height: number) => {
          if (y + height > bottomLimit) {
            doc.addPage();
            y = margin;
          }
        };
        const writeParagraph = (text: string, size: number, style: "normal" | "bold" | "italic", color: [number, number, number], lineGap = 1.35) => {
          doc.setFont("helvetica", style);
          doc.setFontSize(size);
          doc.setTextColor(...color);
          const lineHeight = size * lineGap;
          const paragraphs = clean(text).split(/\r?\n/);
          paragraphs.forEach((paragraph) => {
            const lines: string[] = paragraph.trim() ? doc.splitTextToSize(paragraph.trim(), contentWidth) : [""];
            lines.forEach((line) => {
              ensureSpace(lineHeight);
              doc.text(line, margin, y + size);
              y += lineHeight;
            });
          });
        };

        writeParagraph(eventTitle, 18, "bold", [30, 58, 138]);
        y += 4;
        writeParagraph(t("export.docSubtitle", { count: documents.length, date: exportedOn }), 10, "normal", [71, 85, 105]);

        documents.forEach((d, index) => {
          if (index > 0) {
            doc.addPage();
            y = margin;
          } else {
            y += 24;
          }
          writeParagraph(t("export.submissionNumber", { number: d.number ?? index + 1, total: documents.length }), 8, "normal", [100, 116, 139]);
          y += 2;
          writeParagraph(d.title || untitled, 14, "bold", [15, 23, 42], 1.3);
          y += 4;
          writeParagraph(d.name || noName, 10, "bold", [51, 65, 85]);
          const metaLine = [d.email, d.date ? `${t("export.submittedOn")} ${d.date}` : ""].filter(Boolean).join("   \u00B7   ");
          if (metaLine) writeParagraph(metaLine, 9, "normal", [100, 116, 139]);
          y += 6;
          ensureSpace(10);
          doc.setDrawColor(37, 99, 235);
          doc.setLineWidth(1.2);
          doc.line(margin, y, pageWidth - margin, y);
          y += 12;

          d.sections.forEach((s) => {
            ensureSpace(40);
            writeParagraph(s.label, 10.5, "bold", [30, 58, 138]);
            y += 2;
            // Short lines ending with ":" are inline sub-headings (e.g. "Background:").
            s.text.split("\n").forEach((line) => {
              const trimmed = line.trim();
              const isSubheading = trimmed.length > 0 && trimmed.length <= 60 && trimmed.endsWith(":");
              writeParagraph(line, 10, isSubheading ? "bold" : "normal", [30, 41, 59]);
            });
            y += 10;
          });

          if (d.coAuthors) {
            y += 4;
            writeParagraph(`${coAuthorsLabel} : ${d.coAuthors}`, 9, "italic", [71, 85, 105]);
          }
        });

        const pageCount = doc.getNumberOfPages();
        for (let page = 1; page <= pageCount; page += 1) {
          doc.setPage(page);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(clean(eventTitle), margin, pageHeight - 25, { maxWidth: contentWidth - 60 });
          doc.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 25, { align: "right" });
        }

        doc.save(`${baseFileName}.pdf`);
      }

      toast({ title: "Export", description: t("export.success", { count: data.length, format }) });
    } catch (exportError) {
      console.error("Export failed", exportError);
      toast({ title: "Export", description: t("export.error"), variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`flex flex-col gap-5 ${isRTL ? "rtl" : "ltr"}`}>
      <AdminSectionHeader
        icon={<Briefcase className="h-5 w-5" />}
        title={t("title")}
        subtitle={t("subtitle")}
        isRTL={isRTL}
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard label={t("stats.total")} value={stats.total} icon={<Briefcase className="h-4 w-4" />} accent="blue" isRTL={isRTL} />
        <StatCard label={t("stats.submitted")} value={stats.submitted} icon={<Clock className="h-4 w-4" />} accent="amber" isRTL={isRTL} />
        <StatCard label={t("stats.reviewed")} value={stats.reviewed} icon={<CheckCheck className="h-4 w-4" />} accent="green" isRTL={isRTL} />
        <StatCard label={t("stats.pending")} value={stats.pending} icon={<Calendar className="h-4 w-4" />} accent="neutral" isRTL={isRTL} />
      </div>

      <AdminToolbar
        isRTL={isRTL}
        resultLabel={`${filteredData.length} ${tx("filters.resultsLabel", "résultat(s)")}`}
        filters={
          <>
            <Search placeholder={t("searchPlaceholder")} className="w-full sm:w-auto" />
            <Select
              value={statusFilter || "all"}
              onValueChange={(v) => {
                setStatusFilter(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full sm:w-[210px]">
                <SelectValue placeholder={tx("filters.statusAll", "Statut — Tous")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tx("filters.statusAll", "Statut — Tous")}</SelectItem>
                <SelectItem value="submitted">{t("status.submitted")}</SelectItem>
                <SelectItem value="approved">{t("status.approved")}</SelectItem>
                <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
                <SelectItem value="pending-registration">
                  {tx("filters.pendingRegistration", "En attente d'inscription")}
                </SelectItem>
              </SelectContent>
            </Select>
          </>
        }
        actions={
          <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBulkEmailDialogOpen(true)}
            disabled={isPending || isBulkEmailing || approvedCount === 0}
            title={t("bulkEmail.button")}
            className={`gap-2 border-admin-success/30 bg-admin-success-soft text-admin-success hover:bg-admin-success-soft/70 ${
              isRTL ? "font-arabic flex-row-reverse" : ""
            }`}
          >
            {isBulkEmailing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-admin-success/30 border-t-admin-success" />
            ) : (
              <MailCheck className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{t("bulkEmail.button")}</span>
            {approvedCount > 0 && (
              <span className="rounded-full bg-admin-success px-1.5 text-[11px] font-bold leading-5 text-white">
                {approvedCount}
              </span>
            )}
          </Button>
          <WorkEmailDialog
            open={isBulkEmailDialogOpen}
            onOpenChange={setIsBulkEmailDialogOpen}
            title={t(isNoPoster ? "bulkEmail.dialogTitleNoPoster" : "bulkEmail.dialogTitle")}
            description={t(isNoPoster ? "bulkEmail.dialogDescriptionNoPoster" : "bulkEmail.dialogDescription")}
            defaultSubject={t(isNoPoster ? "bulkEmail.defaultSubjectNoPoster" : "bulkEmail.defaultSubject")}
            defaultMessage={t(isNoPoster ? "bulkEmail.defaultMessageNoPoster" : "bulkEmail.defaultMessage")}
            recipientSummary={
              isNoPoster
                ? t("bulkEmail.recipientsNoPoster", { authors: noPosterAuthors, count: noPosterCount })
                : t("bulkEmail.recipients", { count: approvedCount })
            }
            confirmLabel={t("bulkEmail.confirm", { count: recipientCount })}
            isSending={isBulkEmailing}
            onSend={handleBulkEmail}
            onSendTest={handleBulkTestEmail}
            isSendingTest={isSendingTestEmail}
            filterSlot={
              <div className="space-y-1.5">
                <p className={`text-sm font-medium ${isRTL ? "font-arabic" : ""}`}>
                  {t("bulkEmail.filterLabel")}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(
                    [
                      { value: "all", label: t("bulkEmail.filterAll", { count: approvedCount }) },
                      { value: "noPoster", label: t("bulkEmail.filterNoPoster", { count: noPosterCount }) },
                    ] as const
                  ).map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={bulkFilter === opt.value ? "default" : "outline"}
                      onClick={() => setBulkFilter(opt.value)}
                      disabled={isBulkEmailing || isSendingTestEmail}
                      aria-pressed={bulkFilter === opt.value}
                      className={`h-auto whitespace-normal py-2 text-sm ${isRTL ? "font-arabic" : ""}`}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            }
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isExportingPosters || isPending || postersAvailable.length === 0}
                className="gap-2"
                title="Exporter les e-posters sélectionnés"
              >
                {isExportingPosters ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />}
                <span className="hidden sm:inline">E-posters ({selectedPosters.size})</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              <DropdownMenuItem onClick={() => toggleAllPosters(!allPostersSelected)}>
                {allPostersSelected ? "Tout désélectionner" : `Tout sélectionner (${postersAvailable.length})`}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportPosters("jpeg")}>Exporter en JPEG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportPosters("pdf")}>Exporter en PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportPosters("pptx")}>Exporter en PPTX</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting || isPending || !data || data.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {t("actions.export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              <DropdownMenuItem onClick={() => handleExportWorks("xlsx")}>Export XLSX</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportWorks("word")}>Export Word</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportWorks("pdf")}>Export PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportWorks("csv")}>Export CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </>
        }
      />

      <div className="rounded-xl border border-border bg-card">
        {isMobile ? (
          isPending ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : paginatedData.length > 0 ? (
            <div className="flex flex-col gap-3 p-4">{paginatedData.map(renderMobileCard)}</div>
          ) : (
            <AdminEmptyState
              icon={<Briefcase className="h-8 w-8" />}
              title={t("emptyState.title")}
              description={t("emptyState.description")}
              isRTL={isRTL}
            />
          )
        ) : isPending ? (
          <TableSkeleton />
        ) : paginatedData.length > 0 ? (
          <AdminDataTable columns={columns} data={paginatedData} getRowId={(row) => row._id} isRTL={isRTL} />
        ) : (
          <AdminEmptyState
            icon={<Briefcase className="h-8 w-8" />}
            title={t("emptyState.title")}
            description={t("emptyState.description")}
            isRTL={isRTL}
          />
        )}
        {filteredData.length > 0 && (
          <AdminPagination
            page={safePage}
            pageSize={pageSize}
            total={filteredData.length}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            isRTL={isRTL}
          />
        )}
      </div>
    </div>
  );
}
