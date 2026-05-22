"use client";

import { LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";

import { JobCard } from "@/components/jobs/job-card";
import { JobFilters, type JobFilterState } from "@/components/jobs/job-filters";
import { JobSearch } from "@/components/jobs/job-search";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import type { Category, JobPost } from "@/types/marketplace";

const initialFilters: JobFilterState = {
  region: "all",
  category: "all",
  workMode: "all",
  urgentOnly: false,
};

export function JobList({
  jobs,
  categories,
  regions,
}: {
  jobs: JobPost[];
  categories: Category[];
  regions: Array<{ value: string; label: string }>;
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [view, setView] = useState<"grid" | "list">("grid");

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery =
        !normalizedQuery ||
        `${job.title} ${job.description} ${job.skills.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesRegion = filters.region === "all" || job.region === filters.region;
      const matchesCategory = filters.category === "all" || job.categorySlug === filters.category;
      const matchesWorkMode = filters.workMode === "all" || job.workMode === filters.workMode;
      const matchesUrgent = !filters.urgentOnly || job.isUrgent;

      return matchesQuery && matchesRegion && matchesCategory && matchesWorkMode && matchesUrgent;
    });
  }, [filters, jobs, query]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <JobFilters categories={categories} regions={regions} value={filters} onChange={setFilters} />

      <section className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <JobSearch onSearch={setQuery} />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={view === "grid" ? "default" : "secondary"}
                size="icon"
                onClick={() => setView("grid")}
                aria-label="عرض شبكي"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                type="button"
                variant={view === "list" ? "default" : "secondary"}
                size="icon"
                onClick={() => setView("list")}
                aria-label="عرض قائمة"
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            تم العثور على {filteredJobs.length} طلب مناسب.
          </p>
        </div>

        {filteredJobs.length > 0 ? (
          <div className={view === "grid" ? "grid gap-4 xl:grid-cols-2" : "grid gap-4"}>
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} compact={view === "grid"} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}

        {filteredJobs.length > 0 ? <Pagination currentPage={1} totalPages={3} /> : null}
      </section>
    </div>
  );
}
