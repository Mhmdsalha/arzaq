import { redirect } from "next/navigation";

import { ListingForm } from "@/components/store/listing-form";
import { StoreRouteShell } from "@/components/store/store-route-shell";
import { auth } from "@/lib/auth";
import { getListingFilterOptions, getListingForEdit } from "@/services/listing.service";

export const metadata = {
  title: "تعديل عنصر المتجر",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/store");
  }

  const { listingId } = await params;
  const [categories, listing] = await Promise.all([
    getListingFilterOptions(),
    getListingForEdit(listingId, session.user.id),
  ]);

  if (!listing) {
    redirect("/dashboard/store");
  }

  return (
    <StoreRouteShell
      eyebrow="تعديل المتجر"
      title="تعديل المنتج أو الخدمة"
      description="حدّث تفاصيل العنصر، السعر، الصور، الكمية أو طريقة التسليم. نوع العنصر يبقى ثابتاً بعد الإنشاء."
      backHref="/dashboard/store"
      backLabel="العودة لمتجري"
      variant="dashboard"
    >
      <ListingForm categories={categories} mode="edit" initialData={listing} />
    </StoreRouteShell>
  );
}
