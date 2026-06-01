import { StoreRouteShell } from "@/components/store/store-route-shell";
import { getAdminHref } from "@/lib/admin-path";

export const metadata = {
  title: "طلبات المتجر",
};

export default function AdminStoreOrdersPage() {
  return (
    <StoreRouteShell
      eyebrow="إدارة المتجر"
      title="كل طلبات المتجر"
      description="سيتم هنا عرض الطلبات بين المشترين والبائعين مع الحالة والكمية والسعر والتاريخ."
      backHref={getAdminHref("/store")}
      backLabel="إدارة المتجر"
      variant="admin"
    />
  );
}
