import { Skeleton } from "@/components/shared/Skeleton";

export default function JobsLoading() {
  return (
    <main>
      <section className="bg-white pt-24">
        <div className="container py-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-5 w-full max-w-xl" />
        </div>
      </section>
      <section className="container py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden space-y-4 rounded-2xl border border-slate-200 bg-white p-4 lg:block">
            <Skeleton className="h-6 w-28" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </aside>
          <div className="space-y-4">
            <div className="flex items-center gap-3 lg:hidden">
              <Skeleton className="h-11 flex-1 rounded-xl" />
              <Skeleton className="h-11 w-24 rounded-xl" />
            </div>
            <div className="grid gap-4">
              {Array.from({ length: 9 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function JobCardSkeleton() {
  return (
    <article className="min-h-[140px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="mt-4 h-5 w-3/4" />
      <div className="mt-4 flex flex-wrap gap-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </article>
  );
}
