"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import type { ActionResult } from "@/actions/auth.actions";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requireNotBanned } from "@/lib/authGuards";
import { rateLimiters } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import {
  cancelOrderSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  type CancelOrderInput,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
} from "@/schemas/order.schema";
import { cancelOrder, createOrder, updateOrderStatus } from "@/services/order.service";

export type OrderActionResult = ActionResult & {
  orderId?: string;
  whatsappUrl?: string | null;
};

export async function createOrderAction(input: CreateOrderInput): Promise<OrderActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = createOrderSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى",
    };
  }

  try {
    await requireNotBanned();
    const limit = await rateLimiters.createOrder(session.user.id);

    if (!limit.success) {
      return {
        ok: false,
        message: "تم تجاوز عدد الطلبات المسموح خلال الساعة. حاول لاحقاً",
      };
    }

    const clean = sanitizeCreateOrderInput(parsed.data);
    const order = await createOrder(clean, session.user.id);
    revalidateTag("store", "max");
    revalidatePath("/store");
    revalidatePath(`/store/${clean.listingId}`);
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/store");
    logAudit("CREATE_ORDER", { userId: session.user.id, entityType: "Order", entityId: order.id });

    return {
      ok: true,
      message: "تم إرسال طلبك بنجاح ✅",
      orderId: order.id,
      whatsappUrl: order.whatsappUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function updateOrderStatusAction(
  input: UpdateOrderStatusInput,
): Promise<OrderActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = updateOrderStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى",
    };
  }

  try {
    await requireNotBanned();
    await updateOrderStatus(parsed.data.orderId, parsed.data.status, session.user.id);
    revalidateTag("store", "max");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/store");
    logAudit("UPDATE_ORDER_STATUS", {
      userId: session.user.id,
      entityType: "Order",
      entityId: parsed.data.orderId,
      metadata: { status: parsed.data.status },
    });

    return { ok: true, message: "تم تحديث حالة الطلب" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

export async function cancelOrderAction(input: CancelOrderInput): Promise<OrderActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول أولاً" };
  }

  const parsed = cancelOrderSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "حدث خطأ، حاول مرة أخرى",
    };
  }

  try {
    await requireNotBanned();
    await cancelOrder(parsed.data.orderId, session.user.id);
    revalidateTag("store", "max");
    revalidatePath("/store");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/store");
    logAudit("CANCEL_ORDER", {
      userId: session.user.id,
      entityType: "Order",
      entityId: parsed.data.orderId,
    });

    return { ok: true, message: "تم إلغاء الطلب" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى",
    };
  }
}

function sanitizeCreateOrderInput(input: CreateOrderInput): CreateOrderInput {
  return {
    ...input,
    listingId: sanitizeText(input.listingId),
    note: sanitizeText(input.note ?? ""),
    address: sanitizeText(input.address ?? ""),
  };
}
