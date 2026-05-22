import { Bookmark, BriefcaseBusiness, CheckCircle2, Send } from "lucide-react";

import { StatsCard } from "@/components/dashboard/stats-card";
import type { DashboardStatsData } from "@/types/dashboard";

export function DashboardStats({ stats }: { stats: DashboardStatsData }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="إحصائيات لوحة التحكم">
      <StatsCard
        icon={BriefcaseBusiness}
        label="الطلبات المنشورة"
        value={stats.postedJobs}
        trend="إجمالي"
      />
      <StatsCard
        icon={Send}
        label="العروض المرسلة"
        value={stats.sentOffers}
        trend="نشاطك"
        tone="blue"
      />
      <StatsCard
        icon={CheckCircle2}
        label="العروض المقبولة"
        value={stats.acceptedOffers}
        trend="فرص ناجحة"
        tone="green"
      />
      <StatsCard
        icon={Bookmark}
        label="الطلبات المحفوظة"
        value={stats.savedJobs}
        trend="للمتابعة"
        tone="amber"
      />
    </section>
  );
}
