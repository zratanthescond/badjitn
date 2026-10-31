"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isRTL?: boolean;
  className?: string;
  labels?: {
    showing?: (from: number, to: number, total: number) => string;
    perPage?: string;
  };
}

function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push("…");
    result.push(p);
  });
  return result;
}

/**
 * Client-side pagination control shared by every `/orders` tab. Purely
 * presentational — callers own the current page/pageSize state and slice
 * their own already-filtered array.
 */
export function AdminPagination({
  page,
  pageSize,
  total,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  isRTL,
  className,
  labels,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(total, safePage * pageSize);
  const showing =
    labels?.showing?.(from, to, total) ?? `Affichage ${from}–${to} sur ${total}`;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row",
        isRTL && "sm:flex-row-reverse",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 text-xs text-muted-foreground",
          isRTL && "flex-row-reverse"
        )}
      >
        <span className="tabular-nums">{showing}</span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-7 rounded-md border border-input bg-background px-1.5 text-xs"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} {labels?.perPage ?? "/ page"}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {buildPageList(safePage, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              type="button"
              variant={p === safePage ? "default" : "ghost"}
              size="sm"
              className="h-8 min-w-8 px-2"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default AdminPagination;
