import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { BriefcaseBusiness, Clock, Eye, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { SaveJobButton } from "@/components/jobs/save-job-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { workModeLabels } from "@/constants/jobs";
import { regionLabels } from "@/constants/regions";
import { cn } from "@/lib/utils";
import type { JobListItem } from "@/types/job";

export function JobCard({
  job,
  isAuthenticated = false,
}: {
  job: JobListItem;
  isAuthenticated?: boolean;
}) {
  return (
    <article
      className={cn(
        "group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5",
        job.isUrgent && "border-r-4 border-r-accent-gold bg-amber-50/40",
        job.status !== "OPEN" && "opacity-75",
      )}
    >
      <div className="grid gap-4 min-[520px]:grid-cols-[1fr_180px] min-[520px]:items-start lg:grid-cols-[1fr_220px]">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
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
              <h2 className="line-clamp-2 text-lg font-bold leading-7 text-slate-950 group-hover:text-primary-dark sm:text-xl">
                <Link href={`/jobs/${job.id}`}>{job.title}</Link>
              </h2>
            </div>
            <SaveJobButton
              jobId={job.id}
              isSaved={job.isSaved}
              isAuthenticated={isAuthenticated}
              className="shrink-0"
            />
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">{job.description}</p>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 min-[520px]:grid-cols-2 xl:grid-cols-4">
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
              {formatDistanceToNow(job.createdAt, { addSuffix: true, locale: ar })}
            </span>
            <span className="flex items-center gap-2">
              <Eye className="size-4 text-primary" />
              {job.offersCount} عروض
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 min-[520px]:text-center">
          <p className="text-xs text-slate-500">الميزانية</p>
          <p className="font-bold text-primary-dark">{job.budget}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500 min-[520px]:justify-center">
            {job.author.isTrusted ? <ShieldCheck className="size-3.5 text-primary" /> : null}
            {job.author.name}
          </p>
          <Button asChild variant="secondary" className="mt-4 w-full">
            <Link href={`/jobs/${job.id}`}>عرض التفاصيل</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
