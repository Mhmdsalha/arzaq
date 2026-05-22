import { DashboardComingSoon } from "@/components/dashboard/dashboard-coming-soon";

export const metadata = {
  title: "طلباتي",
};

export default function DashboardJobsPage() {
  return (
    <DashboardComingSoon
      title="طلباتي"
      description="سيتم ربط هذه الصفحة بنظام إدارة الطلبات في Phase 5: عرض الطلبات، تعديلها، إغلاقها، وحذفها حذفًا ناعمًا."
    />
  );
}
