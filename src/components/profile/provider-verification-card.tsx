import { CheckCircle2, Clock3, ShieldCheck, ShieldQuestion } from "lucide-react";

import { requestProviderVerificationFormAction } from "@/actions/provider-verification.actions";
import type { ProviderVerificationSummary } from "@/services/provider-verification.service";

type ProviderVerificationCardProps = {
  summary: ProviderVerificationSummary;
};

const statusLabels = {
  PENDING: "قيد المراجعة",
  APPROVED: "تم القبول",
  REJECTED: "تم الرفض",
} as const;

export function ProviderVerificationCard({ summary }: ProviderVerificationCardProps) {
  if (!summary.isProvider) {
    return null;
  }

  const progress = Math.min(
    Math.round((summary.acceptedOffers / summary.requiredOffers) * 100),
    100,
  );

  if (summary.isTrusted) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-emerald-950">حسابك موثق رسمياً</h2>
              <p className="mt-1 text-sm leading-6 text-emerald-800">
                يظهر حسابك ضمن مقدمي الخدمات الموثقين ويمكن للعملاء رؤيته بثقة أكبر.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            موثق
          </span>
        </div>
      </section>
    );
  }

  const latestRequest = summary.latestRequest;
  const isPending = latestRequest?.status === "PENDING";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
            {isPending ? <Clock3 className="h-6 w-6" /> : <ShieldQuestion className="h-6 w-6" />}
          </span>
          <div>
            <p className="text-sm font-semibold text-primary-dark">التوثيق الرسمي</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">طلب توثيق مقدم الخدمة</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              يمكنك تقديم طلب التوثيق الرسمي بعد قبول {summary.requiredOffers} عروض على الأقل.
              لديك حالياً {summary.acceptedOffers} عروض مقبولة، والمتبقي {summary.remainingOffers}.
            </p>
          </div>
        </div>

        {latestRequest ? (
          <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            آخر طلب: {statusLabels[latestRequest.status]}
          </span>
        ) : null}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>تقدمك نحو التوثيق</span>
          <span className="font-semibold text-slate-900">
            {summary.acceptedOffers}/{summary.requiredOffers}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {latestRequest?.status === "REJECTED" && latestRequest.reviewedNote ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
          ملاحظة الإدارة: {latestRequest.reviewedNote}
        </div>
      ) : null}

      {isPending ? (
        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
          <Clock3 className="h-5 w-5" />
          طلبك قيد مراجعة الإدارة، وسيصلك إشعار عند اتخاذ القرار.
        </div>
      ) : summary.canRequest ? (
        <form action={requestProviderVerificationFormAction} className="mt-5 space-y-3">
          <label className="block text-sm font-semibold text-slate-700" htmlFor="verification-note">
            ملاحظة اختيارية للإدارة
          </label>
          <textarea
            id="verification-note"
            name="note"
            rows={3}
            maxLength={500}
            placeholder="مثلاً: أتممت عدة أعمال عبر المنصة وأرغب بمراجعة حسابي للتوثيق الرسمي."
            className="min-h-28 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white transition hover:bg-primary-dark">
            <CheckCircle2 className="h-5 w-5" />
            طلب التوثيق الرسمي
          </button>
        </form>
      ) : (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          أكمل {summary.remainingOffers} عروض مقبولة إضافية حتى يظهر لك زر طلب التوثيق الرسمي.
        </div>
      )}
    </section>
  );
}
