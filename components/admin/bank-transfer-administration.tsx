"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/shared/data-table";
import Search from "@/components/shared/Search";
import TableSkeleton from "@/components/shared/table-skeleton";
import { CardSkeleton } from "./CardSkeleton";
import {
  getBankTransfers,
  verifyBankTransfer,
} from "@/lib/actions/banktransfer.actions";
import { formatDateTime, formatPriceByCountry } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Landmark,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Download,
  CreditCard,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale, useTranslations } from "next-intl";

interface BankTransferAdministrationProps {
    eventId?: string;
    eventTitle: string;
    searchString: string;
    userId: string;
    eventCountry?: string;
    eventLocation?: { name?: string; lat?: number; lon?: number };
}

export default function BankTransferAdministration({
    eventId,
    eventTitle,
    searchString,
    userId,
    eventCountry,
    eventLocation,
}: BankTransferAdministrationProps) {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [page, setPage] = useState(1);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const locale = useLocale();
  const t = useTranslations("bankTransferAdministration");
  const [isExporting, setIsExporting] = useState(false);

  // Reset to page 1 whenever the filter/search context changes, so we don't
  // end up stuck on an out-of-range page for the new result set.
  const handleStatusFilterChange = (value: "all" | "pending" | "approved" | "rejected") => {
    setStatusFilter(value);
    setPage(1);
  };
  useEffect(() => {
    setPage(1);
  }, [searchString]);

  // Fetch bank transfers
  const { isPending, data, error } = useQuery({
    queryKey: ["bankTransfers", eventId, eventTitle, statusFilter, searchString, page],
    queryFn: () =>
      getBankTransfers({
        eventId,
        eventTitle,
        status: statusFilter,
        searchString,
        page,
      }),
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: ({
      transferId,
      action,
      reason,
    }: {
      transferId: string;
      action: "approve" | "reject";
      reason?: string;
    }) =>
      verifyBankTransfer({
        transferId,
        action,
        verifiedBy: userId,
        rejectionReason: reason,
      }),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: t("messages.success"),
          description: result.message,
        });
        queryClient.invalidateQueries({ queryKey: ["bankTransfers"] });
        setSelectedTransfer(null);
        setRejectionReason("");
      } else {
        toast({
          title: t("messages.error"),
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: t("messages.error"),
        description: t("messages.verifyFailed"),
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    if (selectedTransfer) {
      verifyMutation.mutate({
        transferId: selectedTransfer._id,
        action: "approve",
      });
    }
  };

  const handleReject = () => {
    if (selectedTransfer && rejectionReason.trim()) {
      verifyMutation.mutate({
        transferId: selectedTransfer._id,
        action: "reject",
        reason: rejectionReason,
      });
    } else {
      toast({
        title: t("messages.error"),
        description: t("messages.rejectionReasonRequired"),
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        className:
          "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock,
      },
      approved: {
        className:
          "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle2,
      },
      rejected: {
        className:
          "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300",
        icon: XCircle,
      },
    };

    const variant = variants[status as keyof typeof variants];
    const Icon = variant?.icon || Clock;
    const statusLabel =
      status === "pending"
        ? t("tabs.pending")
        : status === "approved"
          ? t("tabs.approved")
          : status === "rejected"
            ? t("tabs.rejected")
            : status;

    return (
      <Badge variant="outline" className={variant?.className}>
        <Icon className="mr-1 h-3 w-3" />
        {statusLabel}
      </Badge>
    );
  };

  const columns = [
    {
      header: t("table.date"),
      accessor: "createdAt",
      cell: (value: Date) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDateTime(value).dateOnly}</span>
        </div>
      ),
    },
    {
      header: t("table.buyer"),
      accessor: "buyerName",
      cell: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {value.charAt(0).toUpperCase()}
          </div>
          <span>{value}</span>
        </div>
      ),
    },
    {
      header: t("table.amount"),
      accessor: "amount",
      cell: (value: number) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-green-600">
{formatPriceByCountry(value, eventCountry, locale, eventLocation)}
          </span>
        </div>
      ),
    },
    {
      header: t("table.transferId"),
      accessor: "transferId",
      cell: (value: string | null) =>
        value ? (
          <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            {value}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      header: t("table.screenshot"),
      accessor: "screenshotUrl",
      cell: (value: string | null) =>
        value ? (
          <ImageIcon className="h-4 w-4 text-blue-600" />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      header: t("table.status"),
      accessor: "status",
      cell: (value: string) => getStatusBadge(value),
    },
    {
      header: t("table.actions"),
      accessor: "root",
      align: "right" as const,
      cell: (value: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedTransfer(value)}
        >
          <Eye className="h-4 w-4 mr-1" />
          {t("table.view")}
        </Button>
      ),
    },
  ];

  const renderMobileCard = (item: any) => (
    <Card
      key={item._id}
      className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{item.buyerName}</CardTitle>
          {getStatusBadge(item.status)}
        </div>
        <CardDescription className="font-mono text-sm">
          {formatDateTime(item.createdAt).dateTime}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">
{formatPriceByCountry(item.amount, eventCountry, locale, eventLocation)}
            </span>
          </div>
          {item.transferId && (
            <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              {item.transferId}
            </span>
          )}
        </div>
        {item.screenshotUrl && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>{t("table.screenshotAttached")}</span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setSelectedTransfer(item)}
        >
          <Eye className="h-4 w-4 mr-2" />
          {t("table.viewDetails")}
        </Button>
      </CardFooter>
    </Card>
  );

  type ExportFormat = "csv" | "xlsx" | "word" | "pdf";

  const getExportPayload = (transfers: any[]) => {
    const headers = [
      t("table.date"),
      t("table.buyer"),
      t("table.amount"),
      t("table.transferId"),
      t("table.status"),
      t("table.event"),
    ];

    const rows = (transfers || []).map((transfer: any) => [
      transfer?.createdAt ? formatDateTime(transfer.createdAt).dateTime : "",
      transfer?.buyerName ?? "",
      typeof transfer?.amount === "number"
        ? transfer.amount.toFixed(2)
        : "0.00",
      transfer?.transferId ?? "",
      transfer?.status ?? "",
      transfer?.eventTitle ?? "",
    ]);

    return { headers, rows };
  };

  const handleExportTransfers = async (format: ExportFormat) => {
    if (!data || !data.totalCount) {
      toast({
        title: t("actions.export"),
        description: t("messages.noTransfersToExport"),
        variant: "destructive",
      });
      return;
    }

    const safeDate = new Date().toISOString().slice(0, 10);
    const safeEventTitle = String(eventTitle || "bank_transfers")
      .trim()
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .replace(/\s+/g, "_");
    const baseFileName = `${safeEventTitle || "bank_transfers"}_${safeDate}`;

    // Export must cover every matching transfer, not just the current page
    // (the table only shows `limit` rows at a time).
    let exportTransfers: any[] = data.data;
    if (data.totalCount > data.data.length) {
      const full = await getBankTransfers({
        eventId,
        eventTitle,
        status: statusFilter,
        searchString,
        page: 1,
        limit: data.totalCount,
      });
      exportTransfers = full.data;
    }
    const { headers, rows } = getExportPayload(exportTransfers);

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
        const xlsxModule = await import("xlsx");
        const XLSX: any = (xlsxModule as any).default ?? xlsxModule;
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BankTransfers");
        const binary = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "binary",
        });

        const toArrayBuffer = (s: string) => {
          const buffer = new ArrayBuffer(s.length);
          const view = new Uint8Array(buffer);
          for (let i = 0; i < s.length; i += 1) {
            view[i] = s.charCodeAt(i) & 0xff;
          }
          return buffer;
        };

        const xlsxBlob = new Blob([toArrayBuffer(binary)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        downloadBlob(xlsxBlob, `${baseFileName}.xlsx`);
      }

      if (format === "word") {
        const headerHtml = headers
          .map(
            (h) =>
              `<th style="border:1px solid #ccc;padding:8px;background:#f5f5f5;">${h}</th>`
          )
          .join("");
        const rowsHtml = rows
          .map(
            (row: any) =>
              `<tr>${row
                .map(
                  (cell: any) =>
                    `<td style="border:1px solid #ccc;padding:8px;">${String(
                      cell
                    )}</td>`
                )
                .join("")}</tr>`
          )
          .join("");

        const htmlDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><h2>${t("export.title")}</h2><table style="border-collapse:collapse;width:100%"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
        const blob = new Blob(["\uFEFF" + htmlDoc], {
          type: "application/msword;charset=utf-8",
        });
        downloadBlob(blob, `${baseFileName}.doc`);
      }

      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        let y = 40;
        doc.setFontSize(14);
        doc.text(t("export.title"), 40, y);
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

      toast({
        title: t("actions.export"),
        description: t("messages.exportSuccess", {
          count: exportTransfers.length,
          format: format.toUpperCase(),
        }),
      });
    } catch (exportError) {
      console.error("Export failed", exportError);
      toast({
        title: t("actions.export"),
        description: t("messages.exportFailed"),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-rose-500/20">
              <Landmark className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {t("title")}
              </h2>
              <p className="text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-wrap items-center gap-2 sm:gap-3">
            <Search
              placeholder={t("searchPlaceholder")}
              className="w-full sm:w-auto"
            />
            <Button variant="outline" size="icon" title={t("actions.filter")}>
              <Filter className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  title={t("actions.export")}
                  disabled={
                    isExporting || isPending || !data || !data.totalCount
                  }
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportTransfers("xlsx")}>
                  {t("actions.exportXlsx")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportTransfers("word")}>
                  {t("actions.exportWord")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportTransfers("pdf")}>
                  {t("actions.exportPdf")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportTransfers("csv")}>
                  {t("actions.exportCsv")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Row */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
            <div className="glass bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-3 md:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
                <div className="p-2 rounded-lg bg-blue-500/20 shrink-0">
                  <Landmark className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold">{data.statusCounts?.total ?? data.totalCount}</p>
                  <p className="text-xs md:text-sm text-balance leading-tight text-muted-foreground">{t("stats.total")}</p>
                </div>
              </div>
            </div>

            <div className="glass bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-3 md:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
                <div className="p-2 rounded-lg bg-yellow-500/20 shrink-0">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold">
                    {data.statusCounts?.pending ?? 0}
                  </p>
                  <p className="text-xs md:text-sm text-balance leading-tight text-muted-foreground">{t("stats.pending")}</p>
                </div>
              </div>
            </div>

            <div className="glass bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-3 md:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
                <div className="p-2 rounded-lg bg-green-500/20 shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold">
                    {data.statusCounts?.approved ?? 0}
                  </p>
                  <p className="text-xs md:text-sm text-balance leading-tight text-muted-foreground">{t("stats.approved")}</p>
                </div>
              </div>
            </div>

            <div className="glass bg-gradient-to-r from-red-500/10 to-rose-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-3 md:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
                <div className="p-2 rounded-lg bg-red-500/20 shrink-0">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold">
                    {data.statusCounts?.rejected ?? 0}
                  </p>
                  <p className="text-xs md:text-sm text-balance leading-tight text-muted-foreground">{t("stats.rejected")}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={(v: any) => handleStatusFilterChange(v)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
          <TabsTrigger value="pending">{t("tabs.pending")}</TabsTrigger>
          <TabsTrigger value="approved">{t("tabs.approved")}</TabsTrigger>
          <TabsTrigger value="rejected">{t("tabs.rejected")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content Section */}
      <div className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-6">
        {isMobile ? (
          isPending ? (
            <div className="flex flex-col space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <div className="space-y-4">{data.data.map(renderMobileCard)}</div>
          ) : (
            <div className="text-center py-12">
              <Landmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t("empty.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("empty.description")}
              </p>
            </div>
          )
        ) : isPending ? (
          <TableSkeleton />
        ) : data && data.data.length > 0 ? (
          <DataTable columns={columns} data={data.data} />
        ) : (
          <div className="text-center py-12">
            <Landmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("empty.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("empty.description")}
            </p>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/20 pt-4 dark:border-slate-700/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("pagination.previous")}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t("pagination.pageInfo", { page, totalPages: data.totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
            >
              {t("pagination.next")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Verification Dialog */}
      <Dialog
        open={!!selectedTransfer}
        onOpenChange={() => setSelectedTransfer(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border border-slate-200 bg-white text-slate-950 shadow-2xl shadow-black/30 sm:rounded-3xl dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50">
          <DialogHeader className="rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 p-5 dark:border-pink-900/50 dark:from-pink-950/40 dark:to-rose-950/40">
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              <Landmark className="h-5 w-5 text-pink-600" />
              {t("dialog.title")}
            </DialogTitle>
            <DialogDescription className="text-base text-slate-600 dark:text-slate-300">
              {t("dialog.description")}
            </DialogDescription>
          </DialogHeader>

          {selectedTransfer && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t("dialog.status")}</span>
                {getStatusBadge(selectedTransfer.status)}
              </div>

              {/* Registration Information */}
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  <FileText className="h-4 w-4 text-pink-600" />
                  {t("dialog.registrationInfo")}
                </h3>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/80">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t("dialog.buyer")}</span>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{selectedTransfer.buyerName}</p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4 dark:bg-green-950/30">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t("dialog.amount")}</span>
                    <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">
{formatPriceByCountry(selectedTransfer.amount, eventCountry, locale, eventLocation)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/80">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t("dialog.event")}</span>
                    <p className="mt-1 break-words font-semibold text-slate-900 dark:text-slate-100">{selectedTransfer.eventTitle}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/80">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t("dialog.date")}</span>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                      {formatDateTime(selectedTransfer.createdAt).dateTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transfer ID */}
              {selectedTransfer.transferId && (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("dialog.transferId")}</h3>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <code className="text-sm font-mono text-slate-800 dark:text-slate-100">
                      {selectedTransfer.transferId}
                    </code>
                  </div>
                </div>
              )}

              {/* Screenshot */}
              {selectedTransfer.screenshotUrl && (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    <ImageIcon className="h-4 w-4 text-pink-600" />
                    {t("dialog.transferScreenshot")}
                  </h3>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <Zoom>
                      <img
                        src={selectedTransfer.screenshotUrl}
                        alt={t("dialog.transferScreenshotAlt")}
                        className="max-h-[28rem] w-full object-contain"
                      />
                    </Zoom>
                  </div>
                </div>
              )}

              {/* Rejection Reason (if rejected) */}
              {selectedTransfer.status === "rejected" &&
                selectedTransfer.rejectionReason && (
                  <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900/60 dark:bg-red-950/20">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {t("dialog.rejectionReason")}
                    </h3>
                    <div className="rounded-xl border border-red-200 bg-white p-4 dark:border-red-800 dark:bg-slate-900">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {selectedTransfer.rejectionReason}
                      </p>
                    </div>
                  </div>
                )}

              {/* Rejection Reason Input (for pending) */}
              {selectedTransfer.status === "pending" && (
                <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
                  <Label htmlFor="rejection-reason" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {t("dialog.rejectionReason")}
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder={t("dialog.rejectionReasonPlaceholder")}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="min-h-[120px] rounded-2xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-pink-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("dialog.rejectionReasonHint")}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            {selectedTransfer?.status === "pending" ? (
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setSelectedTransfer(null)}
                >
                  {t("dialog.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-2xl"
                  onClick={handleReject}
                  disabled={verifyMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {t("dialog.reject")}
                </Button>
                <Button
                  className="flex-1 rounded-2xl bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={verifyMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t("dialog.approve")}
                </Button>
              </div>
            ) : (
              <Button className="rounded-2xl" onClick={() => setSelectedTransfer(null)}>{t("dialog.close")}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
