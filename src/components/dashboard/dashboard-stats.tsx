import type { AccountType } from "@prisma/client";
import { Bookmark, BriefcaseBusiness, CheckCircle2, Clock3, Inbox, Send, Star } from "lucide-react";

import { StatsCard } from "@/components/dashboard/stats-card";
import type { DashboardStatsData } from "@/types/dashboard";

export function DashboardStats({
  stats,
  accountType,
}: {
  stats: DashboardStatsData;
  accountType: AccountType;
}) {
  if (accountType === "PROVIDER") {
    return (
      <section
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
        aria-label="إحصائيات لوحة التحكم"
      >
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
          icon={Clock3}
          label="العروض قيد الانتظار"
          value={stats.pendingOffers}
          trend="بانتظار الرد"
          tone="amber"
        />
        <StatsCard
          icon={Star}
          label="متوسط التقييم"
          value={stats.avgRating}
          trend="سمعتك"
          tone="slate"
        />
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" aria-label="إحصائيات لوحة التحكم">
      <StatsCard
        icon={BriefcaseBusiness}
        label="الطلبات المنشورة"
        value={stats.postedJobs}
        trend="إجمالي"
      />
      <StatsCard
        icon={CheckCircle2}
        label="الطلبات المفتوحة"
        value={stats.openJobs}
        trend="متاحة"
        tone="blue"
      />
      <StatsCard
        icon={Inbox}
        label="العروض الواردة"
        value={stats.receivedOffers}
        trend="من مقدمي الخدمات"
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
