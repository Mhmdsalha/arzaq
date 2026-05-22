import { compare, hash } from "bcryptjs";

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
    },
  });

  if (!user) {
    return null;
  }

  return {
    phone: user.phone ?? "",
    email: user.email ?? "",
  };
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
    },
  });
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
