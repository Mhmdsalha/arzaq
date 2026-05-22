"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { auth } from "@/lib/auth";
import { profileSchema, type ProfileInput } from "@/schemas/profile.schema";
import { updateProfile } from "@/services/profile.service";

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = profileSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى",
    };
  }

  try {
    await updateProfile(session.user.id, parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return { ok: true, message: "تم حفظ البروفايل بنجاح" };
}
