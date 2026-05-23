import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { Skeleton } from "@/components/shared/Skeleton";
import { auth } from "@/lib/auth";
import { getDashboardOverviewData, getDashboardShellUser } from "@/services/dashboard.service";

export const metadata = {
  title: "لوحة التحكم",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return (
    <Suspense fallback={<DashboardOverviewSkeleton />}>
      <DashboardOverviewContent userId={session.user.id} welcome={params.welcome} />
    </Suspense>
  );
}

async function DashboardOverviewContent({ userId, welcome }: { userId: string; welcome?: string }) {
  const [user, overviewData] = await Promise.all([
    getDashboardShellUser(userId),
    getDashboardOverviewData(userId),
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  return <DashboardOverview user={user} data={overviewData} welcome={welcome} />;
}

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
