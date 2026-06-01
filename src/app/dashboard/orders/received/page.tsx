import { StoreRouteShell } from "@/components/store/store-route-shell";

export const metadata = {
  title: "الطلبات الواردة",
};

export default function ReceivedOrdersPage() {
  return (
    <StoreRouteShell
      eyebrow="طلبات المتجر"
      title="الطلبات الواردة كبائع"
      description="ستظهر هنا طلبات العملاء على منتجاتك وخدماتك، مع أزرار القبول والرفض وتحديث حالة التنفيذ."
      backHref="/dashboard/store"
      backLabel="العودة لمتجري"
      variant="dashboard"
    />
  );
}
