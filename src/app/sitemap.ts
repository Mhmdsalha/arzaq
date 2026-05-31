import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";
import { getPublicSitemapEntries } from "@/services/seo.service";

const staticRoutes: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/jobs", priority: 0.9, changeFrequency: "hourly" },
  { path: "/providers", priority: 0.85, changeFrequency: "daily" },
  { path: "/categories", priority: 0.75, changeFrequency: "weekly" },
  { path: "/how-it-works", priority: 0.65, changeFrequency: "monthly" },
  { path: "/about", priority: 0.55, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.45, changeFrequency: "monthly" },
  { path: "/safety", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries = await getPublicSitemapEntries();

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...entries.jobs.map((job) => ({
      url: absoluteUrl(job.path),
      lastModified: job.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
    ...entries.providers.map((provider) => ({
      url: absoluteUrl(provider.path),
      lastModified: provider.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
  ];
}
