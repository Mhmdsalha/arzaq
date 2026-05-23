import { Skeleton } from "@/components/shared/Skeleton";

export default function DashboardJobsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-6 gap-4 border-b border-slate-100 p-4 lg:grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, row) => (
            <div key={row} className="grid gap-3 p-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, col) => (
                <Skeleton key={col} className="h-5 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
