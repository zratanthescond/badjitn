"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn, formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export function DatePickerWithPresets() {
  const searchParams = useSearchParams();
  const initalDateString = searchParams.get("date") || null;
  const initialDate = initalDateString ? new Date(initalDateString) : null;
  const [date, setDate] = React.useState<Date | null>(initialDate);
  const router = useRouter();
  const t = useTranslations("datePicker");
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let newUrl = "";

      if (date) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "date",
          value: format(date, "yyyy-MM-dd"),
        });
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ["date"],
        });
      }

      router.push(newUrl, { scroll: false });
      //alert("Country changed to: " + newUrl);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [date, searchParams, router]);

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant={"ghost"}
          className="glass min-h-[54px] rounded-full flex-1 md:w-52 w-full "
        >
          <CalendarIcon className="mr-2 h-4 w-4 " />
          {date ? (
            <>
              <Button
                variant="ghost"
                size={"icon"}
                onClick={() => setDate(null)}
                className="mr-0.5"
              >
                <X className="h-4 w-4" />
              </Button>{" "}
              <span>{format(date, "PPP")}</span>
            </>
          ) : (
            <span>{t("pickadate")}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="select-item p-regular-14 rounded-3xl w-full md:w-72 flex flex-col gap-2">
        <Select
          onValueChange={(value) =>
            setDate(addDays(new Date(), parseInt(value)))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("select")} />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="0">{t("today")}</SelectItem>
            <SelectItem value="1">{t("tomorrow")}</SelectItem>
            <SelectItem value="3">{t("in3days")}</SelectItem>
            <SelectItem value="7">{t("inAWeek")}</SelectItem>
            <SelectItem value="30">{t("inAMonth")}</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border ">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
