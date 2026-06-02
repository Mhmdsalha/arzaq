"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireNotBanned } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import {
  createListingReviewSchema,
  type CreateListingReviewInput,
} from "@/schemas/listing-review.schema";
import { createListingReview } from "@/services/listing-review.service";

export type ListingReviewActionResult = ActionResult & {
  reviewId?: string;
};

export async function createListingReviewAction(
  input: CreateListingReviewInput,
): Promise<ListingReviewActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = createListingReviewSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "بيانات التقييم غير صحيحة",
    };
  }

  try {
    await requireNotBanned();
    const limit = await rateLimiters.createReview(session.user.id);

    if (!limit.success) {
      return { ok: false, message: "تم تجاوز عدد التقييمات المسموح. حاول لاحقاً" };
    }

    const review = await createListingReview(
      {
        ...parsed.data,
        orderId: sanitizeText(parsed.data.orderId),
        comment: sanitizeText(parsed.data.comment ?? ""),
      },
      session.user.id,
    );

    revalidateTag("store", "max");
    revalidatePath("/store");
    revalidatePath(`/store/${review.listingId}`);
    revalidatePath("/dashboard/orders");
    logAudit("CREATE_REVIEW", {
      userId: session.user.id,
      entityType: "ListingReview",
      entityId: review.id,
    });

    return { ok: true, message: "تم إرسال تقييمك بنجاح", reviewId: review.id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}
