"use client";

import { useTransition } from "react";
import { CheckIcon, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { setUserLocale } from "../../services/locale";
import { Locale } from "../../i18n/config";

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    const locale = value as Locale;
    // alert(locale);
    startTransition(() => {
      setUserLocale(locale);
    });
  };

  return (
    <div className="relative">
      <Select defaultValue={defaultValue} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "w-[40px] h-[40px] justify-center rounded-full border border-input bg-background p-2 transition-colors hover:bg-muted",
            isPending && "pointer-events-none opacity-60"
          )}
          aria-label={label}
        >
          <Languages className="" />
        </SelectTrigger>

        <SelectContent align="end" className="min-w-[8rem]">
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                <span>{item.label}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
