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
  adminDiscardReport,
  admingetReports,
  approvePublisher,
  rejectPublisher,
} from "@/lib/actions/user.actions";
import UserAlertDialog from "./admin-alert-dialog";
import { ReportAlertDialog } from "./report-alert-dialog";
import { tr } from "date-fns/locale";
import {
  adminBanEventCreator,
  restrictEvent,
} from "@/lib/actions/event.actions";
import { on } from "events";
import { useEffect } from "react";

export default function ReportsAdminstration() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isLoading, data, error, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const orders = await admingetReports();

      return orders;
    },
  });

  const onDiscardReport = async (reportId: string) => {
    try {
      await adminDiscardReport(reportId);
    } catch (error) {
      console.error("Failed to discard report:", error);
    }
  };
  const onHideEvent = async (eventId: string) => {
    try {
      await restrictEvent(eventId);
    } catch (error) {
      console.error("Failed to hide event:", error);
    }
  };
  const onBanCreator = async (eventId: string) => {
    try {
      await adminBanEventCreator(eventId);
    } catch (error) {
      console.error("Failed to hide event:", error);
    }
  };
  const renderMobileCard = (item: any) => (
    <MobileCard
      key={item.id}
      title={item?.eventId?.title}
      subtitle={`ID: ${item._id}`}
      badge={item.status}
      details={[
        {
          label: "Reporter",
          value: item?.userId?.firstName + " " + item?.userId?.lastName,
        },
        {
          label: "Creator",
          value:
            item?.eventId?.organizer?.firstName +
            " " +
            item?.eventId?.organizer?.lastName,
          align: "right",
        },
        { label: "Cause", value: item?.cause, align: "right" },
      ]}
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-xs ">
            {formatDateTime(item?.createdAt).dateTime}
          </span>
          <ReportAlertDialog
            onDiscardReport={onDiscardReport}
            refetch={refetch}
            event={item}
            onHideEvent={onHideEvent}
            onBanCreator={onBanCreator}
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
              : value === "resolved"
              ? "bg-green-400"
              : "bg-red-400"
          }`}
        >
          {value}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: "root",
      align: "right",
      cell: (value: any) => (
        <ReportAlertDialog
          onDiscardReport={onDiscardReport}
          refetch={refetch}
          event={value}
          onHideEvent={onHideEvent}
          onBanCreator={onBanCreator}
        />
      ),
    },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">
          Reports Administration
        </h2>
        <Search placeholder="Search reports..." />
      </div>

      {isMobile ? (
        isLoading ? (
          <div className="flex flex-col space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">{data.map(renderMobileCard)}</div>
        )
      ) : isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
