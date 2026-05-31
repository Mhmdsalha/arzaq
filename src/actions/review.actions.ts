"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireNotBanned } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import { createReviewSchema, type CreateReviewInput } from "@/schemas/review.schema";
import { createReview } from "@/services/review.service";

export type ReviewActionResult = ActionResult & {
  reviewId?: string;
};

export async function createReviewAction(input: CreateReviewInput): Promise<ReviewActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = createReviewSchema.safeParse(input);

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
      return {
        ok: false,
        message: "تم تجاوز عدد التقييمات المسموح. حاول لاحقاً",
      };
    }

    const review = await createReview(sanitizeReviewInput(parsed.data), session.user.id);

    revalidatePath("/dashboard/offers");
    revalidatePath(`/dashboard/jobs/${parsed.data.jobPostId}/offers`);
    revalidatePath("/providers");
    revalidatePath(`/providers/${parsed.data.receiverId}`);
    revalidatePath("/");
    logAudit("CREATE_REVIEW", {
      userId: session.user.id,
      entityType: "Review",
      entityId: review.id,
    });

    return { ok: true, message: "تم إرسال التقييم بنجاح", reviewId: review.id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

function sanitizeReviewInput(input: CreateReviewInput): CreateReviewInput {
  return {
    ...input,
    receiverId: sanitizeText(input.receiverId),
    jobPostId: sanitizeText(input.jobPostId),
    comment: sanitizeText(input.comment ?? ""),
  };
}
