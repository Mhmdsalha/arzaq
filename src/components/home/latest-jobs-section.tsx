import Link from "next/link";

import { JobCard } from "@/components/jobs/job-card";
import type { JobPost } from "@/types/marketplace";

export function LatestJobsSection({ jobs }: { jobs: JobPost[] }) {
  return (
    <section className="bg-slate-50 py-14">
      <div className="container space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">أحدث الطلبات</h2>
            <p className="mt-2 text-slate-600">طلبات حقيقية بصياغة قريبة من احتياج السوق المحلي.</p>
          </div>
          <Link href="/jobs" className="text-sm font-semibold text-primary-dark">
            عرض كل الطلبات
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.slice(0, 6).map((job) => (
            <JobCard key={job.id} job={job} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
