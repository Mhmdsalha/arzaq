"use server";

import type { StorePlan, StorePlanPaymentMethod } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireAdmin, requireNotBanned } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";
import {
  approveStorePlanPaymentRequest,
  createStorePlanPaymentRequest,
  rejectStorePlanPaymentRequest,
} from "@/services/store-plan.service";

const paidPlanSchema = z.enum(["MAJDAL", "QUDS"]);
const paymentMethodSchema = z.enum(["BANK_OF_PALESTINE", "PAYPAL", "JAWAL_PAY"]);

const createPaymentRequestSchema = z.object({
  targetPlan: paidPlanSchema,
  method: paymentMethodSchema,
  proofUrl: z.string().trim().url("إشعار الدفع مطلوب"),
  payerName: z.string().trim().max(100, "اسم المحول لا يتجاوز 100 حرف").optional(),
  reference: z.string().trim().max(100, "رقم العملية لا يتجاوز 100 حرف").optional(),
  note: z.string().trim().max(500, "الملاحظة لا تتجاوز 500 حرف").optional(),
});

export async function createStorePlanPaymentRequestAction(input: {
  targetPlan: StorePlan;
  method: StorePlanPaymentMethod;
  proofUrl: string;
  payerName?: string;
  reference?: string;
  note?: string;
}): Promise<ActionResult & { requestId?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = createPaymentRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "بيانات الدفع غير صحيحة" };
  }

  try {
    await requireNotBanned();

    const limit = await rateLimiters.settings(session.user.id);

    if (!limit.success) {
      return { ok: false, message: "تم إرسال طلبات كثيرة، حاول لاحقاً" };
    }

    const request = await createStorePlanPaymentRequest(session.user.id, {
      targetPlan: parsed.data.targetPlan,
      method: parsed.data.method,
      proofUrl: sanitizeUrl(parsed.data.proofUrl),
      payerName: parsed.data.payerName ? sanitizeText(parsed.data.payerName) : undefined,
      reference: parsed.data.reference ? sanitizeText(parsed.data.reference) : undefined,
      note: parsed.data.note ? sanitizeText(parsed.data.note) : undefined,
    });

    revalidatePath("/dashboard/store");
    revalidatePath("/admin/store/payments");
    logAudit("CREATE_STORE_PLAN_PAYMENT", {
      userId: session.user.id,
      entityType: "StorePlanPaymentRequest",
      entityId: request.id,
      metadata: {
        targetPlan: request.targetPlan,
        amountIls: request.amountIls,
      },
    });

    return { ok: true, message: "تم إرسال إشعار الدفع للمراجعة", requestId: request.id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function approveStorePlanPaymentFormAction(formData: FormData): Promise<void> {
  await reviewStorePlanPaymentAction(formData, "APPROVE");
}

export async function rejectStorePlanPaymentFormAction(formData: FormData): Promise<void> {
  await reviewStorePlanPaymentAction(formData, "REJECT");
}

async function reviewStorePlanPaymentAction(
  formData: FormData,
  decision: "APPROVE" | "REJECT",
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const limit = await rateLimiters.adminAction(session.user.id);

    if (!limit.success) {
      return { ok: false, message: "تم تجاوز عدد عمليات الإدارة، حاول لاحقاً" };
    }

    const requestId = sanitizeText(String(formData.get("requestId") ?? ""));
    const adminNote = sanitizeText(String(formData.get("adminNote") ?? ""));
    const request =
      decision === "APPROVE"
        ? await approveStorePlanPaymentRequest(requestId, adminNote)
        : await rejectStorePlanPaymentRequest(requestId, adminNote);

    revalidateTag("store", "max");
    revalidatePath("/admin/store/payments");
    revalidatePath("/admin/users");
    revalidatePath("/dashboard/store");
    logAudit(decision === "APPROVE" ? "APPROVE_STORE_PLAN_PAYMENT" : "REJECT_STORE_PLAN_PAYMENT", {
      userId: session.user.id,
      entityType: "StorePlanPaymentRequest",
      entityId: request.id,
      metadata: {
        targetPlan: request.targetPlan,
      },
    });

    return {
      ok: true,
      message: decision === "APPROVE" ? "تم قبول الدفع وتفعيل الباقة" : "تم رفض إشعار الدفع",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
    };
  }
}
