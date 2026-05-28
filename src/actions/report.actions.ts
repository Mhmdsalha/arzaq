"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireNotBanned } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import { createReportSchema, type CreateReportInput } from "@/schemas/report.schema";
import { createReport } from "@/services/report.service";

export async function createReportAction(input: CreateReportInput): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = createReportSchema.safeParse(input);

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
      targetType: parsed.data.targetType,
      targetId: sanitizeText(parsed.data.targetId),
      reason: sanitizeText(parsed.data.reason),
    };
    const report = await createReport(clean, session.user.id);

    revalidatePath("/admin/reports");
    logAudit("CREATE_REPORT", {
      userId: session.user.id,
      entityType: "Report",
      entityId: report.id,
      metadata: {
        targetType: clean.targetType,
        targetId: clean.targetId,
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
