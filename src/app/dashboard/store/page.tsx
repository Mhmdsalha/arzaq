import { StoreRouteShell } from "@/components/store/store-route-shell";

export const metadata = {
  title: "متجري",
};

export default function DashboardStorePage() {
  return (
    <StoreRouteShell
      eyebrow="لوحة التحكم"
      title="إدارة متجري"
      description="هنا سيدير المستخدم خدماته ومنتجاته، مع إحصائيات الطلبات والمشاهدات والحالة."
      backHref="/dashboard"
      backLabel="لوحة التحكم"
      variant="dashboard"
    />
  );
}
