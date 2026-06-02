import { z } from "zod";

export const createListingReviewSchema = z.object({
  orderId: z.string().trim().min(1, "الطلب غير صحيح"),
  rating: z.coerce
    .number()
    .int("التقييم غير صحيح")
    .min(1, "اختر تقييماً من نجمة إلى خمس نجوم")
    .max(5, "التقييم لا يتجاوز 5 نجوم"),
  comment: z
    .string()
    .trim()
    .max(500, "التعليق لا يتجاوز 500 حرف")
    .optional()
    .default(""),
});

export type CreateListingReviewInput = z.infer<typeof createListingReviewSchema>;
