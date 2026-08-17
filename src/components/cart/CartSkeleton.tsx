import { Skeleton } from "@/components/ui/skeleton";

export function CartSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="flex gap-3 py-4">
          <Skeleton className="h-24 w-20 rounded-sm" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      ))}
      <Skeleton className="h-32 w-full rounded-sm" />
    </div>
  );
}
