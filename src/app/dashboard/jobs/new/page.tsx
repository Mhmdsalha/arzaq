import { DashboardComingSoon } from "@/components/dashboard/dashboard-coming-soon";

export const metadata = {
  title: "نشر طلب",
};

export default function NewDashboardJobPage() {
  return (
    <DashboardComingSoon
      title="نشر طلب جديد"
      description="نموذج نشر الطلبات سيُبنى في Phase 5 مع التصنيفات، المنطقة، طريقة العمل، الميزانية، والحالة العاجلة."
    />
  );
}
