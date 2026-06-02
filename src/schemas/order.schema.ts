import { z } from "zod";

export const createOrderSchema = z.object({
  listingId: z.string().trim().min(1, "المنتج غير صحيح"),
  quantity: z.coerce
    .number()
    .int("الكمية يجب أن تكون رقماً صحيحاً")
    .min(1, "الكمية يجب أن تكون 1 على الأقل")
    .max(99, "الكمية المطلوبة كبيرة جداً"),
  note: z.string().trim().max(1000, "الملاحظة لا تتجاوز 1000 حرف").optional().default(""),
  contactMethod: z.enum(["WHATSAPP", "PLATFORM"], {
    message: "يجب اختيار طريقة التواصل",
  }),
  address: z.string().trim().max(300, "العنوان لا يتجاوز 300 حرف").optional().default(""),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().trim().min(1, "الطلب غير صحيح"),
  status: z.enum(["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"], {
    message: "حالة الطلب غير صحيحة",
  }),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().trim().min(1, "الطلب غير صحيح"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
