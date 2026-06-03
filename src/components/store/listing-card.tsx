import { Banknote, MapPin, MessageCircle, Package, ShieldCheck, ShoppingBag, Star, Truck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SaveListingButton } from "@/components/store/save-listing-button";
import { Button } from "@/components/ui/button";
import { deliveryMethodLabels, listingTypeLabels } from "@/constants/store";
import { regionLabels } from "@/constants/regions";
import { cn } from "@/lib/utils";
import type { ListingListItem } from "@/types/store";

export function ListingCard({
  listing,
  compact = false,
}: {
  listing: ListingListItem;
  compact?: boolean;
}) {
  const mainImage = listing.images[0];
  const TypeIcon = listing.type === "SERVICE" ? Zap : Package;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        compact && "w-44 shrink-0 lg:w-full lg:shrink",
      )}
    >
      <div className="relative">
        <Link href={`/store/${listing.id}`} className="block">
          <div className="relative aspect-video overflow-hidden bg-slate-100">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={listing.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes={compact ? "176px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-green-50 text-primary-dark">
                <ShoppingBag className={compact ? "size-9" : "size-11"} />
              </div>
            )}

            <div className="absolute right-2 top-2 flex flex-wrap gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm",
                  listing.type === "SERVICE" ? "bg-blue-500/90" : "bg-amber-500/90",
                )}
              >
                <TypeIcon className="size-3" />
                {listing.type === "SERVICE" ? "خدمة" : "منتج"}
              </span>
            </div>

            {listing.isFeatured ? (
              <span className="absolute left-11 top-2 rounded-full bg-amber-400/95 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                مميز
              </span>
            ) : null}
          </div>
        </Link>

        <SaveListingButton
          listingId={listing.id}
          isSaved={listing.isSaved}
          className="absolute left-2 top-2 size-8 bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition-opacity lg:opacity-0 lg:group-hover:opacity-100"
        />
      </div>

      <div className={cn("space-y-2.5 p-3", !compact && "lg:p-4")}>
        <Link href={`/store/${listing.id}`} className="block">
          <h2
            className={cn(
              "line-clamp-2 font-bold leading-snug text-slate-800 transition group-hover:text-primary-dark",
              compact ? "min-h-10 text-sm" : "min-h-10 text-sm lg:min-h-12 lg:text-base",
            )}
          >
            {listing.title}
          </h2>
        </Link>

        {!compact ? (
          <p className="hidden line-clamp-2 text-sm leading-6 text-slate-600 lg:block">
            {listing.description}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] text-slate-500">
          <MetaItem icon={Banknote} className="font-bold text-primary-dark">
            {formatPrice(listing.price)}
          </MetaItem>
          <MetaItem icon={MapPin}>{regionLabels[listing.region]}</MetaItem>
          {!compact ? <MetaItem icon={Truck}>{deliveryMethodLabels[listing.deliveryMethod]}</MetaItem> : null}
        </div>

        {listing.priceLabel && !compact ? (
          <p className="line-clamp-1 text-xs text-slate-500">{listing.priceLabel}</p>
        ) : null}

        <div className="flex items-center gap-2 border-t border-slate-50 pt-2">
          <SellerAvatar listing={listing} compact={compact} />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1">
              <p className="truncate text-[11px] font-semibold text-slate-700 lg:text-xs">
                {listing.seller.name}
              </p>
              {listing.seller.isTrusted ? (
                <ShieldCheck className="size-3.5 shrink-0 text-primary" aria-label="موثوق" />
              ) : null}
            </div>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {listing.avgRating.toFixed(1)}
              {!compact ? <span className="font-medium text-slate-400">({listing.totalReviews})</span> : null}
            </p>
          </div>

          {listing.seller.whatsapp ? (
            <a
              href={`https://wa.me/${listing.seller.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-white transition hover:bg-green-600"
              aria-label="تواصل عبر واتساب"
            >
              <MessageCircle className="size-4" />
            </a>
          ) : null}
        </div>

        {!compact ? (
          <Button asChild className="hidden h-10 w-full translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 lg:inline-flex">
            <Link href={`/store/${listing.id}`}>اطلب الآن</Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function MetaItem({
  icon: Icon,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1", className)}>
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}

function SellerAvatar({ listing, compact }: { listing: ListingListItem; compact: boolean }) {
  const size = compact ? 24 : 28;

  if (listing.seller.avatarUrl) {
    return (
      <Image
        src={listing.seller.avatarUrl}
        alt={listing.seller.name}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full border-2 border-primary object-cover", compact ? "size-6" : "size-7 lg:size-8")}
        sizes={`${size}px`}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white",
        compact ? "size-6 text-xs" : "size-7 text-xs lg:size-8",
      )}
    >
      {listing.seller.name.trim().slice(0, 1)}
    </span>
  );
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ar", {
    maximumFractionDigits: 0,
  }).format(price)} شيكل`;
}
