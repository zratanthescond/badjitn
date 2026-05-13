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
  Upload,
} from "lucide-react";
import Link from "next/link";
import OrderDetailsDialog from "./OrderDetailsDialog";
import EventReportDialog from "./EventReportDialog";
import ImportParticipantsDialog from "./ImportParticipantsDialog";
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
  isFreeEvent,
  eventTitle,
  organisationName,
  eventStartDateTime,
  eventEndDateTime,
  eventPlace,
}: {
  eventId: string;
  searchString: string;
  eventCountry?: string;
  eventLocation?: { name?: string; lat?: number; lon?: number };
  isFreeEvent?: boolean;
  eventTitle?: string;
  organisationName?: string;
  eventStartDateTime?: string | Date;
  eventEndDateTime?: string | Date;
  eventPlace?: string;
}) {
  const t = useTranslations("orderAdministration");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
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

  const getTicketTypeLabel = (value?: string, amount?: number) => {
    if (amount === 0) return t("ticketTypes.free");
    if (!value) return "";
    return ticketTypeLabels[value] || value;
  };

  const getParticipantNameFromOrder = (order: any) => {
    const buyerText = String(order?.buyer || "").trim();
    if (buyerText && buyerText.toLowerCase() !== "guest registration") {
      return buyerText;
    }

    const infoList = Array.isArray(order?.requiredUserInfo)
      ? order.requiredUserInfo
      : [];

    const normalize = (value: unknown) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "");

    const findValue = (matcher: (field: string, label: string) => boolean) => {
      const found = infoList.find((info: any) =>
        matcher(normalize(info?.field), normalize(info?.label))
      );
      return String(found?.value || "").trim();
    };

    const firstName = findValue(
      (field, label) =>
        ["firstname", "first_name", "prenom"].includes(field) ||
        ["firstname", "prenom"].includes(label)
    );
    const lastName = findValue(
      (field, label) =>
        ["lastname", "last_name", "nom", "familyname", "family_name"].includes(field) ||
        ["lastname", "nom", "familyname"].includes(label)
    );
    const fullName = findValue(
      (field, label) =>
        ["name", "fullname", "full_name", "nomcomplet", "nom_complet"].includes(field) ||
        ["name", "fullname", "nomcomplet"].includes(label)
    );

    const combined = `${firstName} ${lastName}`.trim();
    if (combined) return combined;
    if (fullName) return fullName;

    const fallbackValues = infoList
      .map((info: any) => String(info?.value || "").trim())
      .filter(Boolean);
    const fallbackCombined = `${fallbackValues[0] || ""} ${fallbackValues[1] || ""}`.trim();
    if (fallbackCombined) return fallbackCombined;

    return buyerText || "Guest registration";
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
      accessor: "root",
      cell: (order: any) => {
        const participantName = getParticipantNameFromOrder(order);
        return (
        <div
          className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""
            }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {participantName.charAt(0).toUpperCase()}
          </div>
          <span className={`${isRTL ? "font-arabic" : ""}`}>{participantName}</span>
        </div>
      )},
    },
    {
      header: t("table.headers.ticketType"),
      accessor: "root",
      cell: (order: any) => (
        <Badge
          variant="secondary"
          className="glass bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300"
        >
          {getTicketTypeLabel(order.type, order.totalAmount)}
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
    ...(!isFreeEvent
      ? [
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
        ]
      : []),
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
            {getTicketTypeLabel(item.type, item.totalAmount)}
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
              {getParticipantNameFromOrder(item)}
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
          {!isFreeEvent && (
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
          )}

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

  const normalizeText = (value: unknown) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "");

  const getExportEventMeta = () => {
    const title = eventTitle || String(data?.[0]?.eventTitle || "");
    const organisation = organisationName || "";
    const place = eventPlace || eventLocation?.name || "";
    const eventDate = eventStartDateTime
      ? formatDateTime(new Date(eventStartDateTime as any)).dateTime
      : "";
    const eventEndDate = eventEndDateTime
      ? formatDateTime(new Date(eventEndDateTime as any)).dateTime
      : "";

    return {
      title,
      organisation,
      place,
      eventDate,
      eventEndDate,
      exportDate: formatDateTime(new Date()).dateTime,
    };
  };

  const getExportPayload = () => {
    const headers = [
      t("table.headers.orderId"),
      t("table.headers.eventTitle"),
      t("table.headers.buyer"),
      t("table.headers.ticketType"),
      t("table.headers.created"),
    ];
    if (!isFreeEvent) headers.push(t("table.headers.amount"));
    headers.push(t("table.headers.details") || "Détails");

    const rows = (data || []).map((order: any) => {
      const row = [
        order?._id ?? "",
        order?.eventTitle ?? "",
        order?.buyer ?? "",
        getTicketTypeLabel(order?.type, order?.totalAmount),
        order?.createdAt ? formatDateTime(order.createdAt).dateTime : "",
      ];
      
      if (!isFreeEvent) {
        row.push(
          typeof order?.totalAmount === "number"
            ? order.totalAmount.toFixed(2)
            : "0.00"
        );
      }

      const detailsStr = order?.details
        ?.map((d: any) => `${d.name}${d.option ? ` (${d.option})` : ""}`)
        .join(", ") || "";
      row.push(detailsStr);

      return row;
    });

    return { headers, rows };
  };

  const getStructuredExportPayload = () => {
    const hasFirstNameColumn = (data || []).some((order: any) =>
      (order?.requiredUserInfo || []).some((info: any) => {
        const field = normalizeText(info?.field);
        const label = normalizeText(info?.label);
        return (
          ["firstname", "first_name", "prenom"].includes(field) ||
          ["firstname", "prenom"].includes(label)
        );
      })
    );

    const hasLastNameColumn = (data || []).some((order: any) =>
      (order?.requiredUserInfo || []).some((info: any) => {
        const field = normalizeText(info?.field);
        const label = normalizeText(info?.label);
        return (
          ["lastname", "last_name", "nom", "familyname", "family_name"].includes(field) ||
          ["lastname", "nom", "familyname"].includes(label)
        );
      })
    );

    const shouldHideParticipantColumn = hasFirstNameColumn && hasLastNameColumn;

    const baseHeaders: string[] = [
      t("table.headers.orderId"),
      t("table.headers.ticketType"),
      t("table.headers.created"),
    ];
    if (!shouldHideParticipantColumn) {
      baseHeaders.splice(1, 0, t("table.headers.buyer"));
    }
    if (!isFreeEvent) baseHeaders.push(t("table.headers.amount"));

    const participantColumns: string[] = [];
    const planColumns: string[] = [];
    const usedHeaders = new Set<string>(baseHeaders);

    const ensureUniqueHeader = (header: string) => {
      const normalizedHeader = (header || "").trim() || "Colonne";
      if (!usedHeaders.has(normalizedHeader)) {
        usedHeaders.add(normalizedHeader);
        return normalizedHeader;
      }

      let index = 2;
      while (usedHeaders.has(`${normalizedHeader} (${index})`)) {
        index += 1;
      }
      const uniqueHeader = `${normalizedHeader} (${index})`;
      usedHeaders.add(uniqueHeader);
      return uniqueHeader;
    };

    const participantFieldToHeader = new Map<string, string>();
    const planNameToHeader = new Map<string, string>();

    (data || []).forEach((order: any) => {
      (order?.requiredUserInfo || []).forEach((info: any) => {
        const fieldKey = String(info?.field || "").trim();
        if (!fieldKey || participantFieldToHeader.has(fieldKey)) return;

        const header = ensureUniqueHeader(
          String(info?.label || fieldKey).trim() || fieldKey
        );
        participantFieldToHeader.set(fieldKey, header);
        participantColumns.push(header);
      });

      (order?.details || []).forEach((detail: any) => {
        const planName = String(detail?.name || "").trim();
        if (!planName || planNameToHeader.has(planName)) return;

        const header = ensureUniqueHeader(planName);
        planNameToHeader.set(planName, header);
        planColumns.push(header);
      });
    });

    const headers = [...baseHeaders, ...participantColumns, ...planColumns];

    const rows = (data || []).map((order: any) => {
      const row: (string | number)[] = [order?._id ?? ""];
      if (!shouldHideParticipantColumn) {
        row.push(getParticipantNameFromOrder(order));
      }
      row.push(
        getTicketTypeLabel(order?.type, order?.totalAmount),
        order?.createdAt ? formatDateTime(order.createdAt).dateTime : ""
      );

      if (!isFreeEvent) {
        row.push(
          typeof order?.totalAmount === "number"
            ? order.totalAmount.toFixed(2)
            : "0.00"
        );
      }

      const participantInfoMap = new Map<string, string>();
      (order?.requiredUserInfo || []).forEach((info: any) => {
        const fieldKey = String(info?.field || "").trim();
        if (!fieldKey) return;
        participantInfoMap.set(fieldKey, String(info?.value || ""));
      });

      participantFieldToHeader.forEach((_, fieldKey) => {
        row.push(participantInfoMap.get(fieldKey) || "");
      });

      const selectedPlanMap = new Map<string, string>();
      (order?.details || []).forEach((detail: any) => {
        const planName = String(detail?.name || "").trim();
        if (!planName) return;
        selectedPlanMap.set(planName, detail?.option ? String(detail.option) : "Oui");
      });

      planNameToHeader.forEach((_, planName) => {
        row.push(selectedPlanMap.get(planName) || "");
      });

      return row;
    });

    return { headers, rows };
  };
  void getExportPayload;

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
    const { headers, rows } = getStructuredExportPayload();
    const eventMeta = getExportEventMeta();
    const logoUrl = `${
      (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000").replace(/\/$/, "")
    }/assets/images/logoDark.png`;

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

      if (format === "xlsx") {
        const exceljsModule = await import("exceljs");
        const ExcelJS: any = (exceljsModule as any).default ?? exceljsModule;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Orders");

        const totalColumns = Math.max(headers.length, 1);
        const headerRowNumber = 10;
        const dataStartRowNumber = headerRowNumber + 1;
        const platformLogoUrl = `${
          (process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net").replace(/\/$/, "")
        }/assets/images/logoDark.png`;

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

        worksheet.getCell("A3").value = "Événement";
        worksheet.getCell("B3").value = eventMeta.title || "-";
        worksheet.getCell("A4").value = "Organisation";
        worksheet.getCell("B4").value = eventMeta.organisation || "-";
        worksheet.getCell("A5").value = "Date début";
        worksheet.getCell("B5").value = eventMeta.eventDate || "-";
        worksheet.getCell("A6").value = "Date fin";
        worksheet.getCell("B6").value = eventMeta.eventEndDate || "-";
        worksheet.getCell("A7").value = "Lieu";
        worksheet.getCell("B7").value = eventMeta.place || "-";
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
        rows.forEach((row, idx) => {
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

        const numericKeywords = [
          "amount",
          "montant",
          "price",
          "prix",
          "total",
          "numero",
          "telephone",
          "phone",
          "tel",
        ];
        const numericCols = headers
          .map((h, idx) => ({ idx: idx + 1, n: normalizeText(h) }))
          .filter((x) => numericKeywords.some((k) => x.n.includes(k)))
          .map((x) => x.idx);

        rows.forEach((_row, rowIndex) => {
          const rowNumber = dataStartRowNumber + rowIndex;
          const excelRow = worksheet.getRow(rowNumber);
          const isZebra = rowIndex % 2 === 1;
          excelRow.height = 20;
          for (let c = 1; c <= totalColumns; c += 1) {
            const cell = excelRow.getCell(c);
            cell.border = borderThin as any;
            cell.alignment = {
              horizontal: numericCols.includes(c) ? "right" : "left",
              vertical: "middle",
            } as any;
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

      if (false && format === "xlsx") {
        const xlsxModule = await import("xlsx");
        const XLSX: any = (xlsxModule as any).default ?? xlsxModule;

        const metaTableRows: (string | number)[][] = [
          ["BADGI - EXPORT INSCRIPTIONS"],
          [""],
          ["Événement", eventMeta.title || "-"],
          ["Organisation", eventMeta.organisation || "-"],
          ["Date début", eventMeta.eventDate || "-"],
          ["Date fin", eventMeta.eventEndDate || "-"],
          ["Lieu", eventMeta.place || "-"],
          ["Exporté le", eventMeta.exportDate || "-"],
          [""],
        ];

        const allRows: (string | number)[][] = [...metaTableRows, headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(allRows);

        const totalColumns = Math.max(headers.length, 1);
        const lastColIndex = totalColumns - 1;
        const headerRowIndex = metaTableRows.length;
        const dataStartRowIndex = headerRowIndex + 1;

        worksheet["!merges"] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: lastColIndex } },
          { s: { r: 2, c: 1 }, e: { r: 2, c: lastColIndex } },
          { s: { r: 3, c: 1 }, e: { r: 3, c: lastColIndex } },
          { s: { r: 4, c: 1 }, e: { r: 4, c: lastColIndex } },
          { s: { r: 5, c: 1 }, e: { r: 5, c: lastColIndex } },
          { s: { r: 6, c: 1 }, e: { r: 6, c: lastColIndex } },
          { s: { r: 7, c: 1 }, e: { r: 7, c: lastColIndex } },
        ];

        worksheet["!cols"] = headers.map((header: string, colIndex: number) => {
          const values = [
            String(header || ""),
            ...rows.map((row: any[]) => String(row?.[colIndex] ?? "")),
          ];
          const maxLen = values.reduce((max, value) => Math.max(max, value.length), 8);
          return { wch: Math.min(48, Math.max(12, maxLen + 2)) };
        });

        worksheet["!rows"] = allRows.map((_, rowIndex) => {
          if (rowIndex === 0) return { hpx: 36 };
          if (rowIndex >= 2 && rowIndex <= 7) return { hpx: 22 };
          if (rowIndex === headerRowIndex) return { hpx: 24 };
          return { hpx: 20 };
        });

        const borderThin = {
          top: { style: "thin", color: { rgb: "D1D5DB" } },
          bottom: { style: "thin", color: { rgb: "D1D5DB" } },
          left: { style: "thin", color: { rgb: "D1D5DB" } },
          right: { style: "thin", color: { rgb: "D1D5DB" } },
        };

        const titleCellRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
        if (worksheet[titleCellRef]) {
          worksheet[titleCellRef].s = {
            font: { bold: true, sz: 14, color: { rgb: "0F172A" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "DCEBFF" } },
            border: borderThin,
          };
        }

        headers.forEach((_, colIndex) => {
          const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex });
          if (!worksheet[cellRef]) return;
          worksheet[cellRef].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "2563EB" } },
            border: borderThin,
          };
        });

        for (let r = 2; r <= 7; r += 1) {
          const metaLabelRef = XLSX.utils.encode_cell({ r, c: 0 });
          const metaValueRef = XLSX.utils.encode_cell({ r, c: 1 });
          if (worksheet[metaLabelRef]) {
            worksheet[metaLabelRef].s = {
              font: { bold: true, color: { rgb: "1F2937" } },
              alignment: { horizontal: "left", vertical: "center" },
              fill: { fgColor: { rgb: "E5E7EB" } },
              border: borderThin,
            };
          }
          if (worksheet[metaValueRef]) {
            worksheet[metaValueRef].s = {
              alignment: { horizontal: "left", vertical: "center" },
              border: borderThin,
            };
          }
        }

        const numericKeywords = [
          "amount",
          "montant",
          "price",
          "prix",
          "total",
          "numero",
          "telephone",
          "phone",
          "tel",
        ];
        const numericColIndexes = headers
          .map((h, i) => ({ i, n: normalizeText(h) }))
          .filter((x) => numericKeywords.some((key) => x.n.includes(key)))
          .map((x) => x.i);

        for (let r = dataStartRowIndex; r < allRows.length; r += 1) {
          const isZebra = (r - dataStartRowIndex) % 2 === 1;
          for (let c = 0; c <= lastColIndex; c += 1) {
            const ref = XLSX.utils.encode_cell({ r, c });
            if (!worksheet[ref]) continue;
            const isNumericCol = numericColIndexes.includes(c);
            worksheet[ref].s = {
              border: borderThin,
              alignment: {
                horizontal: isNumericCol ? "right" : "left",
                vertical: "center",
              },
              fill: isZebra ? { fgColor: { rgb: "F8FAFC" } } : undefined,
            };
          }
        }

        // NOTE: keep output compatible with broad Excel versions.
        // Some freeze-pane extensions can produce corrupted files with xlsx CE.
        worksheet["!autofilter"] = {
          ref: `${XLSX.utils.encode_col(0)}${headerRowIndex + 1}:${XLSX.utils.encode_col(
            lastColIndex
          )}${headerRowIndex + 1}`,
        };

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

      if (format === "csv") {
        const delimiter = locale === "fr" || locale === "ar" ? ";" : ",";
        const escapeCell = (value: unknown) => {
          const text = value == null ? "" : String(value);
          return `"${text.replace(/"/g, '""')}"`;
        };
        const metaLines = [
          ["BADGI - EXPORT INSCRIPTIONS"],
          [eventMeta.title ? `Événement: ${eventMeta.title}` : ""],
          [eventMeta.organisation ? `Organisation: ${eventMeta.organisation}` : ""],
          [eventMeta.eventDate ? `Date début: ${eventMeta.eventDate}` : ""],
          [eventMeta.eventEndDate ? `Date fin: ${eventMeta.eventEndDate}` : ""],
          [eventMeta.place ? `Lieu: ${eventMeta.place}` : ""],
          [`Exporté le: ${eventMeta.exportDate}`],
          [""],
        ]
          .filter((line) => line[0] !== "")
          .map((line) => line.map(escapeCell).join(delimiter));
        const csvContent = [
          ...metaLines,
          headers.map(escapeCell).join(delimiter),
          ...rows.map((row: any) => row.map(escapeCell).join(delimiter)),
        ].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        downloadBlob(blob, `${baseFileName}.csv`);
      }

      if (false && format === "xlsx") {
        const xlsxModule = await import("xlsx");
        const XLSX: any = (xlsxModule as any).default ?? xlsxModule;
        const metaTableRows: (string | number)[][] = [
          ["BADGI - EXPORT INSCRIPTIONS"],
          ["Événement", eventMeta.title || "-"],
          ["Organisation", eventMeta.organisation || "-"],
          ["Date début", eventMeta.eventDate || "-"],
          ["Date fin", eventMeta.eventEndDate || "-"],
          ["Lieu", eventMeta.place || "-"],
          ["Exporté le", eventMeta.exportDate || "-"],
          [""],
        ];

        const allRows: (string | number)[][] = [...metaTableRows, headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(allRows);

        const totalColumns = Math.max(headers.length, 1);
        const lastColIndex = totalColumns - 1;
        const headerRowIndex = metaTableRows.length;

        // Premium layout: merge title and meta values across the table width
        worksheet["!merges"] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: lastColIndex } },
          { s: { r: 1, c: 1 }, e: { r: 1, c: lastColIndex } },
          { s: { r: 2, c: 1 }, e: { r: 2, c: lastColIndex } },
          { s: { r: 3, c: 1 }, e: { r: 3, c: lastColIndex } },
          { s: { r: 4, c: 1 }, e: { r: 4, c: lastColIndex } },
          { s: { r: 5, c: 1 }, e: { r: 5, c: lastColIndex } },
          { s: { r: 6, c: 1 }, e: { r: 6, c: lastColIndex } },
        ];

        // Column widths auto-fit with sensible min/max
        worksheet["!cols"] = headers.map((header: string, colIndex: number) => {
          const values = [
            String(header || ""),
            ...rows.map((row: any[]) => String(row?.[colIndex] ?? "")),
          ];
          const maxLen = values.reduce(
            (max, value) => Math.max(max, value.length),
            8
          );
          return { wch: Math.min(48, Math.max(12, maxLen + 2)) };
        });

        // Row heights for a cleaner "report" look
        worksheet["!rows"] = allRows.map((_, rowIndex) => {
          if (rowIndex === 0) return { hpx: 28 };
          if (rowIndex <= 6) return { hpx: 22 };
          if (rowIndex === headerRowIndex) return { hpx: 24 };
          return { hpx: 20 };
        });

        const titleCellRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
        const titleCell = worksheet[titleCellRef];
        if (titleCell) {
          titleCell.s = {
            font: { bold: true, sz: 14, color: { rgb: "0F172A" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "DCEBFF" } },
          };
        }

        // Header colors and bold text
        headers.forEach((_, colIndex) => {
          const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex });
          if (!worksheet[cellRef]) return;
          worksheet[cellRef].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "2563EB" } },
          };
        });

        // Meta labels styling (left column)
        for (let r = 1; r <= 6; r += 1) {
          const metaLabelRef = XLSX.utils.encode_cell({ r, c: 0 });
          const metaValueRef = XLSX.utils.encode_cell({ r, c: 1 });
          if (worksheet[metaLabelRef]) {
            worksheet[metaLabelRef].s = {
              font: { bold: true, color: { rgb: "1F2937" } },
              alignment: { horizontal: "left", vertical: "center" },
              fill: { fgColor: { rgb: "E5E7EB" } },
            };
          }
          if (worksheet[metaValueRef]) {
            worksheet[metaValueRef].s = {
              alignment: { horizontal: "left", vertical: "center" },
            };
          }
        }

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

        const htmlDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
        <div style="border:1px solid #d9d9d9;border-radius:8px;padding:12px;margin-bottom:16px;background:#fafafa">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
            <img src="${logoUrl}" alt="badgi" style="height:36px;width:auto;object-fit:contain" />
            <h2 style="margin:0">Export des inscriptions</h2>
          </div>
          <p style="margin:4px 0"><strong>Événement:</strong> ${eventMeta.title || "-"}</p>
          <p style="margin:4px 0"><strong>Organisation:</strong> ${eventMeta.organisation || "-"}</p>
          <p style="margin:4px 0"><strong>Date début:</strong> ${eventMeta.eventDate || "-"}</p>
          <p style="margin:4px 0"><strong>Date fin:</strong> ${eventMeta.eventEndDate || "-"}</p>
          <p style="margin:4px 0"><strong>Lieu:</strong> ${eventMeta.place || "-"}</p>
          <p style="margin:4px 0"><strong>Exporté le:</strong> ${eventMeta.exportDate}</p>
        </div>
        <table style="border-collapse:collapse;width:100%"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>
        </body></html>`;
        const blob = new Blob(["\uFEFF" + htmlDoc], {
          type: "application/msword;charset=utf-8",
        });
        downloadBlob(blob, `${baseFileName}.doc`);
      }

      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        let y = 40;
        try {
          const response = await fetch(logoUrl);
          if (response.ok) {
            const blob = await response.blob();
            const logoDataUrl: string = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(String(reader.result || ""));
              reader.readAsDataURL(blob);
            });
            if (logoDataUrl.startsWith("data:image")) {
              doc.addImage(logoDataUrl, "PNG", 40, y - 6, 80, 22);
            }
          }
        } catch (_logoError) {
          // Non-blocking: continue export even if logo cannot be loaded
        }
        doc.setFontSize(14);
        doc.text("BADGI - Export des inscriptions", 130, y + 10);
        y += 22;
        doc.setFontSize(10);
        doc.text(`Événement: ${eventMeta.title || "-"}`, 40, y);
        y += 14;
        doc.text(`Organisation: ${eventMeta.organisation || "-"}`, 40, y);
        y += 14;
        doc.text(`Date début: ${eventMeta.eventDate || "-"}`, 40, y);
        y += 14;
        doc.text(`Date fin: ${eventMeta.eventEndDate || "-"}`, 40, y);
        y += 14;
        doc.text(`Lieu: ${eventMeta.place || "-"}`, 40, y);
        y += 14;
        doc.text(`Exporté le: ${eventMeta.exportDate}`, 40, y);
        y += 12;
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
                  onClick={() => setIsImportOpen(true)}
                  className="w-full sm:w-auto justify-center gap-2 glass bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border-emerald-300/50 dark:border-emerald-700/50 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-700 dark:text-emerald-400"
                >
                  <Upload className="h-4 w-4" />
                  <span>Importer</span>
                </Button>
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
          <div className={`grid grid-cols-1 ${!isFreeEvent ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4 mt-6`}>
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
                </div>              </div>
            </div>

            {!isFreeEvent && (
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
            )}

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
                    {new Set(data.map((order: any) => getParticipantNameFromOrder(order))).size}
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

      {/* Import Participants Dialog */}
      {eventId && (
        <ImportParticipantsDialog
          eventId={eventId}
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
        />
      )}
    </div>
  );
}
