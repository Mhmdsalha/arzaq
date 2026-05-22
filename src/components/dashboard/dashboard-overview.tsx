import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { NotificationsPreview } from "@/components/dashboard/notifications-preview";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import type { DashboardOverviewData, DashboardShellUser } from "@/types/dashboard";

export function DashboardOverview({
  user,
  data,
}: {
  user: DashboardShellUser;
  data: DashboardOverviewData;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-primary-dark">مرحبًا بعودتك</p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">أهلًا {user.name}</h1>
            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
              هذه نظرة سريعة على طلباتك، عروضك، والتنبيهات المهمة داخل أرزاق.
            </p>
          </div>
        </div>
      </section>

      <DashboardStats stats={data.stats} />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <RecentActivity activities={data.activities} />
        <div className="grid gap-6">
          <ProfileCompletionCard completion={data.profileCompletion} />
          <NotificationsPreview notifications={data.notifications} />
        </div>
      </div>
    </div>
  );
}
