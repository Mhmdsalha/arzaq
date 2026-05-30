"use server";

import { AuthError } from "next-auth";
import type { AccountType } from "@prisma/client";
import { redirect } from "next/navigation";

import { logAudit } from "@/lib/audit";
import { signOut } from "@/lib/auth";
import { sendEmailVerificationCode } from "@/lib/email";
import {
  clearLoginLockout,
  getLoginLockoutMinutes,
  recordFailedLogin,
} from "@/lib/loginLockout";
import { isDatabaseConnectionError } from "@/lib/prisma";
import { rateLimiters } from "@/lib/rateLimit";
import { getPostLoginRedirect } from "@/lib/redirects";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type VerifyEmailInput,
} from "@/schemas/auth.schema";
import {
  createEmailVerificationCode,
  createPasswordResetToken,
  createUser,
  findUserByIdentifier,
  resendEmailVerificationCode,
  resetPassword,
  validatePassword,
  verifyEmailCode,
} from "@/services/auth.service";

export type ActionResult = {
  ok: boolean;
  message: string;
  resetUrl?: string;
  accountType?: AccountType;
  redirectTo?: string;
};

export async function loginAction(input: LoginInput, callbackUrl?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "بيانات الدخول غير صحيحة" };
  }

  try {
    const cleanIdentifier = sanitizeText(parsed.data.identifier);
    const loginLimit = await rateLimiters.login(cleanIdentifier);

    if (!loginLimit.success) {
      return {
        ok: false,
        message: "تم تجاوز عدد المحاولات المسموح. حاول لاحقاً",
      };
    }

    const lockedMinutes = await getLoginLockoutMinutes(cleanIdentifier);

    if (lockedMinutes) {
      return {
        ok: false,
        message: `تم قفل الحساب مؤقتاً. يمكنك المحاولة بعد ${lockedMinutes} دقيقة`,
      };
    }

    const user = await findUserByIdentifier(cleanIdentifier);
    const isValidPassword = user
      ? await validatePassword(parsed.data.password, user.passwordHash)
      : false;

    if (!user || user.isBanned || !isValidPassword) {
      const lockMinutes = await recordFailedLogin(cleanIdentifier);
      logAudit("LOGIN_FAILED", { metadata: { locked: Boolean(lockMinutes) } });

      if (lockMinutes) {
        return {
          ok: false,
          message: "تم قفل الحساب مؤقتاً بسبب محاولات دخول متعددة. حاول بعد 15 دقيقة",
        };
      }

      return { ok: false, message: "بيانات الدخول غير صحيحة" };
    }

    const redirectTo = getPostLoginRedirect(user.accountType, callbackUrl);
    await clearLoginLockout(cleanIdentifier);
    logAudit("LOGIN", { userId: user.id });

    return {
      ok: true,
      message: "تم تسجيل الدخول بنجاح",
      redirectTo,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (isAuthDatabaseError(error)) {
        return {
          ok: false,
          message: "تعذر الاتصال بقاعدة البيانات حالياً، تأكد من إعدادات Neon ثم حاول مرة أخرى",
        };
      }

      const cleanIdentifier = sanitizeText(parsed.data.identifier);
      const lockMinutes = await recordFailedLogin(cleanIdentifier);
      logAudit("LOGIN_FAILED", { metadata: { locked: Boolean(lockMinutes) } });

      if (lockMinutes) {
        return {
          ok: false,
          message: "تم قفل الحساب مؤقتاً بسبب محاولات دخول متعددة. حاول بعد 15 دقيقة",
        };
      }

      return { ok: false, message: "بيانات الدخول غير صحيحة" };
    }

    throw error;
  }

  return { ok: true, message: "تم تسجيل الدخول بنجاح", redirectTo: "/dashboard" };
}

export async function adminLoginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "بيانات الدخول غير صحيحة" };
  }

  const cleanIdentifier = sanitizeText(parsed.data.identifier);

  try {
    const loginLimit = await rateLimiters.login(`admin:${cleanIdentifier}`);

    if (!loginLimit.success) {
      return {
        ok: false,
        message: "تم تجاوز عدد المحاولات المسموح. حاول لاحقاً",
      };
    }

    const lockedMinutes = await getLoginLockoutMinutes(cleanIdentifier);

    if (lockedMinutes) {
      return {
        ok: false,
        message: `تم قفل الحساب مؤقتاً. يمكنك المحاولة بعد ${lockedMinutes} دقيقة`,
      };
    }

    const user = await findUserByIdentifier(cleanIdentifier);
    const isValidPassword = user
      ? await validatePassword(parsed.data.password, user.passwordHash)
      : false;

    if (!user || !isValidPassword) {
      const lockMinutes = await recordFailedLogin(cleanIdentifier);
      logAudit("LOGIN_FAILED", { metadata: { adminLogin: true, locked: Boolean(lockMinutes) } });

      return {
        ok: false,
        message: lockMinutes
          ? "تم قفل الحساب مؤقتاً بسبب محاولات دخول متعددة. حاول بعد 15 دقيقة"
          : "بيانات الدخول غير صحيحة",
      };
    }

    if (user.isBanned) {
      return { ok: false, message: "تم تعليق حسابك، تواصل مع الدعم" };
    }

    if (user.role !== "ADMIN") {
      return { ok: false, message: "هذا الدخول مخصص لحسابات الإدارة فقط" };
    }

    await clearLoginLockout(cleanIdentifier);
    logAudit("LOGIN", {
      userId: user.id,
      metadata: { adminLogin: true },
    });

    return {
      ok: true,
      message: "تم تسجيل دخول الإدارة بنجاح",
      redirectTo: "/admin",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "بيانات الدخول غير صحيحة" };
    }

    throw error;
  }
}

function isAuthDatabaseError(error: AuthError) {
  const possibleErrors = [error, error.cause, getNestedError(error.cause)];

  return possibleErrors.some((possibleError) => isDatabaseConnectionError(possibleError));
}

function getNestedError(cause: unknown) {
  if (typeof cause !== "object" || cause === null || !("err" in cause)) {
    return undefined;
  }

  return (cause as { err?: unknown }).err;
}

export async function registerAction(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى" };
  }

  const clean = sanitizeRegisterInput(parsed.data);
  const registerLimit = await rateLimiters.register(clean.email || clean.phone);

  if (!registerLimit.success) {
    return {
      ok: false,
      message: "تم تجاوز عدد محاولات إنشاء الحساب. حاول لاحقاً",
    };
  }

  try {
    const user = await createUser(clean);
    const userEmail = user.email ?? clean.email;
    const verification = await createEmailVerificationCode(user.id, userEmail);
    const emailResult = await sendEmailVerificationCode({
      to: userEmail,
      name: clean.name,
      code: verification.code,
    });
    logAudit("REGISTER", { userId: user.id, entityType: "User", entityId: user.id });

    return {
      ok: true,
      message: emailResult.sent
        ? "تم إنشاء الحساب وإرسال رمز التحقق إلى بريدك"
        : "تم إنشاء الحساب، لكن تعذر إرسال رمز التحقق. تأكد من إعدادات البريد ثم أعد الإرسال",
      redirectTo: `/auth/verify-email?email=${encodeURIComponent(clean.email)}`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }

  return { ok: true, message: "تم إنشاء الحساب بنجاح" };
}

export async function logoutAction() {
  logAudit("LOGOUT");
  await signOut({ redirectTo: "/" });
}

function sanitizeRegisterInput(input: RegisterInput): RegisterInput {
  return {
    ...input,
    name: sanitizeText(input.name),
    email: sanitizeText(input.email).toLowerCase(),
    phone: sanitizePhone(input.phone),
    skills: input.skills.map(sanitizeText),
  };
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى" };
  }

  const cleanIdentifier = sanitizeText(parsed.data.identifier);
  const resetLimit = await rateLimiters.passwordReset(cleanIdentifier);

  if (!resetLimit.success) {
    return {
      ok: false,
      message: "تم تجاوز عدد المحاولات المسموح. حاول لاحقاً",
    };
  }

  const token = await createPasswordResetToken(cleanIdentifier);

  if (!token) {
    return {
      ok: true,
      message: "إذا كان الحساب موجودًا، سيتم تجهيز رابط إعادة التعيين.",
    };
  }

  return {
    ok: true,
    message: "تم تجهيز رابط إعادة التعيين التجريبي. سنربطه بالإرسال لاحقًا.",
    resetUrl: `/auth/reset-password?token=${token.token}`,
  };
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى" };
  }

  try {
    await resetPassword({
      token: parsed.data.token,
      password: parsed.data.password,
    });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }

  redirect("/auth/login?reset=success");
}

export async function verifyEmailAction(input: VerifyEmailInput): Promise<ActionResult> {
  const parsed = verifyEmailSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "رمز التحقق غير صحيح" };
  }

  try {
    const userId = await verifyEmailCode(parsed.data);
    logAudit("EMAIL_VERIFIED", { userId, entityType: "User", entityId: userId });

    return {
      ok: true,
      message: "تم توثيق البريد الإلكتروني بنجاح",
      redirectTo: "/auth/login?verified=success",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "رمز التحقق غير صحيح أو منتهي",
    };
  }
}

export async function resendEmailVerificationAction(email: string): Promise<ActionResult> {
  const parsedEmail = verifyEmailSchema.shape.email.safeParse(email);

  if (!parsedEmail.success) {
    return { ok: false, message: "البريد الإلكتروني غير صحيح" };
  }

  const limit = await rateLimiters.passwordReset(parsedEmail.data);

  if (!limit.success) {
    return {
      ok: false,
      message: "تم تجاوز عدد المحاولات المسموح. حاول لاحقاً",
    };
  }

  const verification = await resendEmailVerificationCode(parsedEmail.data);

  if (!verification) {
    return {
      ok: true,
      message: "إذا كان الحساب بحاجة إلى توثيق، سيتم إرسال رمز جديد.",
    };
  }

  const emailResult = await sendEmailVerificationCode({
    to: parsedEmail.data,
    name: "مستخدم أرزاق",
    code: verification.code,
  });

  return {
    ok: true,
    message: emailResult.sent
      ? "تم إرسال رمز تحقق جديد إلى بريدك"
      : "تعذر إرسال رمز التحقق حالياً. تأكد من إعدادات البريد ثم حاول مرة أخرى",
  };
}
