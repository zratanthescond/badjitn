"use client";

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

  const { isPending, data, error } = useQuery({
    queryKey: ["works", eventId, searchString],
    queryFn: async () => {
      const response = await getUserWorkByEventId({ eventId, searchString });
      return response;
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: {
        className:
          "glass bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300",
        label: t("status.submitted"),
      },
      reviewed: {
        className:
          "glass bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300",
        label: t("status.reviewed"),
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
        className={`flex justify-end ${isRTL ? "flex-row-reverse" : ""}`}
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
          (item: any) => (item.status || "submitted") === "submitted"
        ).length,
        reviewed: data.filter((item: any) => item.status === "reviewed").length,
        pending: data.filter((item: any) => item.status === "pending").length,
      }
    : { total: 0, submitted: 0, reviewed: 0, pending: 0 };

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="glass bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4">
            <div
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={isRTL ? "text-right" : ""}>
                <p
                  className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
                >
                  {stats.total}
                </p>
                <p
                  className={`text-sm text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("stats.total")}
                </p>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4">
            <div
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-orange-500/20">
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className={isRTL ? "text-right" : ""}>
                <p
                  className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
                >
                  {stats.submitted}
                </p>
                <p
                  className={`text-sm text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("stats.submitted")}
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
                <CheckCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className={isRTL ? "text-right" : ""}>
                <p
                  className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
                >
                  {stats.reviewed}
                </p>
                <p
                  className={`text-sm text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("stats.reviewed")}
                </p>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-4">
            <div
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className={isRTL ? "text-right" : ""}>
                <p
                  className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
                >
                  {stats.pending}
                </p>
                <p
                  className={`text-sm text-muted-foreground ${
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
