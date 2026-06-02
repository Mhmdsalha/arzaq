import type { ReportStatus } from "@prisma/client";
import Link from "next/link";

import { updateListingReportStatusFormAction } from "@/actions/admin-store.actions";
import { getAdminHref } from "@/lib/admin-path";
import { getAdminStoreReports } from "@/services/admin-store.service";

const reportStatusLabels: Record<ReportStatus, string> = {
  PENDING: "قيد المراجعة",
  REVIEWED: "تمت المراجعة",
  RESOLVED: "تم الحل",
  DISMISSED: "مرفوض",
};

const reportStatusValues = Object.keys(reportStatusLabels) as ReportStatus[];

export const metadata = {
  title: "بلاغات المتجر",
};

export default async function AdminStoreReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = parseReportStatus(getParam(params.status));
  const page = Number(getParam(params.page) ?? "1");
  const data = await getAdminStoreReports({ status, page });

  return (
    <section className="container-responsive py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">بلاغات المنتجات والخدمات</h1>
          <p className="mt-2 text-sm text-slate-300">
            راجع بلاغات المستخدمين على عناصر المتجر، وغيّر حالة البلاغ بعد المراجعة.
          </p>
        </div>
        <Link href={getAdminHref("/store")} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200">
          إدارة المتجر
        </Link>
      </div>

      <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[240px_auto]">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        >
          <option value="">كل الحالات</option>
          {reportStatusValues.map((value) => (
            <option key={value} value={value}>
              {reportStatusLabels[value]}
            </option>
          ))}
        </select>
        <button className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-white md:w-fit">تصفية</button>
      </form>

      <div className="mt-6 grid gap-4">
        {data.reports.map((report) => (
          <article key={report.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{report.reason}</h2>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary-light">
                    {reportStatusLabels[report.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  العنصر: {report.listing.title} · البائع: {report.listing.seller.name} · المبلّغ: {report.reporter.name}
                </p>
                {report.details ? <p className="mt-2 text-sm leading-7 text-slate-400">{report.details}</p> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/store/${report.listing.id}`}
                  className="inline-flex min-h-10 items-center rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-200 hover:bg-white/10"
                >
                  عرض العنصر
                </Link>
                {(["REVIEWED", "RESOLVED", "DISMISSED"] as ReportStatus[]).map((value) => (
                  <form key={value} action={updateListingReportStatusFormAction}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="status" value={value} />
                    <button className="min-h-10 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15">
                      {reportStatusLabels[value]}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <Pagination baseHref={getAdminHref("/store/reports")} page={data.page} totalPages={data.totalPages} />
    </section>
  );
}

function Pagination({ baseHref, page, totalPages }: { baseHref: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      {page > 1 ? <Link className="rounded-xl border border-white/10 px-4 py-2 text-white" href={`${baseHref}?page=${page - 1}`}>السابق</Link> : null}
      <span className="text-sm text-slate-300">صفحة {page} من {totalPages}</span>
      {page < totalPages ? <Link className="rounded-xl border border-white/10 px-4 py-2 text-white" href={`${baseHref}?page=${page + 1}`}>التالي</Link> : null}
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseReportStatus(value: string | undefined): ReportStatus | undefined {
  return reportStatusValues.includes(value as ReportStatus) ? (value as ReportStatus) : undefined;
}
