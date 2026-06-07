"use server";

import type { ProviderVerificationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { requireAdmin, requireNotBanned, requireProvider } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import {
  requestProviderVerification,
  reviewProviderVerificationRequest,
} from "@/services/provider-verification.service";

export async function requestProviderVerificationAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireProvider();
    await requireNotBanned();
    const limit = await rateLimiters.providerVerification(session.user.id);

    if (!limit.success) {
      return { ok: false, message: "تم تجاوز عدد محاولات طلب التوثيق، حاول لاحقاً" };
    }

    const note = sanitizeText(String(formData.get("note") ?? ""));
    const request = await requestProviderVerification(session.user.id, note);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/admin");
    revalidatePath("/admin/verification");

    logAudit("REQUEST_PROVIDER_VERIFICATION", {
      userId: session.user.id,
      entityType: "ProviderVerificationRequest",
      entityId: request.id,
    });

    return { ok: true, message: "تم إرسال طلب التوثيق للإدارة" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}

export async function requestProviderVerificationFormAction(formData: FormData): Promise<void> {
  await requestProviderVerificationAction(formData);
}

export async function reviewProviderVerificationFormAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const limit = await rateLimiters.adminAction(session.user.id);

  if (!limit.success) {
    throw new Error("تم تجاوز عدد عمليات الإدارة، حاول لاحقاً");
  }

  const requestId = sanitizeText(String(formData.get("requestId") ?? ""));
  const decision = String(formData.get("decision") ?? "") as ProviderVerificationStatus;
  const reviewedNote = sanitizeText(String(formData.get("reviewedNote") ?? ""));

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    throw new Error("قرار المراجعة غير صحيح");
  }

  await reviewProviderVerificationRequest({
    requestId,
    adminId: session.user.id,
    decision,
    reviewedNote,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/verification");
  revalidatePath("/admin/users");
  revalidatePath("/providers");
}
