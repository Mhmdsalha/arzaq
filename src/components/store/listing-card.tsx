import { Package, ShieldCheck, ShoppingBag, Star, Truck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { deliveryMethodLabels, listingTypeLabels } from "@/constants/store";
import { regionLabels } from "@/constants/regions";
import { cn } from "@/lib/utils";
import type { ListingListItem } from "@/types/store";

export function ListingCard({ listing }: { listing: ListingListItem }) {
  const mainImage = listing.images[0];
  const typeIcon = listing.type === "SERVICE" ? Zap : Package;
  const TypeIcon = typeIcon;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/store/${listing.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={listing.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-green-50 text-primary-dark">
              <ShoppingBag className="size-12" />
            </div>
          )}

          <div className="absolute right-3 top-3 flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm",
                listing.type === "SERVICE"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              <TypeIcon className="size-3.5" />
              {listingTypeLabels[listing.type]}
            </span>
            {listing.isFeatured ? (
              <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                مميز
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div>
          <Link href={`/store/${listing.id}`}>
            <h2 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-950 transition group-hover:text-primary-dark">
              {listing.title}
            </h2>
          </Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{listing.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary-dark">
            {listing.category.name}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            {regionLabels[listing.region]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            <Truck className="size-3.5" />
            {deliveryMethodLabels[listing.deliveryMethod]}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">السعر</p>
            <p className="text-xl font-extrabold text-primary-dark">
              {formatPrice(listing.price)}
            </p>
            {listing.priceLabel ? (
              <p className="mt-0.5 text-xs text-slate-500">{listing.priceLabel}</p>
            ) : null}
          </div>
          <div className="text-left text-xs text-slate-500">
            <p className="inline-flex items-center gap-1 font-bold text-amber-600">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {listing.avgRating.toFixed(1)}
            </p>
            <p>{listing.totalReviews} تقييم</p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <SellerAvatar listing={listing} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-800">{listing.seller.name}</p>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              {listing.seller.isTrusted ? (
                <>
                  <ShieldCheck className="size-3.5 text-primary" />
                  موثوق
                </>
              ) : (
                "بائع على أرزاق"
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button asChild className="h-10 px-3">
            <Link href={`/store/${listing.id}`}>اطلب الآن</Link>
          </Button>
          {listing.seller.whatsapp ? (
            <WhatsAppButton phone={listing.seller.whatsapp} label="واتساب" className="h-10 px-3" />
          ) : (
            <Button asChild variant="secondary" className="h-10 px-3">
              <Link href={`/store/${listing.id}`}>التفاصيل</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function SellerAvatar({ listing }: { listing: ListingListItem }) {
  if (listing.seller.avatarUrl) {
    return (
      <Image
        src={listing.seller.avatarUrl}
        alt={listing.seller.name}
        width={40}
        height={40}
        className="size-10 rounded-full border-2 border-primary object-cover"
        sizes="40px"
      />
    );
  }

  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
      {listing.seller.name.trim().slice(0, 1)}
    </span>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ar", {
    maximumFractionDigits: 0,
  }).format(price) + " شيكل";
}
