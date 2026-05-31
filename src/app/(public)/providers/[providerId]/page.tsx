import { redirect } from "next/navigation";

import { ProviderProfile } from "@/components/providers/provider-profile";
import { PageHeader } from "@/components/shared/page-header";
import { absoluteUrl, createPageMetadata, truncateDescription } from "@/lib/seo";
import { getPublicProviderById } from "@/services/profile.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const provider = await getPublicProviderById(providerId);

  if (!provider) {
    return createPageMetadata({
      title: "ملف مقدم الخدمة",
      description: "ملف عام لمقدم خدمة على منصة أرزاق.",
      path: `/providers/${providerId}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${provider.name} - ${provider.title}`,
    description: truncateDescription(
      `${provider.bio} مهارات: ${provider.skills.slice(0, 6).join("، ")}.`,
    ),
    path: `/providers/${provider.id}`,
    image: provider.avatarUrl,
  });
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
  const providerJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: provider.name,
    jobTitle: provider.title,
    description: provider.bio,
    image: provider.avatarUrl,
    url: absoluteUrl(`/providers/${provider.id}`),
    knowsAbout: provider.skills,
    aggregateRating:
      provider.reviewsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: provider.rating,
            reviewCount: provider.reviewsCount,
          }
        : undefined,
  };

  return (
    <main>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(providerJsonLd) }}
      />
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
