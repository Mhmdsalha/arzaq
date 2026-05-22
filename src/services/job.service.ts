import type { JobStatus, Prisma, Region, WorkMode } from "@prisma/client";

import { prisma } from "@/lib/prisma";
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

export async function getJobFilterOptions(): Promise<JobCategoryOption[]> {
  return prisma.category.findMany({
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
}

export async function getJobsWithFilters(
  filters: JobFiltersInput,
  userId?: string,
): Promise<PaginatedJobs<JobListItem>> {
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const where = buildJobsWhere(filters);

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
}

export async function getJobById(id: string, userId?: string): Promise<JobDetailsData | null> {
  const job = await prisma.jobPost.findFirst({
    where: {
      id,
      deletedAt: null,
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
            },
            take: 1,
          }
        : false,
    },
  });

  if (!job) {
    return null;
  }

  const listItem = mapJobListItem(job, userId);

  return {
    ...listItem,
    author: {
      ...listItem.author,
      whatsapp: job.author.profile?.whatsapp ?? null,
      avgRating: job.author.profile?.avgRating ?? 0,
      totalReviews: job.author.profile?.totalReviews ?? 0,
      region: job.author.profile?.region ?? null,
    },
    alreadyApplied: Boolean(userId && job.offers.length > 0),
    isOwner: job.author.id === userId,
  };
}

export async function getSimilarJobs(
  categoryId: string,
  excludeId: string,
  userId?: string,
): Promise<JobListItem[]> {
  const jobs = await prisma.jobPost.findMany({
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
  });

  return jobs.map((job) => mapJobListItem(job, userId));
}

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

  if (!job || job.status !== "OPEN") {
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
  const job = await prisma.jobPost.create({
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      authorId: userId,
      region: data.region,
      workMode: data.workMode,
      budget: data.budget?.trim() || null,
      duration: data.duration?.trim() || null,
      isUrgent: data.isUrgent,
      expiresAt: parseOptionalDate(data.expiresAt),
    },
    select: {
      id: true,
      title: true,
    },
  });

  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "SYSTEM",
        message: `تم نشر طلب جديد: ${job.title}`,
        link: `/jobs/${job.id}`,
      })),
    });
  }

  return job;
}

export async function updateJob(id: string, data: CreateJobInput, userId: string) {
  const result = await prisma.jobPost.updateMany({
    where: {
      id,
      authorId: userId,
      status: "OPEN",
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
      expiresAt: parseOptionalDate(data.expiresAt),
    },
  });

  if (result.count === 0) {
    throw new Error("لا يمكن تعديل هذا الطلب");
  }
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
  const query = filters.q?.trim();

  return {
    deletedAt: null,
    status: filters.status ?? "OPEN",
    ...(query
      ? {
          OR: [
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
