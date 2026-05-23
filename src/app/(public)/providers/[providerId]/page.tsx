import { redirect } from "next/navigation";

import { ProviderProfile } from "@/components/providers/provider-profile";
import { PageHeader } from "@/components/shared/page-header";
import { getPublicProviderById } from "@/services/profile.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const provider = await getPublicProviderById(providerId);

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
  const provider = await getPublicProviderById(providerId);

  if (!provider) {
    redirect("/providers");
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
