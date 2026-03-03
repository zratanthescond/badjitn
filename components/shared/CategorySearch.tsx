"use client";

import * as React from "react";
import { Check, Search as SearchIcon } from "lucide-react";
import { cn, formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CATEGORY_KEYS } from "@/constants";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

export function CategorySearch() {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("category");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";

  const onSelectCategory = (key: string) => {
    let newUrl = "";

    if (key && key !== "all") {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "category",
        value: key,
      });
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ["category"],
      });
    }

    router.push(newUrl, { scroll: false });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-9 glass rounded-full shrink-0 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm border border-slate-200/50 dark:border-slate-700/50"
        >
          <SearchIcon className="h-4 w-4 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 rounded-xl glass border-none overflow-hidden" align="end">
        <Command className="bg-transparent">
          <CommandInput placeholder={t("category")} className="h-9" />
          <CommandList className="max-h-[300px] overflow-y-auto no-scrollbar">
            <CommandEmpty>{t("all")}</CommandEmpty>
            <CommandGroup>
              {CATEGORY_KEYS.map((key) => (
                <CommandItem
                  key={key}
                  value={t(key)}
                  onSelect={() => onSelectCategory(key)}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentCategory === key ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {t(key)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
