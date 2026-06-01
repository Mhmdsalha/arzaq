import { StoreRouteShell } from "@/components/store/store-route-shell";
import { getAdminHref } from "@/lib/admin-path";

export const metadata = {
  title: "منتجات المتجر",
};

export default function AdminStoreListingsPage() {
  return (
    <StoreRouteShell
      eyebrow="إدارة المتجر"
      title="كل منتجات وخدمات المتجر"
      description="سيتم هنا عرض كل العناصر مع البائع، النوع، التصنيف، السعر، الحالة، وإجراءات التمييز أو الإيقاف أو الحذف."
      backHref={getAdminHref("/store")}
      backLabel="إدارة المتجر"
      variant="admin"
    />
  );
}
