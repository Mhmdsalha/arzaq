import { Skeleton } from "@/components/shared/Skeleton";

export default function StoreLoading() {
  return (
    <main className="container-responsive pb-16 pt-28">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-9 w-64 max-w-full" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
