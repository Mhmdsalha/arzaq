import { Skeleton } from "@/components/shared/Skeleton";

export default function AdminStoreLoading() {
  return (
    <section className="container-responsive py-10">
      <Skeleton className="h-40 rounded-3xl bg-white/10" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl bg-white/10" />
        ))}
      </div>
    </section>
  );
}
