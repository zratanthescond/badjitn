"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

import MobileCard from "../shared/mobile-card";
import DataTable from "../shared/data-table";

import { Badge } from "../ui/badge";
import Search from "../shared/Search";
import { useState } from "react";
import {
  approveCertification,
  getCertificationByEventId,
  rejectCertification,
} from "@/lib/actions/certification.actions";
import TableSkeleton from "../shared/table-skeleton";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { CardSkeleton } from "./CardSkeleton";

export default function CertificationAdministration({
  eventId,
  searchString,
}: {
  eventId: string;
  searchString: string;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isPending, data, error, refetch } = useQuery({
    queryKey: ["certifications", eventId, searchString],
    queryFn: async () => {
      const orders = await getCertificationByEventId({ eventId, searchString });
      return orders;
    },
  });
  const aprove = async (id: string) => {
    const res = await approveCertification(id);
    if (res) {
      refetch();
    }
  };
  const reject = async (id: string) => {
    const res = await rejectCertification(id);
    if (res) {
      refetch();
    }
  };
  const columns = [
    { header: "ID", accessor: "_id" },
    { header: "Certification Title", accessor: "eventTitle" },
    { header: "Applicant", accessor: "buyer" },
    {
      header: "Status",
      accessor: "status",
      cell: (value: string) => (
        <Badge
          className={`text-white capitalize ${
            value === "pending" && "bg-yellow-500 "
          }
          ${value === "approved" && " bg-green-500 "} ${
            value === "rejected" && "bg-red-500 "
          }`}
        >
          {value}
        </Badge>
      ),
    },
    {
      header: "Submitted",
      accessor: "createdAt",
      cell: (value: Date) => formatDateTime(value).dateTime,
    },
    {
      header: "Actions",
      accessor: "root",
      align: "right",
      cell: (value: any) => (
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => reject(value._id)}
            variant="destructive"
            size="sm"
            className="h-8 rounded-full"
          >
            Reject
          </Button>
          <Button
            onClick={() => aprove(value._id)}
            size="sm"
            variant={"outline"}
            className="h-8  rounded-full"
          >
            Approve
          </Button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (item: any) => (
    <MobileCard
      key={item._id}
      title={item.eventTitle}
      subtitle={`ID: ${item._id}`}
      badge={item.status}
      details={[{ label: "Applicant", value: item.buyer }]}
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-xs text-gray-400">
            {formatDateTime(item.createdAt).dateTime}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2  rounded-full"
              onClick={() => reject(item._id)}
            >
              Reject
            </Button>
            <Button
              size="sm"
              className="h-7 px-2  rounded-full"
              onClick={() => aprove(item._id)}
            >
              Approve
            </Button>
          </div>
        </div>
      }
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">
          Certification Administration
        </h2>
        <Search placeholder="Search certifications..." />
      </div>

      {isMobile ? (
        isPending ? (
          <div className="flex flex-col space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="space-y-4">{data.map(renderMobileCard)}</div>
        )
      ) : isPending ? (
        <TableSkeleton />
      ) : (
        <>
          <DataTable columns={columns} data={data} />
        </>
      )}
    </div>
  );
}
