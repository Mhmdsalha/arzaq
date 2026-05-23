import { Skeleton } from "@/components/shared/Skeleton";

export default function ProvidersLoading() {
  return (
    <main>
      <section className="bg-white pt-24">
        <div className="container py-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-5 w-full max-w-xl" />
        </div>
      </section>
      <section className="container py-8">
        <div className="mb-6 flex items-center gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProviderCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}

function ProviderCardSkeleton() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-4 w-24" />
    </article>
  );
}
