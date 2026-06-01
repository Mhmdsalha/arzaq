import { StoreRouteShell } from "@/components/store/store-route-shell";
import { createPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata = createPageMetadata({
  title: "تفاصيل المنتج",
  description: "تفاصيل خدمة أو منتج داخل متجر أرزاق.",
  path: "/store",
});

export default async function ListingDetailsPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;

  return (
    <main className="container-responsive pb-16 pt-28">
      <StoreRouteShell
        eyebrow="تفاصيل المتجر"
        title="تفاصيل المنتج أو الخدمة"
        description="سيتم في المرحلة القادمة تحميل بيانات المنتج، معرض الصور، البائع، نموذج الطلب، والتقييمات من قاعدة البيانات."
        backHref="/store"
        backLabel="العودة للمتجر"
      >
        <p>
          معرّف العنصر الحالي: <span className="font-mono font-bold text-primary-dark">{listingId}</span>
        </p>
      </StoreRouteShell>
    </main>
  );
}
