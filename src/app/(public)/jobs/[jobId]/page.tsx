import { notFound } from "next/navigation";

import { JobDetails } from "@/components/jobs/job-details";
import { PageHeader } from "@/components/shared/page-header";
import { auth } from "@/lib/auth";
import { absoluteUrl, createPageMetadata, truncateDescription } from "@/lib/seo";
import { getJobById, getSimilarJobs, incrementJobViews } from "@/services/job.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await getJobById(jobId);

  if (!job) {
    return createPageMetadata({
      title: "تفاصيل الطلب",
      description: "تفاصيل طلب عمل أو خدمة على منصة أرزاق.",
      path: `/jobs/${jobId}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: job.title,
    description: truncateDescription(
      `${job.description} التصنيف: ${job.category.name}. المنطقة: ${job.region}.`,
    ),
    path: `/jobs/${job.id}`,
  });
}

export default async function JobDetailsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const session = await auth();
  const job = await getJobById(jobId, session?.user?.id);

  if (!job) {
    notFound();
  }

  const [similarJobs] = await Promise.all([
    getSimilarJobs(job.category.id, job.id, session?.user?.id),
    incrementJobViews(job.id, session?.user?.id),
  ]);
  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString(),
    validThrough: job.expiresAt?.toISOString(),
    employmentType: job.workMode,
    hiringOrganization: {
      "@type": "Organization",
      name: "أرزاق",
      sameAs: absoluteUrl("/"),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.region,
        addressRegion: "Gaza",
        addressCountry: "PS",
      },
    },
    url: absoluteUrl(`/jobs/${job.id}`),
    identifier: {
      "@type": "PropertyValue",
      name: "أرزاق",
      value: job.code,
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
      />
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
