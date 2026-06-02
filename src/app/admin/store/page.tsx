import Link from "next/link";

import { StoreRouteShell } from "@/components/store/store-route-shell";
import { getAdminHref } from "@/lib/admin-path";
import { getAdminStoreOverview } from "@/services/admin-store.service";

export const metadata = {
  title: "إدارة المتجر",
};

export default async function AdminStorePage() {
  const overview = await getAdminStoreOverview();

  return (
    <StoreRouteShell
      eyebrow="لوحة الإدارة"
      title="إدارة متجر أرزاق"
      description="تابع عناصر المتجر والطلبات والبلاغات من لوحة واحدة، واتخذ إجراءات سريعة عند الحاجة."
      backHref={getAdminHref()}
      backLabel="لوحة الإدارة"
      variant="admin"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat label="كل العناصر" value={overview.totalListings} />
        <AdminStat label="العناصر النشطة" value={overview.activeListings} />
        <AdminStat label="طلبات بانتظار التأكيد" value={overview.pendingOrders} />
        <AdminStat label="بلاغات قيد المراجعة" value={overview.pendingReports} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <AdminStoreLink href={getAdminHref("/store/listings")} label="كل المنتجات والخدمات" />
        <AdminStoreLink href={getAdminHref("/store/orders")} label="كل الطلبات" />
        <AdminStoreLink href={getAdminHref("/store/reports")} label="بلاغات المتجر" />
      </div>
    </StoreRouteShell>
  );
}

function AdminStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function AdminStoreLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-24 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-center font-bold text-white transition hover:bg-white/10"
    >
      {label}
    </Link>
  );
}
