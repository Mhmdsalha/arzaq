import { createHash, randomInt, timingSafeEqual } from "crypto";
import type { AccountType, Prisma, Region, User, UserRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { cache } from "react";

import { isDatabaseConnectionError, isDatabaseTemporarilyUnavailable, prisma } from "@/lib/prisma";

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
  email: string;
  phone: string;
  password: string;
  region: Region;
  skills: string[];
}) {
  const email = input.email.toLowerCase();
  const phone = normalizePhone(input.phone);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ phone }, { email }],
    },
    select: {
      email: true,
      phone: true,
    },
  });

  if (existingUser?.phone === phone) {
    throw new Error("رقم الجوال مسجل مسبقاً");
  }

  if (existingUser?.email === email) {
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
    select: {
      id: true,
      email: true,
    },
  });
}

export async function createEmailVerificationCode(userId: string, email: string) {
  const normalizedEmail = email.toLowerCase();
  const code = String(randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  await prisma.emailVerificationToken.updateMany({
    where: {
      userId,
      email: normalizedEmail,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      email: normalizedEmail,
      codeHash: hashVerificationCode(code),
      expiresAt,
    },
  });

  return { code, expiresAt };
}

export async function verifyEmailCode(input: { email: string; code: string }) {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
    select: {
      id: true,
      isVerified: true,
    },
  });

  if (!user) {
    throw new Error("رمز التحقق غير صحيح أو منتهي");
  }

  if (user.isVerified) {
    return user.id;
  }

  const token = await prisma.emailVerificationToken.findFirst({
    where: {
      userId: user.id,
      email,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!token || !safeCompare(token.codeHash, hashVerificationCode(input.code))) {
    throw new Error("رمز التحقق غير صحيح أو منتهي");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    }),
    prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return user.id;
}

export async function resendEmailVerificationCode(email: string) {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      deletedAt: null,
    },
    select: {
      id: true,
      isVerified: true,
    },
  });

  if (!user || user.isVerified) {
    return null;
  }

  return createEmailVerificationCode(user.id, normalizedEmail);
}

export const getRegistrationSkills = cache(async () => {
  if (isDatabaseTemporarilyUnavailable()) {
    return [];
  }

  try {
    return await prisma.skill.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return [];
    }

    throw error;
  }
});

export async function createPasswordResetCode(identifier: string) {
  const user = await findUserByIdentifier(identifier);

  if (!user || user.isBanned || !user.email) {
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

  const code = String(randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  const resetToken = await prisma.passwordResetToken.create({
    data: {
      token: hashVerificationCode(code),
      userId: user.id,
      expiresAt,
    },
  });

  return {
    id: resetToken.id,
    code,
    email: user.email,
    name: user.name,
    expiresAt,
  };
}

export async function resetPassword(input: { email: string; code: string; password: string }) {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
    select: {
      id: true,
      isBanned: true,
    },
  });

  if (!user || user.isBanned) {
    throw new Error("رمز إعادة التعيين غير صحيح أو منتهي");
  }

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!resetToken || !safeCompare(resetToken.token, hashVerificationCode(input.code))) {
    throw new Error("رمز إعادة التعيين غير صحيح أو منتهي");
  }

  const passwordHash = await hash(input.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
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

function hashVerificationCode(code: string) {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? "arzaq-dev-secret";
  return createHash("sha256").update(`${code}:${secret}`).digest("hex");
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}
