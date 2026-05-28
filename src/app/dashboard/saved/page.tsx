import { redirect } from "next/navigation";

import { JobCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/shared/empty-state";
import { auth } from "@/lib/auth";
import { getSavedJobs } from "@/services/job.service";

export const metadata = {
  title: "المحفوظات",
};

export default async function DashboardSavedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const jobs = await getSavedJobs(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-dark">الطلبات المحفوظة</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">المحفوظات</h1>
        <p className="mt-2 text-sm text-slate-600">الطلبات التي حفظتها للعودة إليها لاحقًا.</p>
      </div>

      {jobs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="لا توجد محفوظات"
          description="احفظ الطلبات المهمة من صفحة الطلبات العامة."
        />
      )}
    </div>
  );
}
