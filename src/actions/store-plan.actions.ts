"use server";

import type { StorePlan } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireNotBanned } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { requestStorePlanUpgrade } from "@/services/store-plan.service";

const upgradePlanSchema = z.enum(["MAJDAL", "QUDS"]);

export async function requestStorePlanUpgradeAction(plan: StorePlan): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = upgradePlanSchema.safeParse(plan);

  if (!parsed.success) {
    return { ok: false, message: "الباقة المختارة غير صحيحة" };
  }

  try {
    await requireNotBanned();

    const limit = await rateLimiters.settings(session.user.id);

    if (!limit.success) {
      return { ok: false, message: "تم إرسال طلبات كثيرة، حاول لاحقاً" };
    }

    await requestStorePlanUpgrade(session.user.id, parsed.data);
    revalidatePath("/dashboard/store");
    logAudit("REQUEST_STORE_PLAN_UPGRADE", {
      userId: session.user.id,
      entityType: "User",
      entityId: session.user.id,
      metadata: {
        targetPlan: parsed.data,
      },
    });

    return { ok: true, message: "تم إرسال طلب الاشتراك للإدارة" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}
