import { CategoriesGrid } from "@/components/home/categories-grid";
import { CTASection } from "@/components/home/cta-section";
import { FeaturedProvidersSection } from "@/components/home/featured-providers-section";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { LatestJobsSection } from "@/components/home/latest-jobs-section";
import { SearchSection } from "@/components/home/search-section";
import { categories } from "@/mock/categories";
import { createPageMetadata } from "@/lib/seo";
import { getJobsWithFilters } from "@/services/job.service";
import { getFeaturedProvidersForHome } from "@/services/profile.service";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "منصة العمل والخدمات المحلية في غزة",
  description:
    "انشر طلب خدمة أو عمل، تصفح الطلبات المفتوحة، وابحث عن مقدمي خدمات موثوقين في غزة عبر منصة أرزاق.",
  path: "/",
});

export default async function HomePage() {
  const [featuredProviders, latestJobs] = await Promise.all([
    getFeaturedProvidersForHome(),
    getJobsWithFilters({ status: "OPEN", pageSize: 6 }),
  ]);

  return (
    <main>
      <HeroSection />
      <SearchSection />
      <CategoriesGrid categories={categories} />
      <LatestJobsSection jobs={latestJobs.items} />
      <FeaturedProvidersSection
        providers={featuredProviders.providers}
        mode={featuredProviders.mode}
      />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
