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
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategotiesWithEventsCount,
  updateCategory,
} from "@/lib/actions/category.actions";
import { string } from "zod";
import { startTransition, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit, Trash } from "lucide-react";

import { useTranslations } from "next-intl";

export default function CategorieAdministration() {
  const t = useTranslations("workAdministration");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [newCategory, setNewCategory] = useState<string>("");
  const { isLoading, data, error, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const orders = await getCategotiesWithEventsCount();
      return orders;
    },
  });
  const [categoryId, setCategoryId] = useState<string>("");
  const [type, setType] = useState<string>("create");
  const [open, setOpen] = useState(false);
  const columns = [
    { header: t("categories.table.id"), accessor: "_id" },
    {
      header: t("categories.table.title"),
      accessor: "name",
      cell: (value: string) =>
        value && value !== "" ? (
          <Badge variant="secondary">{value}</Badge>
        ) : (
          <Badge>user</Badge>
        ),
    },
    {
      header: t("categories.table.events"),
      accessor: "eventCount",

      cell: (value: string) =>
        value && value !== "" ? (
          <Badge variant="secondary">{value}</Badge>
        ) : (
          <Badge variant={"secondary"}>0</Badge>
        ),
    },
    {
      header: t("categories.table.actions"),
      accessor: "root",
      align: "right",
      cell: (value: any) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant={"destructive"}
            size={"icon"}
            onClick={() => {
              startTransition(() => {
                deleteCategory(value._id)
                  .then(() => {
                    refetch();
                  })
                  .catch((error) => {
                    toast({
                      title: t("common.error"),
                      description: t("common.processingError"),
                      variant: "destructive",
                    });
                  });
              });
            }}
            className="rounded-full"
          >
            <Trash />
          </Button>
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => {
              startTransition(() => {
                setOpen(true);
                setNewCategory(value.name);
                setCategoryId(value._id);
                setType("edit");
              });
            }}
            className="rounded-full"
          >
            <Edit />
          </Button>
        </div>
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
        { label: "", value: item.name },
        { label: "Events", value: String(item.eventCount || 0), align: "right" },
      ]}
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-xs ">
            {item._id}
          </span>
        </div>
      }
    />
  );
  const handleAddCategory = () => {
    setOpen(false);
    createCategory({
      categoryName: newCategory.trim(),
    })
      .then((category) => {
        refetch();
        setNewCategory("");
      })
      .catch((error) => {
        toast({
          title: t("common.error"),
          description: t("common.processingError"),
          variant: "destructive",
        });
      });
  };
  const handleEditCategory = () => {
    setOpen(false);
    updateCategory({
      id: categoryId,
      name: newCategory.trim(),
    })
      .then((category) => {
        refetch();
        setNewCategory("");
      })
      .catch((error) => {
        toast({
          title: t("common.error"),
          description: t("common.processingError"),
          variant: "destructive",
        });
      });
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">
          {t("categories.title")}
        </h2>
        <AlertDialog
          open={open}
          onOpenChange={(open) => {
            if (!open) {
              setNewCategory("");
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              onClick={() => {
                setOpen(true);
                setType("create");
              }}
              variant={"outline"}
              className=" rounded-full"
            >
              {t("categories.add")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass backdrop-blur-lg w-96 self-center rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("categories.new")}</AlertDialogTitle>
              <AlertDialogDescription>
                <Input
                  type="text"
                  placeholder={t("categories.name")}
                  className="input-field mt-3"
                  onChange={(e) => setNewCategory(e.target.value)}
                  value={newCategory}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setOpen(false)}
                className="bg-pink-500 rounded-full"
              >
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-green-500 rounded-full"
                onClick={() =>
                  startTransition(
                    type === "edit" ? handleEditCategory : handleAddCategory
                  )
                }
              >
                {type === "edit" ? t("common.edit") : t("common.add")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Search placeholder={t("common.search")} />
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
