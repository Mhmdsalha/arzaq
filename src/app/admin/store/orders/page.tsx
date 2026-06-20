import type { OrderStatus } from "@prisma/client";
import Link from "next/link";

import { adminUpdateStoreOrderStatusFormAction } from "@/actions/admin-store.actions";
import { getAdminHref } from "@/lib/admin-path";
import { getAdminStoreOrders } from "@/services/admin-store.service";

const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "بانتظار التأكيد",
  CONFIRMED: "مؤكد",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
  DISPUTED: "قيد المراجعة",
};

const orderStatusValues = Object.keys(orderStatusLabels) as OrderStatus[];

export const metadata = {
  title: "طلبات المتجر",
};

export default async function AdminStoreOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getParam(params.q);
  const status = parseOrderStatus(getParam(params.status));
  const page = Number(getParam(params.page) ?? "1");
  const data = await getAdminStoreOrders({ q, status, page });
  const baseParams = new URLSearchParams();

  if (q) baseParams.set("q", q);
  if (status) baseParams.set("status", status);

  return (
    <section className="container-responsive py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">كل طلبات المتجر</h1>
          <p className="mt-2 text-sm text-slate-300">
            راقب الطلبات بين المشترين والبائعين، وتابع حالات التنفيذ والتسليم.
          </p>
        </div>
        <Link href={getAdminHref("/store")} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200">
          إدارة المتجر
        </Link>
      </div>

      <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_220px_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="بحث برقم الطلب أو اسم العميل أو البائع أو العنصر"
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        >
          <option value="">كل الحالات</option>
          {orderStatusValues.map((value) => (
            <option key={value} value={value}>
              {orderStatusLabels[value]}
            </option>
          ))}
        </select>
        <button className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-white">بحث</button>
      </form>

      <div className="mt-6 grid gap-4">
        {data.orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{order.listing.title}</h2>
                  <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-slate-200">
                    {order.id.slice(-10).toUpperCase()}
                  </span>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary-light">
                    {orderStatusLabels[order.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  العميل: {order.buyer.name} · البائع: {order.listing.seller.name}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  الكمية: {order.quantity} · الإجمالي: {formatPrice(order.totalPrice)} · {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="grid gap-2 sm:min-w-64">
                <Link
                  href={`/store/${order.listing.id}`}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-200 hover:bg-white/10"
                >
                  عرض العنصر
                </Link>
                <form action={adminUpdateStoreOrderStatusFormAction} className="grid grid-cols-[1fr_auto] gap-2">
                  <input type="hidden" name="orderId" value={order.id} />
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
                  >
                    {orderStatusValues.map((value) => (
                      <option key={value} value={value}>
                        {orderStatusLabels[value]}
                      </option>
                    ))}
                  </select>
                  <button className="min-h-10 rounded-xl bg-primary px-4 text-sm font-bold text-white">
                    حفظ
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Pagination
        baseHref={getAdminHref("/store/orders")}
        page={data.page}
        totalPages={data.totalPages}
        searchParams={baseParams}
      />
    </section>
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
    <div className="mt-6 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link
          className="rounded-xl border border-white/10 px-4 py-2 text-white"
          href={`${baseHref}?${previousParams.toString()}`}
        >
          السابق
        </Link>
      ) : null}
      <span className="text-sm text-slate-300">صفحة {page} من {totalPages}</span>
      {page < totalPages ? (
        <Link
          className="rounded-xl border border-white/10 px-4 py-2 text-white"
          href={`${baseHref}?${nextParams.toString()}`}
        >
          التالي
        </Link>
      ) : null}
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseOrderStatus(value: string | undefined): OrderStatus | undefined {
  return orderStatusValues.includes(value as OrderStatus) ? (value as OrderStatus) : undefined;
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ar").format(price)} شيكل`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(date);
}
