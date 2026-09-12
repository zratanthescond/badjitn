import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminEmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  isRTL?: boolean;
  className?: string;
}

/** Shared "no results" panel for the admin backoffice tables/cards. */
export function AdminEmptyState({
  icon,
  title,
  description,
  isRTL,
  className,
}: AdminEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 py-14 text-center", className)}>
      <span className="text-muted-foreground/60">{icon}</span>
      <h3 className={cn("text-sm font-semibold text-foreground", isRTL && "font-arabic")}>
        {title}
      </h3>
      {description && (
        <p className={cn("max-w-sm text-xs text-muted-foreground", isRTL && "font-arabic")}>
          {description}
        </p>
      )}
    </div>
  );
}

export default AdminEmptyState;
