import { JobCard } from "@/components/jobs/job-card";
import type { JobPost } from "@/types/marketplace";

export function SimilarJobs({ jobs }: { jobs: JobPost[] }) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950">طلبات مشابهة</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {jobs.slice(0, 2).map((job) => (
          <JobCard key={job.id} job={job} compact />
        ))}
      </div>
    </section>
  );
}
