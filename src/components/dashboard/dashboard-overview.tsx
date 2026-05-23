import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { NotificationsPreview } from "@/components/dashboard/notifications-preview";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import type { DashboardOverviewData, DashboardShellUser } from "@/types/dashboard";
import Link from "next/link";

export function DashboardOverview({
  user,
  data,
  welcome,
}: {
  user: DashboardShellUser;
  data: DashboardOverviewData;
  welcome?: string;
}) {
  const isProvider = user.accountType === "PROVIDER";
  const isProfileComplete = data.profileCompletion.percent === 100;

  return (
    <div className="space-y-6">
      {welcome ? (
        <section className="rounded-3xl border border-primary/20 bg-primary/10 p-5 text-primary-dark">
          <p className="font-bold">
            {welcome === "provider"
              ? "مرحباً! أكمل بروفايلك لتظهر في نتائج البحث 🎉"
              : "مرحباً! ابدأ بنشر أول طلب عمل 🎉"}
          </p>
        </section>
      ) : null}

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

      <DashboardStats stats={data.stats} accountType={user.accountType} />

      <section
        className={
          isProvider
            ? "rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm"
            : "rounded-3xl border border-green-100 bg-green-50 p-6 shadow-sm"
        }
      >
        <h2 className="text-2xl font-bold text-slate-950">
          {isProvider
            ? isProfileComplete
              ? "تصفح أحدث الطلبات"
              : "أكمل بروفايلك"
            : "انشر طلبك الآن"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
          {isProvider
            ? isProfileComplete
              ? "اختر الطلب المناسب لمهاراتك وابدأ بتقديم عروض احترافية."
              : "البروفايل المكتمل يزيد فرص قبول عروضك بنسبة كبيرة"
            : "احصل على عروض من مئات مقدمي الخدمات في غزة"}
        </p>
        <Button asChild className="mt-5">
          <Link
            href={
              isProvider
                ? isProfileComplete
                  ? "/jobs"
                  : "/dashboard/profile"
                : "/dashboard/jobs/new"
            }
          >
            {isProvider ? (isProfileComplete ? "تصفح الطلبات" : "إكمال البروفايل") : "نشر طلب جديد"}
          </Link>
        </Button>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <RecentActivity activities={data.activities} />
        <div className="grid gap-6">
          {isProvider ? <ProfileCompletionCard completion={data.profileCompletion} /> : null}
          <NotificationsPreview notifications={data.notifications} />
        </div>
      </div>
    </div>
  );
}
