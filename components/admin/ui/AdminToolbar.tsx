"use client";

import type { ReactNode } from "react";
import { Search as SearchIcon, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminToolbarProps {
  /** Controlled search value. Omit the search field entirely by leaving both undefined. */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Filter selects (or any controls) rendered next to the search field. */
  filters?: ReactNode;
  /** e.g. "24 résultats". */
  resultLabel?: string;
  onReset?: () => void;
  resetLabel?: string;
  /** Secondary/primary action buttons, right-aligned. */
  actions?: ReactNode;
  isRTL?: boolean;
  className?: string;
}

/**
 * The filter bar shared by every `/orders` tab: a search input, a row of
 * filter controls, a live result count with a reset button, and a slot for
 * the tab's action buttons (export, import, scan...). Replaces the
 * decorative, non-functional "Filter" icon button that used to sit here.
 */
export function AdminToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  resultLabel,
  onReset,
  resetLabel = "Réinitialiser les filtres",
  actions,
  isRTL,
  className,
}: AdminToolbarProps) {
  const hasSearch = onSearchChange !== undefined;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 sm:p-4",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
          isRTL && "md:flex-row-reverse"
        )}
      >
        <div
          className={cn(
            "flex flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center",
            isRTL && "sm:flex-row-reverse"
          )}
        >
          {hasSearch && (
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <SearchIcon
                className={cn(
                  "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  isRTL ? "right-3" : "left-3"
                )}
              />
              <Input
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn("h-10 bg-muted/60", isRTL ? "pr-9 text-right" : "pl-9")}
              />
            </div>
          )}
          {filters}
        </div>
        <div
          className={cn(
            "flex items-center gap-2 whitespace-nowrap text-xs text-muted-foreground",
            isRTL && "flex-row-reverse"
          )}
        >
          {resultLabel && <span>{resultLabel}</span>}
          {onReset && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onReset}
              title={resetLabel}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      {actions && (
        <div className={cn("flex flex-wrap items-center gap-2", isRTL && "flex-row-reverse")}>
          {actions}
        </div>
      )}
    </div>
  );
}

export default AdminToolbar;
