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

export function JobCard({ job }: { job: JobListItem }) {
  return (
    <article
      className={cn(
        "group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4 lg:p-5",
        job.isUrgent && "border-r-4 border-r-accent-gold bg-amber-50/40",
        job.status !== "OPEN" && "opacity-75",
      )}
    >
      <div className="grid gap-3 min-[520px]:grid-cols-[1fr_180px] min-[520px]:items-start lg:grid-cols-[1fr_220px] lg:gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold leading-none text-slate-600 sm:px-3 sm:text-xs">
                  {job.code}
                </span>
                <span className="max-w-24 truncate rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold leading-none text-primary-dark sm:max-w-none sm:px-3 sm:text-xs">
                  {job.category.name}
                </span>
                {job.isUrgent ? (
                  <StatusBadge status="URGENT" />
                ) : (
                  <StatusBadge status={job.status} />
                )}
              </div>

              <h2 className="line-clamp-1 text-base font-bold leading-7 text-slate-950 group-hover:text-primary-dark sm:line-clamp-2 sm:text-lg lg:text-xl">
                <Link href={`/jobs/${job.id}`}>{job.title}</Link>
              </h2>
            </div>

            <SaveJobButton
              jobId={job.id}
              isSaved={job.isSaved}
              className="h-11 w-11 shrink-0 rounded-xl"
            />
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 sm:mt-3 sm:leading-7">
            {job.description}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs leading-relaxed text-slate-600 sm:mt-4 sm:text-sm min-[520px]:grid-cols-2 xl:grid-cols-4">
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="size-4 shrink-0 text-primary" />
              <span className="truncate">{regionLabels[job.region]}</span>
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <BriefcaseBusiness className="size-4 shrink-0 text-primary" />
              <span className="truncate">{workModeLabels[job.workMode]}</span>
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <Clock className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                {formatDistanceToNow(job.createdAt, { addSuffix: true, locale: ar })}
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <Eye className="size-4 shrink-0 text-primary" />
              <span className="truncate">{job.offersCount} عروض</span>
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 min-[520px]:p-4 min-[520px]:text-center">
          <div className="flex items-center justify-between gap-3 min-[520px]:block">
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 sm:text-xs">الميزانية</p>
              <p className="truncate text-base font-bold text-primary-dark">{job.budget}</p>
            </div>
            <p className="flex min-w-0 items-center gap-1 text-xs text-slate-500 min-[520px]:mt-2 min-[520px]:justify-center">
              {job.author.isTrusted ? (
                <ShieldCheck className="size-3.5 shrink-0 text-primary" />
              ) : null}
              <span className="truncate">{job.author.name}</span>
            </p>
          </div>

          <Button asChild variant="secondary" className="mt-3 h-10 w-full rounded-xl sm:h-11 min-[520px]:mt-4">
            <Link href={`/jobs/${job.id}`}>عرض التفاصيل</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
