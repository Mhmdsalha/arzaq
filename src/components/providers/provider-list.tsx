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

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <ProviderFilters
        categories={categories}
        regions={regions}
        value={filters}
        onChange={setFilters}
      />

      <section className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="ابحث بالاسم، المهارة أو المجال..."
          />
          <p className="mt-3 text-sm text-slate-500">
            تم العثور على {filteredProviders.length} مقدم خدمة.
          </p>
        </div>

        {filteredProviders.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <EmptyState title="لا يوجد مزودون مطابقون" />
        )}

        {filteredProviders.length > 0 ? <Pagination currentPage={1} totalPages={2} /> : null}
      </section>
    </div>
  );
}
