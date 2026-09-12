"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminColumn {
  /** Stable identifier used to track sort state. Defaults to `accessor`. */
  key?: string;
  header: string;
  /** Same contract as components/shared/data-table.tsx — "root" passes the whole row. */
  accessor: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  cell?: (value: any, row: any) => ReactNode;
}

interface AdminDataTableProps {
  columns: AdminColumn[];
  data: any[];
  sortKey?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (key: string) => void;
  onRowClick?: (row: any) => void;
  getRowId?: (row: any, index: number) => string | number;
  isRTL?: boolean;
  className?: string;
}

/**
 * A restyled, optionally-sortable table for the admin backoffice. Keeps the
 * same `accessor`/"root" contract as components/shared/data-table.tsx (which
 * is left untouched — it's also used by the /cockpit screens) so migrating a
 * tab's column config only means changing the import.
 */
export function AdminDataTable({
  columns,
  data,
  sortKey,
  sortDir = "asc",
  onSortChange,
  onRowClick,
  getRowId,
  isRTL,
  className,
}: AdminDataTableProps) {
  const alignClass = (align?: AdminColumn["align"]) =>
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            {columns.map((column, index) => {
              const key = column.key || column.accessor || String(index);
              const isActive = sortKey === key;
              return (
                <th
                  key={index}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                    alignClass(column.align),
                    column.sortable && "cursor-pointer select-none hover:text-foreground"
                  )}
                  onClick={column.sortable ? () => onSortChange?.(key) : undefined}
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-1",
                      column.align === "right" && "flex-row-reverse"
                    )}
                  >
                    {column.header}
                    {column.sortable &&
                      (isActive ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      ))}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, rowIndex) => (
            <tr
              key={getRowId ? getRowId(row, rowIndex) : rowIndex}
              className={cn(
                "transition-colors hover:bg-muted/50",
                onRowClick && "cursor-pointer"
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={cn("px-4 py-3 align-middle text-sm text-foreground", alignClass(column.align))}
                >
                  {column.cell
                    ? column.cell(
                        column.accessor === "root" ? row : row[column.accessor],
                        row
                      )
                    : column.accessor
                      ? row[column.accessor]
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDataTable;
