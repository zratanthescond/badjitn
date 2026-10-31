import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminSectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  isRTL?: boolean;
}

/**
 * The header row used at the top of every `/orders` tab: an icon tile, a
 * title + subtitle, and a slot for the tab's own primary actions. Replaces
 * the four differently-colored gradient headers that used to live in
 * app/(root)/orders/page.tsx and each *-administration.tsx file.
 */
export function AdminSectionHeader({
  icon,
  title,
  subtitle,
  actions,
  isRTL,
}: AdminSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
        isRTL && "lg:flex-row-reverse"
      )}
    >
      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-admin-accent-soft text-primary">
          {icon}
        </span>
        <div className={isRTL ? "text-right" : undefined}>
          <h2 className="font-outfit text-lg font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div
          className={cn(
            "flex w-full flex-wrap items-center gap-2 lg:w-auto",
            isRTL && "flex-row-reverse"
          )}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

export default AdminSectionHeader;
