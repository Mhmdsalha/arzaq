import type { ReportStatus, ReportTargetType } from "@prisma/client";
import Link from "next/link";

import { updateReportStatusFormAction } from "@/actions/admin.actions";
import { getAdminReports } from "@/services/admin.service";

const reportStatusLabels: Record<ReportStatus, string> = {
  PENDING: "معلق",
  REVIEWED: "قيد المراجعة",
  RESOLVED: "تم الحل",
  DISMISSED: "مرفوض",
};

const targetTypeLabels: Record<ReportTargetType, string> = {
  USER: "مستخدم",
  JOB_POST: "طلب",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = parseReportStatus(getParam(params.status));
  const targetType = parseTargetType(getParam(params.targetType));
  const page = Number(getParam(params.page) ?? "1");
  const data = await getAdminReports({ status, targetType, page });

  return (
    <section className="container-responsive py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-white">البلاغات</h1>
        <Link href="/admin" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200">
          رجوع
        </Link>
      </div>

      <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[220px_220px_auto]">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        >
          <option value="">كل الحالات</option>
          {Object.entries(reportStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="targetType"
          defaultValue={targetType ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        >
          <option value="">كل الأهداف</option>
          {Object.entries(targetTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-white">
          فلترة
        </button>
      </form>

      <div className="mt-6 grid gap-4">
        {data.reports.map((report) => (
          <article key={report.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary-light">
                    {targetTypeLabels[report.targetType]}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                    {reportStatusLabels[report.status]}
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-bold text-white">{report.reason}</h2>
                <p className="mt-2 text-sm text-slate-300">
                  المبلّغ: {report.reporter.name} · الهدف:{" "}
                  {report.jobPost ? report.jobPost.title : report.targetId}
                </p>
                {report.resolvedNote ? (
                  <p className="mt-2 rounded-xl bg-white/5 p-3 text-sm text-slate-300">
                    {report.resolvedNote}
                  </p>
                ) : null}
              </div>
              <form action={updateReportStatusFormAction} className="grid min-w-72 gap-2">
                <input type="hidden" name="reportId" value={report.id} />
                <select
                  name="status"
                  defaultValue={report.status}
                  className="h-11 rounded-xl border border-white/10 bg-slate-950 px-4 text-white"
                >
                  {Object.entries(reportStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  name="resolvedNote"
                  defaultValue={report.resolvedNote ?? ""}
                  placeholder="ملاحظة إدارية"
                  className="h-11 rounded-xl border border-white/10 bg-slate-950 px-4 text-white"
                />
                <button className="min-h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white">
                  حفظ الحالة
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseReportStatus(value: string | undefined): ReportStatus | undefined {
  return value === "PENDING" ||
    value === "REVIEWED" ||
    value === "RESOLVED" ||
    value === "DISMISSED"
    ? value
    : undefined;
}

function parseTargetType(value: string | undefined): ReportTargetType | undefined {
  return value === "USER" || value === "JOB_POST" ? value : undefined;
}
