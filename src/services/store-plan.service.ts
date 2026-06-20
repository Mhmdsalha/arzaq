import type {
  Prisma,
  StorePlan,
  StorePlanPaymentMethod,
  StorePlanPaymentStatus,
} from "@prisma/client";

import { getAdminHref } from "@/lib/admin-path";
import { prisma } from "@/lib/prisma";
import {
  getStorePlanConfig,
  getStorePlanLimit,
  hasHigherStorePlan,
  storePlanOrder,
} from "@/constants/store-plans";
import { paymentMethodOrder, paymentMethods } from "@/constants/payment-methods";

export type StorePlanPaymentInput = {
  targetPlan: StorePlan;
  method: StorePlanPaymentMethod;
  proofUrl: string;
  payerName?: string;
  reference?: string;
  note?: string;
};

export type StorePlanPaymentFilters = {
  q?: string;
  requestId?: string;
  status?: StorePlanPaymentStatus;
  page?: number;
};

const PAYMENT_PAGE_SIZE = 20;

export async function getStorePlanCheckout(userId: string, targetPlan: StorePlan) {
  const user = await getActiveUserWithPlan(userId);

  if (!hasHigherStorePlan(user.storePlan, targetPlan)) {
    throw new Error("أنت تستخدم هذه الباقة أو باقة أعلى بالفعل");
  }

  const pendingRequest = await prisma.storePlanPaymentRequest.findFirst({
    where: {
      userId,
      targetPlan,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      amountIls: true,
      method: true,
      proofUrl: true,
      createdAt: true,
    },
  });

  return {
    currentPlan: user.storePlan,
    targetPlan,
    targetPlanConfig: getStorePlanConfig(targetPlan),
    currentPlanConfig: getStorePlanConfig(user.storePlan),
    paymentMethods,
    paymentMethodOrder,
    pendingRequest,
  };
}

export async function createStorePlanPaymentRequest(userId: string, input: StorePlanPaymentInput) {
  const user = await getActiveUserWithPlan(userId);

  if (!hasHigherStorePlan(user.storePlan, input.targetPlan)) {
    throw new Error("أنت تستخدم هذه الباقة أو باقة أعلى بالفعل");
  }

  if (!paymentMethodOrder.includes(input.method)) {
    throw new Error("طريقة الدفع غير صحيحة");
  }

  const targetPlan = getStorePlanConfig(input.targetPlan);

  if (targetPlan.priceIls <= 0) {
    throw new Error("هذه الباقة مجانية ولا تحتاج إلى دفع");
  }

  const existingPending = await prisma.storePlanPaymentRequest.findFirst({
    where: {
      userId,
      status: "PENDING",
    },
    select: {
      id: true,
    },
  });

  if (existingPending) {
    throw new Error("لديك طلب دفع قيد المراجعة بالفعل");
  }

  const paymentRequest = await prisma.storePlanPaymentRequest.create({
    data: {
      userId,
      targetPlan: input.targetPlan,
      amountIls: targetPlan.priceIls,
      method: input.method,
      proofUrl: input.proofUrl,
      payerName: input.payerName?.trim() || null,
      reference: input.reference?.trim() || null,
      note: input.note?.trim() || null,
    },
    select: {
      id: true,
      targetPlan: true,
      amountIls: true,
    },
  });

  await notifyAdminsAboutPaymentRequest(paymentRequest.id, user.name, input.targetPlan);
  await prisma.notification.create({
    data: {
      userId,
      type: "SYSTEM",
      message: `تم استلام إشعار الدفع لباقتك ${targetPlan.label}. ستتم مراجعته من الإدارة قريباً.`,
      link: "/dashboard/store",
    },
  });

  return paymentRequest;
}

export async function getAdminStorePlanPaymentRequests(filters: StorePlanPaymentFilters = {}) {
  const currentPage = Math.max(filters.page ?? 1, 1);
  const query = filters.q?.trim();
  const where: Prisma.StorePlanPaymentRequestWhereInput = {
    ...(filters.requestId ? { id: filters.requestId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(query
      ? {
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { reference: { contains: query, mode: "insensitive" } },
            { payerName: { contains: query, mode: "insensitive" } },
            { user: { name: { contains: query, mode: "insensitive" } } },
            { user: { email: { contains: query, mode: "insensitive" } } },
            { user: { phone: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [requests, total] = await prisma.$transaction([
    prisma.storePlanPaymentRequest.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (currentPage - 1) * PAYMENT_PAGE_SIZE,
      take: PAYMENT_PAGE_SIZE,
      select: {
        id: true,
        targetPlan: true,
        amountIls: true,
        method: true,
        payerName: true,
        reference: true,
        proofUrl: true,
        note: true,
        adminNote: true,
        status: true,
        reviewedAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            storePlan: true,
          },
        },
      },
    }),
    prisma.storePlanPaymentRequest.count({ where }),
  ]);

  return {
    requests,
    total,
    page: currentPage,
    totalPages: Math.max(Math.ceil(total / PAYMENT_PAGE_SIZE), 1),
  };
}

export async function approveStorePlanPaymentRequest(requestId: string, adminNote?: string) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.storePlanPaymentRequest.findFirst({
      where: {
        id: requestId,
        status: "PENDING",
      },
      select: {
        id: true,
        userId: true,
        targetPlan: true,
        user: {
          select: {
            storePlan: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error("طلب الدفع غير موجود أو تمت مراجعته مسبقاً");
    }

    if (getStorePlanLimit(request.user.storePlan) < getStorePlanLimit(request.targetPlan)) {
      await tx.user.update({
        where: {
          id: request.userId,
        },
        data: {
          storePlan: request.targetPlan,
        },
      });
    }

    const updatedRequest = await tx.storePlanPaymentRequest.update({
      where: {
        id: request.id,
      },
      data: {
        status: "APPROVED",
        adminNote: adminNote?.trim() || null,
        reviewedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        targetPlan: true,
      },
    });

    await tx.notification.create({
      data: {
        userId: updatedRequest.userId,
        type: "SYSTEM",
        message: `تم قبول الدفع وتفعيل باقة ${getStorePlanConfig(updatedRequest.targetPlan).label}`,
        link: "/dashboard/store",
      },
    });

    return updatedRequest;
  });
}

export async function rejectStorePlanPaymentRequest(requestId: string, adminNote?: string) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.storePlanPaymentRequest.findFirst({
      where: {
        id: requestId,
        status: "PENDING",
      },
      select: {
        id: true,
        userId: true,
        targetPlan: true,
      },
    });

    if (!request) {
      throw new Error("طلب الدفع غير موجود أو تمت مراجعته مسبقاً");
    }

    const updatedRequest = await tx.storePlanPaymentRequest.update({
      where: {
        id: request.id,
      },
      data: {
        status: "REJECTED",
        adminNote: adminNote?.trim() || null,
        reviewedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        targetPlan: true,
      },
    });

    await tx.notification.create({
      data: {
        userId: updatedRequest.userId,
        type: "SYSTEM",
        message: adminNote?.trim()
          ? `لم يتم قبول إشعار الدفع لباقتك ${getStorePlanConfig(updatedRequest.targetPlan).label}: ${adminNote.trim()}`
          : `لم يتم قبول إشعار الدفع لباقتك ${getStorePlanConfig(updatedRequest.targetPlan).label}. يرجى المحاولة مرة أخرى.`,
        link: "/dashboard/store",
      },
    });

    return updatedRequest;
  });
}

function getActiveUserWithPlan(userId: string) {
  return prisma.user
    .findFirst({
      where: {
        id: userId,
        deletedAt: null,
        isBanned: false,
      },
      select: {
        id: true,
        name: true,
        storePlan: true,
      },
    })
    .then((user) => {
      if (!user) {
        throw new Error("الحساب غير موجود");
      }

      return user;
    });
}

async function notifyAdminsAboutPaymentRequest(
  requestId: string,
  userName: string,
  targetPlan: StorePlan,
) {
  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      deletedAt: null,
      isBanned: false,
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
      message: `طلب دفع باقة متجر من ${userName}: ${getStorePlanConfig(targetPlan).label}`,
      link: getAdminHref(`/store/payments?request=${requestId}`),
    })),
  });
}

export function isPaidStorePlan(plan: StorePlan) {
  return storePlanOrder.includes(plan) && getStorePlanConfig(plan).priceIls > 0;
}
