import { ProviderList } from "@/components/providers/provider-list";
import { PageHeader } from "@/components/shared/page-header";
import { categories } from "@/mock/categories";
import { regions } from "@/mock/regions";
import { getPublicProviders } from "@/services/profile.service";

export const metadata = {
  title: "مقدمو الخدمات",
};

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const providers = await getPublicProviders();

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
