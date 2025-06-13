"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getAllCategories } from "@/lib/actions/category.actions";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { ICategory } from "@/lib/database/models/category.model";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "next-intl";
import clsx from "clsx";

const CategoryFilter = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("category");

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories();
      if (categoryList) setCategories(categoryList);
      setLoading(false);
    };

    getCategories();
  }, []);

  const onSelectCategory = (category: string) => {
    let newUrl = "";

    if (category && category !== "all") {
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex flex-row px-2 w-full glass md:w-4/6 group rounded-full">
      {/* Scroll Buttons */}
      <Button
        onClick={() => scrollByAmount(-200)}
        className="absolute glass left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow transition group-hover:flex"
        variant="ghost"
        size="icon"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        onClick={() => scrollByAmount(200)}
        className="absolute glass right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow transition group-hover:flex"
        variant="ghost"
        size="icon"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Scrollable Category Row */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scroll-smooth  items-center  no-scrollbar rounded-full w-full"
      >
        <div
          className={`absolute top-0 rounded-l-full bottom-0 left-0 w-20 bg-gradient-to-r from-slate-50/90 via-slate-50/50  dark:from-gray-900/90 dark:via-gray-900/50 dark: to-transparent pointer-events-none z-10 transition-opacity duration-300 
          
          `}
        />

        {/* Right shadow */}
        <div
          className={`absolute top-0 rounded-r-full bottom-0 right-0 w-20 dark:bg-gradient-to-l bg-gradient-to-l from-slate-50/90 via-slate-50/50 dark:from-gray-900/90 dark:via-gray-900/50 dark:to-transparent  pointer-events-none z-10 transition-opacity duration-300 
            opacity-100
          `}
        />
        {loading ? (
          [...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full bg-muted/50" />
          ))
        ) : (
          <>
            <Button
              variant="secondary"
              key={uuidv4()}
              size="sm"
              className="rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap"
              onClick={() => onSelectCategory("For you")}
            >
              {t("forYou")}
            </Button>

            {categories.map((category) => (
              <Button
                variant="secondary"
                key={category._id}
                size="sm"
                className="rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap"
                onClick={() => onSelectCategory(category.name)}
              >
                {t(category.name)}
              </Button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;
