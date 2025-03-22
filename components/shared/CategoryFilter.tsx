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
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
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
    <ScrollArea className="w-full glass rounded-full whitespace-nowrap p-1  ">
      <Button
        variant={"secondary"}
        key={uuidv4()}
        size={"lg"}
        className="select-item p-regular-14 m-1  text-semibold rounded-full "
        onClick={() => onSelectCategory("For you")}
      >
        <span className="capitalize font-bold "> For you</span>
      </Button>
      {categories.map((category) => (
        <Button
          variant={"secondary"}
          key={category._id}
          size={"lg"}
          className="select-item p-regular-14 m-1  text-semibold rounded-full "
          onClick={() => onSelectCategory(category.name)}
        >
          <span className="capitalize font-bold "> {category.name}</span>
        </Button>
      ))}

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryFilter;
