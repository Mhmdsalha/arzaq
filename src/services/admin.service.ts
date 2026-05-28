import type { AccountType, JobStatus, ReportStatus, ReportTargetType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const ADMIN_PAGE_SIZE = 20;

export async function getAdminOverview() {
  const [
    totalUsers,
    clientUsers,
    providerUsers,
    openJobs,
    pendingReports,
    trustedProviders,
    bannedUsers,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, accountType: "CLIENT" } }),
    prisma.user.count({ where: { deletedAt: null, accountType: "PROVIDER" } }),
    prisma.jobPost.count({ where: { deletedAt: null, status: "OPEN" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.profile.count({ where: { isTrusted: true, user: { accountType: "PROVIDER" } } }),
    prisma.user.count({ where: { deletedAt: null, isBanned: true } }),
  ]);

  return {
    totalUsers,
    clientUsers,
    providerUsers,
    openJobs,
    pendingReports,
    trustedProviders,
    bannedUsers,
  };
}

export async function getAdminUsers({
  q,
  accountType,
  page = 1,
}: {
  q?: string;
  accountType?: AccountType;
  page?: number;
}) {
  const currentPage = Math.max(page, 1);
  const where = {
    deletedAt: null,
    ...(accountType ? { accountType } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        accountType: true,
        isVerified: true,
        isBanned: true,
        createdAt: true,
        profile: {
          select: {
            isTrusted: true,
            avgRating: true,
            totalReviews: true,
            region: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page: currentPage,
    totalPages: Math.max(Math.ceil(total / ADMIN_PAGE_SIZE), 1),
  };
}

export async function getAdminJobs({
  q,
  status,
  page = 1,
}: {
  q?: string;
  status?: JobStatus;
  page?: number;
}) {
  const currentPage = Math.max(page, 1);
  const where = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [jobs, total] = await prisma.$transaction([
    prisma.jobPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        status: true,
        region: true,
        isUrgent: true,
        views: true,
        createdAt: true,
        author: { select: { id: true, name: true, isBanned: true } },
        category: { select: { name: true } },
        _count: { select: { offers: true, reports: true } },
      },
    }),
    prisma.jobPost.count({ where }),
  ]);

  return {
    jobs,
    total,
    page: currentPage,
    totalPages: Math.max(Math.ceil(total / ADMIN_PAGE_SIZE), 1),
  };
}

export async function getAdminReports({
  status,
  targetType,
  page = 1,
}: {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  page?: number;
}) {
  const currentPage = Math.max(page, 1);
  const where = {
    ...(status ? { status } : {}),
    ...(targetType ? { targetType } : {}),
  };

  const [reports, total] = await prisma.$transaction([
    prisma.report.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        reason: true,
        targetType: true,
        targetId: true,
        status: true,
        resolvedNote: true,
        createdAt: true,
        reporter: { select: { id: true, name: true, email: true } },
        jobPost: { select: { id: true, title: true } },
      },
    }),
    prisma.report.count({ where }),
  ]);

  return {
    reports,
    total,
    page: currentPage,
    totalPages: Math.max(Math.ceil(total / ADMIN_PAGE_SIZE), 1),
  };
}

export async function setUserBanned(userId: string, isBanned: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isBanned },
    select: { id: true, isBanned: true },
  });
}

export async function setProviderTrusted(userId: string, isTrusted: boolean) {
  return prisma.profile.update({
    where: { userId },
    data: { isTrusted },
    select: { userId: true, isTrusted: true },
  });
}

export async function adminSoftDeleteJob(jobId: string) {
  return prisma.jobPost.update({
    where: { id: jobId },
    data: { deletedAt: new Date(), status: "CANCELLED" },
    select: { id: true },
  });
}

export async function updateReportReview(
  reportId: string,
  status: ReportStatus,
  resolvedNote?: string,
) {
  return prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      resolvedNote: resolvedNote?.trim() || null,
    },
    select: {
      id: true,
      status: true,
      reporterId: true,
      targetType: true,
      targetId: true,
    },
  });
}
