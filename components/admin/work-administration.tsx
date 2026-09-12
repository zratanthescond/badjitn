"use client";

import { useMemo, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import Search from "../shared/Search";
import { getUserWorkByEventId } from "@/lib/actions/user.actions";
import { useQuery } from "@tanstack/react-query";
import TableSkeleton from "../shared/table-skeleton";
import { formatDateTime } from "@/lib/utils";
import { CheckCheck, Download, Briefcase, Calendar, Clock } from "lucide-react";
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
          {t("workIdLabel")}: {String(item._id).slice(-8)}
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

  type ExportFormat = "csv" | "xlsx" | "word" | "pdf";

  const getExportPayload = () => {
    const headers = [
      t("table.headers.id"),
      t("table.headers.eventTitle"),
      t("table.headers.submitter"),
      t("table.headers.status"),
      t("table.headers.submitted"),
    ];

    const rows = (data || []).map((work: any) => [
      work?._id ?? "",
      work?.eventTitle ?? "",
      work?.buyer ?? "",
      getStatusLabel(work?.status || "submitted"),
      work?.createdAt ? formatDateTime(work.createdAt).dateTime : "",
    ]);

    return { headers, rows };
  };

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
        const xlsxModule = await import("xlsx");
        const XLSX: any = (xlsxModule as any).default ?? xlsxModule;
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Works");
        const binary = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

        const toArrayBuffer = (s: string) => {
          const buffer = new ArrayBuffer(s.length);
          const view = new Uint8Array(buffer);
          for (let i = 0; i < s.length; i += 1) view[i] = s.charCodeAt(i) & 0xff;
          return buffer;
        };

        const xlsxBlob = new Blob([toArrayBuffer(binary)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        downloadBlob(xlsxBlob, `${baseFileName}.xlsx`);
      }

      if (format === "word") {
        const headerHtml = headers
          .map((h) => `<th style="border:1px solid #ccc;padding:8px;background:#f5f5f5;">${h}</th>`)
          .join("");
        const rowsHtml = rows
          .map(
            (row: any) =>
              `<tr>${row.map((cell: any) => `<td style="border:1px solid #ccc;padding:8px;">${String(cell)}</td>`).join("")}</tr>`
          )
          .join("");

        const htmlDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><h2>Works Export</h2><table style="border-collapse:collapse;width:100%"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
        const blob = new Blob(["﻿" + htmlDoc], { type: "application/msword;charset=utf-8" });
        downloadBlob(blob, `${baseFileName}.doc`);
      }

      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        let y = 40;
        doc.setFontSize(14);
        doc.text("Works Export", 40, y);
        y += 22;
        doc.setFontSize(9);
        doc.text(headers.join(" | "), 40, y);
        y += 16;

        rows.forEach((row: any) => {
          const line = row.join(" | ");
          const wrapped = doc.splitTextToSize(line, 515);
          if (y > 780) {
            doc.addPage();
            y = 40;
          }
          doc.text(wrapped, 40, y);
          y += wrapped.length * 12 + 4;
        });

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
