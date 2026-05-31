"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { auth } from "@/lib/auth";
import { markUserNotificationsAsRead } from "@/services/navigation.service";

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const count = await markUserNotificationsAsRead(session.user.id);
  revalidatePath("/dashboard/notifications");

  return {
    ok: true,
    message: count > 0 ? "تم تعليم الإشعارات كمقروءة" : "لا توجد إشعارات غير مقروءة",
  };
}

export async function markAllNotificationsReadFormAction(): Promise<void> {
  await markAllNotificationsReadAction();
}
