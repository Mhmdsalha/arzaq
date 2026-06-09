import type { StorePlanPaymentStatus } from "@prisma/client";
import Link from "next/link";

import {
  approveStorePlanPaymentFormAction,
  rejectStorePlanPaymentFormAction,
} from "@/actions/store-plan.actions";
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
  const status = parseStatus(getParam(params.status));
  const page = Number(getParam(params.page) ?? "1");
  const data = await getAdminStorePlanPaymentRequests({ status, page });

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

      <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[220px_auto]">
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
          فلترة
        </button>
      </form>

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
                <a
                  href={request.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-slate-950"
                >
                  عرض إشعار الدفع
                </a>

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
    </section>
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

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value: string | undefined): StorePlanPaymentStatus | undefined {
  return statusValues.includes(value as StorePlanPaymentStatus)
    ? (value as StorePlanPaymentStatus)
    : undefined;
}
