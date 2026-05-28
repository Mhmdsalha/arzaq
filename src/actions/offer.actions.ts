"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireNotBanned, requireProvider } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import {
  createOfferSchema,
  updateOfferSchema,
  type CreateOfferInput,
  type UpdateOfferInput,
} from "@/schemas/offer.schema";
import {
  acceptOffer,
  createOffer,
  rejectOffer,
  updateOffer,
  withdrawOffer,
} from "@/services/offer.service";

export type OfferActionResult = ActionResult & {
  offerId?: string;
};

export async function createOfferAction(input: CreateOfferInput): Promise<OfferActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = createOfferSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى",
    };
  }

  try {
    await requireProvider();
    await requireNotBanned();
    const limit = await rateLimiters.createOffer(session.user.id);

    if (!limit.success) {
      return {
        ok: false,
        message: "تم تجاوز عدد العروض المسموح خلال الساعة. حاول لاحقاً",
      };
    }

    const clean = sanitizeCreateOfferInput(parsed.data);
    const offer = await createOffer(clean, session.user.id);
    revalidatePath(`/jobs/${clean.jobPostId}`);
    revalidatePath("/dashboard/offers");
    logAudit("CREATE_OFFER", { userId: session.user.id, entityType: "Offer", entityId: offer.id });

    return { ok: true, message: "تم إرسال عرضك بنجاح ✅", offerId: offer.id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function updateOfferAction(
  id: string,
  input: UpdateOfferInput,
): Promise<OfferActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = updateOfferSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى",
    };
  }

  try {
    await requireNotBanned();
    await updateOffer(id, sanitizeUpdateOfferInput(parsed.data), session.user.id);
    revalidatePath("/dashboard/offers");

    return { ok: true, message: "تم تعديل العرض بنجاح" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function withdrawOfferAction(id: string): Promise<OfferActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  try {
    await requireNotBanned();
    await withdrawOffer(id, session.user.id);
    revalidatePath("/dashboard/offers");
    logAudit("WITHDRAW_OFFER", { userId: session.user.id, entityType: "Offer", entityId: id });

    return { ok: true, message: "تم سحب العرض" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function acceptOfferAction(id: string): Promise<OfferActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  try {
    await requireNotBanned();
    await acceptOffer(id, session.user.id);
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/offers");
    logAudit("ACCEPT_OFFER", { userId: session.user.id, entityType: "Offer", entityId: id });

    return { ok: true, message: "تم قبول العرض" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function rejectOfferAction(id: string): Promise<OfferActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  try {
    await requireNotBanned();
    await rejectOffer(id, session.user.id);
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/offers");
    logAudit("REJECT_OFFER", { userId: session.user.id, entityType: "Offer", entityId: id });

    return { ok: true, message: "تم رفض العرض" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

function sanitizeCreateOfferInput(input: CreateOfferInput): CreateOfferInput {
  return {
    ...input,
    jobPostId: sanitizeText(input.jobPostId),
    message: sanitizeText(input.message),
    price: sanitizeText(input.price ?? ""),
    duration: sanitizeText(input.duration ?? ""),
  };
}

function sanitizeUpdateOfferInput(input: UpdateOfferInput): UpdateOfferInput {
  return {
    ...input,
    message: sanitizeText(input.message),
    price: sanitizeText(input.price ?? ""),
    duration: sanitizeText(input.duration ?? ""),
  };
}
