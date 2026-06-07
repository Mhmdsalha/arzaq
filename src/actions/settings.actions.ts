"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireNotBanned } from "@/lib/authGuards";
import { sendEmailVerificationCode } from "@/lib/email";
import { sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import {
  accountSettingsSchema,
  changePasswordSchema,
  type AccountSettingsInput,
  type ChangePasswordInput,
} from "@/schemas/settings.schema";
import { changeUserPassword, updateAccountSettings } from "@/services/settings.service";
import { switchAccountType } from "@/services/settings.service";
import { createEmailVerificationCode } from "@/services/auth.service";
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
    await requireNotBanned();
    const result = await updateAccountSettings(session.user.id, {
      phone: sanitizePhone(parsed.data.phone),
      email: parsed.data.email ? sanitizeEmail(parsed.data.email) : undefined,
    });

    if (result.emailChanged && result.email) {
      const verification = await createEmailVerificationCode(session.user.id, result.email);
      await sendEmailVerificationCode({
        to: result.email,
        name: session.user.name ?? "مستخدم أرزاق",
        code: verification.code,
      });
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }

  revalidatePath("/dashboard/settings");

  return {
    ok: true,
    message: "تم تحديث بيانات الحساب. إذا غيّرت البريد، أرسلنا رمز تحقق للبريد الجديد",
  };
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
    await requireNotBanned();
    await changeUserPassword(session.user.id, {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });
    logAudit("PASSWORD_CHANGE", {
      userId: session.user.id,
      entityType: "User",
      entityId: session.user.id,
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
    if (!["CLIENT", "PROVIDER"].includes(targetAccountType)) {
      return { ok: false, message: "نوع الحساب غير صحيح" };
    }

    await requireNotBanned();
    const result = await switchAccountType(session.user.id, targetAccountType);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/profile");
    logAudit("ACCOUNT_TYPE_SWITCH", {
      userId: session.user.id,
      entityType: "User",
      entityId: session.user.id,
      metadata: { targetAccountType },
    });

    return {
      ok: true,
      message:
        result.withdrawnOffers > 0
          ? "تم تحويل حسابك بنجاح، وتم سحب عروضك المعلقة تلقائياً"
          : "تم تحويل حسابك بنجاح",
      accountType: targetAccountType,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}
