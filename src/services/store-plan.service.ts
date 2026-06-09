import type { StorePlan } from "@prisma/client";

import { getAdminHref } from "@/lib/admin-path";
import { prisma } from "@/lib/prisma";
import { getStorePlanConfig, hasHigherStorePlan } from "@/constants/store-plans";

export async function requestStorePlanUpgrade(userId: string, targetPlan: StorePlan) {
  const user = await prisma.user.findFirst({
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
  });

  if (!user) {
    throw new Error("الحساب غير موجود");
  }

  if (!hasHigherStorePlan(user.storePlan, targetPlan)) {
    throw new Error("أنت تستخدم هذه الباقة أو باقة أعلى بالفعل");
  }

  const target = getStorePlanConfig(targetPlan);
  const current = getStorePlanConfig(user.storePlan);
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

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "SYSTEM",
        message: `طلب ترقية باقة متجر من ${user.name}: من ${current.label} إلى ${target.label}`,
        link: getAdminHref(`/users?q=${encodeURIComponent(user.name)}`),
      })),
    });
  }

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SYSTEM",
      message: `تم استلام طلب ترقية باقتك إلى ${target.label}. ستراجع الإدارة الطلب قريباً.`,
      link: "/dashboard/store",
    },
  });

  return {
    currentPlan: user.storePlan,
    targetPlan,
  };
}
