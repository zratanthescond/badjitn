"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/shared/data-table";
import { Badge } from "../ui/badge";
import Search from "../shared/Search";
import { getOrdersByEvent } from "@/lib/actions/order.actions";
import { formatDateTime } from "@/lib/utils";
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
} from "lucide-react";
import OrderDetailsDialog from "./OrderDetailsDialog";
import { CardSkeleton } from "./CardSkeleton";
import { useTranslations, useLocale } from "next-intl";

export default function OrderAdministration({
  eventId,
  searchString,
}: {
  eventId: string;
  searchString: string;
}) {
  const t = useTranslations("orderAdministration");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { isPending, data, error } = useQuery({
    queryKey: ["orders", eventId, searchString],
    queryFn: async () => {
      const orders = await getOrdersByEvent({ eventId, searchString });
      return orders;
    },
  });

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
        <span className={`font-medium ${isRTL ? "font-arabic" : ""}`}>
          {value}
        </span>
      ),
    },
    {
      header: t("table.headers.buyer"),
      accessor: "buyer",
      cell: (value: string) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
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
          {value !== undefined ? t(`ticketTypes.${value}`) : value}
        </Badge>
      ),
    },
    {
      header: t("table.headers.created"),
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
      header: t("table.headers.amount"),
      accessor: "totalAmount",
      align: "right" as const,
      cell: (value: number) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <CreditCard className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-green-600 dark:text-green-400">
            {parseFloat(value).toFixed(2)} {/* Ensure value is a number */}
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
          className={`flex items-center justify-between ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <CardTitle className={`text-lg ${isRTL ? "font-arabic" : ""}`}>
            {item.eventTitle}
          </CardTitle>
          <Badge
            variant="secondary"
            className="glass bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300"
          >
            {item.type !== undefined
              ? t(`ticketTypes.${item.type}`)
              : item.type}
          </Badge>
        </div>
        <CardDescription
          className={`font-mono text-sm ${
            isRTL ? "font-arabic text-right" : ""
          }`}
        >
          {t("orderIdLabel")}: {item._id.slice(-8)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div
          className={`flex items-center gap-3 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
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
              {t("buyer")}
            </p>
          </div>
        </div>

        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div
            className={`flex items-center gap-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <CreditCard className="h-4 w-4 text-green-600" />
            <span
              className={`font-semibold text-green-600 dark:text-green-400 ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              ${parseFloat(item.totalAmount).toFixed(2)}
            </span>
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
        </div>
      </CardContent>

      <CardFooter
        className={`flex justify-end ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <OrderDetailsDialog value={item} />
      </CardFooter>
    </Card>
  );

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
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
              <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <h2
                className={`text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent ${
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
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Search
              placeholder={t("searchPlaceholder")}
              className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
            />
            <Button
              variant="outline"
              size="icon"
              className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80"
              title={t("actions.filter")}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80"
              title={t("actions.export")}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="glass bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4">
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p
                    className={`text-2xl font-bold ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {data.length}
                  </p>
                  <p
                    className={`text-sm text-muted-foreground ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("stats.totalOrders")}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-4">
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p
                    className={`text-2xl font-bold ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    $
                    {data
                      .reduce(
                        (sum: number, order: any) =>
                          sum + parseFloat(order.totalAmount) || 0,
                        0
                      )
                      ?.toFixed(2)}
                  </p>
                  <p
                    className={`text-sm text-muted-foreground ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("stats.totalRevenue")}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p
                    className={`text-2xl font-bold ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {new Set(data.map((order: any) => order.buyer)).size}
                  </p>
                  <p
                    className={`text-sm text-muted-foreground ${
                      isRTL ? "font-arabic" : ""
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
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
