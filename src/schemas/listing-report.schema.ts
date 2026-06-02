import { z } from "zod";

export const createListingReportSchema = z.object({
  listingId: z.string().trim().min(1, "العنصر غير صحيح"),
  reason: z
    .string()
    .trim()
    .min(5, "سبب البلاغ يجب أن يكون واضحاً")
    .max(200, "سبب البلاغ لا يتجاوز 200 حرف"),
  details: z
    .string()
    .trim()
    .max(500, "تفاصيل البلاغ لا تتجاوز 500 حرف")
    .optional()
    .default(""),
});

export type CreateListingReportInput = z.infer<typeof createListingReportSchema>;
