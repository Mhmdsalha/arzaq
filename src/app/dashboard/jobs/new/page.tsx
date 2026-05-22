import { JobForm } from "@/components/jobs/job-form";
import { getJobFilterOptions } from "@/services/job.service";

export const metadata = {
  title: "نشر طلب",
};

export default async function NewDashboardJobPage() {
  const categories = await getJobFilterOptions();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-dark">طلب جديد</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">نشر طلب</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          اكتب طلبك بوضوح حتى تصل للعروض المناسبة بسرعة.
        </p>
      </div>

      <JobForm categories={categories} mode="create" />
    </div>
  );
}
