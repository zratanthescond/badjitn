"use client";

import { useMemo, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  CreditCard,
  Download,
  Printer,
  QrCode,
  FileText,
  Upload,
  UserPlus,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import OrderDetailsDialog from "./OrderDetailsDialog";
import EventReportDialog from "./EventReportDialog";
import ImportParticipantsDialog from "./ImportParticipantsDialog";
import AddParticipantDialog from "./AddParticipantDialog";
import { CardSkeleton } from "./CardSkeleton";
import { AdminSectionHeader } from "./ui/AdminSectionHeader";
import { StatCard } from "./ui/StatCard";
import { AdminToolbar } from "./ui/AdminToolbar";
import { AdminDataTable, type AdminColumn } from "./ui/AdminDataTable";
import { AdminPagination } from "./ui/AdminPagination";
import { AdminEmptyState } from "./ui/AdminEmptyState";
import {
  getOrderCategory,
  getParticipantNameFromOrder,
  getPaymentStatus,
  getTicketTypeKey,
  toneChipClass,
  type OrderCategory,
} from "./utils/order-helpers";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PLAN_BAR_COLORS = [
  "bg-primary",
  "bg-admin-success",
  "bg-admin-warning",
  "bg-destructive",
  "bg-muted-foreground",
];

type SortKey = "id" | "name" | "plan" | "amount" | "createdAt";
type SortDir = "asc" | "desc";
const PAGE_SIZE_OPTIONS = [10, 25, 50];

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
  const tx = (key: string, fallback: string) =>
    t.has(key as any) ? t(key as any) : fallback;
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();

  // Real, working filters (replacing the previously decorative "Filter"
  // button) — all client-side, since getOrdersByEvent already returns the
  // full, unpaginated set for the event.
  const [search, setSearch] = useState(searchString || "");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "createdAt",
    dir: "desc",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const { isPending, data } = useQuery({
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

  const categoryLabels: Record<OrderCategory, string> = {
    attendee: tx("categories.attendee", "Participant"),
    speaker: tx("categories.speaker", "Orateur"),
    sponsor: tx("categories.sponsor", "Sponsor"),
    staff: tx("categories.staff", "Staff"),
  };

  const paymentStatusLabel = (status: ReturnType<typeof getPaymentStatus>) =>
    tx(status.labelKey, status.fallback);

  // ---- search / filter / sort -------------------------------------------------
  const normalize = (value: unknown) =>
    String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  const matchesSearch = (order: any, query: string) => {
    if (!query) return true;
    const q = normalize(query);
    const haystack = [
      getParticipantNameFromOrder(order, tx("guestRegistration", "Guest registration")),
      order?.buyer,
      order?._id,
      ...(Array.isArray(order?.requiredUserInfo)
        ? order.requiredUserInfo.map((info: any) => info?.value)
        : []),
      ...(Array.isArray(order?.details)
        ? order.details.map((d: any) => `${d?.name || ""} ${d?.option || ""}`)
        : []),
    ]
      .filter(Boolean)
      .map(normalize)
      .join(" ");
    return haystack.includes(q);
  };

  const filteredData = useMemo(() => {
    const base = data || [];
    return base.filter((order: any) => {
      if (typeFilter && getTicketTypeKey(order) !== typeFilter) return false;
      if (categoryFilter && getOrderCategory(order) !== categoryFilter) return false;
      if (statusFilter && getPaymentStatus(order).key !== statusFilter) return false;
      return matchesSearch(order, search);
    });
  }, [data, typeFilter, categoryFilter, statusFilter, search]);

  const sortedData = useMemo(() => {
    const { key, dir } = sort;
    const factor = dir === "asc" ? 1 : -1;
    const accessor = (order: any): string | number => {
      switch (key) {
        case "id":
          return String(order?._id || "");
        case "name":
          return getParticipantNameFromOrder(order, "");
        case "plan":
          return String(order?.details?.[0]?.name || "");
        case "amount":
          return Number(order?.totalAmount) || 0;
        case "createdAt":
        default:
          return new Date(order?.createdAt || 0).getTime();
      }
    };
    return [...filteredData].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  }, [filteredData, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedData = sortedData.slice((safePage - 1) * pageSize, safePage * pageSize);

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("");
    setCategoryFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const handleSortChange = (key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key: key as SortKey, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key: key as SortKey, dir: "asc" }
    );
  };

  // ---- KPIs & plan breakdown, computed on the *filtered* set so they stay
  // consistent with what's visible in the table -------------------------------
  const totalRevenue = filteredData.reduce(
    (sum: number, order: any) => sum + (Number(order.totalAmount) || 0),
    0
  );
  const uniqueParticipants = new Set(
    filteredData.map((order: any) => getParticipantNameFromOrder(order))
  ).size;
  const actionableCount = filteredData.filter((order: any) =>
    ["amber"].includes(getPaymentStatus(order).tone)
  ).length;

  const planBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    filteredData.forEach((order: any) => {
      const name = String(order?.details?.[0]?.name || "").trim();
      if (!name) return;
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    const total = filteredData.length || 1;
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));
  }, [filteredData]);

  // ---- table columns ----------------------------------------------------------
  const columns: AdminColumn[] = [
    {
      key: "id",
      header: t("table.headers.orderId"),
      accessor: "_id",
      sortable: true,
      cell: (value: string) => (
        <div>
          <span className="font-mono text-xs font-semibold text-primary">
            #{value.slice(-8)}
          </span>
        </div>
      ),
    },
    {
      key: "name",
      header: t("table.headers.buyer"),
      accessor: "root",
      sortable: true,
      cell: (order: any) => {
        const participantName = getParticipantNameFromOrder(
          order,
          tx("guestRegistration", "Guest registration")
        );
        const email = Array.isArray(order?.requiredUserInfo)
          ? order.requiredUserInfo.find((info: any) =>
              String(info?.field || info?.label || "").toLowerCase().includes("email")
            )?.value
          : undefined;
        return (
          <div className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {participantName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className={`truncate text-sm font-semibold text-foreground ${isRTL ? "font-arabic" : ""}`}>
                {participantName}
              </p>
              {email && (
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "plan",
      header: tx("table.headers.plan", "Formule"),
      accessor: "root",
      sortable: true,
      cell: (order: any) => (
        <div>
          <p className={`text-sm font-medium text-foreground ${isRTL ? "font-arabic" : ""}`}>
            {order?.details?.[0]?.name || "—"}
          </p>
          {order?.details?.[0]?.option && (
            <p className="text-xs text-muted-foreground">{order.details[0].option}</p>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: t("table.headers.ticketType"),
      accessor: "root",
      cell: (order: any) => (
        <Badge variant="secondary" className="bg-muted font-medium text-foreground">
          {getTicketTypeLabel(order.type, order.totalAmount)}
        </Badge>
      ),
    },
    {
      key: "paymentStatus",
      header: tx("table.headers.paymentStatus", "Statut paiement"),
      accessor: "root",
      cell: (order: any) => {
        const status = getPaymentStatus(order);
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${toneChipClass(status.tone)}`}
          >
            {status.tone === "amber" && <Clock className="h-3 w-3" />}
            {paymentStatusLabel(status)}
          </span>
        );
      },
    },
    {
      key: "category",
      header: tx("table.headers.category", "Catégorie"),
      accessor: "root",
      cell: (order: any) => (
        <Badge variant="outline" className="font-medium text-muted-foreground">
          {categoryLabels[getOrderCategory(order)]}
        </Badge>
      ),
    },
    ...(!isFreeEvent
      ? [
          {
            key: "amount",
            header: t("table.headers.amount"),
            accessor: "totalAmount",
            align: "right" as const,
            sortable: true,
            cell: (value: number) => (
              <span className="font-semibold text-foreground">
                {formatPriceByCountry(value, eventCountry || data?.[0]?.eventCountry, locale, eventLocation)}
              </span>
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

  const renderMobileCard = (item: any) => {
    const status = getPaymentStatus(item);
    return (
      <Card key={item._id} className="border-border">
        <CardHeader className="pb-3">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <CardTitle className={`text-base font-semibold ${isRTL ? "font-arabic" : ""}`}>
              {getParticipantNameFromOrder(item, tx("guestRegistration", "Guest registration"))}
            </CardTitle>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${toneChipClass(status.tone)}`}>
              {paymentStatusLabel(status)}
            </span>
          </div>
          <CardDescription className={`font-mono text-xs ${isRTL ? "text-right font-arabic" : ""}`}>
            #{item._id.slice(-8)} · {item?.details?.[0]?.name || "—"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pb-3">
          <div className={`flex items-center justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
            {!isFreeEvent && (
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                {formatPriceByCountry(item.totalAmount, eventCountry || item.eventCountry, locale, eventLocation)}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateTime(item.createdAt).dateTime}
            </span>
          </div>
        </CardContent>
        <CardFooter className={`flex justify-end ${isRTL ? "flex-row-reverse" : ""}`}>
          <OrderDetailsDialog value={item} />
        </CardFooter>
      </Card>
    );
  };

  // ---- export (unchanged logic, retargeted to the filtered set) --------------
  type ExportFormat = "csv" | "xlsx" | "word" | "pdf";

  const normalizeText = (value: unknown) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "");

  const getExportEventMeta = () => {
    const title = eventTitle || String(filteredData?.[0]?.eventTitle || "");
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

  const getStructuredExportPayload = () => {
    const hasFirstNameColumn = filteredData.some((order: any) =>
      (order?.requiredUserInfo || []).some((info: any) => {
        const field = normalizeText(info?.field);
        const label = normalizeText(info?.label);
        return (
          ["firstname", "first_name", "prenom"].includes(field) ||
          ["firstname", "prenom"].includes(label)
        );
      })
    );

    const hasLastNameColumn = filteredData.some((order: any) =>
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

    filteredData.forEach((order: any) => {
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

    const rows = filteredData.map((order: any) => {
      const row: (string | number)[] = [order?._id ?? ""];
      if (!shouldHideParticipantColumn) {
        row.push(getParticipantNameFromOrder(order, tx("guestRegistration", "Guest registration")));
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

  const handleExportOrders = async (format: ExportFormat) => {
    if (filteredData.length === 0) {
      toast({
        title: tx("export.toastTitle", "Export"),
        description: tx("export.noOrders", "Aucune inscription à exporter."),
        variant: "destructive",
      });
      return;
    }

    const safeDate = new Date().toISOString().slice(0, 10);
    const safeEventTitle = String(filteredData[0]?.eventTitle || "orders")
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
          // Non-blocking: continue export even if logo cannot be loaded
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

        rows.forEach((_row: any, rowIndex: number) => {
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
        const blob = new Blob(["﻿" + csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        downloadBlob(blob, `${baseFileName}.csv`);
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
        const blob = new Blob(["﻿" + htmlDoc], {
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
          // Non-blocking
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
        title: tx("export.toastTitle", "Export"),
        description: `${filteredData.length} ${tx(
          "export.successCountLabel",
          "inscription(s)"
        )} ${tx("export.successExportedIn", "exportée(s) en")} ${format.toUpperCase()}.`,
      });
    } catch (exportError) {
      console.error("Export failed", exportError);
      toast({
        title: tx("export.toastTitle", "Export"),
        description: tx("export.failed", "Échec de l'export. Veuillez réessayer."),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`flex flex-col gap-5 ${isRTL ? "rtl" : "ltr"}`}>
      <AdminSectionHeader
        icon={<ShoppingCart className="h-5 w-5" />}
        title={t("title")}
        subtitle={t("subtitle")}
        isRTL={isRTL}
      />

      {/* KPIs, computed on the filtered result set */}
      <div className={`grid grid-cols-1 gap-3.5 sm:grid-cols-2 ${isFreeEvent ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
        <StatCard
          label={t("stats.totalOrders")}
          value={filteredData.length}
          icon={<ShoppingCart className="h-4 w-4" />}
          accent="blue"
          hint={
            <>
              <Users className="h-3.5 w-3.5" /> {uniqueParticipants} {tx("stats.uniqueParticipantsHint", "participants uniques")}
            </>
          }
          isRTL={isRTL}
        />
        {!isFreeEvent && (
          <StatCard
            label={t("stats.totalRevenue")}
            value={formatPriceByCountry(totalRevenue, eventCountry || data?.[0]?.eventCountry, locale, eventLocation)}
            icon={<CreditCard className="h-4 w-4" />}
            accent="green"
            isRTL={isRTL}
          />
        )}
        <StatCard
          label={tx("stats.actionable", "À valider")}
          value={actionableCount}
          icon={<Clock className="h-4 w-4" />}
          accent="amber"
          hint={tx("stats.actionableHint", "virements et remises en attente")}
          isRTL={isRTL}
        />
        <StatCard
          label={t("stats.uniqueBuyers")}
          value={uniqueParticipants}
          icon={<Users className="h-4 w-4" />}
          accent="neutral"
          isRTL={isRTL}
        />
      </div>

      {planBreakdown.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {tx("planBreakdown.title", "Répartition des formules")}
          </p>
          <div className="flex flex-col gap-3">
            {planBreakdown.map((plan, index) => (
              <div key={plan.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-foreground">{plan.name}</span>
                  <span className="font-semibold tabular-nums text-muted-foreground">
                    {plan.count} ({plan.pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${PLAN_BAR_COLORS[index % PLAN_BAR_COLORS.length]}`}
                    style={{ width: `${plan.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AdminToolbar
        isRTL={isRTL}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={tx(
          "filters.searchPlaceholder",
          "Nom, e-mail, référence, formule…"
        )}
        resultLabel={`${filteredData.length} ${tx("filters.resultsLabel", "résultat(s)")}`}
        onReset={resetFilters}
        resetLabel={tx("filters.reset", "Réinitialiser les filtres")}
        filters={
          <>
            <Select
              value={typeFilter || "all"}
              onValueChange={(v) => {
                setTypeFilter(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full sm:w-[190px]">
                <SelectValue placeholder={tx("filters.type", "Type — Tous")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tx("filters.typeAll", "Type — Tous")}</SelectItem>
                <SelectItem value="paid">{t("ticketTypes.paid")}</SelectItem>
                <SelectItem value="bank_transfer">{t("ticketTypes.bankTransfer")}</SelectItem>
                <SelectItem value="doorpay">{t("ticketTypes.doorpay")}</SelectItem>
                <SelectItem value="hosted">{t("ticketTypes.hosted")}</SelectItem>
                <SelectItem value="free">{t("ticketTypes.free")}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter || "all"}
              onValueChange={(v) => {
                setCategoryFilter(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full sm:w-[190px]">
                <SelectValue placeholder={tx("filters.categoryAll", "Catégorie — Toutes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tx("filters.categoryAll", "Catégorie — Toutes")}</SelectItem>
                {(["attendee", "speaker", "sponsor", "staff"] as const).map((c) => (
                  <SelectItem key={c} value={c}>
                    {categoryLabels[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <SelectItem value="paid">{tx("paymentStatus.paid", "Payé")}</SelectItem>
                <SelectItem value="pending-eligibility">
                  {tx("paymentStatus.pendingEligibility", "En attente de validation")}
                </SelectItem>
                <SelectItem value="pending-transfer">
                  {tx("paymentStatus.pendingTransfer", "Virement à vérifier")}
                </SelectItem>
                <SelectItem value="doorpay">{tx("paymentStatus.doorpay", "Paiement sur place")}</SelectItem>
                <SelectItem value="hosted">{tx("paymentStatus.hosted", "Pris en charge")}</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={`/events/${eventId}/scan`}>
                <QrCode className="h-4 w-4" />
                {tx("actions.scanAccess", "Scanner un accès")}
              </Link>
            </Button>
            {eventId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsAddParticipantOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  {tx("actions.add", "Ajouter")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsImportOpen(true)}
                >
                  <Upload className="h-4 w-4" />
                  {tx("actions.import", "Importer")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsReportOpen(true)}
                >
                  <FileText className="h-4 w-4" />
                  {t("actions.rapport")}
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isExporting || isPending || filteredData.length === 0}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t("actions.export")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                <DropdownMenuItem onClick={() => handleExportOrders("xlsx")}>
                  {tx("export.xlsx", "Export XLSX")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportOrders("word")}>
                  {tx("export.word", "Export Word")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportOrders("pdf")}>
                  {tx("export.pdf", "Export PDF")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportOrders("csv")}>
                  {tx("export.csv", "Export CSV")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {eventId && (
              <Button asChild size="sm" className="gap-2">
                <Link href={`/events/${eventId}/badge`}>
                  <Printer className="h-4 w-4" />
                  {tx("actions.manageBadges", "Gérer les badges")}
                </Link>
              </Button>
            )}
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
              icon={<ShoppingCart className="h-8 w-8" />}
              title={t("emptyState.title")}
              description={t("emptyState.description")}
              isRTL={isRTL}
            />
          )
        ) : isPending ? (
          <TableSkeleton />
        ) : paginatedData.length > 0 ? (
          <AdminDataTable
            columns={columns}
            data={paginatedData}
            sortKey={sort.key}
            sortDir={sort.dir}
            onSortChange={(key) => handleSortChange(key)}
            getRowId={(row) => row._id}
            isRTL={isRTL}
          />
        ) : (
          <AdminEmptyState
            icon={<ShoppingCart className="h-8 w-8" />}
            title={t("emptyState.title")}
            description={t("emptyState.description")}
            isRTL={isRTL}
          />
        )}
        {sortedData.length > 0 && (
          <AdminPagination
            page={safePage}
            pageSize={pageSize}
            total={sortedData.length}
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

      {eventId && (
        <EventReportDialog
          eventId={eventId}
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      )}
      {eventId && (
        <ImportParticipantsDialog
          eventId={eventId}
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
        />
      )}
      {eventId && (
        <AddParticipantDialog
          eventId={eventId}
          isOpen={isAddParticipantOpen}
          onClose={() => setIsAddParticipantOpen(false)}
          isFreeEvent={isFreeEvent}
        />
      )}
    </div>
  );
}
