import { redirect } from "next/navigation";

import { JobForm } from "@/components/jobs/job-form";
import { auth } from "@/lib/auth";
import { getJobFilterOptions, getJobForEdit } from "@/services/job.service";

export const metadata = {
  title: "تعديل الطلب",
};

export default async function EditDashboardJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { jobId } = await params;
  const [categories, job] = await Promise.all([
    getJobFilterOptions(),
    getJobForEdit(jobId, session.user.id),
  ]);

  if (!job) {
    redirect("/dashboard/jobs");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-dark">تعديل الطلب</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">تعديل الطلب</h1>
        <p className="mt-2 text-sm text-slate-600">يمكن تعديل الطلبات المفتوحة فقط.</p>
      </div>

      <JobForm categories={categories} mode="edit" initialData={job} />
    </div>
  );
}
