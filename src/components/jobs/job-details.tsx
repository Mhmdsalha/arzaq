import { format, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  Clock,
  Eye,
  MapPin,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { SaveJobButton } from "@/components/jobs/save-job-button";
import { SimilarJobs } from "@/components/jobs/similar-jobs";
import { OfferForm } from "@/components/offers/offer-form";
import { ReportButton } from "@/components/shared/report-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { workModeLabels } from "@/constants/jobs";
import { regionLabels } from "@/constants/regions";
import type { JobDetailsData, JobListItem } from "@/types/job";

export function JobDetails({
  job,
  similarJobs,
  isAuthenticated,
}: {
  job: JobDetailsData;
  similarJobs: JobListItem[];
  isAuthenticated: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <article className="space-y-6">
        <Card className={job.isUrgent ? "border-r-4 border-r-accent-gold" : undefined}>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark">
                {job.category.name}
              </span>
              {job.isUrgent ? <StatusBadge status="URGENT" /> : null}
              <StatusBadge status={job.status} />
            </div>
            <CardTitle className="leading-10">{job.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="whitespace-pre-line text-base leading-8 text-slate-700">
              {job.description}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem icon={BriefcaseBusiness} label="معرّف الطلب" value={job.code} mono />
              <DetailItem icon={MapPin} label="المنطقة" value={regionLabels[job.region]} />
              <DetailItem
                icon={BriefcaseBusiness}
                label="طريقة العمل"
                value={workModeLabels[job.workMode]}
              />
              <DetailItem icon={CircleDollarSign} label="الميزانية" value={job.budget} />
              <DetailItem icon={Clock} label="المدة المتوقعة" value={job.duration} />
              <DetailItem
                icon={CalendarDays}
                label="تاريخ النشر"
                value={formatDistanceToNow(job.createdAt, { addSuffix: true, locale: ar })}
              />
              <DetailItem
                icon={CalendarDays}
                label="تاريخ الانتهاء"
                value={
                  job.expiresAt ? format(job.expiresAt, "d MMMM yyyy", { locale: ar }) : "غير محدد"
                }
              />
            </div>
          </CardContent>
        </Card>

        <SimilarJobs jobs={similarJobs} />
      </article>

      <aside className="space-y-4">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-xl">ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Metric icon={Eye} label="المشاهدات" value={String(job.views)} />
              <Metric icon={UserRound} label="العروض" value={String(job.offersCount)} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary-dark">
                  {job.author.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-1 font-semibold text-slate-950">
                    {job.author.name}
                    {job.author.isTrusted ? <ShieldCheck className="size-4 text-primary" /> : null}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {job.author.avgRating.toFixed(1)} من {job.author.totalReviews} تقييم
                  </p>
                </div>
              </div>
              {job.author.region ? (
                <p className="mt-3 text-sm text-slate-600">
                  المنطقة: {regionLabels[job.author.region]}
                </p>
              ) : null}
            </div>

            <ApplyState job={job} isAuthenticated={isAuthenticated} />

            {isAuthenticated && !job.isOwner && !job.alreadyApplied && job.status === "OPEN" ? (
              <OfferForm jobPostId={job.id} />
            ) : null}

            {job.author.whatsapp ? (
              <WhatsAppButton phone={job.author.whatsapp} className="w-full" label="تواصل واتساب" />
            ) : null}

            <SaveJobButton
              jobId={job.id}
              isSaved={job.isSaved}
              className="w-full"
            />
            {isAuthenticated && !job.isOwner ? (
              <ReportButton
                targetType="JOB_POST"
                targetId={job.id}
                label="الإبلاغ عن الطلب"
                className="w-full"
              />
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function ApplyState({ job, isAuthenticated }: { job: JobDetailsData; isAuthenticated: boolean }) {
  if (!isAuthenticated) {
    return (
      <Button asChild className="w-full">
        <Link href="/auth/login">سجّل دخول للتقديم</Link>
      </Button>
    );
  }

  if (job.isOwner) {
    return (
      <p className="rounded-xl bg-slate-100 p-3 text-center text-sm text-slate-600">
        هذا طلبك المنشور.
      </p>
    );
  }

  if (job.alreadyApplied) {
    return (
      <Button asChild variant="secondary" className="w-full">
        <Link href="/dashboard/offers">تم تقديم عرضك</Link>
      </Button>
    );
  }

  if (job.status !== "OPEN") {
    return (
      <Button type="button" disabled className="w-full">
        هذا الطلب مغلق
      </Button>
    );
  }

  return (
    <Button asChild className="w-full">
      <Link href={`/jobs/${job.id}#offer`}>قدّم عرضك</Link>
    </Button>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <p className={`mt-2 font-semibold text-slate-950 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <Icon className="mx-auto size-4 text-primary" />
      <p className="mt-1 text-xs text-slate-500">{label}</p>
      <p className="font-bold text-slate-950">{value}</p>
    </div>
  );
}
