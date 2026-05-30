import Link from "next/link";
import { notFound } from "next/navigation";

import {
  adminDeleteJobFormAction,
  approveJobFormAction,
  requestJobEditFormAction,
} from "@/actions/admin.actions";
import { adminJobStatusLabels, workModeLabels } from "@/constants/jobs";
import { regionLabels } from "@/constants/regions";
import { getAdminJobById } from "@/services/admin.service";

export const metadata = {
  title: "مراجعة الطلب",
};

export default async function AdminJobReviewPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = await getAdminJobById(jobId);

  if (!job) {
    notFound();
  }

  const canApprove = job.status === "PENDING_REVIEW" || job.status === "NEEDS_EDIT";
  const canRequestEdit =
    job.status === "PENDING_REVIEW" || job.status === "OPEN" || job.status === "NEEDS_EDIT";

  return (
    <section className="container-responsive py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary-light">مراجعة طلب</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{job.title}</h1>
          <p className="mt-2 font-mono text-sm text-slate-300">معرّف الطلب: {job.code}</p>
          <p className="mt-2 text-sm text-slate-300">
            راجع تفاصيل الطلب بالكامل قبل اعتماد النشر أو إرجاعه لصاحب الطلب للتعديل.
          </p>
        </div>
        <Link
          href="/admin/jobs"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200"
        >
          رجوع للطلبات
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-light">
                {adminJobStatusLabels[job.status]}
              </span>
              {job.isUrgent ? (
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200">
                  عاجل
                </span>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoCard label="التصنيف" value={job.category.name} />
              <InfoCard label="معرّف الطلب" value={job.code} mono />
              <InfoCard label="المنطقة" value={regionLabels[job.region]} />
              <InfoCard label="طريقة العمل" value={workModeLabels[job.workMode]} />
              <InfoCard label="الميزانية" value={job.budget ?? "حسب الاتفاق"} />
              <InfoCard label="المدة المتوقعة" value={job.duration ?? "غير محددة"} />
              <InfoCard
                label="تاريخ النشر"
                value={job.createdAt.toLocaleDateString("ar", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950 p-5">
              <h2 className="text-xl font-bold text-white">وصف الطلب</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-8 text-slate-200">
                {job.description}
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold text-white">صاحب الطلب</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <InfoCard label="الاسم" value={job.author.name} />
              <InfoCard label="البريد" value={job.author.email ?? "غير مضاف"} />
              <InfoCard label="الجوال" value={job.author.phone ?? "غير مضاف"} />
              <InfoCard
                label="توثيق الحساب"
                value={job.author.isVerified ? "موثق" : "غير موثق"}
              />
              <InfoCard
                label="حالة الحساب"
                value={job.author.isBanned ? "محظور" : "نشط"}
              />
              <InfoCard
                label="منطقة صاحب الطلب"
                value={
                  job.author.profile?.region ? regionLabels[job.author.profile.region] : "غير محددة"
                }
              />
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold text-white">قرار الإدارة</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              الاعتماد ينشر الطلب للعامة فوراً. الرفض هنا يعني إرجاع الطلب للعميل مع
              ملاحظة واضحة حتى يقوم بتعديله وإرساله للمراجعة مرة أخرى.
            </p>

            <div className="mt-5 grid gap-3">
              {canApprove ? (
                <form action={approveJobFormAction}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button className="w-full min-h-12 rounded-xl bg-primary px-5 font-semibold text-white hover:bg-primary-dark">
                    اعتماد الطلب ونشره
                  </button>
                </form>
              ) : null}

              {canRequestEdit ? (
                <form action={requestJobEditFormAction} className="grid gap-3">
                  <input type="hidden" name="jobId" value={job.id} />
                  <label className="grid gap-2 text-sm font-medium text-slate-200">
                    سبب الرفض أو المطلوب تعديله
                    <textarea
                      name="note"
                      rows={5}
                      required
                      placeholder="مثال: يرجى توضيح الميزانية، إضافة تفاصيل أكثر عن المهمة، أو تعديل صياغة الطلب."
                      className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm leading-7 text-white outline-none focus:border-primary"
                    />
                  </label>
                  <button className="min-h-12 rounded-xl border border-amber-400/40 px-5 font-semibold text-amber-100 hover:bg-amber-500/10">
                    رفض الطلب وإرساله للتعديل
                  </button>
                </form>
              ) : null}

              <form action={adminDeleteJobFormAction}>
                <input type="hidden" name="jobId" value={job.id} />
                <button className="w-full min-h-12 rounded-xl bg-red-600 px-5 font-semibold text-white hover:bg-red-700">
                  إخفاء الطلب من المنصة
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold text-white">مؤشرات سريعة</h2>
            <div className="mt-4 grid gap-3">
              <InfoCard label="المشاهدات" value={String(job.views)} />
              <InfoCard label="العروض" value={String(job._count.offers)} />
              <InfoCard label="البلاغات" value={String(job._count.reports)} />
              <InfoCard label="الحفظ" value={String(job._count.savedBy)} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function InfoCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold text-white ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
