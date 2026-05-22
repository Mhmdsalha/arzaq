import { z } from "zod";

export const createOfferSchema = z.object({
  jobPostId: z.string().trim().min(1, "الطلب غير صحيح"),
  message: z
    .string()
    .trim()
    .min(20, "رسالة العرض مطلوبة ولا تقل عن 20 حرفاً")
    .max(1000, "رسالة العرض لا تتجاوز 1000 حرف"),
  price: z.string().trim().max(100, "السعر المقترح لا يتجاوز 100 حرف"),
  duration: z.string().trim().max(50, "مدة التسليم لا تتجاوز 50 حرفاً"),
});

export const updateOfferSchema = createOfferSchema.omit({ jobPostId: true });

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
