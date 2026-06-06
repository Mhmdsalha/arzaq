import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  adminDeleteListingFormAction,
  reviewListingFormAction,
  setListingFeaturedFormAction,
  setListingStatusFormAction,
} from "@/actions/admin-store.actions";
import { regionLabels } from "@/constants/regions";
import { deliveryMethodLabels, listingStatusLabels, listingTypeLabels } from "@/constants/store";
import { getAdminHref } from "@/lib/admin-path";
import { getAdminStoreListingById } from "@/services/admin-store.service";

export const metadata = {
  title: "مراجعة عنصر المتجر",
};

export default async function AdminStoreListingReviewPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const listing = await getAdminStoreListingById(listingId);

  if (!listing) {
    notFound();
  }

  const canReview = listing.status === "PENDING_REVIEW" || listing.status === "NEEDS_EDIT";
  const canToggleStatus = listing.status === "ACTIVE" || listing.status === "PAUSED";

  return (
    <section className="container-responsive py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary-light">مراجعة عنصر متجر</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{listing.title}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            راجع تفاصيل المنتج أو الخدمة قبل الموافقة على نشره في المتجر العام.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {listing.status === "ACTIVE" ? (
            <Link
              href={`/store/${listing.id}`}
              className="rounded-xl border border-primary/40 px-4 py-2 text-sm font-semibold text-primary-light hover:bg-primary/10"
            >
              فتح الصفحة العامة
            </Link>
          ) : null}
          <Link
            href={getAdminHref("/store/listings")}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            رجوع لقائمة المتجر
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{listingTypeLabels[listing.type]}</Badge>
              <Badge className="bg-primary/15 text-primary-light">{listingStatusLabels[listing.status]}</Badge>
              <Badge>{listing.category.name}</Badge>
              {listing.isFeatured ? <Badge className="bg-amber-500/15 text-amber-200">مميز</Badge> : null}
            </div>

            <div className="mt-5">
              <ImagePreviewGrid images={listing.images} title={listing.title} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoCard label="السعر" value={formatPrice(listing.price)} />
              <InfoCard label="وصف السعر" value={listing.priceLabel ?? "غير محدد"} />
              <InfoCard label="طريقة التسليم" value={deliveryMethodLabels[listing.deliveryMethod]} />
              <InfoCard label="مدة التسليم" value={listing.deliveryTime ?? "حسب الاتفاق"} />
              <InfoCard label="المنطقة" value={regionLabels[listing.region]} />
              <InfoCard
                label="الكمية"
                value={listing.type === "PHYSICAL" ? String(listing.quantity ?? 0) : "خدمة بدون مخزون"}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950 p-5">
              <h2 className="text-xl font-bold text-white">الوصف التفصيلي</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-8 text-slate-200">
                {listing.description}
              </p>
            </div>

            {listing.tags.length > 0 ? (
              <div className="mt-5">
                <h2 className="text-sm font-semibold text-slate-200">الكلمات المفتاحية</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold text-white">بيانات البائع</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoCard label="الاسم" value={listing.seller.name} />
              <InfoCard label="البريد الإلكتروني" value={listing.seller.email ?? "غير مضاف"} />
              <InfoCard label="رقم الجوال" value={listing.seller.phone ?? "غير مضاف"} />
              <InfoCard
                label="واتساب"
                value={
                  listing.seller.profile?.showWhatsapp && listing.seller.profile.whatsapp
                    ? listing.seller.profile.whatsapp
                    : "غير مفعل"
                }
              />
              <InfoCard
                label="توثيق البريد"
                value={listing.seller.isVerified ? "موثق" : "غير موثق"}
              />
              <InfoCard
                label="توثيق الإدارة"
                value={listing.seller.profile?.isTrusted ? "موثق رسمياً" : "غير موثق رسمياً"}
              />
              <InfoCard
                label="حالة الحساب"
                value={listing.seller.isBanned ? "محظور" : "نشط"}
              />
              <InfoCard
                label="منطقة البائع"
                value={listing.seller.profile?.region ? regionLabels[listing.seller.profile.region] : "غير محددة"}
              />
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold text-white">قرار الإدارة</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              الموافقة تنشر العنصر في المتجر. طلب التعديلات أو الرفض يرسل إشعاراً للبائع مع الملاحظة.
            </p>

            <div className="mt-5 grid gap-3">
              {canReview ? (
                <form action={reviewListingFormAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="decision" value="APPROVE" />
                  <button className="w-full min-h-12 rounded-xl bg-primary px-5 font-semibold text-white hover:bg-primary-dark">
                    اعتماد العنصر ونشره
                  </button>
                </form>
              ) : null}

              {canToggleStatus ? (
                <form action={setListingStatusFormAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="status" value={listing.status === "ACTIVE" ? "PAUSED" : "ACTIVE"} />
                  <button className="w-full min-h-12 rounded-xl border border-primary/40 px-5 font-semibold text-primary-light hover:bg-primary/10">
                    {listing.status === "ACTIVE" ? "إيقاف العنصر مؤقتاً" : "إعادة تفعيل العنصر"}
                  </button>
                </form>
              ) : null}

              <form action={setListingFeaturedFormAction}>
                <input type="hidden" name="listingId" value={listing.id} />
                <input type="hidden" name="isFeatured" value={String(!listing.isFeatured)} />
                <button className="w-full min-h-12 rounded-xl bg-amber-600 px-5 font-semibold text-white hover:bg-amber-700">
                  {listing.isFeatured ? "إلغاء التمييز" : "تمييز العنصر"}
                </button>
              </form>

              {canReview ? (
                <form action={reviewListingFormAction} className="grid gap-3">
                  <input type="hidden" name="listingId" value={listing.id} />
                  <label className="grid gap-2 text-sm font-medium text-slate-200">
                    ملاحظة للبائع
                    <textarea
                      name="reviewNote"
                      rows={5}
                      placeholder="مثال: أضف صورة أوضح، عدّل السعر، أو وضّح طريقة التسليم..."
                      className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm leading-7 text-white outline-none focus:border-primary"
                    />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      name="decision"
                      value="NEEDS_EDIT"
                      className="min-h-12 rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700"
                    >
                      طلب تعديلات
                    </button>
                    <button
                      name="decision"
                      value="REJECT"
                      className="min-h-12 rounded-xl bg-red-600 px-5 font-semibold text-white hover:bg-red-700"
                    >
                      رفض العنصر
                    </button>
                  </div>
                </form>
              ) : null}

              <form action={adminDeleteListingFormAction}>
                <input type="hidden" name="listingId" value={listing.id} />
                <button className="w-full min-h-12 rounded-xl bg-red-700 px-5 font-semibold text-white hover:bg-red-800">
                  حذف العنصر من المتجر
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold text-white">مؤشرات سريعة</h2>
            <div className="mt-4 grid gap-3">
              <InfoCard label="المشاهدات" value={String(listing.viewCount)} />
              <InfoCard label="طلبات الشراء" value={String(listing._count.orders)} />
              <InfoCard label="البلاغات" value={String(listing._count.reports)} />
              <InfoCard label="الحفظ" value={String(listing._count.savedBy)} />
              <InfoCard
                label="تاريخ الإرسال"
                value={listing.createdAt.toLocaleDateString("ar", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ImagePreviewGrid({ images, title }: { images: string[]; title: string }) {
  if (images.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950 text-sm text-slate-400">
        لا توجد صور مرفقة لهذا العنصر.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {images.map((image, index) => (
        <div
          key={image}
          className={index === 0 ? "relative aspect-[16/10] overflow-hidden rounded-3xl sm:col-span-2" : "relative aspect-[4/3] overflow-hidden rounded-2xl"}
        >
          <Image
            src={image}
            alt={`${title} - صورة ${index + 1}`}
            fill
            className="object-cover"
            sizes={index === 0 ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 1024px) 50vw, 280px"}
          />
          {index === 0 ? (
            <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
              الصورة الرئيسية
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Badge({
  children,
  className = "bg-white/10 text-slate-200",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ar", { maximumFractionDigits: 0 }).format(price)} شيكل`;
}
