import { CalendarDays, CircleDollarSign, MapPin, UserRound } from "lucide-react";

import { SimilarJobs } from "@/components/jobs/similar-jobs";
import { StatusBadge } from "@/components/shared/status-badge";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { regionLabels } from "@/constants/regions";
import type { JobPost } from "@/types/marketplace";

const workModeLabels: Record<JobPost["workMode"], string> = {
  ONLINE: "أونلاين",
  FIELD: "ميداني",
  BOTH: "مرن",
};

export function JobDetails({ job, similarJobs }: { job: JobPost; similarJobs: JobPost[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <article className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark">
                {job.categoryName}
              </span>
              {job.isUrgent ? <StatusBadge status="URGENT" /> : <StatusBadge status={job.status} />}
            </div>
            <CardTitle className="leading-10">{job.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base leading-8 text-slate-700">{job.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem icon={MapPin} label="المنطقة" value={regionLabels[job.region]} />
              <DetailItem icon={CircleDollarSign} label="الميزانية" value={job.budget} />
              <DetailItem icon={CalendarDays} label="تاريخ النشر" value={job.postedAt} />
              <DetailItem icon={UserRound} label="صاحب الطلب" value={job.authorName} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-950">المهارات المطلوبة</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <SimilarJobs jobs={similarJobs} />
      </article>

      <aside className="space-y-4">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-xl">قدّم عرضك</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              التواصل يتم خارجيًا عبر واتساب في هذه المرحلة. لا توجد محادثة داخلية أو دفع داخل
              المنصة.
            </div>
            <div className="grid gap-3 text-sm">
              <p>
                <span className="font-semibold text-slate-950">نمط العمل: </span>
                {workModeLabels[job.workMode]}
              </p>
              <p>
                <span className="font-semibold text-slate-950">نوع الجهة: </span>
                {job.authorType}
              </p>
            </div>
            <WhatsAppButton phone={job.whatsapp} className="w-full" label="تواصل مع صاحب الطلب" />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <p className="mt-2 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
