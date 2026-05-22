import { notFound } from "next/navigation";

import { JobDetails } from "@/components/jobs/job-details";
import { PageHeader } from "@/components/shared/page-header";
import { jobs } from "@/mock/jobs";

export function generateStaticParams() {
  return jobs.map((job) => ({ jobId: job.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = jobs.find((item) => item.id === jobId);

  return {
    title: job ? job.title : "تفاصيل الطلب",
  };
}

export default async function JobDetailsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    notFound();
  }

  const similarJobs = jobs.filter(
    (item) => item.categorySlug === job.categorySlug && item.id !== job.id,
  );

  return (
    <main>
      <PageHeader
        title={job.title}
        description="تفاصيل الطلب وطريقة التواصل مع صاحب الطلب."
        breadcrumbs={[{ label: "الطلبات", href: "/jobs" }, { label: job.title }]}
      />
      <section className="container py-8">
        <JobDetails job={job} similarJobs={similarJobs} />
      </section>
    </main>
  );
}
