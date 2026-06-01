import { StoreRouteShell } from "@/components/store/store-route-shell";

export const metadata = {
  title: "تعديل المنتج",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;

  return (
    <StoreRouteShell
      eyebrow="تعديل المتجر"
      title="تعديل المنتج أو الخدمة"
      description="سيتم تحميل بيانات العنصر الحالي داخل نموذج التعديل مع منع تغيير نوعه بعد الإنشاء."
      backHref="/dashboard/store"
      backLabel="العودة لمتجري"
      variant="dashboard"
    >
      <p>
        معرّف العنصر: <span className="font-mono font-bold text-primary-dark">{listingId}</span>
      </p>
    </StoreRouteShell>
  );
}
