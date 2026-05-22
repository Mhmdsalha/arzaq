import { ProviderList } from "@/components/providers/provider-list";
import { PageHeader } from "@/components/shared/page-header";
import { categories } from "@/mock/categories";
import { providers } from "@/mock/providers";
import { regions } from "@/mock/regions";

export const metadata = {
  title: "مقدمو الخدمات",
};

export default function ProvidersPage() {
  return (
    <main>
      <PageHeader
        title="مقدمو الخدمات"
        description="ابحث عن مصممين، مطورين، مدرسين، فنيين ومهارات محلية موثوقة."
        breadcrumbs={[{ label: "مقدمو الخدمات" }]}
      />
      <section className="container py-8">
        <ProviderList providers={providers} categories={categories} regions={regions} />
      </section>
    </main>
  );
}
