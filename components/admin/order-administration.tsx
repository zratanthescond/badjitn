"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

import MobileCard from "@/components/shared/mobile-card";
import DataTable from "@/components/shared/data-table";

import { Badge } from "../ui/badge";
import { Suspense, use, useEffect, useState } from "react";
import Search from "../shared/Search";
import { getOrdersByEvent } from "@/lib/actions/order.actions";
import { toast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import TableSkeleton from "../shared/table-skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { ScrollBar, ScrollArea } from "../ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Check } from "lucide-react";
import OrderDetailsDialog from "./OrderDetailsDialog";
import { CardSkeleton } from "./CardSkeleton";

const columns = [
  { header: "Order ID", accessor: "_id" },
  { header: "Event Title", accessor: "eventTitle" },
  { header: "Buyer", accessor: "buyer" },
  {
    header: "Ticket Type",
    accessor: "type",
    cell: (value: string) => <Badge variant="secondary">{value}</Badge>,
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
    header: "Amount",
    accessor: "totalAmount",
    align: "right",
  },
  {
    header: "Details",
    accessor: "root",
    align: "right",
    cell: (value: any) => <OrderDetailsDialog value={value} />,
  },
];

export default function OrderAdministration({
  eventId,
  searchString,
}: {
  eventId: string;
  searchString: string;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isPending, data, error } = useQuery({
    queryKey: ["orders", eventId, searchString],
    queryFn: async () => {
      const orders = await getOrdersByEvent({ eventId, searchString });
      return orders;
    },
  });
  const renderMobileCard = (item: any) => (
    <MobileCard
      key={item.id}
      title={item.eventTitle}
      subtitle={`ID: ${item._id}`}
      badge={item.type}
      details={[
        { label: "", value: item.buyer },
        { label: "", value: item.totalAmount, align: "right" },
      ]}
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-xs ">
            {formatDateTime(item.createdAt).dateTime}
          </span>
          <OrderDetailsDialog value={item} />
        </div>
      }
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">
          Order Administration
        </h2>
        <Search placeholder="Search orders..." />
      </div>
      {/* <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre> */}
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
