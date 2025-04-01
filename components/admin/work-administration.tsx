"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

import MobileCard from "@/components/shared/mobile-card";
import DataTable from "@/components/shared/data-table";

import { Badge } from "../ui/badge";
import { useState } from "react";
import Search from "../shared/Search";
import { getUserWorkByEventId } from "@/lib/actions/user.actions";
import { useQuery } from "@tanstack/react-query";
import TableSkeleton from "../shared/table-skeleton";
import { extractFileDetails, formatDateTime } from "@/lib/utils";
import { CheckCheck, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import FileViewer from "react-file-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Link from "next/link";
import { formatDate } from "date-fns";
import { WorkDetailsDialog } from "./WorkDetailsDialog";
export default function WorkAdministration({
  eventId,
  searchString,
}: {
  eventId: string;
  searchString: string;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [workData, setWorkData] = useState([]);
  const { isPending, data, error } = useQuery({
    queryKey: ["works", eventId, searchString],
    queryFn: async () => {
      const response = await getUserWorkByEventId({ eventId, searchString });
      return response;
    },
  });
  const columns = [
    { header: "ID", accessor: "_id" },
    { header: "Title", accessor: "eventTitle" },
    { header: "User", accessor: "buyer" },

    {
      header: "Submitted",
      accessor: "createdAt",
      cell: (value: Date) => formatDateTime(value).dateTime,
    },
    {
      header: "Actions",
      accessor: "root",
      align: "right",
      cell: (value) => <WorkDetailsDialog value={value} />,
    },
  ];

  const renderMobileCard = (item: any) => (
    <MobileCard
      key={item.id}
      title={item.eventTitle}
      subtitle={`ID: ${item._id}`}
      badge={"html"}
      details={[{ label: "User", value: item.buyer }]}
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-xs text-gray-400">
            {formatDateTime(item.createdAt).dateTime}
          </span>
          <div className="flex gap-2">
            <WorkDetailsDialog value={item} />
          </div>
        </div>
      }
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">
          Work Administration
        </h2>
        <Search placeholder="Search works..." />
      </div>

      {isMobile ? (
        isPending ? (
          <TableSkeleton />
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
