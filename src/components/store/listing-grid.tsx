"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { ListingCard } from "@/components/store/listing-card";
import { ListingCardSkeleton } from "@/components/store/listing-card-skeleton";
import type { ListingListItem } from "@/types/store";

type ListingsApiResponse = {
  items: Array<Omit<ListingListItem, "createdAt"> & { createdAt: string }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function ListingGrid({
  listings,
  pagination,
}: {
  listings: ListingListItem[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
}) {
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [visibleListings, setVisibleListings] = useState(listings);
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
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(currentPage + 1));

    try {
      const response = await fetch(`/api/store?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to load more listings");
      }

      const data = (await response.json()) as ListingsApiResponse;

      setVisibleListings((previousListings) => {
        const existingIds = new Set(previousListings.map((listing) => listing.id));
        const nextListings = data.items
          .map(normalizeListingDates)
          .filter((listing) => !existingIds.has(listing.id));

        return [...previousListings, ...nextListings];
      });
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setLoadMoreError("تعذر تحميل المزيد من عناصر المتجر، حاول مرة أخرى");
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
      { rootMargin: "360px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      abortRef.current?.abort();
    };
  }, [hasMore, loadNextPage]);

  if (visibleListings.length === 0) {
    return (
      <EmptyState
        title="لا توجد نتائج"
        description="جرب تغيير الفلاتر أو البحث بكلمة أخرى."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
        {visibleListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      <div ref={loadMoreRef} className="min-h-20">
        {isLoadingMore ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
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
          <p className="py-8 text-center text-xs text-slate-400">— وصلت لنهاية المتجر —</p>
        ) : null}
      </div>
    </div>
  );
}

function normalizeListingDates(listing: ListingsApiResponse["items"][number]): ListingListItem {
  return {
    ...listing,
    createdAt: new Date(listing.createdAt),
  };
}
