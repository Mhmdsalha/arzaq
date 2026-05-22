import { DashboardComingSoon } from "@/components/dashboard/dashboard-coming-soon";

export const metadata = {
  title: "المحفوظات",
};

export default function DashboardSavedPage() {
  return (
    <DashboardComingSoon
      title="المحفوظات"
      description="سيتم ربط الوظائف المحفوظة في Phase 5 مع زر الحفظ في بطاقة الطلب وصفحة التفاصيل."
    />
  );
}
