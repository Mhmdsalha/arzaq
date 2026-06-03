import { Skeleton } from "@/components/shared/Skeleton";

export function ListingCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "w-44 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm" : "overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"}>
      <Skeleton className="aspect-video rounded-none" />
      <div className="space-y-3 p-3 lg:p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
          <Skeleton className="size-7 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
