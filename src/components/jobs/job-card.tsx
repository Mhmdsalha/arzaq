import { BriefcaseBusiness, Clock, MapPin } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { regionLabels } from "@/constants/regions";
import { cn } from "@/lib/utils";
import type { JobPost } from "@/types/marketplace";

const workModeLabels: Record<JobPost["workMode"], string> = {
  ONLINE: "أونلاين",
  FIELD: "ميداني",
  BOTH: "مرن",
};

export function JobCard({ job, compact = false }: { job: JobPost; compact?: boolean }) {
  return (
    <article
      className={cn(
        "group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        job.isUrgent && "border-l-4 border-l-accent-gold",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark">
              {job.categoryName}
            </span>
            {job.isUrgent ? <StatusBadge status="URGENT" /> : <StatusBadge status={job.status} />}
          </div>
          <h2 className="line-clamp-2 text-lg font-bold leading-7 text-slate-950 group-hover:text-primary-dark">
            <Link href={`/jobs/${job.id}`}>{job.title}</Link>
          </h2>
        </div>
      </div>

      <p className={cn("mt-3 text-sm leading-7 text-slate-600", compact && "line-clamp-2")}>
        {job.description}
      </p>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
        <span className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          {regionLabels[job.region]}
        </span>
        <span className="flex items-center gap-2">
          <BriefcaseBusiness className="size-4 text-primary" />
          {workModeLabels[job.workMode]}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          {job.postedAt}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">الميزانية</p>
          <p className="font-bold text-primary-dark">{job.budget}</p>
        </div>
        <Button asChild variant="secondary" className="sm:w-auto">
          <Link href={`/jobs/${job.id}`}>عرض التفاصيل</Link>
        </Button>
      </div>
    </article>
  );
}
