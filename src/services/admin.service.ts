import type { AccountType, JobStatus, ReportStatus, ReportTargetType } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import type { CreateAdminInput } from "@/schemas/admin.schema";

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
    pendingJobs,
    pendingVerificationRequests,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, accountType: "CLIENT" } }),
    prisma.user.count({ where: { deletedAt: null, accountType: "PROVIDER" } }),
    prisma.jobPost.count({ where: { deletedAt: null, status: "OPEN" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.profile.count({ where: { isTrusted: true, user: { accountType: "PROVIDER" } } }),
    prisma.user.count({ where: { deletedAt: null, isBanned: true } }),
    prisma.jobPost.count({ where: { deletedAt: null, status: "PENDING_REVIEW" } }),
    prisma.providerVerificationRequest.count({ where: { status: "PENDING" } }),
  ]);

  return {
    totalUsers,
    clientUsers,
    providerUsers,
    openJobs,
    pendingReports,
    trustedProviders,
    bannedUsers,
    pendingJobs,
    pendingVerificationRequests,
  };
}

export async function getAdminQueueSnapshot() {
  const [pendingJobs, verificationRequests, pendingReports] = await prisma.$transaction([
    prisma.jobPost.findMany({
      where: {
        deletedAt: null,
        status: "PENDING_REVIEW",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        code: true,
        title: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.providerVerificationRequest.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        provider: {
          select: {
            name: true,
            profile: {
              select: {
                avgRating: true,
                totalReviews: true,
              },
            },
          },
        },
      },
    }),
    prisma.report.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        reason: true,
        targetType: true,
        createdAt: true,
        reporter: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  return {
    pendingJobs,
    verificationRequests,
    pendingReports,
  };
}

export async function getAdminAccounts() {
  return prisma.user.findMany({
    where: {
      role: "ADMIN",
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isVerified: true,
      createdAt: true,
    },
  });
}

export async function createAdminUser(data: CreateAdminInput) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, ...(data.phone ? [{ phone: data.phone }] : [])],
      deletedAt: null,
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error("يوجد حساب بنفس البريد أو رقم الجوال");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone?.trim() || null,
      passwordHash,
      role: "ADMIN",
      accountType: "CLIENT",
      isVerified: true,
      profile: {
        create: {
          region: "ONLINE",
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
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
            { code: { contains: q, mode: "insensitive" as const } },
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
        code: true,
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

export async function getAdminJobById(jobId: string) {
  return prisma.jobPost.findFirst({
    where: {
      id: jobId,
      deletedAt: null,
    },
    select: {
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
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isVerified: true,
          isBanned: true,
          profile: {
            select: {
              region: true,
              whatsapp: true,
              avatarUrl: true,
            },
          },
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
          color: true,
        },
      },
      _count: {
        select: {
          offers: true,
          reports: true,
          savedBy: true,
        },
      },
    },
  });
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

export async function setUserVerified(userId: string, isVerified: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isVerified },
    select: { id: true, isVerified: true },
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

export async function approveJobPost(jobId: string) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.jobPost.update({
      where: { id: jobId },
      data: { status: "OPEN" },
      select: { id: true, title: true, authorId: true },
    });

    await tx.notification.create({
      data: {
        userId: job.authorId,
        type: "SYSTEM",
        message: `تم اعتماد طلبك ونشره: ${job.title}`,
        link: `/jobs/${job.id}`,
      },
    });

    return job;
  });
}

export async function requestJobEdit(jobId: string, note?: string) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.jobPost.update({
      where: { id: jobId },
      data: { status: "NEEDS_EDIT" },
      select: { id: true, title: true, authorId: true },
    });

    await tx.notification.create({
      data: {
        userId: job.authorId,
        type: "SYSTEM",
        message: note?.trim()
          ? `يرجى تعديل طلبك: ${job.title} - ${note.trim()}`
          : `يرجى تعديل طلبك قبل النشر: ${job.title}`,
        link: `/dashboard/jobs/${job.id}/edit`,
      },
    });

    return job;
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
