import Link from "next/link";

import { StoreRouteShell } from "@/components/store/store-route-shell";
import { getAdminHref } from "@/lib/admin-path";

export const metadata = {
  title: "إدارة المتجر",
};

export default function AdminStorePage() {
  return (
    <StoreRouteShell
      eyebrow="لوحة الإدارة"
      title="إدارة متجر أرزاق"
      description="من هنا ستتابع الإدارة المنتجات والطلبات والبلاغات الخاصة بميزة المتجر."
      backHref={getAdminHref()}
      backLabel="لوحة الإدارة"
      variant="admin"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminStoreLink href={getAdminHref("/store/listings")} label="كل المنتجات" />
        <AdminStoreLink href={getAdminHref("/store/orders")} label="كل الطلبات" />
        <AdminStoreLink href={getAdminHref("/store/reports")} label="بلاغات المتجر" />
      </div>
    </StoreRouteShell>
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
