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
          variant="outline"
          size="icon"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-10 glass-control border-white/10 rounded-xl shrink-0 transition-all duration-300 hover:shadow-elite-glow hover:scale-110 active:scale-95"
        >
          <SearchIcon className="h-4 w-4 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 rounded-2xl glass-panel border-white/10 shadow-elite-soft animate-in zoom-in-95 duration-200 overflow-hidden" align="start">
        <Command className="bg-transparent font-outfit">
          <CommandInput 
            placeholder={t("category")} 
            className="h-12 border-b border-white/10 bg-transparent text-white placeholder:text-slate-500 focus:ring-0" 
          />
          <CommandList className="max-h-[300px] overflow-y-auto no-scrollbar py-2">
            <CommandEmpty className="py-6 text-center text-sm text-slate-500">{t("all")}</CommandEmpty>
            <CommandGroup className="px-2">
              {CATEGORY_KEYS.map((key) => (
                <CommandItem
                  key={key}
                  value={t(key)}
                  onSelect={() => onSelectCategory(key)}
                  className="rounded-xl px-3 py-2 text-slate-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      currentCategory === key ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="font-semibold text-sm">{t(key)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
