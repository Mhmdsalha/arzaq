import { StoreRouteShell } from "@/components/store/store-route-shell";

export const metadata = {
  title: "إضافة منتج أو خدمة",
};

export default function NewListingPage() {
  return (
    <StoreRouteShell
      eyebrow="متجر جديد"
      title="إضافة منتج أو خدمة"
      description="سيتم هنا بناء نموذج من خطوتين لاختيار النوع ثم إدخال التفاصيل والصور والسعر وطريقة التسليم."
      backHref="/dashboard/store"
      backLabel="العودة لمتجري"
      variant="dashboard"
    />
  );
}
