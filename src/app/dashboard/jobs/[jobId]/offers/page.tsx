import { DashboardComingSoon } from "@/components/dashboard/dashboard-coming-soon";

export const metadata = {
  title: "عروض المتقدمين",
};

export default function DashboardJobOffersPage() {
  return (
    <DashboardComingSoon
      title="عروض المتقدمين"
      description="سيتم بناء صفحة عروض الطلب في Phase 6 مع قبول ورفض العروض داخل معاملة Prisma واحدة."
    />
  );
}
