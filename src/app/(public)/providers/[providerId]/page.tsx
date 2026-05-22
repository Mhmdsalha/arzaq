import { notFound } from "next/navigation";

import { ProviderProfile } from "@/components/providers/provider-profile";
import { PageHeader } from "@/components/shared/page-header";
import { providers } from "@/mock/providers";

export function generateStaticParams() {
  return providers.map((provider) => ({ providerId: provider.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const provider = providers.find((item) => item.id === providerId);

  return {
    title: provider ? provider.name : "ملف مقدم الخدمة",
  };
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;
  const provider = providers.find((item) => item.id === providerId);

  if (!provider) {
    notFound();
  }

  return (
    <main>
      <PageHeader
        title={provider.name}
        description={provider.title}
        breadcrumbs={[{ label: "مقدمو الخدمات", href: "/providers" }, { label: provider.name }]}
      />
      <section className="container py-8">
        <ProviderProfile provider={provider} />
      </section>
    </main>
  );
}
