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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useGetEventDates } from "@/hooks/useGetEventDates";
import { useDayRender, DayModifiers } from "react-day-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DayButton = React.forwardRef<HTMLButtonElement, any>(
  ({ calendarRef, ...props }, forwardedRef) => {
    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        // Attach focus ref for DayPicker
        if (typeof calendarRef === "function") calendarRef(node);
        else if (calendarRef && "current" in calendarRef) calendarRef.current = node;

        // Attach tooltip ref
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef && "current" in forwardedRef) forwardedRef.current = node;
      },
      [calendarRef, forwardedRef]
    );

    return <button {...props} ref={setRefs} />;
  }
);
DayButton.displayName = "DayButton";

const CalendarDay = ({ 
  date, 
  displayMonth, 
  modifiers, 
  getEventCountForDate 
}: any) => {
  const calendarRef = React.useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;
  const dayRender = useDayRender(date, displayMonth, calendarRef);

  if (dayRender.isHidden) return null;

  const count = getEventCountForDate(date);
  const { ref: _dayRef, ...buttonProps } = dayRender.buttonProps as any;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DayButton calendarRef={calendarRef} {...buttonProps} />
      </TooltipTrigger>
      {count > 0 && (
        <TooltipContent>
          <p>
            {count}{" "}
            {count > 1 ? "événements programmés" : "événement programmé"}
          </p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export function DatePickerWithPresets({ slim = false }: { slim?: boolean }) {
  const searchParams = useSearchParams();
  const initalDateString = searchParams.get("date") || null;
  const initialDate = initalDateString ? new Date(initalDateString) : undefined;
  const [date, setDate] = React.useState<Date | undefined>(initialDate);
  const router = useRouter();
  const t = useTranslations("datePicker");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const { data: eventDates } = useGetEventDates();

  const eventModifiers: DayModifiers = useMemo(() => {
    if (!eventDates) return { hasEvents: [] };
    const dates = eventDates.map((ed) => {
      const [year, month, day] = ed.date.split("-").map(Number);
      return new Date(year, month - 1, day);
    });
    return { hasEvents: dates };
  }, [eventDates]);

  const getEventCountForDate = useCallback(
    (day: Date) => {
      if (!eventDates) return 0;
      const dateString = format(day, "yyyy-MM-dd");
      return eventDates.find((ed) => ed.date === dateString)?.count || 0;
    },
    [eventDates]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentDateString = searchParams.get("date") || "";
      const selectedDateString = date ? format(date, "yyyy-MM-dd") : "";

      if (selectedDateString === currentDateString) return; // Only push if changed

      let newUrl = "";

      if (date) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "date",
          value: selectedDateString,
        });
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ["date"],
        });
      }

      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [date, searchParams, router]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          className={cn(
            "glass-control border-white/10 rounded-2xl flex-items-center transition-all duration-300 hover:shadow-elite-glow hover:scale-105 active:scale-95",
            slim ? "min-h-[46px] px-3" : "min-h-[54px] px-6",
            "w-full md:w-auto"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 " />
          {date ? (
            <>
              <div
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDate(undefined);
                }}
                className="mr-0.5 p-2 rounded-md hover:bg-black/10 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </div>{" "}
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
          <TooltipProvider>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate as any}
              modifiers={eventModifiers}
              modifiersClassNames={{
                hasEvents:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary font-bold",
              }}
              components={{
                Day: (props: any) => (
                  <CalendarDay
                    {...props}
                    getEventCountForDate={getEventCountForDate}
                  />
                ),
              }}
            />
          </TooltipProvider>
        </div>
      </PopoverContent>
    </Popover>
  );
}
