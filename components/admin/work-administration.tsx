"use client";

import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/shared/data-table";
import { Badge } from "../ui/badge";
import Search from "../shared/Search";
import { getUserWorkByEventId } from "@/lib/actions/user.actions";
import { useQuery } from "@tanstack/react-query";
import TableSkeleton from "../shared/table-skeleton";
import { formatDateTime } from "@/lib/utils";
import {
  CheckCheck,
  Download,
  Briefcase,
  Calendar,
  FileText,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { WorkDetailsDialog } from "./WorkDetailsDialog";
import { CardSkeleton } from "./CardSkeleton";
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

export default function WorkAdministration({
  eventId,
  searchString,
}: {
  eventId: string;
  searchString: string;
}) {
  const t = useTranslations("workAdministration");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const { isPending, data, error } = useQuery({
    queryKey: ["works", eventId, searchString],
    queryFn: async () => {
      const response = await getUserWorkByEventId({ eventId, searchString });
      return response;
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; label: string }> = {
      submitted: {
        className:
          "glass bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300",
        label: t("status.submitted"),
      },
      approved: {
        className:
          "glass bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300",
        label: t("status.approved"),
      },
      reviewed: {
        className:
          "glass bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300",
        label: t("status.reviewed"),
      },
      rejected: {
        className:
          "glass bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30 text-red-700 dark:text-red-300",
        label: t("status.rejected"),
      },
      draft: {
        className:
          "glass bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-300",
        label: t("status.pending"),
      },
      pending: {
        className:
          "glass bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-300",
        label: t("status.pending"),
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.submitted;

    return (
      <Badge className={`${config.className} ${isRTL ? "font-arabic" : ""}`}>
        {config.label}
      </Badge>
    );
  };

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

  const columns = [
    {
      header: t("table.headers.id"),
      accessor: "_id",
      cell: (value: string) => (
        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {value.slice(-8)}
        </span>
      ),
    },
    {
      header: t("table.headers.eventTitle"),
      accessor: "eventTitle",
      cell: (value: string) => (
        <span className={`font-medium ${isRTL ? "font-arabic" : ""}`}>
          {value}
        </span>
      ),
    },
    {
      header: t("table.headers.submitter"),
      accessor: "buyer",
      cell: (value: string) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-medium">
            {value.charAt(0).toUpperCase()}
          </div>
          <span className={`${isRTL ? "font-arabic" : ""}`}>{value}</span>
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
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span
            className={`text-sm text-muted-foreground ${
              isRTL ? "font-arabic" : ""
            }`}
          >
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
    <Card
      key={item._id}
      className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:scale-105 transition-all duration-300"
    >
      <CardHeader className="pb-3">
        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <CardTitle className={`text-lg ${isRTL ? "font-arabic" : ""}`}>
            {item.eventTitle}
          </CardTitle>
          {getStatusBadge(item.status || "submitted")}
        </div>
        <CardDescription
          className={`font-mono text-sm ${
            isRTL ? "font-arabic text-right" : ""
          }`}
        >
          {t("workIdLabel")}: {item._id.slice(-8)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div
          className={`flex items-center gap-3 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-medium">
            {item.buyer.charAt(0).toUpperCase()}
          </div>
          <div className={isRTL ? "text-right" : ""}>
            <p className={`font-medium ${isRTL ? "font-arabic" : ""}`}>
              {item.buyer}
            </p>
            <p
              className={`text-sm text-muted-foreground ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {t("submitter")}
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span
            className={`text-sm text-muted-foreground ${
              isRTL ? "font-arabic" : ""
            }`}
          >
            {formatDateTime(item.createdAt).dateTime}
          </span>
        </div>
      </CardContent>

      <CardFooter
        className={`flex justify-center w-full mt-2 pt-4 pb-4 border-t border-slate-100 dark:border-slate-800 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <WorkDetailsDialog value={item} />
      </CardFooter>
    </Card>
  );

  // Calculate stats
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
      };
    });

  const handleExportWorks = async (format: ExportFormat) => {
    if (!data || data.length === 0) {
      toast({
        title: "Export",
        description: t("export.noData"),
        variant: "destructive",
      });
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
        const blob = new Blob(["\uFEFF" + csvContent], {
          type: "text/csv;charset=utf-8;",
        });
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
              `<p style="font-family:Calibri,Arial,sans-serif;font-size:9pt;color:#64748b;margin:0 0 6pt 0;">${esc(t("export.submissionNumber", { number: index + 1, total: documents.length }))}</p>` +
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
          writeParagraph(t("export.submissionNumber", { number: index + 1, total: documents.length }), 8, "normal", [100, 116, 139]);
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

      toast({
        title: "Export",
        description: t("export.success", { count: data.length, format }),
      });
    } catch (exportError) {
      console.error("Export failed", exportError);
      toast({
        title: "Export",
        description: t("export.error"),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header Section */}
      <div className="glass bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-6">
        <div
          className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${
            isRTL ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div
            className={`flex items-center gap-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20">
              <Briefcase className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <h2
                className={`text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("title")}
              </h2>
              <p
                className={`text-muted-foreground ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("subtitle")}
              </p>
            </div>
          </div>

        <div
          className={`w-full lg:w-auto flex flex-wrap items-center gap-2 sm:gap-3 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Search
            placeholder={t("searchPlaceholder")}
            className="w-full sm:w-auto glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
          />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80"
            title={t("actions.filter")}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={isExporting || isPending || !data || data.length === 0}
                className="shrink-0 glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80"
                title={t("actions.export")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              <DropdownMenuItem onClick={() => handleExportWorks("xlsx")}>
                Export XLSX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportWorks("word")}>
                Export Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportWorks("pdf")}>
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportWorks("csv")}>
                Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
          <div className="glass bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-3 md:p-4">
            <div
              className={`flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left ${
                isRTL ? "sm:flex-row-reverse sm:text-right" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-blue-500/20 shrink-0">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p
                  className={`text-xl md:text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
                >
                  {stats.total}
                </p>
                <p
                  className={`text-xs md:text-sm text-balance leading-tight text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("stats.total")}
                </p>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-500/20 rounded-xl p-3 md:p-4">
            <div
              className={`flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left ${
                isRTL ? "sm:flex-row-reverse sm:text-right" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-orange-500/20 shrink-0">
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p
                  className={`text-xl md:text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
                >
                  {stats.submitted}
                </p>
                <p
                  className={`text-xs md:text-sm text-balance leading-tight text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("stats.submitted")}
                </p>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-3 md:p-4">
            <div
              className={`flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left ${
                isRTL ? "sm:flex-row-reverse sm:text-right" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-green-500/20 shrink-0">
                <CheckCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p
                  className={`text-xl md:text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
                >
                  {stats.reviewed}
                </p>
                <p
                  className={`text-xs md:text-sm text-balance leading-tight text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("stats.reviewed")}
                </p>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-3 md:p-4">
            <div
              className={`flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left ${
                isRTL ? "sm:flex-row-reverse sm:text-right" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-yellow-500/20 shrink-0">
                <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p
                  className={`text-xl md:text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
                >
                  {stats.pending}
                </p>
                <p
                  className={`text-xs md:text-sm text-balance leading-tight text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("stats.pending")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-6">
        {isMobile ? (
          isPending ? (
            <div className="flex flex-col space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-4">{data.map(renderMobileCard)}</div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3
                className={`text-lg font-semibold mb-2 ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("emptyState.title")}
              </h3>
              <p
                className={`text-muted-foreground ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("emptyState.description")}
              </p>
            </div>
          )
        ) : isPending ? (
          <TableSkeleton />
        ) : data && data.length > 0 ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3
              className={`text-lg font-semibold mb-2 ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {t("emptyState.title")}
            </h3>
            <p
              className={`text-muted-foreground ${isRTL ? "font-arabic" : ""}`}
            >
              {t("emptyState.description")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
