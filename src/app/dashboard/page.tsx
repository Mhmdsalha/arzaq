import { redirect } from "next/navigation";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { auth } from "@/lib/auth";
import { getDashboardOverviewData, getDashboardShellUser } from "@/services/dashboard.service";

export const metadata = {
  title: "لوحة التحكم",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const [user, overviewData] = await Promise.all([
    getDashboardShellUser(session.user.id),
    getDashboardOverviewData(session.user.id),
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  return <DashboardOverview user={user} data={overviewData} />;
}
