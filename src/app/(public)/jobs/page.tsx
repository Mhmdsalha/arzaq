import { Suspense } from "react";

import { JobList } from "@/components/jobs/job-list";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { regionLabels } from "@/constants/regions";
import { createPageMetadata } from "@/lib/seo";
import { jobFiltersSchema } from "@/schemas/job.schema";
import { getCachedJobFilterOptions, getCachedJobsWithFilters } from "@/services/job.service";

export const metadata = createPageMetadata({
  title: "طلبات العمل والخدمات في غزة",
  description:
    "تصفح أحدث طلبات العمل والخدمات المفتوحة في غزة، وفرز الفرص حسب المنطقة، المجال، طريقة العمل والطلبات العاجلة.",
  path: "/jobs",
});

export const revalidate = 60;

export default function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <main>
      <PageHeader
        title="طلبات العمل والخدمات"
        description="تصفح الطلبات المنشورة، فلتر حسب المنطقة أو المجال، واختر الفرصة المناسبة لمهارتك."
        breadcrumbs={[{ label: "الطلبات" }]}
      />
      <Suspense fallback={<JobsContentSkeleton />}>
        <JobsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function JobsContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsedFilters = jobFiltersSchema.safeParse({
    q: getSingleParam(params.q),
    category: getSingleParam(params.category),
    region: getSingleParam(params.region),
    workMode: getSingleParam(params.workMode),
    urgent: getSingleParam(params.urgent),
    page: getSingleParam(params.page),
  });
  const filters = parsedFilters.success ? parsedFilters.data : {};
  const [categories, jobs] = await Promise.all([
    getCachedJobFilterOptions(),
    getCachedJobsWithFilters(filters),
  ]);

  return (
    <section className="container-responsive py-6 lg:py-8">
      <JobList
        jobs={jobs.items}
        categories={categories}
        regions={Object.entries(regionLabels).map(([value, label]) => ({ value, label }))}
        filters={{
          q: filters.q ?? "",
          category: filters.category ?? "all",
          region: filters.region ?? "all",
          workMode: filters.workMode ?? "all",
          urgentOnly: filters.urgent ?? false,
        }}
        pagination={{
          page: jobs.page,
          total: jobs.total,
          totalPages: jobs.totalPages,
        }}
      />
    </section>
  );
}

function JobsContentSkeleton() {
  return (
    <section className="container-responsive py-6 lg:py-8">
      <Skeleton className="mb-6 h-16 w-full rounded-2xl" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
