import { notFound } from "next/navigation";

import { JobDetails } from "@/components/jobs/job-details";
import { PageHeader } from "@/components/shared/page-header";
import { auth } from "@/lib/auth";
import { getJobById, getSimilarJobs, incrementJobViews } from "@/services/job.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await getJobById(jobId);

  return {
    title: job ? job.title : "تفاصيل الطلب",
  };
}

export default async function JobDetailsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const session = await auth();
  const job = await getJobById(jobId, session?.user?.id);

  if (!job) {
    notFound();
  }

  await incrementJobViews(job.id, session?.user?.id);

  const similarJobs = await getSimilarJobs(job.category.id, job.id, session?.user?.id);

  return (
    <main>
      <PageHeader
        title={job.title}
        description="تفاصيل الطلب وطريقة التواصل مع صاحب الطلب."
        breadcrumbs={[{ label: "الطلبات", href: "/jobs" }, { label: job.title }]}
      />
      <section className="container py-8">
        <JobDetails
          job={job}
          similarJobs={similarJobs}
          isAuthenticated={Boolean(session?.user?.id)}
        />
      </section>
    </main>
  );
}
