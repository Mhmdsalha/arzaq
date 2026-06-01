import { StoreRouteShell } from "@/components/store/store-route-shell";
import { createPageMetadata } from "@/lib/seo";

export const revalidate = 30;

export const metadata = createPageMetadata({
  title: "متجر أرزاق",
  description: "خدمات جاهزة ومنتجات محلية من أهل غزة داخل منصة أرزاق.",
  path: "/store",
});

export default function StorePage() {
  return (
    <main className="container-responsive pb-16 pt-28">
      <StoreRouteShell
        eyebrow="متجر أرزاق"
        title="خدمات ومنتجات محلية من أهل غزة"
        description="هذا هو المسار العام للمتجر. في المرحلة التالية سنربطه بقوائم المنتجات، الفلاتر، البحث، والكروت الفعلية من قاعدة البيانات."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <StoreStep title="1" text="خدمات جاهزة بسعر واضح" />
          <StoreStep title="2" text="منتجات وبضائع محلية" />
          <StoreStep title="3" text="طلب داخل المنصة وتواصل خارجي آمن" />
        </div>
      </StoreRouteShell>
    </main>
  );
}

function StoreStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="font-mono text-xl font-bold text-primary-dark">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );
}
