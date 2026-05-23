"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { auth } from "@/lib/auth";
import {
  accountSettingsSchema,
  changePasswordSchema,
  type AccountSettingsInput,
  type ChangePasswordInput,
} from "@/schemas/settings.schema";
import { changeUserPassword, updateAccountSettings } from "@/services/settings.service";
import { switchAccountType } from "@/services/settings.service";
import type { AccountType } from "@prisma/client";

export async function updateAccountSettingsAction(
  input: AccountSettingsInput,
): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = accountSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى",
    };
  }

  try {
    await updateAccountSettings(session.user.id, parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }

  revalidatePath("/dashboard/settings");

  return { ok: true, message: "تم تحديث بيانات الحساب" };
}

export async function changePasswordAction(input: ChangePasswordInput): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = changePasswordSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى",
    };
  }

  try {
    await changeUserPassword(session.user.id, {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }

  return { ok: true, message: "تم تغيير كلمة المرور بنجاح" };
}

export async function switchAccountTypeAction(
  targetAccountType: AccountType,
): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  try {
    const result = await switchAccountType(session.user.id, targetAccountType);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/profile");

    return {
      ok: true,
      message:
        result.withdrawnOffers > 0
          ? "تم تحويل حسابك بنجاح، وتم سحب عروضك المعلقة تلقائياً"
          : "تم تحويل حسابك بنجاح",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}
