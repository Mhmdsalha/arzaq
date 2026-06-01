import { Skeleton } from "@/components/shared/Skeleton";

export default function DashboardStoreLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-32 rounded-3xl" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  );
}
