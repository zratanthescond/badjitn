"use client";

import { MoreVertical } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function HomeEventCardSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:gap-10">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className="rounded-xl p-4 bg-card-foreground/5 text-white aspect-[9/16] flex flex-col justify-between shadow-lg"
        >
          {/* Date Circle */}
          <div className="flex justify-end">
            <div className="flex items-center bg-card-foreground/30 justify-center rounded-full  w-10 h-10 text-xs font-semibold"></div>
          </div>
          <div className="flex  flex-col  gap-2">
            {/* Title */}
            <div className="space-y-2 justify-self-end mt-4">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 mt-6">
              <Skeleton className="w-4 h-4 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>

            {/* Time and Avatar */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-3 w-14 rounded" />
              </div>
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
          </div>
        </Skeleton>
      ))}
    </div>
  );
}
