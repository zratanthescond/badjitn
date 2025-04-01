import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="w-full max-w-md rounded-xl bg-gray-900 p-4 border border-gray-800 text-white">
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40 bg-gray-800" />
          <Skeleton className="h-4 w-56 bg-gray-800" />
        </div>
        <Skeleton className="h-6 w-20 rounded-md bg-gray-800" />
      </div>

      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-4 w-32 bg-gray-800" />
        <Skeleton className="h-4 w-6 bg-gray-800" />
      </div>

      <div className="flex justify-between items-center mt-6">
        <Skeleton className="h-4 w-36 bg-gray-800" />
        <Skeleton className="h-9 w-16 rounded-full bg-gray-800" />
      </div>
    </div>
  );
}
