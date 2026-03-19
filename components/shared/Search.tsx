"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Search as SearchIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";

const Search = ({
  placeholder = "Search title...",
  slim = false,
  className,
}: {
  placeholder?: string;
  slim?: boolean;
  className?: string;
}) => {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("homePage");
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentQuery = searchParams.get("query") || "";
      if (query === currentQuery) return; // Only push if changed

      let newUrl = "";

      if (query) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: query,
        });
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ["query"],
        });
      }

      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchParams, router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "glass-control border-white/10 rounded-2xl transition-all duration-300 hover:shadow-elite-glow hover:scale-105 active:scale-95",
            slim ? "min-h-[46px] md:px-4" : "min-h-[54px] md:px-6",
            className
          )}
        >
          <div className={cn("flex items-center", slim ? "gap-2" : "gap-3")}>
            <SearchIcon className="w-4 h-4 text-primary" />
            {query.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="font-outfit font-semibold text-white">{query}</span>
                <div
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setQuery("");
                  }}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-3 h-3 text-slate-400 hover:text-white" />
                </div>
              </div>
            ) : (
              <span className="hidden md:block font-outfit font-semibold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {t("search")}
              </span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-2 glass-panel border-white/10 shadow-elite-soft animate-in zoom-in-95 duration-200">
        <div className="flex items-center w-full overflow-hidden rounded-xl bg-white/5 border border-white/5">
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="font-outfit text-sm border-0 w-full bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Search;
