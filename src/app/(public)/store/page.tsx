import type { DeliveryMethod, ListingType, Region } from "@prisma/client";
import Link from "next/link";
import { Suspense } from "react";

import { ListingCard } from "@/components/store/listing-card";
import { ListingPagination } from "@/components/store/listing-pagination";
import { StoreFilters, type StoreFilterValues } from "@/components/store/store-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/shared/Skeleton";
import { createPageMetadata } from "@/lib/seo";
import { auth } from "@/lib/auth";
import {
  getCachedListingFilterOptions,
  getCachedListingsWithFilters,
  getListingsWithFilters,
  type ListingFiltersInput,
} from "@/services/listing.service";

export const revalidate = 30;

export const metadata = createPageMetadata({
  title: "متجر أرزاق",
  description: "خدمات جاهزة ومنتجات محلية من أهل غزة داخل منصة أرزاق.",
  path: "/store",
});

export default function StorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <main className="pb-16 pt-28">
      <section className="container-responsive">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-primary-dark">متجر أرزاق</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
                خدمات وبضائع محلية من أهل غزة
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                تصفح خدمات جاهزة ومنتجات محلية، وابدأ الطلب داخل أرزاق مع بقاء الدفع خارج المنصة حسب الاتفاق.
              </p>
            </div>
            <Link
              href="/dashboard/store/new"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-dark"
            >
              أضف منتجاً أو خدمة
            </Link>
          </div>
        </div>
      </section>

      <Suspense fallback={<StoreContentSkeleton />}>
        <StoreContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function StoreContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await auth();
  const filters = parseStoreFilters(params);
  const [categories, listings] = await Promise.all([
    getCachedListingFilterOptions(),
    session?.user?.id
      ? getListingsWithFilters(filters, session.user.id)
      : getCachedListingsWithFilters(filters),
  ]);
  const queryParams = toUrlSearchParams(params);

  return (
    <section className="container-responsive py-6 lg:py-8">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <TypeTab href={buildTypeHref(queryParams, undefined)} active={!filters.type}>
          الكل
        </TypeTab>
        <TypeTab href={buildTypeHref(queryParams, "SERVICE")} active={filters.type === "SERVICE"}>
          خدمات جاهزة
        </TypeTab>
        <TypeTab href={buildTypeHref(queryParams, "PHYSICAL")} active={filters.type === "PHYSICAL"}>
          منتجات
        </TypeTab>
        <span className="ms-auto text-sm text-slate-500">
          {listings.total} منتج وخدمة متاحة
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr] lg:gap-6">
        <StoreFilters categories={categories} values={toFilterValues(filters)} />

        <div className="space-y-5">
          {listings.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {listings.items.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              <ListingPagination
                page={listings.page}
                totalPages={listings.totalPages}
                searchParams={queryParams}
              />
            </>
          ) : (
            <EmptyState
              title="لا توجد منتجات أو خدمات بعد"
              description="ابدأ بإضافة أول منتج أو خدمة، أو جرّب تعديل الفلاتر الحالية."
              action={
                <Link
                  href="/dashboard/store/new"
                  className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-white"
                >
                  إضافة منتج أو خدمة
                </Link>
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

function StoreContentSkeleton() {
  return (
    <section className="container-responsive py-6 lg:py-8">
      <div className="grid gap-5 lg:grid-cols-[280px_1fr] lg:gap-6">
        <Skeleton className="h-[560px] rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

function TypeTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-white"
          : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
      }
    >
      {children}
    </Link>
  );
}

function parseStoreFilters(params: Record<string, string | string[] | undefined>): ListingFiltersInput {
  return {
    q: getSingleParam(params.q) ?? undefined,
    type: parseEnum<ListingType>(getSingleParam(params.type), ["SERVICE", "PHYSICAL"]),
    category: normalizeAll(getSingleParam(params.category)),
    region: parseEnum<Region>(getSingleParam(params.region), [
      "NORTH_GAZA",
      "GAZA_CITY",
      "CENTRAL",
      "KHAN_YOUNIS",
      "RAFAH",
      "ONLINE",
    ]),
    delivery: parseEnum<DeliveryMethod>(getSingleParam(params.delivery), [
      "IN_PERSON",
      "DELIVERY",
      "ONLINE",
      "WHATSAPP",
    ]),
    min: parsePrice(getSingleParam(params.min)),
    max: parsePrice(getSingleParam(params.max)),
    sort: parseEnum<NonNullable<ListingFiltersInput["sort"]>>(getSingleParam(params.sort), [
      "newest",
      "price_asc",
      "price_desc",
      "popular",
    ]) ?? "newest",
    page: parsePage(getSingleParam(params.page)),
  };
}

function toFilterValues(filters: ListingFiltersInput): StoreFilterValues {
  return {
    q: filters.q ?? "",
    type: filters.type ?? "all",
    category: filters.category ?? "all",
    region: filters.region ?? "all",
    delivery: filters.delivery ?? "all",
    min: typeof filters.min === "number" ? String(filters.min) : "",
    max: typeof filters.max === "number" ? String(filters.max) : "",
    sort: filters.sort ?? "newest",
  };
}

function buildTypeHref(params: URLSearchParams, type: ListingType | undefined) {
  const nextParams = new URLSearchParams(params);
  nextParams.delete("page");

  if (type) {
    nextParams.set("type", type);
  } else {
    nextParams.delete("type");
  }

  const query = nextParams.toString();
  return query ? `/store?${query}` : "/store";
}

function toUrlSearchParams(params: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const currentValue = getSingleParam(value);
    if (currentValue) {
      searchParams.set(key, currentValue);
    }
  }

  return searchParams;
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeAll(value: string | undefined) {
  return !value || value === "all" ? undefined : value;
}

function parsePrice(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

function parsePage(value: string | undefined) {
  const page = Number(value ?? "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function parseEnum<T extends string>(value: string | undefined, values: readonly T[]) {
  return value && values.includes(value as T) ? (value as T) : undefined;
}
