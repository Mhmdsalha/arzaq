import { StoreRouteShell } from "@/components/store/store-route-shell";

export const metadata = {
  title: "طلباتي من المتجر",
};

export default function DashboardOrdersPage() {
  return (
    <StoreRouteShell
      eyebrow="طلبات المتجر"
      title="طلباتي كمشترٍ"
      description="ستظهر هنا الطلبات التي أرسلها المستخدم على منتجات أو خدمات المتجر، مع الحالة وإمكانية التقييم بعد الاكتمال."
      backHref="/dashboard"
      backLabel="لوحة التحكم"
      variant="dashboard"
    />
  );
}
