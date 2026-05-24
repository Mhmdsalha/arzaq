import { CategoriesGrid } from "@/components/home/categories-grid";
import { CTASection } from "@/components/home/cta-section";
import { FeaturedProvidersSection } from "@/components/home/featured-providers-section";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { LatestJobsSection } from "@/components/home/latest-jobs-section";
import { SearchSection } from "@/components/home/search-section";
import { categories } from "@/mock/categories";
import { getJobsWithFilters } from "@/services/job.service";
import { getPublicProviders } from "@/services/profile.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [providers, latestJobs] = await Promise.all([
    getPublicProviders(),
    getJobsWithFilters({ status: "OPEN", pageSize: 6 }),
  ]);

  return (
    <main>
      <HeroSection />
      <SearchSection />
      <CategoriesGrid categories={categories} />
      <LatestJobsSection jobs={latestJobs.items} />
      <FeaturedProvidersSection providers={providers.filter((provider) => provider.isTrusted)} />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
