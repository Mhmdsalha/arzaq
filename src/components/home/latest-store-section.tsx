import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ListingCard } from "@/components/store/listing-card";
import { Button } from "@/components/ui/button";
import type { ListingListItem } from "@/types/store";

export function LatestStoreSection({
  services,
  products,
}: {
  services: ListingListItem[];
  products: ListingListItem[];
}) {
  const hasListings = services.length > 0 || products.length > 0;

  return (
    <section className="section-spacing bg-slate-50">
      <div className="container-responsive space-y-6 lg:space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold text-primary-dark">من متجر أرزاق</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">خدمات ومنتجات جاهزة</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              تصفح خدمات جاهزة ومنتجات محلية من مقدمي الخدمات والبائعين داخل أرزاق.
            </p>
          </div>
          <Link href="/store" className="text-sm font-semibold text-primary-dark">
            عرض المتجر
          </Link>
        </div>

        {hasListings ? (
          <div className="space-y-7">
            <StoreRow title="خدمات جاهزة" listings={services} />
            <StoreRow title="منتجات" listings={products} />
          </div>
        ) : (
          <EmptyState
            title="لا توجد عناصر في المتجر بعد"
            description="ستظهر هنا الخدمات والمنتجات بعد إضافتها واعتمادها داخل النظام."
            action={
              <Button asChild>
                <Link href="/dashboard/store/new">إضافة أول عنصر</Link>
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
}

function StoreRow({ title, listings }: { title: string; listings: ListingListItem[] }) {
  if (listings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-950">{title}</h3>
        <Link href={`/store?type=${title === "خدمات جاهزة" ? "SERVICE" : "PHYSICAL"}`} className="text-xs font-bold text-primary-dark">
          عرض الكل
        </Link>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0">
        {listings.slice(0, 4).map((listing) => (
          <ListingCard key={listing.id} listing={listing} compact />
        ))}
      </div>
    </div>
  );
}
