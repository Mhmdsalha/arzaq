import type { DeliveryMethod, ListingType, Region } from "@prisma/client";
import { ArrowLeft, Package, Search, ShoppingBag, Sparkles, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { ListingGrid } from "@/components/store/listing-grid";
import { StoreFilterSheet } from "@/components/store/store-filter-sheet";
import { StoreFilters, type StoreFilterValues } from "@/components/store/store-filters";
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
    <main className="pb-20 pt-24 lg:pb-16 lg:pt-28">
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
  const [categories, listings, serviceListings, productListings] = await Promise.all([
    getCachedListingFilterOptions(),
    session?.user?.id
      ? getListingsWithFilters(filters, session.user.id)
      : getCachedListingsWithFilters(filters),
    getCachedListingsWithFilters({ ...filters, type: "SERVICE", page: 1, pageSize: 1 }),
    getCachedListingsWithFilters({ ...filters, type: "PHYSICAL", page: 1, pageSize: 1 }),
  ]);
  const queryParams = toUrlSearchParams(params);

  return (
    <section className="container-responsive space-y-5 lg:space-y-8">
      <StoreHero total={listings.total} serviceTotal={serviceListings.total} productTotal={productListings.total} />

      <StoreHeader
        filters={filters}
        queryParams={queryParams}
        total={listings.total}
        serviceTotal={serviceListings.total}
        productTotal={productListings.total}
        categories={categories}
      />

      <div className="grid gap-5 lg:grid-cols-[256px_1fr] lg:gap-6">
        <aside className="hidden lg:block">
          <StoreFilters
            categories={categories}
            values={toFilterValues(filters)}
            className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto"
          />
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="hidden items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex">
            <div>
              <p className="font-bold text-slate-950">{listings.total.toLocaleString("ar")} نتيجة</p>
              <p className="text-xs text-slate-500">تظهر النتائج الأحدث أولاً ويمكنك تعديل الفلاتر من القائمة الجانبية.</p>
            </div>
            <Link href="/dashboard/store/new" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark">
              إضافة عنصر
            </Link>
          </div>

          <ListingGrid
            listings={listings.items}
            pagination={{
              page: listings.page,
              total: listings.total,
              totalPages: listings.totalPages,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function StoreHero({
  total,
  serviceTotal,
  productTotal,
}: {
  total: number;
  serviceTotal: number;
  productTotal: number;
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-primary text-white shadow-xl shadow-emerald-950/10 lg:rounded-[2.5rem]">
      <style>
        {`
          @keyframes storeHeroFloatPrimary {
            0%, 100% {
              transform: translate3d(0, 0, 0) rotate(-1deg);
            }
            50% {
              transform: translate3d(0, -10px, 0) rotate(1deg);
            }
          }

          @keyframes storeHeroFloatSecondary {
            0%, 100% {
              transform: translate3d(0, 0, 0) rotate(1deg);
            }
            50% {
              transform: translate3d(0, 8px, 0) rotate(-1deg);
            }
          }

          @keyframes storeHeroBadgeFloat {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            50% {
              transform: translate3d(0, -6px, 0) scale(1.03);
            }
          }

          .store-hero-float-primary {
            animation: storeHeroFloatPrimary 7s ease-in-out infinite;
            will-change: transform;
          }

          .store-hero-float-secondary {
            animation: storeHeroFloatSecondary 8s ease-in-out infinite;
            will-change: transform;
          }

          .store-hero-badge-float {
            animation: storeHeroBadgeFloat 6s ease-in-out infinite;
            will-change: transform;
          }

          @media (prefers-reduced-motion: reduce) {
            .store-hero-float-primary,
            .store-hero-float-secondary,
            .store-hero-badge-float {
              animation: none;
              transform: none;
            }
          }
        `}
      </style>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#15803d_0%,#16a34a_54%,#22c55e_100%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -right-20 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 left-8 size-72 rounded-full bg-primary-light/20 blur-3xl" />

      <div className="relative z-10 grid gap-8 p-5 sm:p-7 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:p-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            <Sparkles className="size-4" />
            متجر أرزاق للخدمات والمنتجات
          </div>

          <h1 className="mt-5 font-palestine text-4xl font-bold leading-snug text-white sm:text-5xl lg:text-6xl">
            كل ما تحتاجه من أهل غزة في مكان واحد
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-8 text-white/85 sm:text-base">
            اطلب خدمة جاهزة، اشتري منتجاً محلياً، أو اعرض ما تقدمه للناس بطريقة منظمة وسهلة داخل أرزاق.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#store-results"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-primary-dark transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              تصفح المتجر
              <ArrowLeft className="size-4" />
            </Link>
            <Link
              href="/dashboard/store/new"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20"
            >
              أضف خدمة أو منتج
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-3 overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/15">
            <HeroStat value={total} label="عنصر متاح" />
            <HeroStat value={serviceTotal} label="خدمة جاهزة" />
            <HeroStat value={productTotal} label="منتج محلي" />
          </div>
        </div>

        <div className="relative min-h-[280px] lg:min-h-[410px]">
          <div className="store-hero-float-primary absolute left-0 top-0 w-[68%] overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80"
                alt="خدمة رقمية جاهزة داخل متجر أرزاق"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 70vw, 420px"
                priority
              />
            </div>
            <div className="flex items-center justify-between px-2 py-3">
              <span className="text-sm font-bold">خدمات جاهزة</span>
              <span className="rounded-full bg-white/15 px-2 py-1 text-[11px]">تصميم، كتابة، تدريب</span>
            </div>
          </div>

          <div className="store-hero-float-secondary absolute bottom-0 right-0 w-[62%] overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
              <Image
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
                alt="منتجات محلية في متجر أرزاق"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 64vw, 360px"
                priority
              />
            </div>
            <div className="flex items-center justify-between px-2 py-3">
              <span className="text-sm font-bold">منتجات محلية</span>
              <span className="rounded-full bg-amber-400 px-2 py-1 text-[11px] font-bold text-white">مميز</span>
            </div>
          </div>

          <div className="store-hero-badge-float absolute right-4 top-10 hidden rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-xl sm:block">
            <p className="text-xs text-slate-500">طلب سريع</p>
            <p className="mt-1 text-sm font-bold text-primary-dark">تواصل واتفق خارج المنصة</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="border-white/10 px-3 py-3 text-center [&:not(:first-child)]:border-r">
      <p className="font-cairo text-xl font-extrabold text-white">{value.toLocaleString("ar")}</p>
      <p className="mt-1 text-[11px] font-medium text-white/75">{label}</p>
    </div>
  );
}

function StoreHeader({
  filters,
  queryParams,
  total,
  serviceTotal,
  productTotal,
  categories,
}: {
  filters: ListingFiltersInput;
  queryParams: URLSearchParams;
  total: number;
  serviceTotal: number;
  productTotal: number;
  categories: Awaited<ReturnType<typeof getCachedListingFilterOptions>>;
}) {
  const filterValues = toFilterValues(filters);

  return (
    <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm lg:p-8">
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <h1 className="font-palestine text-2xl font-bold text-slate-950">متجر أرزاق</h1>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
          {total.toLocaleString("ar")} منتج وخدمة
        </span>
      </div>

      <div className="hidden items-end justify-between gap-6 lg:flex">
        <div>
          <nav className="mb-3 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-primary-dark">الرئيسية</Link>
            <span className="px-2">/</span>
            <span>المتجر</span>
          </nav>
          <h1 className="font-palestine text-4xl font-bold text-slate-950">متجر أرزاق</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            اكتشف خدمات جاهزة وبضائع محلية من أهل غزة، وابدأ الطلب داخل أرزاق.
          </p>
        </div>
        <div className="flex items-center rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <StoreStat icon={ShoppingBag} value={total} label="عنصر" />
          <Divider />
          <StoreStat icon={Wrench} value={serviceTotal} label="خدمة" />
          <Divider />
          <StoreStat icon={Package} value={productTotal} label="منتج" />
        </div>
      </div>

      <form action="/store" className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-3 lg:min-h-12 lg:bg-white lg:shadow-sm lg:ring-1 lg:ring-slate-200">
        <Search className="size-4 shrink-0 text-slate-400" />
        <input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="ابحث في المتجر..."
          className="min-w-0 flex-1 bg-transparent text-right text-base outline-none placeholder:text-slate-400"
        />
        <input type="hidden" name="type" value={filters.type ?? "all"} />
        <input type="hidden" name="category" value={filters.category ?? "all"} />
        <input type="hidden" name="region" value={filters.region ?? "all"} />
        <input type="hidden" name="delivery" value={filters.delivery ?? "all"} />
        <input type="hidden" name="min" value={typeof filters.min === "number" ? String(filters.min) : ""} />
        <input type="hidden" name="max" value={typeof filters.max === "number" ? String(filters.max) : ""} />
        <input type="hidden" name="sort" value={filters.sort ?? "newest"} />
        <button className="hidden rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white transition hover:bg-primary-dark lg:inline-flex">
          بحث
        </button>
        <div className="lg:hidden">
          <StoreFilterSheet categories={categories} values={filterValues} />
        </div>
      </form>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
        <TypeTab href={buildTypeHref(queryParams, undefined)} active={!filters.type}>
          الكل
        </TypeTab>
        <TypeTab href={buildTypeHref(queryParams, "SERVICE")} active={filters.type === "SERVICE"}>
          خدمات جاهزة
        </TypeTab>
        <TypeTab href={buildTypeHref(queryParams, "PHYSICAL")} active={filters.type === "PHYSICAL"}>
          منتجات
        </TypeTab>
      </div>
    </div>
  );
}

function StoreStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3">
      <Icon className="size-4 text-primary" />
      <div>
        <p className="font-bold text-primary-dark">{value.toLocaleString("ar")}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function Divider() {
  return <span className="h-8 w-px bg-slate-200" />;
}

function StoreContentSkeleton() {
  return (
    <section className="container-responsive space-y-6">
      <Skeleton className="h-48 rounded-3xl" />
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
