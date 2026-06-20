import type { StorePlanPaymentStatus } from "@prisma/client";
import Link from "next/link";

import {
  approveStorePlanPaymentFormAction,
  rejectStorePlanPaymentFormAction,
} from "@/actions/store-plan.actions";
import { PaymentProofPreview } from "@/components/store/payment-proof-preview";
import { paymentMethods } from "@/constants/payment-methods";
import { storePlans } from "@/constants/store-plans";
import { getAdminHref } from "@/lib/admin-path";
import { getAdminStorePlanPaymentRequests } from "@/services/store-plan.service";

const statusValues: StorePlanPaymentStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const statusLabels: Record<StorePlanPaymentStatus, string> = {
  PENDING: "قيد المراجعة",
  APPROVED: "مقبول",
  REJECTED: "مرفوض",
};

export const metadata = {
  title: "طلبات دفع باقات المتجر",
};

export default async function AdminStorePaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getParam(params.q);
  const requestId = getParam(params.request);
  const status = parseStatus(getParam(params.status));
  const page = Number(getParam(params.page) ?? "1");
  const data = await getAdminStorePlanPaymentRequests({ q, requestId, status, page });
  const baseParams = new URLSearchParams();

  if (q) baseParams.set("q", q);
  if (requestId) baseParams.set("request", requestId);
  if (status) baseParams.set("status", status);

  return (
    <section className="container-responsive py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-primary-light">إدارة المتجر</p>
          <h1 className="mt-1 text-3xl font-bold text-white">طلبات دفع الباقات</h1>
          <p className="mt-2 text-sm text-slate-300">
            راجع إشعارات الدفع، ثم فعّل الباقة أو ارفض الطلب مع ملاحظة واضحة للمستخدم.
          </p>
        </div>
        <Link
          href={getAdminHref("/store")}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200"
        >
          العودة للمتجر
        </Link>
      </div>

      {requestId ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <p className="text-sm font-semibold text-primary-light">
            يتم عرض طلب الدفع القادم من رابط الإشعار:{" "}
            <span className="font-mono text-white">{requestId}</span>
          </p>
          <Link
            href={getAdminHref("/store/payments")}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200"
          >
            عرض كل الطلبات
          </Link>
        </div>
      ) : null}

      <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_220px_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="بحث باسم المستخدم أو البريد أو الجوال أو رقم العملية"
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        />
        {requestId ? <input type="hidden" name="request" value={requestId} /> : null}
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        >
          <option value="">كل الحالات</option>
          {statusValues.map((value) => (
            <option key={value} value={value}>
              {statusLabels[value]}
            </option>
          ))}
        </select>
        <button className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-white">
          بحث
        </button>
      </form>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="إجمالي النتائج" value={data.total} />
        <SummaryCard label="الصفحة الحالية" value={`${data.page} / ${data.totalPages}`} />
        <SummaryCard label="المعروض الآن" value={data.requests.length} />
      </div>

      <div className="mt-6 grid gap-4">
        {data.requests.map((request) => (
          <article key={request.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{request.user.name}</h2>
                  <Badge>{statusLabels[request.status]}</Badge>
                  <Badge>باقة {storePlans[request.targetPlan].label}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {request.user.email ?? "لا يوجد بريد"} · {request.user.phone ?? "لا يوجد جوال"} ·
                  باقته الحالية: {storePlans[request.user.storePlan].label}
                </p>
                <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
                  <Info label="المبلغ" value={`${request.amountIls} شيكل`} />
                  <Info label="طريقة الدفع" value={paymentMethods[request.method].label} />
                  <Info label="اسم المحول" value={request.payerName ?? "غير مضاف"} />
                  <Info label="رقم العملية" value={request.reference ?? "غير مضاف"} />
                </div>
                {request.note ? (
                  <p className="mt-3 rounded-xl bg-white/5 p-3 text-sm leading-6 text-slate-300">
                    ملاحظة المستخدم: {request.note}
                  </p>
                ) : null}
                {request.adminNote ? (
                  <p className="mt-3 rounded-xl bg-white/5 p-3 text-sm leading-6 text-slate-300">
                    ملاحظة الإدارة: {request.adminNote}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2 sm:min-w-72">
                <PaymentProofPreview proofUrl={request.proofUrl} />

                {request.status === "PENDING" ? (
                  <div className="grid gap-2">
                    <form action={approveStorePlanPaymentFormAction} className="grid gap-2">
                      <input type="hidden" name="requestId" value={request.id} />
                      <input
                        name="adminNote"
                        placeholder="ملاحظة اختيارية"
                        className="h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
                      />
                      <button className="min-h-10 rounded-xl bg-primary px-4 text-sm font-bold text-white">
                        قبول وتفعيل الباقة
                      </button>
                    </form>
                    <form action={rejectStorePlanPaymentFormAction} className="grid gap-2">
                      <input type="hidden" name="requestId" value={request.id} />
                      <input
                        name="adminNote"
                        placeholder="سبب الرفض"
                        className="h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
                      />
                      <button className="min-h-10 rounded-xl bg-red-600 px-4 text-sm font-bold text-white">
                        رفض الطلب
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}

        {data.requests.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-xl font-bold text-white">لا توجد طلبات دفع حالياً</h2>
            <p className="mt-2 text-sm text-slate-300">
              ستظهر الطلبات هنا بعد رفع المستخدمين لإشعارات الدفع.
            </p>
          </div>
        ) : null}
      </div>

      <Pagination
        baseHref={getAdminHref("/store/payments")}
        page={data.page}
        totalPages={data.totalPages}
        searchParams={baseParams}
      />
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary-light">
      {children}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function Pagination({
  baseHref,
  page,
  totalPages,
  searchParams,
}: {
  baseHref: string;
  page: number;
  totalPages: number;
  searchParams: URLSearchParams;
}) {
  if (totalPages <= 1) return null;

  const previousParams = new URLSearchParams(searchParams);
  previousParams.set("page", String(page - 1));
  const nextParams = new URLSearchParams(searchParams);
  nextParams.set("page", String(page + 1));

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-3">
      {page > 1 ? (
        <Link
          href={`${baseHref}?${previousParams.toString()}`}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white"
        >
          السابق
        </Link>
      ) : null}
      <span className="rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-300">
        صفحة {page} من {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={`${baseHref}?${nextParams.toString()}`}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white"
        >
          التالي
        </Link>
      ) : null}
    </nav>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value: string | undefined): StorePlanPaymentStatus | undefined {
  return statusValues.includes(value as StorePlanPaymentStatus)
    ? (value as StorePlanPaymentStatus)
    : undefined;
}
