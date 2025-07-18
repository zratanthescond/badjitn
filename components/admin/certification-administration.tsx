"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/shared/data-table";
import { Badge } from "../ui/badge";
import Search from "../shared/Search";
import { useTransition } from "react";
import {
  approveCertification,
  getCertificationByEventId,
  rejectCertification,
} from "@/lib/actions/certification.actions";
import TableSkeleton from "../shared/table-skeleton";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/utils";
import { CardSkeleton } from "./CardSkeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "@/hooks/use-toast";

export default function CertificationAdministration({
  eventId,
  searchString,
}: {
  eventId: string;
  searchString: string;
}) {
  const t = useTranslations("certificationAdministration");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isPending, startTransition] = useTransition();

  const {
    isPending: isLoading,
    data,
    error,
    refetch,
  } = useQuery({
    queryKey: ["certifications", eventId, searchString],
    queryFn: async () => {
      const certifications = await getCertificationByEventId({
        eventId,
        searchString,
      });
      return certifications;
    },
  });

  const approve = async (id: string) => {
    startTransition(async () => {
      try {
        const res = await approveCertification(id);
        if (res) {
          refetch();
          toast({
            title: t("toast.success"),
            description: t("toast.approved"),
          });
        }
      } catch (error) {
        toast({
          title: t("toast.error"),
          description: t("toast.approveError"),
          variant: "destructive",
        });
      }
    });
  };

  const reject = async (id: string) => {
    startTransition(async () => {
      try {
        const res = await rejectCertification(id);
        if (res) {
          refetch();
          toast({
            title: t("toast.success"),
            description: t("toast.rejected"),
          });
        }
      } catch (error) {
        toast({
          title: t("toast.error"),
          description: t("toast.rejectError"),
          variant: "destructive",
        });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        className:
          "glass bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-300",
        icon: <Clock className="h-3 w-3" />,
        label: t("status.pending"),
      },
      approved: {
        className:
          "glass bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300",
        icon: <CheckCircle className="h-3 w-3" />,
        label: t("status.approved"),
      },
      rejected: {
        className:
          "glass bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30 text-red-700 dark:text-red-300",
        icon: <XCircle className="h-3 w-3" />,
        label: t("status.rejected"),
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge
        className={`${config.className} ${
          isRTL ? "flex-row-reverse font-arabic" : ""
        }`}
      >
        {config.icon}
        <span className="ml-1">{config.label}</span>
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
      header: t("table.headers.applicant"),
      accessor: "buyer",
      cell: (value: string) => (
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
            {value.charAt(0).toUpperCase()}
          </div>
          <span className={`${isRTL ? "font-arabic" : ""}`}>{value}</span>
        </div>
      ),
    },
    {
      header: t("table.headers.status"),
      accessor: "status",
      cell: (value: string) => getStatusBadge(value),
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
      cell: (value: any) => (
        <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button
            onClick={() => reject(value._id)}
            variant="outline"
            size="sm"
            disabled={isPending || value.status !== "pending"}
            className="glass bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-500/20 rounded-full transition-all duration-200 hover:scale-105"
          >
            <XCircle className="h-4 w-4 mr-1" />
            {t("actions.reject")}
          </Button>
          <Button
            onClick={() => approve(value._id)}
            size="sm"
            disabled={isPending || value.status !== "pending"}
            className="glass bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full transition-all duration-200 hover:scale-105"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {t("actions.approve")}
          </Button>
        </div>
      ),
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
          {getStatusBadge(item.status)}
        </div>
        <CardDescription
          className={`font-mono text-sm ${
            isRTL ? "font-arabic text-right" : ""
          }`}
        >
          {t("certificationIdLabel")}: {item._id.slice(-8)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div
          className={`flex items-center gap-3 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
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
              {t("applicant")}
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

      <CardFooter className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending || item.status !== "pending"}
          onClick={() => reject(item._id)}
          className="glass bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-500/20 rounded-full flex-1 transition-all duration-200"
        >
          <XCircle className="h-4 w-4 mr-1" />
          {t("actions.reject")}
        </Button>
        <Button
          size="sm"
          disabled={isPending || item.status !== "pending"}
          onClick={() => approve(item._id)}
          className="glass bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full flex-1 transition-all duration-200"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          {t("actions.approve")}
        </Button>
      </CardFooter>
    </Card>
  );

  // Calculate stats
  const stats = data
    ? {
        total: data.length,
        pending: data.filter((item: any) => item.status === "pending").length,
        approved: data.filter((item: any) => item.status === "approved").length,
        rejected: data.filter((item: any) => item.status === "rejected").length,
      }
    : { total: 0, pending: 0, approved: 0, rejected: 0 };

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
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <h2
                className={`text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${
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
                <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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

          <div className="glass bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-4">
            <div
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
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

          <div className="glass bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-4">
            <div
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className={isRTL ? "text-right" : ""}>
                <p
                  className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
                >
                  {stats.approved}
                </p>
                <p
                  className={`text-sm text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("stats.approved")}
                </p>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-r from-red-500/10 to-rose-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-4">
            <div
              className={`flex items-center gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className={isRTL ? "text-right" : ""}>
                <p
                  className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
                >
                  {stats.rejected}
                </p>
                <p
                  className={`text-sm text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("stats.rejected")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-6">
        {isMobile ? (
          isLoading ? (
            <div className="flex flex-col space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-4">{data.map(renderMobileCard)}</div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
        ) : isLoading ? (
          <TableSkeleton />
        ) : data && data.length > 0 ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
