import { JobList } from "@/components/jobs/job-list";
import { PageHeader } from "@/components/shared/page-header";
import { categories } from "@/mock/categories";
import { jobs } from "@/mock/jobs";
import { regions } from "@/mock/regions";

export const metadata = {
  title: "طلبات العمل والخدمات",
};

export default function JobsPage() {
  return (
    <main>
      <PageHeader
        title="طلبات العمل والخدمات"
        description="تصفح الطلبات المنشورة، فلتر حسب المنطقة أو المجال، واختر الفرصة المناسبة لمهارتك."
        breadcrumbs={[{ label: "الطلبات" }]}
      />
      <section className="container py-8">
        <JobList jobs={jobs} categories={categories} regions={regions} />
      </section>
    </main>
  );
}
