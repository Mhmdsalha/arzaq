import { StoreRouteShell } from "@/components/store/store-route-shell";
import { getAdminHref } from "@/lib/admin-path";

export const metadata = {
  title: "بلاغات المتجر",
};

export default function AdminStoreReportsPage() {
  return (
    <StoreRouteShell
      eyebrow="إدارة المتجر"
      title="بلاغات المنتجات والخدمات"
      description="سيتم هنا مراجعة بلاغات المستخدمين على عناصر المتجر واتخاذ الإجراء المناسب."
      backHref={getAdminHref("/store")}
      backLabel="إدارة المتجر"
      variant="admin"
    />
  );
}
