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
  admingetUsers,
  banUser,
  unbanUser,
} from "@/lib/actions/user.actions";
import UserAlertDialog from "./admin-alert-dialog";

import { useTranslations } from "next-intl";

export default function UsersAdministration() {
  const t = useTranslations("workAdministration");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isLoading, data, error } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const orders = await admingetUsers();
      return orders;
    },
  });
  const columns = [
    { header: t("users.table.id"), accessor: "_id" },
    { header: t("users.table.email"), accessor: "email" },
    { header: t("users.table.username"), accessor: "username" },
    {
      header: t("users.table.role"),
      accessor: "role",
      cell: (value: string) =>
        value && value !== "" ? (
          <Badge variant="secondary">{value}</Badge>
        ) : (
          <Badge>user</Badge>
        ),
    },
    {
      header: t("users.table.memberSince"),
      accessor: "createdAt",
      cell: (value: Date) => (
        <span className="text-xs text-gray-400">
          {formatDateTime(value).dateTime}
        </span>
      ),
    },
    {
      header: t("users.table.details"),
      accessor: "root",
      align: "right" as const,
      cell: (value: any) => (
        <UserAlertDialog
          user={value}
          onBanUser={banUser}
          onUnbanUser={unbanUser}
        />
      ),
    },
  ];

  const renderMobileCard = (item: any) => (
    <MobileCard
      key={item.id}
      title={item.name}
      subtitle={`ID: ${item._id}`}
      badge={item.role}
      details={[
        { label: "", value: item.username },
        { label: t("users.table.role"), value: item.role || "user", align: "right" },
      ]}
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-xs ">
            {formatDateTime(item.createdAt).dateTime}
          </span>
          <UserAlertDialog
            user={item}
            onBanUser={banUser}
            onUnbanUser={unbanUser}
          />
        </div>
      }
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">
          {t("users.title")}
        </h2>
        <Search placeholder={t("common.search")} />
      </div>
      <pre></pre>
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
