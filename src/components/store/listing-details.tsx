import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  BadgeCheck,
  CalendarDays,
  Eye,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  Tags,
  Truck,
  UserRound,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ListingCard } from "@/components/store/listing-card";
import { ListingGallery } from "@/components/store/listing-gallery";
import { ListingReportButton } from "@/components/store/listing-report-button";
import { OrderSheet } from "@/components/store/order-sheet";
import { SaveListingButton } from "@/components/store/save-listing-button";
import { StarRating } from "@/components/shared/star-rating";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { regionLabels } from "@/constants/regions";
import { deliveryMethodLabels, listingTypeLabels } from "@/constants/store";
import type { ListingDetailsData, ListingListItem } from "@/types/store";

export function ListingDetails({
  listing,
  similarListings,
  isAuthenticated,
}: {
  listing: ListingDetailsData;
  similarListings: ListingListItem[];
  isAuthenticated: boolean;
}) {
  const TypeIcon = listing.type === "SERVICE" ? Zap : Package;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <article className="space-y-6">
        <ListingGallery images={listing.images} title={listing.title} />

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-dark">
                <TypeIcon className="size-3.5" />
                {listingTypeLabels[listing.type]}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {listing.category.name}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {regionLabels[listing.region]}
              </span>
              {listing.isFeatured ? (
                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                  مميز
                </span>
              ) : null}
            </div>
            <CardTitle className="leading-10">{listing.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
              <p className="text-sm text-slate-600">السعر</p>
              <p className="mt-1 text-3xl font-extrabold text-primary-dark">
                {formatPrice(listing.price)}
              </p>
              {listing.priceLabel ? (
                <p className="mt-1 text-sm text-slate-600">{listing.priceLabel}</p>
              ) : null}
            </div>

            <p className="whitespace-pre-line text-base leading-8 text-slate-700">
              {listing.description}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem icon={Truck} label="طريقة التسليم" value={deliveryMethodLabels[listing.deliveryMethod]} />
              <DetailItem icon={CalendarDays} label="مدة التسليم" value={listing.deliveryTime ?? "حسب الاتفاق"} />
              <DetailItem icon={MapPin} label="المنطقة" value={regionLabels[listing.region]} />
              <DetailItem icon={Eye} label="المشاهدات" value={String(listing.viewCount)} />
            </div>

            {listing.tags.length > 0 ? (
              <div>
                <div className="mb-3 flex items-center gap-2 font-bold text-slate-950">
                  <Tags className="size-4 text-primary" />
                  الكلمات المفتاحية
                </div>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/store?q=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">التقييمات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-3xl font-extrabold text-slate-950">{listing.avgRating.toFixed(1)}</p>
                <StarRating value={listing.avgRating} showValue={false} size="md" />
              </div>
              <p className="text-sm text-slate-600">
                بناءً على {listing.totalReviews} تقييم. تظهر تقييمات المشترين بعد اكتمال الطلبات.
              </p>
            </div>
          </CardContent>
        </Card>

        <ListingReviews reviews={listing.reviews} />

        {similarListings.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">عناصر مشابهة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {similarListings.map((similarListing) => (
                  <ListingCard key={similarListing.id} listing={similarListing} />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </article>

      <aside className="space-y-4">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-xl">ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SellerCard listing={listing} />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">الإجمالي التقريبي</p>
              <p className="mt-1 text-2xl font-extrabold text-primary-dark">
                {formatPrice(listing.price)}
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                الدفع يتم خارج المنصة عند الاستلام أو حسب الاتفاق مع البائع.
              </p>
            </div>

            <OrderAction listing={listing} isAuthenticated={isAuthenticated} />

            <SaveListingButton
              listingId={listing.id}
              isSaved={listing.isSaved}
              className="w-full"
              showLabel
            />

            {listing.seller.whatsapp ? (
              <WhatsAppButton
                phone={listing.seller.whatsapp}
                className="w-full"
                label="تواصل عبر واتساب"
              />
            ) : null}

            <ListingReportAction listing={listing} isAuthenticated={isAuthenticated} />

            <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              تأكد من تفاصيل المنتج أو الخدمة قبل الدفع. أرزاق لا يعالج المدفوعات حالياً.
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function SellerCard({ listing }: { listing: ListingDetailsData }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        {listing.seller.avatarUrl ? (
          <Image
            src={listing.seller.avatarUrl}
            alt={listing.seller.name}
            width={56}
            height={56}
            className="size-14 rounded-2xl border-2 border-primary object-cover"
            sizes="56px"
          />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
            {listing.seller.name.trim().slice(0, 1)}
          </span>
        )}
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-bold text-slate-950">
            {listing.seller.name}
            {listing.seller.isVerified ? <BadgeCheck className="size-4 text-blue-600" /> : null}
            {listing.seller.isTrusted ? <ShieldCheck className="size-4 text-primary" /> : null}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {listing.seller.avgRating.toFixed(1)} من {listing.seller.totalReviews} تقييم
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Metric icon={UserRound} label="عضو منذ" value={formatDistanceToNow(listing.seller.createdAt, { locale: ar })} />
        <Metric
          icon={MapPin}
          label="المنطقة"
          value={listing.seller.region ? regionLabels[listing.seller.region] : "غير محددة"}
        />
      </div>

      <Button asChild variant="secondary" className="mt-4 w-full">
        <Link href={`/providers/${listing.seller.id}`}>عرض بروفايله</Link>
      </Button>
    </div>
  );
}

function OrderAction({
  listing,
  isAuthenticated,
}: {
  listing: ListingDetailsData;
  isAuthenticated: boolean;
}) {
  if (!isAuthenticated) {
    return (
      <Button asChild className="w-full">
        <Link href={`/auth/login?callbackUrl=${encodeURIComponent(`/store/${listing.id}`)}`}>
          سجّل دخولك للطلب
        </Link>
      </Button>
    );
  }

  if (listing.isOwner) {
    return (
      <p className="rounded-xl bg-slate-100 p-3 text-center text-sm text-slate-600">
        هذا العنصر منشور من حسابك.
      </p>
    );
  }

  if (listing.status !== "ACTIVE") {
    return (
      <Button type="button" disabled className="w-full">
        هذا العنصر غير متاح
      </Button>
    );
  }

  return (
    <OrderSheet
      listing={{
        id: listing.id,
        title: listing.title,
        type: listing.type,
        price: listing.price,
        quantity: listing.quantity,
        deliveryMethod: listing.deliveryMethod,
      }}
    />
  );
}

function ListingReportAction({
  listing,
  isAuthenticated,
}: {
  listing: ListingDetailsData;
  isAuthenticated: boolean;
}) {
  if (listing.isOwner) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Button asChild variant="secondary" className="w-full">
        <Link href={`/auth/login?callbackUrl=${encodeURIComponent(`/store/${listing.id}`)}`}>
          سجّل دخولك للإبلاغ
        </Link>
      </Button>
    );
  }

  return <ListingReportButton listingId={listing.id} className="w-full" />;
}

function ListingReviews({
  reviews,
}: {
  reviews: ListingDetailsData["reviews"];
}) {
  if (reviews.length === 0) {
    return (
      <p className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
        لا توجد تقييمات لهذا العنصر بعد.
      </p>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-slate-950">{review.reviewer.name}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDate(review.createdAt)}</p>
            </div>
            <StarRating value={review.rating} showValue={false} />
          </div>
          {review.comment ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">{review.comment}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <p className="mt-2 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <Icon className="mx-auto size-4 text-primary" />
      <p className="mt-1 text-xs text-slate-500">{label}</p>
      <p className="line-clamp-1 font-bold text-slate-950">{value}</p>
    </div>
  );
}

function formatPrice(price: number) {
  return (
    new Intl.NumberFormat("ar", {
      maximumFractionDigits: 0,
    }).format(price) + " شيكل"
  );
}


function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(date);
}
