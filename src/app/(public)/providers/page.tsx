import { Suspense } from "react";

import { ProviderList } from "@/components/providers/provider-list";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { categories } from "@/mock/categories";
import { regions } from "@/mock/regions";
import { getPublicProviders } from "@/services/profile.service";

export const metadata = {
  title: "مقدمو الخدمات",
};

export const dynamic = "force-dynamic";

export default function ProvidersPage() {
  return (
    <main>
      <PageHeader
        title="مقدمو الخدمات"
        description="ابحث عن مصممين، مطورين، مدرسين، فنيين ومهارات محلية موثوقة."
        breadcrumbs={[{ label: "مقدمو الخدمات" }]}
      />
      <Suspense fallback={<ProvidersContentSkeleton />}>
        <ProvidersContent />
      </Suspense>
    </main>
  );
}

async function ProvidersContent() {
  const providers = await getPublicProviders();

  return (
    <section className="container py-8">
      <ProviderList providers={providers} categories={categories} regions={regions} />
    </section>
  );
}

function ProvidersContentSkeleton() {
  return (
    <section className="container py-8">
      <Skeleton className="mb-6 h-16 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}
