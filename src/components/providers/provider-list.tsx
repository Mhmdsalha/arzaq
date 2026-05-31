"use client";

import { useMemo, useState } from "react";

import { ProviderCard } from "@/components/providers/provider-card";
import { ProviderFilters, type ProviderFilterState } from "@/components/providers/provider-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import type { Category, ProviderProfile } from "@/types/marketplace";

const initialFilters: ProviderFilterState = {
  region: "all",
  category: "all",
  trustedOnly: false,
};

const PROVIDERS_PER_PAGE = 10;

export function ProviderList({
  providers,
  categories,
  regions,
}: {
  providers: ProviderProfile[];
  categories: Category[];
  regions: Array<{ value: string; label: string }>;
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);

  const filteredProviders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return providers.filter((provider) => {
      const matchesQuery =
        !normalizedQuery ||
        `${provider.name} ${provider.title} ${provider.bio} ${provider.skills.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesRegion = filters.region === "all" || provider.region === filters.region;
      const matchesCategory =
        filters.category === "all" || provider.categorySlugs.includes(filters.category);
      const matchesTrusted = !filters.trustedOnly || provider.isTrusted;

      return matchesQuery && matchesRegion && matchesCategory && matchesTrusted;
    });
  }, [filters, providers, query]);

  const totalPages = Math.max(Math.ceil(filteredProviders.length / PROVIDERS_PER_PAGE), 1);
  const visibleProviders = filteredProviders.slice(
    (page - 1) * PROVIDERS_PER_PAGE,
    page * PROVIDERS_PER_PAGE,
  );

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    document.getElementById("providers-results")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr] lg:gap-6">
        <ProviderFilters
          categories={categories}
          regions={regions}
          value={filters}
          onChange={(nextFilters) => {
            setFilters(nextFilters);
            setPage(1);
          }}
        />

      <section id="providers-results" className="scroll-mt-24 space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <SearchInput
            value={query}
            onChange={(nextQuery) => {
              setQuery(nextQuery);
              setPage(1);
            }}
            placeholder="ابحث بالاسم، المهارة أو المجال..."
          />
          <p className="mt-3 text-xs leading-relaxed text-slate-500 sm:text-sm">
            تم العثور على {filteredProviders.length} مقدم خدمة.
            {filteredProviders.length > PROVIDERS_PER_PAGE
              ? ` تظهر الصفحة ${page} من ${totalPages}.`
              : ""}
          </p>
        </div>

        {filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {visibleProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <EmptyState title="لا يوجد أي مقدم خدمة مطابق للبحث" />
        )}

        {filteredProviders.length > PROVIDERS_PER_PAGE ? (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        ) : null}
      </section>
    </div>
  );
}
