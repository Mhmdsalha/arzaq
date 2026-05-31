import type { JobStatus, Prisma, Region, WorkMode } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { assertClient } from "@/lib/authGuards";
import { isDatabaseConnectionError, isDatabaseTemporarilyUnavailable, prisma } from "@/lib/prisma";
import { sanitizeSearchQuery } from "@/lib/sanitize";
import { categories as mockCategories } from "@/mock/categories";
import { jobs as mockJobs } from "@/mock/jobs";
import type {
  JobCategoryOption,
  JobDetailsData,
  JobFormData,
  JobListItem,
  PaginatedJobs,
  UserJobItem,
} from "@/types/job";

const DEFAULT_PAGE_SIZE = 12;

export type JobFiltersInput = {
  q?: string;
  category?: string;
  region?: Region;
  workMode?: WorkMode;
  urgent?: boolean;
  status?: JobStatus;
  page?: number;
  pageSize?: number;
};

export type CreateJobInput = {
  title: string;
  description: string;
  categoryId: string;
  region: Region;
  workMode: WorkMode;
  budget?: string;
  duration?: string;
  isUrgent: boolean;
  expiresAt?: string;
};

const cachedJobFilterOptions = unstable_cache(
  async () => getJobFilterOptions(),
  ["job-filter-options"],
  {
    revalidate: 60,
    tags: ["jobs"],
  },
);

const cachedJobsWithFilters = unstable_cache(
  async (serializedFilters: string) => {
    return getJobsWithFilters(JSON.parse(serializedFilters) as JobFiltersInput);
  },
  ["jobs-with-filters"],
  {
    revalidate: 60,
    tags: ["jobs"],
  },
);

export function getCachedJobFilterOptions(): Promise<JobCategoryOption[]> {
  return cachedJobFilterOptions();
}

export function getCachedJobsWithFilters(
  filters: JobFiltersInput,
): Promise<PaginatedJobs<JobListItem>> {
  return cachedJobsWithFilters(serializeJobFilters(filters));
}

export const getJobFilterOptions = cache(async (): Promise<JobCategoryOption[]> => {
  if (!hasDatabaseUrl()) {
    return getMockJobFilterOptions();
  }

  if (isDatabaseTemporarilyUnavailable()) {
    return getMockJobFilterOptions();
  }

  try {
    return await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        icon: true,
      },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return getMockJobFilterOptions();
    }

    throw error;
  }
});

function serializeJobFilters(filters: JobFiltersInput): string {
  return JSON.stringify({
    q: filters.q ?? "",
    category: filters.category ?? "",
    region: filters.region ?? "",
    workMode: filters.workMode ?? "",
    urgent: filters.urgent ?? false,
    status: filters.status ?? "OPEN",
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
  });
}

export async function getJobsWithFilters(
  filters: JobFiltersInput,
  userId?: string,
): Promise<PaginatedJobs<JobListItem>> {
  if (!hasDatabaseUrl()) {
    return getMockJobsWithFilters(filters);
  }

  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;

  if (isDatabaseTemporarilyUnavailable()) {
    return getEmptyJobs(page, pageSize);
  }

  const where = buildJobsWhere(filters);

  try {
    const [items, total] = await prisma.$transaction([
      prisma.jobPost.findMany({
        where,
        orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: jobListSelect(userId),
      }),
      prisma.jobPost.count({ where }),
    ]);

    return {
      items: items.map((job) => mapJobListItem(job, userId)),
      total,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    };
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return getEmptyJobs(page, pageSize);
    }

    throw error;
  }
}

export const getJobById = cache(
  async (id: string, userId?: string): Promise<JobDetailsData | null> => {
    if (!hasDatabaseUrl()) {
      return getMockJobById(id);
    }

    if (isDatabaseTemporarilyUnavailable()) {
      return null;
    }

    const job = await prisma.jobPost
      .findFirst({
        where: {
          id,
          deletedAt: null,
          ...(userId
            ? {
                OR: [
                  { status: "OPEN" },
                  { authorId: userId },
                  {
                    offers: {
                      some: {
                        providerId: userId,
                        status: "ACCEPTED",
                      },
                    },
                  },
                ],
              }
            : { status: "OPEN" }),
        },
        select: {
          ...jobListSelect(userId),
          author: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  avatarUrl: true,
                  whatsapp: true,
                  avgRating: true,
                  totalReviews: true,
                  isTrusted: true,
                  region: true,
                },
              },
            },
          },
          offers: userId
            ? {
                where: {
                  providerId: userId,
                },
                select: {
                  id: true,
                  status: true,
                },
                take: 1,
              }
            : false,
        },
      })
      .catch((error: unknown) => {
        if (isDatabaseConnectionError(error)) {
          return null;
        }

        throw error;
      });

    if (!job) {
      return null;
    }

    const listItem = mapJobListItem(job, userId);
    const currentUserOffer = userId ? job.offers[0] : null;
    const canContactAuthor = currentUserOffer?.status === "ACCEPTED";

    return {
      ...listItem,
      author: {
        ...listItem.author,
        whatsapp: canContactAuthor ? (job.author.profile?.whatsapp ?? null) : null,
        avgRating: job.author.profile?.avgRating ?? 0,
        totalReviews: job.author.profile?.totalReviews ?? 0,
        region: job.author.profile?.region ?? null,
      },
      alreadyApplied: Boolean(userId && job.offers.length > 0),
      isOwner: job.author.id === userId,
    };
  },
);

export const getSimilarJobs = cache(
  async (categoryId: string, excludeId: string, userId?: string): Promise<JobListItem[]> => {
    if (!hasDatabaseUrl()) {
      return getMockSimilarJobs(categoryId, excludeId);
    }

    if (isDatabaseTemporarilyUnavailable()) {
      return [];
    }

    const jobs = await prisma.jobPost
      .findMany({
        where: {
          categoryId,
          id: {
            not: excludeId,
          },
          status: "OPEN",
          deletedAt: null,
        },
        orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
        take: 4,
        select: jobListSelect(userId),
      })
      .catch((error: unknown) => {
        if (isDatabaseConnectionError(error)) {
          return [];
        }

        throw error;
      });

    return jobs.map((job) => mapJobListItem(job, userId));
  },
);

export async function getUserJobs(userId: string): Promise<UserJobItem[]> {
  const jobs = await prisma.jobPost.findMany({
    where: {
      authorId: userId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      code: true,
      title: true,
      region: true,
      status: true,
      views: true,
      isUrgent: true,
      createdAt: true,
      category: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          offers: true,
        },
      },
    },
  });

  return jobs.map((job) => ({
    id: job.id,
    code: job.code,
    title: job.title,
    categoryName: job.category.name,
    region: job.region,
    status: job.status,
    views: job.views,
    isUrgent: job.isUrgent,
    createdAt: job.createdAt,
    offersCount: job._count.offers,
  }));
}

export async function getJobForEdit(id: string, userId: string): Promise<JobFormData | null> {
  const job = await prisma.jobPost.findFirst({
    where: {
      id,
      authorId: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      categoryId: true,
      region: true,
      workMode: true,
      budget: true,
      duration: true,
      isUrgent: true,
      expiresAt: true,
      status: true,
      _count: {
        select: {
          offers: true,
        },
      },
    },
  });

  if (!job || !["OPEN", "PENDING_REVIEW", "NEEDS_EDIT"].includes(job.status)) {
    return null;
  }

  return {
    id: job.id,
    title: job.title,
    description: job.description,
    categoryId: job.categoryId,
    region: job.region,
    workMode: job.workMode,
    budget: job.budget ?? "",
    duration: job.duration ?? "",
    isUrgent: job.isUrgent,
    expiresAt: job.expiresAt ? job.expiresAt.toISOString().slice(0, 10) : "",
    offersCount: job._count.offers,
  };
}

export async function getSavedJobs(userId: string): Promise<JobListItem[]> {
  const savedJobs = await prisma.savedJob.findMany({
    where: {
      userId,
      jobPost: {
        deletedAt: null,
      },
    },
    orderBy: {
      savedAt: "desc",
    },
    select: {
      jobPost: {
        select: jobListSelect(userId),
      },
    },
  });

  return savedJobs.map((savedJob) => mapJobListItem(savedJob.jobPost, userId));
}

export async function createJob(data: CreateJobInput, userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: {
      accountType: true,
    },
  });

  if (!user) {
    throw new Error("غير مصرح لك بهذا الإجراء");
  }

  assertClient(user.accountType);

  const job = await prisma.jobPost.create({
    data: {
      code: await generateJobCode(),
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      authorId: userId,
      region: data.region,
      workMode: data.workMode,
      budget: data.budget?.trim() || null,
      duration: data.duration?.trim() || null,
      isUrgent: data.isUrgent,
      status: "PENDING_REVIEW",
      expiresAt: parseOptionalDate(data.expiresAt),
    },
    select: {
      id: true,
      code: true,
      title: true,
    },
  });

  await notifyAdminsForJobReview(job.id, job.title);

  return job;
}

export async function updateJob(id: string, data: CreateJobInput, userId: string) {
  const result = await prisma.jobPost.updateMany({
    where: {
      id,
      authorId: userId,
      status: {
        in: ["OPEN", "PENDING_REVIEW", "NEEDS_EDIT"],
      },
      deletedAt: null,
    },
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      region: data.region,
      workMode: data.workMode,
      budget: data.budget?.trim() || null,
      duration: data.duration?.trim() || null,
      isUrgent: data.isUrgent,
      status: "PENDING_REVIEW",
      expiresAt: parseOptionalDate(data.expiresAt),
    },
  });

  if (result.count === 0) {
    throw new Error("لا يمكن تعديل هذا الطلب");
  }
  await notifyAdminsForJobReview(id, data.title);
}

export async function closeJob(id: string, userId: string) {
  const result = await prisma.jobPost.updateMany({
    where: {
      id,
      authorId: userId,
      status: "OPEN",
      deletedAt: null,
    },
    data: {
      status: "CANCELLED",
    },
  });

  if (result.count === 0) {
    throw new Error("لا يمكن إغلاق هذا الطلب");
  }
}

export async function softDeleteJob(id: string, userId: string) {
  const result = await prisma.jobPost.updateMany({
    where: {
      id,
      authorId: userId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw new Error("لا يمكن حذف هذا الطلب");
  }
}

export async function incrementJobViews(id: string, viewerId?: string) {
  if (!hasDatabaseUrl()) {
    return;
  }

  await prisma.jobPost.updateMany({
    where: {
      id,
      deletedAt: null,
      ...(viewerId ? { authorId: { not: viewerId } } : {}),
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });
}

async function notifyAdminsForJobReview(jobId: string, title: string) {
  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (admins.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: "SYSTEM",
      message: `طلب جديد بانتظار المراجعة: ${title}`,
      link: `/admin/jobs?status=PENDING_REVIEW&job=${jobId}`,
    })),
  });
}

async function generateJobCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = `ARZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const exists = await prisma.jobPost.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!exists) {
      return code;
    }
  }

  return `ARZ-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function getEmptyJobs(page: number, pageSize: number): PaginatedJobs<JobListItem> {
  return {
    items: [],
    total: 0,
    page,
    pageSize,
    totalPages: 1,
  };
}

function getMockJobFilterOptions(): JobCategoryOption[] {
  return mockCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    color: category.color,
    icon: category.icon,
  }));
}

function getMockJobsWithFilters(filters: JobFiltersInput): PaginatedJobs<JobListItem> {
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const query = filters.q?.trim().toLowerCase();
  const items = mockJobs
    .filter((job) => {
      const matchesQuery =
        !query ||
        `${job.title} ${job.description} ${job.categoryName} ${job.skills.join(" ")}`
          .toLowerCase()
          .includes(query);
      const matchesStatus = !filters.status || job.status === filters.status;
      const matchesCategory = !filters.category || job.categorySlug === filters.category;
      const matchesRegion = !filters.region || job.region === filters.region;
      const matchesWorkMode = !filters.workMode || job.workMode === filters.workMode;
      const matchesUrgent = !filters.urgent || job.isUrgent;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesCategory &&
        matchesRegion &&
        matchesWorkMode &&
        matchesUrgent
      );
    })
    .map(mapMockJobListItem);

  const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

  return {
    items: paginatedItems,
    total: items.length,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(items.length / pageSize), 1),
  };
}

function getMockJobById(id: string): JobDetailsData | null {
  const job = mockJobs.find((item) => item.id === id);

  if (!job) {
    return null;
  }

  return {
    ...mapMockJobListItem(job),
    author: {
      id: `mock-author-${job.id}`,
      name: job.authorName,
      avatarUrl: null,
      isTrusted: false,
      whatsapp: job.whatsapp,
      avgRating: 0,
      totalReviews: 0,
      region: job.region,
    },
    alreadyApplied: false,
    isOwner: false,
  };
}

function getMockSimilarJobs(categoryId: string, excludeId: string): JobListItem[] {
  return mockJobs
    .filter(
      (job) => job.categorySlug === categoryId && job.id !== excludeId && job.status === "OPEN",
    )
    .slice(0, 4)
    .map(mapMockJobListItem);
}

function mapMockJobListItem(job: (typeof mockJobs)[number]): JobListItem {
  const category = mockCategories.find((item) => item.slug === job.categorySlug);

  return {
    id: job.id,
    code: `ARZ-${job.id.slice(-6).toUpperCase()}`,
    title: job.title,
    description: job.description,
    budget: job.budget,
    duration: "حسب الاتفاق",
    isUrgent: job.isUrgent,
    views: 0,
    region: job.region,
    workMode: job.workMode,
    status: job.status,
    createdAt: new Date(`${job.postedAt}T00:00:00`),
    expiresAt: job.expiresAt ? new Date(`${job.expiresAt}T00:00:00`) : null,
    category: {
      id: category?.id ?? job.categorySlug,
      name: category?.name ?? job.categoryName,
      slug: category?.slug ?? job.categorySlug,
      color: category?.color ?? null,
      icon: category?.icon ?? null,
    },
    author: {
      id: `mock-author-${job.id}`,
      name: job.authorName,
      avatarUrl: null,
      isTrusted: false,
    },
    offersCount: 0,
    isSaved: false,
  };
}

export async function toggleSavedJob(id: string, userId: string) {
  const job = await prisma.jobPost.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!job) {
    throw new Error("الطلب غير موجود");
  }

  const savedJob = await prisma.savedJob.findUnique({
    where: {
      userId_jobPostId: {
        userId,
        jobPostId: id,
      },
    },
  });

  if (savedJob) {
    await prisma.savedJob.delete({
      where: {
        userId_jobPostId: {
          userId,
          jobPostId: id,
        },
      },
    });

    return false;
  }

  await prisma.savedJob.create({
    data: {
      userId,
      jobPostId: id,
    },
  });

  return true;
}

function buildJobsWhere(filters: JobFiltersInput): Prisma.JobPostWhereInput {
  const query = filters.q ? sanitizeSearchQuery(filters.q) : "";
  return {
    deletedAt: null,
    status: filters.status ?? "OPEN",
    ...(query
      ? {
          OR: [
            { code: { contains: query, mode: "insensitive" } },
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.category ? { categoryId: filters.category } : {}),
    ...(filters.region ? { region: filters.region } : {}),
    ...(filters.workMode ? { workMode: filters.workMode } : {}),
    ...(filters.urgent ? { isUrgent: true } : {}),
  };
}

function jobListSelect(userId?: string) {
  return {
    id: true,
    code: true,
    title: true,
    description: true,
    budget: true,
    duration: true,
    isUrgent: true,
    views: true,
    region: true,
    workMode: true,
    status: true,
    createdAt: true,
    expiresAt: true,
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        icon: true,
      },
    },
    author: {
      select: {
        id: true,
        name: true,
        profile: {
          select: {
            avatarUrl: true,
            isTrusted: true,
          },
        },
      },
    },
    _count: {
      select: {
        offers: true,
      },
    },
    savedBy: userId
      ? {
          where: {
            userId,
          },
          select: {
            userId: true,
          },
          take: 1,
        }
      : false,
  } satisfies Prisma.JobPostSelect;
}

type JobListPayload = Prisma.JobPostGetPayload<{
  select: ReturnType<typeof jobListSelect>;
}>;

function mapJobListItem(job: JobListPayload, userId?: string): JobListItem {
  return {
    id: job.id,
    code: job.code,
    title: job.title,
    description: job.description,
    budget: job.budget ?? "حسب الاتفاق",
    duration: job.duration ?? "حسب الاتفاق",
    isUrgent: job.isUrgent,
    views: job.views,
    region: job.region,
    workMode: job.workMode,
    status: job.status,
    createdAt: job.createdAt,
    expiresAt: job.expiresAt,
    category: job.category,
    author: {
      id: job.author.id,
      name: job.author.name,
      avatarUrl: job.author.profile?.avatarUrl ?? null,
      isTrusted: job.author.profile?.isTrusted ?? false,
    },
    offersCount: job._count.offers,
    isSaved: Boolean(userId && job.savedBy.length > 0),
  };
}

function parseOptionalDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}
