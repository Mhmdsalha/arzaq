"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { JobCard } from "@/components/jobs/job-card";
import { JobFilters, type JobFilterState } from "@/components/jobs/job-filters";
import { JobSearch } from "@/components/jobs/job-search";
import { JobPagination } from "@/components/jobs/job-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import type { JobCategoryOption, JobListItem } from "@/types/job";

export function JobList({
  jobs,
  categories,
  regions,
  filters,
  pagination,
  isAuthenticated,
}: {
  jobs: JobListItem[];
  categories: JobCategoryOption[];
  regions: Array<{ value: string; label: string }>;
  filters: JobFilterState & { q: string };
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (updates: Record<string, string | boolean | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all" || (key === "status" && value === "OPEN")) {
          params.delete(key);
          continue;
        }

        params.set(key, String(value));
      }

      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <JobFilters
        categories={categories}
        regions={regions}
        value={filters}
        onChange={(value) =>
          updateParam({
            category: value.category,
            region: value.region,
            workMode: value.workMode,
            status: value.status,
            urgent: value.urgentOnly ? "true" : undefined,
          })
        }
      />

      <section className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:items-center">
            <JobSearch value={filters.q} onSearch={(q) => updateParam({ q })} />
          </div>
          <p className="mt-3 text-sm text-slate-500">تم العثور على {pagination.total} طلب مناسب.</p>
        </div>

        {jobs.length > 0 ? (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} isAuthenticated={isAuthenticated} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا توجد طلبات"
            description="جرّب تعديل الفلاتر أو كلمة البحث الحالية."
          />
        )}

        {jobs.length > 0 ? (
          <JobPagination currentPage={pagination.page} totalPages={pagination.totalPages} />
        ) : null}
      </section>
    </div>
  );
}
