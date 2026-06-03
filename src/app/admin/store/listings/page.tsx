import type { ListingStatus, ListingType } from "@prisma/client";
import Link from "next/link";

import {
  adminDeleteListingFormAction,
  reviewListingFormAction,
  setListingFeaturedFormAction,
  setListingStatusFormAction,
} from "@/actions/admin-store.actions";
import { listingStatusLabels, listingTypeLabels } from "@/constants/store";
import { getAdminHref } from "@/lib/admin-path";
import { getAdminStoreListings } from "@/services/admin-store.service";

const listingStatusValues: ListingStatus[] = ["PENDING_REVIEW", "NEEDS_EDIT", "REJECTED", "ACTIVE", "PAUSED", "SOLD_OUT"];
const listingTypeValues: ListingType[] = ["SERVICE", "PHYSICAL"];

export const metadata = {
  title: "منتجات وخدمات المتجر",
};

export default async function AdminStoreListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getParam(params.q);
  const status = parseListingStatus(getParam(params.status));
  const type = parseListingType(getParam(params.type));
  const page = Number(getParam(params.page) ?? "1");
  const data = await getAdminStoreListings({ q, status, type, page });

  return (
    <section className="container-responsive py-10">
      <Header
        title="كل منتجات وخدمات المتجر"
        description="راجع العناصر المنشورة، وميّز المناسب منها أو أوقف ما يحتاج مراجعة."
      />

      <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_200px_200px_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="بحث بالعنوان أو اسم البائع"
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        >
          <option value="">كل الحالات</option>
          {listingStatusValues.map((value) => (
            <option key={value} value={value}>
              {listingStatusLabels[value]}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={type ?? ""}
          className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
        >
          <option value="">كل الأنواع</option>
          {listingTypeValues.map((value) => (
            <option key={value} value={value}>
              {listingTypeLabels[value]}
            </option>
          ))}
        </select>
        <button className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-white">بحث</button>
      </form>

      <div className="mt-6 grid gap-4">
        {data.listings.map((listing) => (
          <article key={listing.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{listing.title}</h2>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                    {listingTypeLabels[listing.type]}
                  </span>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary-light">
                    {listingStatusLabels[listing.status]}
                  </span>
                  {listing.isFeatured ? (
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-200">
                      مميز
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  {listing.category.name} · البائع: {listing.seller.name} · السعر: {formatPrice(listing.price)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {listing._count.orders} طلب · {listing._count.reports} بلاغ · {listing.viewCount} مشاهدة
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/store/${listing.id}`}
                  className="inline-flex min-h-10 items-center rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-200 hover:bg-white/10"
                >
                  عرض
                </Link>
                {listing.status === "PENDING_REVIEW" || listing.status === "NEEDS_EDIT" ? (
                  <form action={reviewListingFormAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="listingId" value={listing.id} />
                    <input type="hidden" name="decision" value="APPROVE" />
                    <button className="min-h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
                      موافقة
                    </button>
                  </form>
                ) : null}
                <form action={setListingFeaturedFormAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="isFeatured" value={String(!listing.isFeatured)} />
                  <button className="min-h-10 rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700">
                    {listing.isFeatured ? "إلغاء التمييز" : "تمييز"}
                  </button>
                </form>
                {listing.status === "ACTIVE" || listing.status === "PAUSED" ? (
                <form action={setListingStatusFormAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="status" value={listing.status === "ACTIVE" ? "PAUSED" : "ACTIVE"} />
                  <button className="min-h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
                    {listing.status === "ACTIVE" ? "إيقاف" : "تفعيل"}
                  </button>
                </form>
                ) : null}
                <form action={adminDeleteListingFormAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <button className="min-h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700">
                    حذف
                  </button>
                </form>
              </div>
            </div>
            {listing.status === "PENDING_REVIEW" || listing.status === "NEEDS_EDIT" ? (
              <form action={reviewListingFormAction} className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                <input type="hidden" name="listingId" value={listing.id} />
                <label className="grid gap-2 text-sm font-semibold text-slate-200">
                  ملاحظة للبائع عند الرفض أو طلب التعديل
                  <textarea
                    name="reviewNote"
                    rows={2}
                    placeholder="مثلاً: أضف صورة أوضح، عدّل السعر، أو وضّح طريقة التسليم..."
                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-primary"
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button name="decision" value="NEEDS_EDIT" className="min-h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
                    طلب تعديلات
                  </button>
                  <button name="decision" value="REJECT" className="min-h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700">
                    رفض
                  </button>
                </div>
              </form>
            ) : null}
          </article>
        ))}
      </div>

      <Pagination baseHref={getAdminHref("/store/listings")} page={data.page} totalPages={data.totalPages} />
    </section>
  );
}

function Header({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      </div>
      <Link href={getAdminHref("/store")} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200">
        إدارة المتجر
      </Link>
    </div>
  );
}

function Pagination({ baseHref, page, totalPages }: { baseHref: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      {page > 1 ? <Link className="rounded-xl border border-white/10 px-4 py-2 text-white" href={`${baseHref}?page=${page - 1}`}>السابق</Link> : null}
      <span className="text-sm text-slate-300">صفحة {page} من {totalPages}</span>
      {page < totalPages ? <Link className="rounded-xl border border-white/10 px-4 py-2 text-white" href={`${baseHref}?page=${page + 1}`}>التالي</Link> : null}
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseListingStatus(value: string | undefined): ListingStatus | undefined {
  return listingStatusValues.includes(value as ListingStatus) ? (value as ListingStatus) : undefined;
}

function parseListingType(value: string | undefined): ListingType | undefined {
  return listingTypeValues.includes(value as ListingType) ? (value as ListingType) : undefined;
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ar").format(price)} شيكل`;
}
