"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { auth } from "@/lib/auth";
import { requireNotBanned } from "@/lib/authGuards";
import { extractR2Key } from "@/lib/r2Utils";
import { sanitizePhone, sanitizeText, sanitizeUrl } from "@/lib/sanitize";
import { deleteFromR2 } from "@/lib/uploadImage";
import { profileSchema, type ProfileInput } from "@/schemas/profile.schema";
import { getProfileByUserId, updateProfile } from "@/services/profile.service";

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
    await requireNotBanned();
    const clean = sanitizeProfileInput(parsed.data);
    const currentProfile = await getProfileByUserId(session.user.id);
    await updateProfile(session.user.id, clean);

    const oldAvatarUrl = currentProfile?.profile.avatarUrl;
    if (oldAvatarUrl && clean.avatarUrl && oldAvatarUrl !== clean.avatarUrl) {
      const oldKey = extractR2Key(oldAvatarUrl);
      if (oldKey) {
        void deleteFromR2(oldKey).catch(() => undefined);
      }
    }
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

function sanitizeProfileInput(input: ProfileInput): ProfileInput {
  return {
    ...input,
    name: sanitizeText(input.name),
    title: sanitizeText(input.title ?? ""),
    bio: sanitizeText(input.bio ?? ""),
    whatsapp: sanitizePhone(input.whatsapp ?? ""),
    avatarUrl: sanitizeUrl(input.avatarUrl ?? ""),
    portfolioUrls: input.portfolioUrls.map(sanitizeUrl).filter(Boolean),
  };
}
