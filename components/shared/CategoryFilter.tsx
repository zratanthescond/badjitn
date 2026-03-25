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
import { CATEGORY_KEYS } from "@/constants";
import { CategorySearch } from "./CategorySearch";

const CategoryFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("category");

  const currentCategory = searchParams.get("category") || "all";

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
    <div className="relative flex-1 flex items-center w-full group">
      {/* Scroll Buttons */}
      <Button
        onClick={() => scrollByAmount(-200)}
        className="absolute -left-2 top-1/2 z-30 hidden h-8 w-8 -translate-y-1/2 rounded-full glass-control border-white/10 shadow-elite-soft transition-all duration-300 hover:scale-110 active:scale-95 group-hover:flex"
        variant="ghost"
        size="icon"
      >
        <ChevronLeft className="h-4 w-4 text-white" />
      </Button>

      <Button
        onClick={() => scrollByAmount(200)}
        className="absolute right-0 top-1/2 z-30 hidden h-8 w-8 -translate-y-1/2 rounded-full glass-control border-white/10 shadow-elite-soft transition-all duration-300 hover:scale-110 active:scale-95 group-hover:flex"
        variant="ghost"
        size="icon"
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </Button>

      {/* Scrollable Category Row */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto scroll-smooth items-center no-scrollbar w-full py-1"
      >
        {/* Subtle Edge Gradients handled by main pill or similar */}
        
        {CATEGORY_KEYS.map((key) => {
          const isActive = currentCategory === key;
          return (
            <Button
              variant={isActive ? "default" : "ghost"}
              key={key}
              size="sm"
              className={clsx(
                "rounded-xl px-5 py-2 text-xs font-bold font-outfit uppercase tracking-widest whitespace-nowrap transition-all duration-300 hover:scale-105 active:scale-95",
                isActive 
                  ? "bg-primary text-white shadow-elite-glow ring-1 ring-primary/20" 
                  : "glass-control border-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
              onClick={() => onSelectCategory(key)}
            >
              {t.has(key) ? t(key) : key}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
