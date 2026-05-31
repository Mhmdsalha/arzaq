import { isDatabaseConnectionError, isDatabaseTemporarilyUnavailable, prisma } from "@/lib/prisma";

export type SitemapEntry = {
  path: string;
  updatedAt: Date;
};

export async function getPublicSitemapEntries(): Promise<{
  jobs: SitemapEntry[];
  providers: SitemapEntry[];
}> {
  if (isDatabaseTemporarilyUnavailable()) {
    return { jobs: [], providers: [] };
  }

  try {
    const [jobs, providers] = await Promise.all([
      prisma.jobPost.findMany({
        where: {
          status: "OPEN",
          deletedAt: null,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 500,
        select: {
          id: true,
          updatedAt: true,
        },
      }),
      prisma.user.findMany({
        where: {
          accountType: "PROVIDER",
          isVerified: true,
          isBanned: false,
          deletedAt: null,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 500,
        select: {
          id: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      jobs: jobs.map((job) => ({
        path: `/jobs/${job.id}`,
        updatedAt: job.updatedAt,
      })),
      providers: providers.map((provider) => ({
        path: `/providers/${provider.id}`,
        updatedAt: provider.updatedAt,
      })),
    };
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return { jobs: [], providers: [] };
    }

    throw error;
  }
}
