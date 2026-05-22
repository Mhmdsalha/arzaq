"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/auth";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/schemas/auth.schema";
import { createPasswordResetToken, createUser, resetPassword } from "@/services/auth.service";

export type ActionResult = {
  ok: boolean;
  message: string;
  resetUrl?: string;
};

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "بيانات الدخول غير صحيحة" };
  }

  try {
    await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "بيانات الدخول غير صحيحة" };
    }

    throw error;
  }

  return { ok: true, message: "تم تسجيل الدخول بنجاح" };
}

export async function registerAction(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى" };
  }

  try {
    await createUser(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }

  try {
    await signIn("credentials", {
      identifier: parsed.data.email ?? parsed.data.phone,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "تم إنشاء الحساب، لكن تعذر تسجيل الدخول تلقائيًا" };
    }

    throw error;
  }

  return { ok: true, message: "تم إنشاء الحساب بنجاح" };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى" };
  }

  const token = await createPasswordResetToken(parsed.data.identifier);

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
