import { CategoriesGrid } from "@/components/home/categories-grid";
import { CTASection } from "@/components/home/cta-section";
import { FeaturedProvidersSection } from "@/components/home/featured-providers-section";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { LatestJobsSection } from "@/components/home/latest-jobs-section";
import { SearchSection } from "@/components/home/search-section";
import { categories } from "@/mock/categories";
import { jobs } from "@/mock/jobs";
import { getPublicProviders } from "@/services/profile.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const providers = await getPublicProviders();

  return (
    <main>
      <HeroSection />
      <SearchSection />
      <CategoriesGrid categories={categories} />
      <LatestJobsSection jobs={jobs} />
      <FeaturedProvidersSection providers={providers.filter((provider) => provider.isTrusted)} />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
