"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { auth } from "@/lib/auth";
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
    const offer = await createOffer(parsed.data, session.user.id);
    revalidatePath(`/jobs/${parsed.data.jobPostId}`);
    revalidatePath("/dashboard/offers");

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
    await updateOffer(id, parsed.data, session.user.id);
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
    await withdrawOffer(id, session.user.id);
    revalidatePath("/dashboard/offers");

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
    await acceptOffer(id, session.user.id);
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/offers");

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
    await rejectOffer(id, session.user.id);
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/offers");

    return { ok: true, message: "تم رفض العرض" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}
