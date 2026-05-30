"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { JobCard } from "@/components/jobs/job-card";
import { JobFilters, type JobFilterState } from "@/components/jobs/job-filters";
import { JobSearch } from "@/components/jobs/job-search";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/shared/Skeleton";
import type { JobCategoryOption, JobListItem } from "@/types/job";

type JobsApiResponse = {
  items: Array<
    Omit<JobListItem, "createdAt" | "expiresAt"> & {
      createdAt: string;
      expiresAt: string | null;
    }
  >;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function JobList({
  jobs,
  categories,
  regions,
  filters,
  pagination,
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
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (updates: Record<string, string | boolean | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") {
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

  const resultsKey = JSON.stringify({
    filters,
    page: pagination.page,
    ids: jobs.map((job) => job.id),
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr] lg:gap-6">
      <JobFilters
        categories={categories}
        regions={regions}
        value={filters}
        onChange={(value) =>
          updateParam({
            category: value.category,
            region: value.region,
            workMode: value.workMode,
            urgent: value.urgentOnly ? "true" : undefined,
          })
        }
      />

      <section className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:items-center">
            <JobSearch value={filters.q} onSearch={(q) => updateParam({ q })} />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            تم العثور على {pagination.total} طلب مناسب.
          </p>
        </div>

        <InfiniteJobResults key={resultsKey} jobs={jobs} pagination={pagination} />
      </section>
    </div>
  );
}

function InfiniteJobResults({
  jobs,
  pagination,
}: {
  jobs: JobListItem[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
}) {
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [visibleJobs, setVisibleJobs] = useState(jobs);
  const [currentPage, setCurrentPage] = useState(pagination.page);
  const [totalPages, setTotalPages] = useState(pagination.totalPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const hasMore = currentPage < totalPages;

  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(null);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(currentPage + 1));

    try {
      const response = await fetch(`/api/jobs?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to load more jobs");
      }

      const data = (await response.json()) as JobsApiResponse;

      setVisibleJobs((previousJobs) => [
        ...previousJobs,
        ...data.items.map(normalizeJobDates),
      ]);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      setLoadMoreError("تعذر تحميل المزيد من الطلبات، حاول مرة أخرى");
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, searchParams]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;

    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void loadNextPage();
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  return (
    <>
      {visibleJobs.length > 0 ? (
        <div className="grid gap-4">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState title="لا توجد طلبات" description="جرّب تعديل الفلاتر أو كلمة البحث الحالية." />
      )}

      {visibleJobs.length > 0 ? (
        <div ref={loadMoreRef} className="min-h-16">
          {isLoadingMore ? (
            <div className="space-y-4">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          ) : null}

          {loadMoreError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-600">
              <p>{loadMoreError}</p>
              <button
                type="button"
                onClick={() => void loadNextPage()}
                className="mt-3 h-11 rounded-xl bg-red-600 px-5 font-semibold text-white transition hover:bg-red-700"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : null}

          {!hasMore && !isLoadingMore ? (
            <p className="py-4 text-center text-sm text-slate-500">
              وصلت إلى نهاية الطلبات المتاحة.
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function normalizeJobDates(job: JobsApiResponse["items"][number]): JobListItem {
  return {
    ...job,
    createdAt: new Date(job.createdAt),
    expiresAt: job.expiresAt ? new Date(job.expiresAt) : null,
  };
}
