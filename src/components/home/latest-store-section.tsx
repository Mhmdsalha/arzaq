import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ListingCard } from "@/components/store/listing-card";
import { Button } from "@/components/ui/button";
import type { ListingListItem } from "@/types/store";

export function LatestStoreSection({ listings }: { listings: ListingListItem[] }) {
  return (
    <section className="section-spacing bg-white">
      <div className="container-responsive space-y-6 lg:space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold text-primary-dark">متجر أرزاق</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">خدمات ومنتجات جاهزة</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              تصفح خدمات جاهزة ومنتجات محلية من مقدمي الخدمات والبائعين داخل أرزاق.
            </p>
          </div>
          <Link href="/store" className="text-sm font-semibold text-primary-dark">
            عرض المتجر
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
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
