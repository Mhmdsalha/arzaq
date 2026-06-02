"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireNotBanned } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import {
  createListingReportSchema,
  type CreateListingReportInput,
} from "@/schemas/listing-report.schema";
import { createListingReport } from "@/services/listing-report.service";

export async function createListingReportAction(
  input: CreateListingReportInput,
): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = createListingReportSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "بيانات البلاغ غير صحيحة",
    };
  }

  try {
    await requireNotBanned();
    const limit = await rateLimiters.report(session.user.id);

    if (!limit.success) {
      return { ok: false, message: "تم تجاوز عدد البلاغات المسموح. حاول لاحقاً" };
    }

    const clean = {
      listingId: sanitizeText(parsed.data.listingId),
      reason: sanitizeText(parsed.data.reason),
      details: sanitizeText(parsed.data.details ?? ""),
    };
    const report = await createListingReport(clean, session.user.id);

    revalidatePath("/admin/store/reports");
    revalidatePath(`/store/${report.listingId}`);
    logAudit("CREATE_REPORT", {
      userId: session.user.id,
      entityType: "ListingReport",
      entityId: report.id,
      metadata: {
        listingId: report.listingId,
      },
    });

    return { ok: true, message: "تم إرسال البلاغ وسيتم مراجعته" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}
