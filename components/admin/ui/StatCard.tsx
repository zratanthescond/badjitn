import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatAccent = "blue" | "green" | "amber" | "red" | "neutral";

const ACCENT_CLASSES: Record<StatAccent, string> = {
  blue: "bg-admin-accent-soft text-admin-accent-soft-foreground",
  green: "bg-admin-success-soft text-admin-success",
  amber: "bg-admin-warning-soft text-admin-warning",
  red: "bg-admin-critical-soft text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

const PROGRESS_CLASSES: Record<StatAccent, string> = {
  blue: "bg-primary",
  green: "bg-admin-success",
  amber: "bg-admin-warning",
  red: "bg-destructive",
  neutral: "bg-foreground/60",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: StatAccent;
  hint?: ReactNode;
  /** 0-100. When set, renders a thin progress bar instead of `hint`. */
  progress?: number;
  isRTL?: boolean;
  className?: string;
}

/**
 * A single KPI tile. Shared by every tab of the `/orders` backoffice so the
 * "total / breakdown" summary line always looks and behaves the same way,
 * instead of being hand-rolled per tab.
 */
export function StatCard({
  label,
  value,
  icon,
  accent = "blue",
  hint,
  progress,
  isRTL,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5",
        className
      )}
    >
      <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse")}>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              ACCENT_CLASSES[accent]
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="font-outfit text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-[26px]">
        {value}
      </div>
      {progress != null ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", PROGRESS_CLASSES[accent])}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      ) : hint ? (
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs text-muted-foreground",
            isRTL && "flex-row-reverse"
          )}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export default StatCard;
