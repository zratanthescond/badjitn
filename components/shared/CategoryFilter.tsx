"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCategories } from "@/lib/actions/category.actions";
import { ICategory } from "@/lib/database/models/category.model";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

const CategoryFilter = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories();

      categoryList && setCategories(categoryList as ICategory[]);
    };

    getCategories();
  }, []);

  const onSelectCategory = (category: string) => {
    let newUrl = "";

    if (category && category !== "All") {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "category",
        value: category,
      });
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ["category"],
      });
    }

    router.push(newUrl, { scroll: false });
  };

  return (
    <ScrollArea className="w-full rounded-full whitespace-nowrap glass py-2 backdrop:blur ">
      {categories.map((category) => (
        <Badge
          key={category._id}
          className="select-item p-regular-14 mx-2 glass text-bold font-size-14"
          onClick={() => onSelectCategory(category.name)}
        >
          <span className="capitalize font-bold text-purple-50">
            {" "}
            {category.name}
          </span>
        </Badge>
      ))}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryFilter;
