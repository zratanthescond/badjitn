"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { setUserLocale } from "../../services/locale";
import { Locale } from "../../i18n/config";

type Props = {
  defaultValue: string;
  items: Array<{
    value: string;
    label: string;
    flagSrc: string;
    flagAlt: string;
  }>;
  label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    const locale = value as Locale;
    // alert(locale);
    startTransition(async () => {
      await setUserLocale(locale);
      router.refresh();
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

        <SelectContent align="end" className="min-w-[11rem]">

          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <span className="flex items-center gap-2">
                <Image
                  src={item.flagSrc}
                  alt={item.flagAlt}
                  width={18}
                  height={12}
                  className="h-3 w-[18px] rounded-[2px] object-cover"
                />
                <span>{item.label}</span>
              </span>
            </SelectItem>
          ))}

        </SelectContent>
      </Select>
    </div>
  );
}
