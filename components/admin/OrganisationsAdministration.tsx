"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import MobileCard from "@/components/shared/mobile-card";
import DataTable from "@/components/shared/data-table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatDateTime } from "@/lib/utils";
import TableSkeleton from "../shared/table-skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CardSkeleton } from "./CardSkeleton";
import {
  adminGetAllOrganisations,
  toggleOrganisationVerification,
} from "@/lib/actions/organisation.actions";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  XCircle,
  Building2,
  Shield,
  Loader2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function OrganisationsAdministration() {
  const t = useTranslations("organisationsAdministration");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { isLoading, data } = useQuery({
    queryKey: ["admin-organisations"],
    queryFn: async () => {
      const orgs = await adminGetAllOrganisations();
      return orgs;
    },
  });

  const handleToggleVerification = async (
    orgId: string,
    orgName: string,
    currentStatus: boolean
  ) => {
    setTogglingId(orgId);
    try {
      await toggleOrganisationVerification(orgId);
      toast({
        title: currentStatus
          ? t("toast.verificationRemoved")
          : t("toast.organisationVerified"),
        description: currentStatus
          ? t("toast.unverifiedDescription", { orgName })
          : t("toast.verifiedDescription", { orgName }),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-organisations"] });
    } catch (error) {
      toast({
        title: t("toast.errorTitle"),
        description: t("toast.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    {
      header: t("table.organisation"),
      accessor: "root",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          {row.logo ? (
            <img
              src={row.logo}
              alt={row.name}
              className="h-8 w-8 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          )}
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      header: t("table.creator"),
      accessor: "creator",
      cell: (value: any) => (
        <span className="text-sm">
          {value?.firstName} {value?.lastName}
        </span>
      ),
    },
    {
      header: t("table.members"),
      accessor: "admins",
      cell: (value: any) => (
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{value?.length || 1}</span>
        </div>
      ),
    },
    {
      header: t("table.created"),
      accessor: "createdAt",
      cell: (value: Date) => (
        <span className="text-xs text-gray-400">{formatDateTime(value).dateTime}</span>
      ),
    },
    {
      header: t("table.status"),
      accessor: "isVerified",
      cell: (value: boolean) => (
        <Badge
          className={
            value
              ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "border-slate-500/30 bg-slate-500/20 text-slate-600 dark:text-slate-400"
          }
        >
          {value ? (
            <>
              <CheckCircle className="mr-1 h-3 w-3" />
              {t("status.verified")}
            </>
          ) : (
            <>
              <XCircle className="mr-1 h-3 w-3" />
              {t("status.unverified")}
            </>
          )}
        </Badge>
      ),
    },
    {
      header: t("table.actions"),
      accessor: "root",
      align: "right" as const,
      cell: (row: any) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant={row.isVerified ? "outline" : "default"}
              className={
                row.isVerified
                  ? "rounded-full border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20"
                  : "rounded-full border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
              }
              disabled={togglingId === row._id}
            >
              {togglingId === row._id ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : row.isVerified ? (
                <XCircle className="mr-1 h-3.5 w-3.5" />
              ) : (
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
              )}
              {row.isVerified ? t("actions.revoke") : t("actions.verify")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {row.isVerified ? t("dialog.revokeTitle") : t("dialog.verifyTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {row.isVerified
                  ? t("dialog.revokeDescription", { orgName: row.name })
                  : t("dialog.verifyDescription", { orgName: row.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                {t("actions.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  handleToggleVerification(row._id, row.name, row.isVerified)
                }
                className={
                  row.isVerified
                    ? "rounded-xl bg-red-500 hover:bg-red-600"
                    : "rounded-xl bg-emerald-500 hover:bg-emerald-600"
                }
              >
                {row.isVerified
                  ? t("actions.revokeVerification")
                  : t("actions.approveVerification")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ];

  const renderMobileCard = (item: any) => (
    <MobileCard
      key={item._id}
      title={item.name}
      subtitle={t("mobile.creatorSubtitle", {
        creatorName: `${item.creator?.firstName} ${item.creator?.lastName}`,
      })}
      badge={item.isVerified ? t("status.verified") : t("status.unverified")}
      details={[
        { label: t("table.members"), value: String(item.admins?.length || 1) },
        { label: t("mobile.website"), value: item.website || t("mobile.noWebsite") },
      ]}
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs">{formatDateTime(item.createdAt).dateTime}</span>
          <Button
            size="sm"
            variant={item.isVerified ? "outline" : "default"}
            className={
              item.isVerified
                ? "rounded-full border-red-200 text-red-500"
                : "rounded-full bg-emerald-500 text-white"
            }
            onClick={() =>
              handleToggleVerification(item._id, item.name, item.isVerified)
            }
            disabled={togglingId === item._id}
          >
            {togglingId === item._id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : item.isVerified ? (
              t("actions.revoke")
            ) : (
              t("actions.verify")
            )}
          </Button>
        </div>
      }
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <Shield className="h-5 w-5 text-indigo-500" />
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="glass rounded-xl border border-border/40 bg-white/50 p-3 backdrop-blur-sm dark:bg-slate-900/50">
            <p className="text-2xl font-bold">{data.length}</p>
            <p className="text-xs text-muted-foreground">{t("stats.totalOrganisations")}</p>
          </div>
          <div className="glass rounded-xl border border-emerald-200/30 bg-emerald-50/50 p-3 backdrop-blur-sm dark:border-emerald-700/30 dark:bg-emerald-950/20">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {data.filter((o: any) => o.isVerified).length}
            </p>
            <p className="text-xs text-muted-foreground">{t("status.verified")}</p>
          </div>
          <div className="glass rounded-xl border border-border/40 bg-slate-50/50 p-3 backdrop-blur-sm dark:bg-slate-900/50">
            <p className="text-2xl font-bold text-slate-500">
              {data.filter((o: any) => !o.isVerified).length}
            </p>
            <p className="text-xs text-muted-foreground">{t("stats.pendingUnverified")}</p>
          </div>
        </div>
      )}

      {isMobile ? (
        isLoading ? (
          <div className="flex flex-col space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">{data?.map(renderMobileCard)}</div>
        )
      ) : isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}
    </div>
  );
}
