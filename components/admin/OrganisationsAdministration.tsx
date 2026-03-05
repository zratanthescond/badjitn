"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import MobileCard from "@/components/shared/mobile-card";
import DataTable from "@/components/shared/data-table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Search from "../shared/Search";
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
import { CheckCircle, XCircle, Building2, Shield, Loader2, Globe, Users } from "lucide-react";
import { useState } from "react";

export default function OrganisationsAdministration() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const queryClient = useQueryClient();
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const { isLoading, data, error } = useQuery({
        queryKey: ["admin-organisations"],
        queryFn: async () => {
            const orgs = await adminGetAllOrganisations();
            return orgs;
        },
    });

    const handleToggleVerification = async (orgId: string, orgName: string, currentStatus: boolean) => {
        setTogglingId(orgId);
        try {
            await toggleOrganisationVerification(orgId);
            toast({
                title: currentStatus ? "Verification Removed" : "Organisation Verified",
                description: currentStatus
                    ? `${orgName} has been unverified.`
                    : `${orgName} is now verified and can publish with a trusted badge.`,
            });
            queryClient.invalidateQueries({ queryKey: ["admin-organisations"] });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update verification status.",
                variant: "destructive",
            });
        } finally {
            setTogglingId(null);
        }
    };

    const columns = [
        {
            header: "Organisation",
            accessor: "root",
            cell: (row: any) => (
                <div className="flex items-center gap-2">
                    {row.logo ? (
                        <img src={row.logo} alt={row.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-white" />
                        </div>
                    )}
                    <span className="font-medium">{row.name}</span>
                </div>
            ),
        },
        {
            header: "Creator",
            accessor: "creator",
            cell: (value: any) => (
                <span className="text-sm">
                    {value?.firstName} {value?.lastName}
                </span>
            ),
        },
        {
            header: "Members",
            accessor: "admins",
            cell: (value: any) => (
                <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{value?.length || 1}</span>
                </div>
            ),
        },
        {
            header: "Created",
            accessor: "createdAt",
            cell: (value: Date) => (
                <span className="text-xs text-gray-400">
                    {formatDateTime(value).dateTime}
                </span>
            ),
        },
        {
            header: "Status",
            accessor: "isVerified",
            cell: (value: boolean) => (
                <Badge
                    className={
                        value
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30"
                    }
                >
                    {value ? (
                        <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                        </>
                    ) : (
                        <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Unverified
                        </>
                    )}
                </Badge>
            ),
        },
        {
            header: "Actions",
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
                                    ? "rounded-full text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20"
                                    : "rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
                            }
                            disabled={togglingId === row._id}
                        >
                            {togglingId === row._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            ) : row.isVerified ? (
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                            ) : (
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            )}
                            {row.isVerified ? "Revoke" : "Verify"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {row.isVerified ? "Revoke Verification" : "Verify Organisation"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {row.isVerified
                                    ? `Are you sure you want to remove the verified badge from "${row.name}"? They will lose the trusted publisher status.`
                                    : `Are you sure you want to verify "${row.name}"? This will grant them a trusted publisher badge.`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() =>
                                    handleToggleVerification(row._id, row.name, row.isVerified)
                                }
                                className={
                                    row.isVerified
                                        ? "bg-red-500 hover:bg-red-600 rounded-xl"
                                        : "bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                                }
                            >
                                {row.isVerified ? "Revoke Verification" : "Approve Verification"}
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
            subtitle={`Creator: ${item.creator?.firstName} ${item.creator?.lastName}`}
            badge={item.isVerified ? "Verified" : "Unverified"}
            details={[
                { label: "Members", value: String(item.admins?.length || 1) },
                { label: "Website", value: item.website || "—" },
            ]}
            footer={
                <div className="flex justify-between items-center w-full">
                    <span className="text-xs">
                        {formatDateTime(item.createdAt).dateTime}
                    </span>
                    <Button
                        size="sm"
                        variant={item.isVerified ? "outline" : "default"}
                        className={
                            item.isVerified
                                ? "rounded-full text-red-500 border-red-200"
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
                            "Revoke"
                        ) : (
                            "Verify"
                        )}
                    </Button>
                </div>
            }
        />
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-500" />
                        Organisations Verification
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage organisation publisher badges. Verified organisations display a trusted badge.
                    </p>
                </div>
            </div>

            {/* Stats */}
            {data && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="glass bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-border/40 rounded-xl p-3">
                        <p className="text-2xl font-bold">{data.length}</p>
                        <p className="text-xs text-muted-foreground">Total Organisations</p>
                    </div>
                    <div className="glass bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-700/30 rounded-xl p-3">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {data.filter((o: any) => o.isVerified).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Verified</p>
                    </div>
                    <div className="glass bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border border-border/40 rounded-xl p-3">
                        <p className="text-2xl font-bold text-slate-500">
                            {data.filter((o: any) => !o.isVerified).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Pending / Unverified</p>
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
