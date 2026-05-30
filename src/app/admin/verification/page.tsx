import type { ProviderVerificationStatus } from "@prisma/client";
import Link from "next/link";

import { reviewProviderVerificationFormAction } from "@/actions/provider-verification.actions";
import { regionLabels } from "@/constants/regions";
import { requireAdmin } from "@/lib/authGuards";
import {
  getAdminProviderVerificationRequests,
  REQUIRED_ACCEPTED_OFFERS_FOR_VERIFICATION,
} from "@/services/provider-verification.service";

const statusLabels: Record<ProviderVerificationStatus, string> = {
  PENDING: "قيد المراجعة",
  APPROVED: "تم القبول",
  REJECTED: "تم الرفض",
};

const statusOptions: ProviderVerificationStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export default async function AdminVerificationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = parseStatus(getParam(params.status));
  const requests = await getAdminProviderVerificationRequests({ status });

  return (
    <section className="container-responsive py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">طلبات توثيق مقدمي الخدمات</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
            راجع طلبات التوثيق الرسمية بعد وصول مقدم الخدمة إلى{" "}
            {REQUIRED_ACCEPTED_OFFERS_FOR_VERIFICATION} عروض مقبولة على الأقل.
          </p>
        </div>
        <Link href="/admin" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200">
          رجوع
        </Link>
      </div>

      <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-[240px_auto]">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        >
          <option value="">كل الحالات</option>
          {statusOptions.map((value) => (
            <option key={value} value={value}>
              {statusLabels[value]}
            </option>
          ))}
        </select>
        <button className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-white">
          تصفية
        </button>
      </form>

      <div className="mt-6 grid gap-4">
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
            لا توجد طلبات توثيق حالياً.
          </div>
        ) : null}

        {requests.map((request) => (
          <article key={request.id} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{request.provider.name}</h2>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary-light">
                    {statusLabels[request.status]}
                  </span>
                  {request.provider.profile?.isTrusted ? (
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                      موثق حالياً
                    </span>
                  ) : null}
                  {request.provider.isVerified ? (
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-200">
                      البريد موثق
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  {request.provider.email ?? "لا يوجد بريد"} · {request.provider.phone ?? "لا يوجد جوال"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {request.provider.profile?.title ?? "مقدم خدمة"} ·{" "}
                  {request.provider.profile?.region
                    ? regionLabels[request.provider.profile.region]
                    : "منطقة غير محددة"}
                </p>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <Stat label="العروض المقبولة" value={`${request.acceptedOffers}/5`} />
                  <Stat
                    label="متوسط التقييم"
                    value={request.provider.profile?.avgRating.toFixed(1) ?? "0.0"}
                  />
                  <Stat
                    label="عدد المراجعات"
                    value={String(request.provider.profile?.totalReviews ?? 0)}
                  />
                </div>

                {request.note ? (
                  <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm leading-7 text-slate-200">
                    ملاحظة مقدم الخدمة: {request.note}
                  </div>
                ) : null}

                {request.reviewedNote ? (
                  <div className="mt-4 rounded-2xl bg-amber-500/10 p-4 text-sm leading-7 text-amber-100">
                    ملاحظة المراجعة: {request.reviewedNote}
                  </div>
                ) : null}
              </div>

              {request.status === "PENDING" ? (
                <div className="w-full shrink-0 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:w-80">
                  <form action={reviewProviderVerificationFormAction} className="space-y-3">
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="decision" value="APPROVED" />
                    <button className="w-full min-h-11 rounded-xl bg-primary px-4 font-semibold text-white hover:bg-primary-dark">
                      قبول التوثيق
                    </button>
                  </form>

                  <form action={reviewProviderVerificationFormAction} className="space-y-3">
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="decision" value="REJECTED" />
                    <textarea
                      name="reviewedNote"
                      rows={3}
                      placeholder="سبب الرفض أو المطلوب تعديله"
                      className="min-h-24 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-primary"
                    />
                    <button className="w-full min-h-11 rounded-xl bg-red-600 px-4 font-semibold text-white hover:bg-red-700">
                      رفض مع ملاحظة
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value: string | undefined): ProviderVerificationStatus | undefined {
  return statusOptions.includes(value as ProviderVerificationStatus)
    ? (value as ProviderVerificationStatus)
    : undefined;
}
