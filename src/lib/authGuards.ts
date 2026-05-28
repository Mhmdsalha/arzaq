import type { AccountType } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("غير مصرح: يجب تسجيل الدخول");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user.role !== "ADMIN") {
    throw new Error("غير مصرح: هذا الإجراء للمديرين فقط");
  }

  return session;
}

export async function requireClient() {
  const session = await requireAuth();

  if (session.user.accountType !== "CLIENT") {
    throw new Error("هذا الإجراء لأصحاب الطلبات فقط");
  }

  return session;
}

export async function requireProvider() {
  const session = await requireAuth();

  if (session.user.accountType !== "PROVIDER") {
    throw new Error("هذا الإجراء لمقدمي الخدمات فقط");
  }

  return session;
}

export async function requireOwnership(
  resourceUserId: string,
  message = "ليس لديك صلاحية لتعديل هذا المحتوى",
) {
  const session = await requireAuth();

  if (session.user.id !== resourceUserId && session.user.role !== "ADMIN") {
    throw new Error(message);
  }

  return session;
}

export async function requireNotBanned() {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      isBanned: true,
    },
  });

  if (user?.isBanned) {
    throw new Error("تم تعليق حسابك. تواصل مع الدعم.");
  }

  return session;
}

export function assertClient(accountType: AccountType): void {
  if (accountType !== "CLIENT") {
    throw new Error("مقدمو الخدمات لا يمكنهم نشر الطلبات");
  }
}

export function assertProvider(accountType: AccountType): void {
  if (accountType !== "PROVIDER") {
    throw new Error("أصحاب الطلبات لا يمكنهم تقديم عروض");
  }
}
