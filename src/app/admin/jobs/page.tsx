import type { JobStatus } from "@prisma/client";
import Link from "next/link";

import {
  adminDeleteJobFormAction,
  approveJobFormAction,
  requestJobEditFormAction,
} from "@/actions/admin.actions";
import { jobStatusLabels } from "@/constants/jobs";
import { regionLabels } from "@/constants/regions";
import { getAdminJobs } from "@/services/admin.service";

const jobStatusValues: JobStatus[] = [
  "PENDING_REVIEW",
  "NEEDS_EDIT",
  "OPEN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getParam(params.q);
  const status = parseJobStatus(getParam(params.status));
  const page = Number(getParam(params.page) ?? "1");
  const data = await getAdminJobs({ q, status, page });

  return (
    <section className="container-responsive py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">مراجعة الطلبات</h1>
          <p className="mt-2 text-sm text-slate-300">
            الطلبات الجديدة لا تظهر للعامة إلا بعد اعتمادها من الإدارة.
          </p>
        </div>
        <Link href="/admin" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200">
          رجوع
        </Link>
      </div>

      <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_240px_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="بحث بعنوان الطلب أو الوصف"
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        >
          <option value="">كل الحالات</option>
          {jobStatusValues.map((value) => (
            <option key={value} value={value}>
              {jobStatusLabels[value]}
            </option>
          ))}
        </select>
        <button className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-white">
          بحث
        </button>
      </form>

      <div className="mt-6 grid gap-4">
        {data.jobs.map((job) => (
          <article
            key={job.id}
            className="rounded-2xl border border-white/10 bg-slate-900 p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{job.title}</h2>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary-light">
                    {jobStatusLabels[job.status]}
                  </span>
                  {job.isUrgent ? (
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-200">
                      عاجل
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  {job.category.name} · {regionLabels[job.region]} · صاحب الطلب: {job.author.name}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {job._count.offers} عروض · {job._count.reports} بلاغات · {job.views} مشاهدة
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex min-h-10 items-center rounded-xl bg-white/10 px-4 text-sm font-semibold text-white"
                >
                  عرض
                </Link>
                {job.status === "PENDING_REVIEW" || job.status === "NEEDS_EDIT" ? (
                  <form action={approveJobFormAction}>
                    <input type="hidden" name="jobId" value={job.id} />
                    <button className="min-h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
                      اعتماد ونشر
                    </button>
                  </form>
                ) : null}
                <form action={adminDeleteJobFormAction}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button className="min-h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700">
                    إخفاء
                  </button>
                </form>
              </div>
            </div>

            {job.status === "PENDING_REVIEW" || job.status === "OPEN" ? (
              <form action={requestJobEditFormAction} className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
                <input type="hidden" name="jobId" value={job.id} />
                <input
                  name="note"
                  placeholder="ملاحظة للعميل عند طلب التعديل، مثال: يرجى توضيح الميزانية أو وصف المهمة"
                  className="h-11 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none"
                />
                <button className="min-h-11 rounded-xl border border-amber-400/40 px-4 text-sm font-semibold text-amber-100 hover:bg-amber-500/10">
                  طلب تعديل
                </button>
              </form>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseJobStatus(value: string | undefined): JobStatus | undefined {
  return jobStatusValues.includes(value as JobStatus) ? (value as JobStatus) : undefined;
}
