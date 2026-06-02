import { redirect } from "next/navigation";

import { ListingForm } from "@/components/store/listing-form";
import { StoreRouteShell } from "@/components/store/store-route-shell";
import { auth } from "@/lib/auth";
import { getListingFilterOptions } from "@/services/listing.service";

export const metadata = {
  title: "إضافة عنصر إلى المتجر",
};

export default async function NewListingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/store/new");
  }

  const categories = await getListingFilterOptions();

  return (
    <StoreRouteShell
      eyebrow="متجر جديد"
      title="إضافة منتج أو خدمة"
      description="أضف خدمة جاهزة أو منتجاً بسيطاً مع السعر وطريقة التسليم والصور."
      backHref="/dashboard/store"
      backLabel="العودة لمتجري"
      variant="dashboard"
    >
      <ListingForm categories={categories} mode="create" />
    </StoreRouteShell>
  );
}
