import { compare, hash } from "bcryptjs";
import type { AccountType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/services/auth.service";
import type { AccountSettingsData } from "@/types/profile";

export async function getSettingsByUserId(userId: string): Promise<AccountSettingsData | null> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: {
      phone: true,
      email: true,
      accountType: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    phone: user.phone ?? "",
    email: user.email ?? "",
    accountType: user.accountType,
  };
}

export async function switchAccountType(userId: string, targetAccountType: AccountType) {
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
    throw new Error("الحساب غير موجود");
  }

  if (user.accountType === targetAccountType) {
    return { withdrawnOffers: 0 };
  }

  return prisma.$transaction(async (tx) => {
    let withdrawnOffers = 0;

    if (user.accountType === "PROVIDER" && targetAccountType === "CLIENT") {
      const result = await tx.offer.updateMany({
        where: {
          providerId: userId,
          status: "PENDING",
        },
        data: {
          status: "WITHDRAWN",
        },
      });

      withdrawnOffers = result.count;
    }

    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        accountType: targetAccountType,
      },
    });

    await tx.profile.upsert({
      where: {
        userId,
      },
      update: {
        isAvailable: targetAccountType === "PROVIDER",
      },
      create: {
        userId,
        region: "ONLINE",
        isAvailable: targetAccountType === "PROVIDER",
      },
    });

    return { withdrawnOffers };
  });
}

export async function updateAccountSettings(
  userId: string,
  input: {
    phone: string;
    email?: string;
  },
) {
  const phone = normalizePhone(input.phone);
  const email = input.email ? input.email.toLowerCase() : null;

  const currentUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: {
      email: true,
    },
  });

  if (!currentUser) {
    throw new Error("الحساب غير موجود");
  }

  const emailChanged = email !== currentUser.email;

  const existingUser = await prisma.user.findFirst({
    where: {
      id: {
        not: userId,
      },
      OR: [{ phone }, ...(email ? [{ email }] : [])],
    },
    select: {
      phone: true,
      email: true,
    },
  });

  if (existingUser?.phone === phone) {
    throw new Error("رقم الجوال مسجل مسبقاً");
  }

  if (email && existingUser?.email === email) {
    throw new Error("البريد الإلكتروني مسجل مسبقاً");
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      phone,
      email,
      ...(emailChanged ? { isVerified: false } : {}),
    },
  });

  return { emailChanged, email };
}

export async function changeUserPassword(
  userId: string,
  input: {
    currentPassword: string;
    newPassword: string;
  },
) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: {
      passwordHash: true,
    },
  });

  if (!user) {
    throw new Error("الحساب غير موجود");
  }

  const isValidPassword = await compare(input.currentPassword, user.passwordHash);

  if (!isValidPassword) {
    throw new Error("كلمة المرور الحالية غير صحيحة");
  }

  const passwordHash = await hash(input.newPassword, 12);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
    },
  });
}
