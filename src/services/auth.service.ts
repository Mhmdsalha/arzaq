import { randomBytes } from "crypto";
import type { AccountType, Prisma, Region, User, UserRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type AuthUser = Pick<
  User,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "passwordHash"
  | "role"
  | "accountType"
  | "isVerified"
  | "isBanned"
>;

export type SafeAuthUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  accountType: AccountType;
  isVerified: boolean;
};

export async function findUserByIdentifier(identifier: string) {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const orConditions: Prisma.UserWhereInput[] = [];

  if (normalizedIdentifier.email) {
    orConditions.push({ email: normalizedIdentifier.email });
  }

  if (normalizedIdentifier.phone) {
    orConditions.push({ phone: normalizedIdentifier.phone });
  }

  if (orConditions.length === 0) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: orConditions,
    },
  });
}

export const findUserById = cache(async (userId: string) => {
  return prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });
});

export async function validatePassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createUser(input: {
  accountType: AccountType;
  name: string;
  email?: string;
  phone: string;
  password: string;
  region: Region;
  skills: string[];
}) {
  const email = input.email ? input.email.toLowerCase() : undefined;
  const phone = normalizePhone(input.phone);
  const orConditions: Prisma.UserWhereInput[] = [{ phone }];

  if (email) {
    orConditions.push({ email });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: orConditions,
    },
    select: {
      email: true,
      phone: true,
    },
  });

  if (existingUser?.phone === phone) {
    throw new Error("رقم الجوال مسجل مسبقاً");
  }

  if (email && existingUser?.email === email) {
    throw new Error("البريد الإلكتروني مسجل مسبقاً");
  }

  const passwordHash = await hash(input.password, 12);
  const skillIds = input.accountType === "PROVIDER" ? [...new Set(input.skills)] : [];

  if (skillIds.length > 0) {
    const existingSkills = await prisma.skill.count({
      where: {
        id: {
          in: skillIds,
        },
      },
    });

    if (existingSkills !== skillIds.length) {
      throw new Error("بعض المهارات المختارة غير صحيحة");
    }
  }

  return prisma.user.create({
    data: {
      name: input.name,
      email,
      phone,
      passwordHash,
      accountType: input.accountType,
      profile: {
        create: {
          region: input.region,
          whatsapp: phoneToWhatsApp(phone),
          isAvailable: input.accountType === "PROVIDER",
          skills:
            skillIds.length > 0
              ? {
                  create: skillIds.map((skillId) => ({
                    skill: {
                      connect: {
                        id: skillId,
                      },
                    },
                  })),
                }
              : undefined,
        },
      },
    },
  });
}

export const getRegistrationSkills = cache(async () => {
  return prisma.skill.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
});

export async function createPasswordResetToken(identifier: string) {
  const user = await findUserByIdentifier(identifier);

  if (!user || user.isBanned) {
    return null;
  }

  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      usedAt: new Date(),
    },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  const resetToken = await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  return resetToken;
}

export async function resetPassword(input: { token: string; password: string }) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: input.token },
    include: { user: true },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date() ||
    resetToken.user.deletedAt
  ) {
    throw new Error("رابط إعادة التعيين غير صالح أو منتهي");
  }

  const passwordHash = await hash(input.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);
}

export function toSafeAuthUser(user: AuthUser): SafeAuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    accountType: user.accountType,
    isVerified: user.isVerified,
  };
}

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function normalizeIdentifier(identifier: string) {
  const value = identifier.trim().toLowerCase();
  const isEmail = value.includes("@");

  return {
    email: isEmail ? value : undefined,
    phone: isEmail ? undefined : normalizePhone(value),
  };
}

function phoneToWhatsApp(phone: string) {
  if (phone.startsWith("+")) {
    return phone.replace("+", "");
  }

  if (phone.startsWith("0")) {
    return `970${phone.slice(1)}`;
  }

  return phone;
}
