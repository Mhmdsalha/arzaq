import { DashboardComingSoon } from "@/components/dashboard/dashboard-coming-soon";

export const metadata = {
  title: "عروضي",
};

export default function DashboardOffersPage() {
  return (
    <DashboardComingSoon
      title="عروضي"
      description="سيتم بناء إدارة العروض المرسلة في Phase 6 مع تعديل العرض، سحبه، وحالة القبول أو الرفض."
    />
  );
}
