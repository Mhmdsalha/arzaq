import type { CreateReportInput } from "@/schemas/report.schema";
import { prisma } from "@/lib/prisma";

export async function createReport(data: CreateReportInput, reporterId: string) {
  const existingReport = await prisma.report.findFirst({
    where: {
      reporterId,
      targetType: data.targetType,
      targetId: data.targetId,
    },
    select: { id: true },
  });

  if (existingReport) {
    throw new Error("أرسلت بلاغاً على هذا المحتوى مسبقاً");
  }

  if (data.targetType === "JOB_POST") {
    const job = await prisma.jobPost.findFirst({
      where: {
        id: data.targetId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!job) {
      throw new Error("الطلب غير موجود");
    }

    return prisma.report.create({
      data: {
        reason: data.reason,
        targetType: data.targetType,
        targetId: data.targetId,
        jobPostId: data.targetId,
        reporterId,
      },
      select: { id: true },
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      id: data.targetId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!user) {
    throw new Error("المستخدم غير موجود");
  }

  if (user.id === reporterId) {
    throw new Error("لا يمكنك الإبلاغ عن حسابك");
  }

  return prisma.report.create({
    data: {
      reason: data.reason,
      targetType: data.targetType,
      targetId: data.targetId,
      reporterId,
    },
    select: { id: true },
  });
}
