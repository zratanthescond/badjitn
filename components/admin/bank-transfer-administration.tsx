"use client";

import { useState } from "react";
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
import { formatDateTime } from "@/lib/utils";
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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

interface BankTransferAdministrationProps {
    eventTitle: string;
    searchString: string;
    userId: string;
}

export default function BankTransferAdministration({
    eventTitle,
    searchString,
    userId,
}: BankTransferAdministrationProps) {
    const [statusFilter, setStatusFilter] = useState<
        "all" | "pending" | "approved" | "rejected"
    >("all");
    const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const isMobile = useMediaQuery("(max-width: 768px)");

    // Fetch bank transfers
    const { isPending, data, error } = useQuery({
        queryKey: ["bankTransfers", eventTitle, statusFilter, searchString],
        queryFn: () => getBankTransfers({
            eventTitle,
            status: statusFilter,
            searchString,
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
        }) => verifyBankTransfer({
            transferId,
            action,
            verifiedBy: userId,
            rejectionReason: reason,
        }),
        onSuccess: (result) => {
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                });
                queryClient.invalidateQueries({ queryKey: ["bankTransfers"] });
                setSelectedTransfer(null);
                setRejectionReason("");
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to verify bank transfer",
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
                title: "Error",
                description: "Please provide a rejection reason",
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

        return (
            <Badge variant="outline" className={variant?.className}>
                <Icon className="mr-1 h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const columns = [
        {
            header: "Date",
            accessor: "createdAt",
            cell: (value: Date) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDateTime(value).dateOnly}</span>
                </div>
            ),
        },
        {
            header: "Buyer",
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
            header: "Amount",
            accessor: "amount",
            cell: (value: number) => (
                <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                        €{value.toFixed(2)}
                    </span>
                </div>
            ),
        },
        {
            header: "Transfer ID",
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
            header: "Screenshot",
            accessor: "screenshotUrl",
            cell: (value: string | null) =>
                value ? (
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                ),
        },
        {
            header: "Status",
            accessor: "status",
            cell: (value: string) => getStatusBadge(value),
        },
        {
            header: "Actions",
            accessor: "root",
            align: "right" as const,
            cell: (value: any) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTransfer(value)}
                >
                    <Eye className="h-4 w-4 mr-1" />
                    View
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
                            €{item.amount.toFixed(2)}
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
                        <span>Screenshot attached</span>
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
                    View Details
                </Button>
            </CardFooter>
        </Card>
    );

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
                                Bank Transfer Verification
                            </h2>
                            <p className="text-muted-foreground">
                                Review and verify bank transfer payments
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Search placeholder="Search by buyer or transfer ID..." />
                        <Button variant="outline" size="icon" title="Filter">
                            <Filter className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" title="Export">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats Row */}
                {data && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
                        <div className="glass bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/20">
                                    <Landmark className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{data.totalCount}</p>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-yellow-500/20">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {data.data.filter((t: any) => t.status === "pending").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/20">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {data.data.filter((t: any) => t.status === "approved").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Approved</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass bg-gradient-to-r from-red-500/10 to-rose-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-500/20">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {data.data.filter((t: any) => t.status === "rejected").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Rejected</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
                                No bank transfers found
                            </h3>
                            <p className="text-muted-foreground">
                                No bank transfer payments to display
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
                            No bank transfers found
                        </h3>
                        <p className="text-muted-foreground">
                            No bank transfer payments to display
                        </p>
                    </div>
                )}
            </div>

            {/* Verification Dialog */}
            <Dialog
                open={!!selectedTransfer}
                onOpenChange={() => setSelectedTransfer(null)}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-pink-600" />
                            Bank Transfer Details
                        </DialogTitle>
                        <DialogDescription>
                            Review and verify this bank transfer payment
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTransfer && (
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status:</span>
                                {getStatusBadge(selectedTransfer.status)}
                            </div>

                            {/* Order Information */}
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Order Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Buyer:</span>
                                        <p className="font-medium">{selectedTransfer.buyerName}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Amount:</span>
                                        <p className="font-semibold text-green-600">
                                            €{selectedTransfer.amount.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Event:</span>
                                        <p className="font-medium">{selectedTransfer.eventTitle}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Date:</span>
                                        <p className="font-medium">
                                            {formatDateTime(selectedTransfer.createdAt).dateTime}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Transfer ID */}
                            {selectedTransfer.transferId && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Transfer ID</h3>
                                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                        <code className="text-sm font-mono">
                                            {selectedTransfer.transferId}
                                        </code>
                                    </div>
                                </div>
                            )}

                            {/* Screenshot */}
                            {selectedTransfer.screenshotUrl && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Transfer Screenshot
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <Zoom>
                                            <img
                                                src={selectedTransfer.screenshotUrl}
                                                alt="Bank transfer screenshot"
                                                className="w-full h-auto"
                                            />
                                        </Zoom>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason (if rejected) */}
                            {selectedTransfer.status === "rejected" &&
                                selectedTransfer.rejectionReason && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-red-600">
                                            Rejection Reason
                                        </h3>
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <p className="text-sm">{selectedTransfer.rejectionReason}</p>
                                        </div>
                                    </div>
                                )}

                            {/* Rejection Reason Input (for pending) */}
                            {selectedTransfer.status === "pending" && (
                                <div className="space-y-2">
                                    <Label htmlFor="rejection-reason">
                                        Rejection Reason (optional)
                                    </Label>
                                    <Textarea
                                        id="rejection-reason"
                                        placeholder="Enter reason for rejection..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {selectedTransfer?.status === "pending" ? (
                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setSelectedTransfer(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleReject}
                                    disabled={verifyMutation.isPending}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={handleApprove}
                                    disabled={verifyMutation.isPending}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => setSelectedTransfer(null)}>Close</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
