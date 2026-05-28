import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { regionLabels } from "@/constants/regions";
import type { JobListItem } from "@/types/job";

export function LatestJobsSection({ jobs }: { jobs: JobListItem[] }) {
  return (
    <section className="section-spacing bg-slate-50">
      <div className="container-responsive space-y-6 lg:space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">أحدث الطلبات</h2>
            <p className="mt-2 text-slate-600">
              الطلبات التي ينشرها المستخدمون ستظهر هنا مباشرة بعد نشرها.
            </p>
          </div>
          <Link href="/jobs" className="text-sm font-semibold text-primary-dark">
            عرض كل الطلبات
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {jobs.slice(0, 6).map((job) => (
              <article
                key={job.id}
                className="card-padding rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark">
                    {job.category.name}
                  </span>
                  {job.isUrgent ? (
                    <StatusBadge status="URGENT" />
                  ) : (
                    <StatusBadge status={job.status} />
                  )}
                </div>
                <h3 className="mt-3 line-clamp-2 text-base font-bold leading-7 text-slate-950 lg:text-lg">
                  {job.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-600">
                  {job.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
                  <span>{regionLabels[job.region]}</span>
                  <span>·</span>
                  <span>{job.budget}</span>
                </div>
                <Button asChild variant="secondary" className="mt-5 h-11 w-full sm:w-auto">
                  <Link href={`/jobs/${job.id}`}>عرض الطلب</Link>
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا توجد طلبات منشورة بعد"
            description="ابدأ التجربة الفعلية بنشر أول طلب من لوحة التحكم."
            action={
              <Button asChild>
                <Link href="/dashboard/jobs/new">نشر أول طلب</Link>
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
}
