import { redirect } from "next/navigation";

import { ListingForm } from "@/components/store/listing-form";
import { StorePlanCard } from "@/components/store/store-plan-card";
import { StoreRouteShell } from "@/components/store/store-route-shell";
import { auth } from "@/lib/auth";
import { getListingFilterOptions, getSellerStoreStats } from "@/services/listing.service";

export const metadata = {
  title: "إضافة عنصر إلى المتجر",
};

export default async function NewListingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/store/new");
  }

  const [categories, stats] = await Promise.all([
    getListingFilterOptions(),
    getSellerStoreStats(session.user.id),
  ]);
  const canAddListing = stats.remainingListings > 0;

  return (
    <StoreRouteShell
      eyebrow="متجر جديد"
      title="إضافة منتج أو خدمة"
      description="أضف خدمة جاهزة أو منتجاً بسيطاً مع السعر وطريقة التسليم والصور."
      backHref="/dashboard/store"
      backLabel="العودة لمتجري"
      variant="dashboard"
    >
      <div className="space-y-5">
        <StorePlanCard stats={stats} />
        {canAddListing ? (
          <ListingForm categories={categories} mode="create" />
        ) : (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
            <h2 className="text-xl font-extrabold text-slate-950">وصلت إلى حد باقتك الحالية</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              باقتك الحالية تسمح بإضافة {stats.planLimit} عناصر. اختر باقة أعلى من بطاقة الاستخدام
              لإرسال طلب اشتراك للإدارة.
            </p>
          </div>
        )}
      </div>
    </StoreRouteShell>
  );
}
