"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/shared/data-table";
import { Badge } from "../ui/badge";
import Search from "../shared/Search";
import { getOrdersByEvent } from "@/lib/actions/order.actions";
import { formatDateTime, formatPriceByCountry } from "@/lib/utils";
import TableSkeleton from "../shared/table-skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ShoppingCart,
  Calendar,
  User,
  CreditCard,
  Filter,
  Download,
  Printer,
  QrCode,
  FileText,
} from "lucide-react";
import Link from "next/link";
import OrderDetailsDialog from "./OrderDetailsDialog";
import EventReportDialog from "./EventReportDialog";
import { CardSkeleton } from "./CardSkeleton";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OrderAdministration({
  eventId,
  searchString,
  eventCountry,
  eventLocation,
}: {
  eventId: string;
  searchString: string;
  eventCountry?: string;
  eventLocation?: { name?: string; lat?: number; lon?: number };
}) {
  const t = useTranslations("orderAdministration");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();

  const { isPending, data, error } = useQuery({
    queryKey: ["orders", eventId, searchString],
    queryFn: async () => {
      const orders = await getOrdersByEvent({ eventId, searchString });
      return orders;
    },
  });

  const ticketTypeLabels: Record<string, string> = {
    paid: t("ticketTypes.paid"),
    free: t("ticketTypes.free"),
    hosted: t("ticketTypes.hosted"),
    doorpay: t("ticketTypes.doorpay"),
    bank_transfer: t("ticketTypes.bankTransfer"),
  };

  const getTicketTypeLabel = (value?: string) => {
    if (!value) return "";
    return ticketTypeLabels[value] || value;
  };

  const columns = [
    {
      header: t("table.headers.orderId"),
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
        <span className={`font-medium text-foreground ${isRTL ? "font-arabic" : ""}`}>
          {value}
        </span>
      ),
    },
    {
      header: t("table.headers.buyer"),
      accessor: "buyer",
      cell: (value: string) => (
        <div
          className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""
            }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {value.charAt(0).toUpperCase()}
          </div>
          <span className={`${isRTL ? "font-arabic" : ""}`}>{value}</span>
        </div>
      ),
    },
    {
      header: t("table.headers.ticketType"),
      accessor: "type",
      cell: (value: string) => (
        <Badge
          variant="secondary"
          className="glass bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300"
        >
          {getTicketTypeLabel(value)}
        </Badge>
      ),
    },
    {
      header: t("table.headers.created"),
      accessor: "createdAt",
      cell: (value: Date) => (
        <div
          className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""
            }`}
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span
            className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""
              }`}
          >
            {formatDateTime(value).dateTime}
          </span>
        </div>
      ),
    },
    {
      header: t("table.headers.amount"),
      accessor: "totalAmount",
      align: "right" as const,
      cell: (value: number) => (
        <div
          className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""
            }`}
        >
          <CreditCard className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-green-600 dark:text-green-400">
            {formatPriceByCountry(
              value,
              eventCountry || data?.[0]?.eventCountry,
              locale,
              eventLocation
            )}
          </span>
        </div>
      ),
    },
    {
      header: t("table.headers.details"),
      accessor: "root",
      align: "right" as const,
      cell: (value: any) => <OrderDetailsDialog value={value} />,
    },
  ];

  const renderMobileCard = (item: any) => (
    <Card
      key={item.id}
      className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:scale-105 transition-all duration-300"
    >
      <CardHeader className="pb-3">
        <div
          className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""
            }`}
        >
          <CardTitle className={`text-lg text-foreground font-bold ${isRTL ? "font-arabic" : ""}`}>
            {item.eventTitle}
          </CardTitle>
          <Badge
            variant="secondary"
            className="glass bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300"
          >
            {getTicketTypeLabel(item.type)}
          </Badge>
        </div>
        <CardDescription
          className={`font-mono text-sm ${isRTL ? "font-arabic text-right" : ""
            }`}
        >
          {t("orderIdLabel")}: {item._id.slice(-8)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div
          className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""
            }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {item.buyer.charAt(0).toUpperCase()}
          </div>
          <div className={isRTL ? "text-right" : ""}>
            <p className={`font-semibold text-foreground ${isRTL ? "font-arabic" : ""}`}>
              {item.buyer}
            </p>
            <p
              className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""
                }`}
            >
              {t("buyer")}
            </p>
          </div>
        </div>

        <div
          className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""
            }`}
        >
          <div
            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""
              }`}
          >
            <CreditCard className="h-4 w-4 text-green-600" />
            <span
              className={`font-semibold text-green-600 dark:text-green-400 ${isRTL ? "font-arabic" : ""
                }`}
            >
              {formatPriceByCountry(
                item.totalAmount,
                eventCountry || item.eventCountry,
                locale,
                eventLocation
              )}
            </span>
          </div>

          <div
            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""
              }`}
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span
              className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""
                }`}
            >
              {formatDateTime(item.createdAt).dateTime}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter
        className={`flex justify-end ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <OrderDetailsDialog value={item} />
      </CardFooter>
    </Card>
  );

  type ExportFormat = "csv" | "xlsx" | "word" | "pdf";

  const getExportPayload = () => {
    const headers = [
      t("table.headers.orderId"),
      t("table.headers.eventTitle"),
      t("table.headers.buyer"),
      t("table.headers.ticketType"),
      t("table.headers.created"),
      t("table.headers.amount"),
    ];

    const rows = (data || []).map((order: any) => [
      order?._id ?? "",
      order?.eventTitle ?? "",
      order?.buyer ?? "",
      getTicketTypeLabel(order?.type),
      order?.createdAt ? formatDateTime(order.createdAt).dateTime : "",
      typeof order?.totalAmount === "number"
        ? order.totalAmount.toFixed(2)
        : "0.00",
    ]);

    return { headers, rows };
  };

  const handleExportOrders = async (format: ExportFormat) => {
    if (!data || data.length === 0) {
      toast({
        title: "Export",
        description: "Aucune inscription à exporter.",
        variant: "destructive",
      });
      return;
    }

    const safeDate = new Date().toISOString().slice(0, 10);
    const safeEventTitle = String(data[0]?.eventTitle || "orders")
      .trim()
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .replace(/\s+/g, "_");
    const baseFileName = `${safeEventTitle || "orders"}_${safeDate}`;
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
        const xlsxModule = await import("xlsx");
        const XLSX: any = (xlsxModule as any).default ?? xlsxModule;
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
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
          .map((h) => `<th style="border:1px solid #ccc;padding:8px;background:#f5f5f5;">${h}</th>`)
          .join("");
        const rowsHtml = rows
          .map(
            (row: any) =>
              `<tr>${row
                .map((cell: any) => `<td style="border:1px solid #ccc;padding:8px;">${String(cell)}</td>`)
                .join("")}</tr>`
          )
          .join("");

        const htmlDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><h2>Registrations Export</h2><table style="border-collapse:collapse;width:100%"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
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
        doc.text("Registrations Export", 40, y);
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
        title: "Export",
        description: `${data.length} inscription(s) exportée(s) en ${format.toUpperCase()}.`,
      });
    } catch (exportError) {
      console.error("Export failed", exportError);
      toast({
        title: "Export",
        description: "Échec de l'export. Veuillez réessayer.",
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
          className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${isRTL ? "lg:flex-row-reverse" : ""
            }`}
        >
          <div
            className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""
              }`}
          >
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
              <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <h2
                className={`text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent ${isRTL ? "font-arabic" : ""
                  }`}
              >
                {t("title")}
              </h2>
              <p
                className={`text-muted-foreground ${isRTL ? "font-arabic" : ""
                  }`}
              >
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div
            className={`w-full lg:w-auto flex flex-wrap items-center gap-2 sm:gap-3 ${isRTL ? "flex-row-reverse" : ""
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
                <DropdownMenuItem onClick={() => handleExportOrders("xlsx")}>
                  Export XLSX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportOrders("word")}>
                  Export Word
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportOrders("pdf")}>
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportOrders("csv")}>
                  Export CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto justify-center glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 gap-2"
            >
              <Link href={`/events/${eventId}/scan`}>
                <QrCode className="h-4 w-4" />
                <span>Scanner un accès</span>
              </Link>
            </Button>
            {eventId && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsReportOpen(true)}
                  className="w-full sm:w-auto justify-center gap-2 glass bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border-amber-300/50 dark:border-amber-700/50 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-700 dark:text-amber-400"
                >
                  <FileText className="h-4 w-4" />
                  <span>{t("actions.rapport")}</span>
                </Button>
                <Button
                  asChild
                  variant="default"
                  className="w-full sm:w-auto justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300"
                >
                  <Link href={`/events/${eventId}/badge`}>
                    <Printer className="w-4 h-4 mr-2" />
                    Gérer les badges
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Row */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="glass bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""
                  }`}
              >
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p
                    className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {data.length}
                  </p>
                  <p
                    className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {t("stats.totalOrders")}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-4">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""
                  }`}
              >
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p
                    className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {formatPriceByCountry(
                      data.reduce(
                        (sum: number, order: any) => sum + (order.totalAmount || 0),
                        0
                      ),
                      eventCountry || data[0]?.eventCountry,
                      locale,
                      eventLocation
                    )}
                  </p>
                  <p
                    className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {t("stats.totalRevenue")}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""
                  }`}
              >
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p
                    className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {new Set(data.map((order: any) => order.buyer)).size}
                  </p>
                  <p
                    className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {t("stats.uniqueBuyers")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3
                className={`text-lg font-semibold mb-2 ${isRTL ? "font-arabic" : ""
                  }`}
              >
                {t("emptyState.title")}
              </h3>
              <p
                className={`text-muted-foreground ${isRTL ? "font-arabic" : ""
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
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3
              className={`text-lg font-semibold mb-2 ${isRTL ? "font-arabic" : ""
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

      {/* Event Report Dialog */}
      {eventId && (
        <EventReportDialog
          eventId={eventId}
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
}
