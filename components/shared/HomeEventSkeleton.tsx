"use client";

import { MoreVertical } from "lucide-react";

export function HomeEventCardSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all"
        >
          <div className="aspect-[3/4] w-full">
            {/* Top date badge */}
            <div className="absolute right-3 top-3 z-10 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
              <div className="h-5 w-10 animate-pulse rounded-md bg-muted" />
              <div className="mt-1 h-3.5 w-8 animate-pulse rounded-md bg-muted" />
            </div>

            {/* Menu button */}
            <div className="absolute left-3 top-3 z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Main image area */}
            <div className="h-full w-full animate-pulse bg-muted" />
          </div>

          {/* Content area */}
          <div className="p-3">
            {/* Title */}
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />

            {/* Location and time */}
            <div className="mt-4 flex items-center space-x-2">
              <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-4 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-1/4 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
