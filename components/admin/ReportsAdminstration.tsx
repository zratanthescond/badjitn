"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

import MobileCard from "@/components/shared/mobile-card";
import DataTable from "@/components/shared/data-table";

import { Badge } from "../ui/badge";
import Search from "../shared/Search";
import { formatDateTime } from "@/lib/utils";
import TableSkeleton from "../shared/table-skeleton";
import { useQuery } from "@tanstack/react-query";

import { CardSkeleton } from "./CardSkeleton";
import {
  admingetReports,
  approvePublisher,
  rejectPublisher,
} from "@/lib/actions/user.actions";
import UserAlertDialog from "./admin-alert-dialog";

export default function ReportsAdminstration() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isPending, data, error } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const orders = await admingetReports();

      return orders;
    },
  });
  const renderMobileCard = (item: any) => (
    <MobileCard
      key={item.id}
      title={item.name}
      subtitle={`ID: ${item._id}`}
      badge={item.role}
      details={[
        { label: "", value: item.username },
        { label: "Publisher", value: item.publisher, align: "right" },
      ]}
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-xs ">
            {formatDateTime(item.createdAt).dateTime}
          </span>
          <UserAlertDialog
            user={item}
            onApprovePublisherRequest={approvePublisher}
            onRejectPublisherRequest={rejectPublisher}
          />
        </div>
      }
    />
  );
  const columns = [
    { header: "ID", accessor: "_id" },
    {
      header: "Event",
      accessor: "root",
      cell: (value: any) => (
        <div className="truncate text-ellipsis max-w-xs ">
          {value?.eventId?.title}
        </div>
      ),
    },

    {
      header: "Reporter",
      accessor: "root",
      cell: (value: any) => (
        <Badge variant="secondary">
          {value?.userId?.firstName + " " + value?.userId?.lastName}
        </Badge>
      ),
    },
    {
      header: "Cause",
      accessor: "cause",
      cell: (value: string) => (
        <div className="truncate line-clamp-1 max-x-md text-ellipsis">
          {value}
        </div>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      cell: (value: Date) => (
        <span className="text-xs text-gray-400">
          {formatDateTime(value).dateTime}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      align: "right",
      cell: (value: string) => (
        <Badge
          className={`${
            value === "pending"
              ? "bg-yellow-400"
              : value === "approved"
              ? "bg-green-400"
              : "bg-red-400"
          }`}
        >
          {value}
        </Badge>
      ),
    },
    {
      header: "Details",
      accessor: "root",
      align: "right",
      cell: (value: any) => <div></div>,
    },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">
          Order Administration
        </h2>
        <Search placeholder="Search orders..." />
      </div>

      {isMobile ? (
        isPending ? (
          <div className="flex flex-col space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">{data.map(renderMobileCard)}</div>
        )
      ) : isPending ? (
        <TableSkeleton />
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
