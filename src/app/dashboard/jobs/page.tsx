import Link from "next/link";
import { redirect } from "next/navigation";

import { MyJobsList } from "@/components/jobs/my-jobs-list";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getUserJobs } from "@/services/job.service";

export const metadata = {
  title: "طلباتي",
};

export default async function DashboardJobsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const jobs = await getUserJobs(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-dark">إدارة الطلبات</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">طلباتي</h1>
          <p className="mt-2 text-sm text-slate-600">
            تابع الطلبات التي نشرتها وعدّل المفتوح منها.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs/new">نشر طلب</Link>
        </Button>
      </div>

      <MyJobsList jobs={jobs} />
    </div>
  );
}
