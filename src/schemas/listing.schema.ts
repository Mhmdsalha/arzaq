import { z } from "zod";

const imageUrlSchema = z
  .string()
  .trim()
  .url("رابط الصورة غير صحيح")
  .max(500, "رابط الصورة طويل جداً");

const tagSchema = z
  .string()
  .trim()
  .min(2, "الوسم يجب أن لا يقل عن حرفين")
  .max(30, "الوسم لا يتجاوز 30 حرفاً");

const baseListingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "العنوان مطلوب ولا يقل عن 10 أحرف")
    .max(120, "العنوان لا يتجاوز 120 حرفاً"),
  description: z
    .string()
    .trim()
    .min(30, "الوصف مطلوب ولا يقل عن 30 حرفاً")
    .max(2000, "الوصف لا يتجاوز 2000 حرف"),
  type: z.enum(["SERVICE", "PHYSICAL"], {
    message: "يجب اختيار نوع العنصر",
  }),
  categoryId: z.string().trim().min(1, "يجب اختيار تصنيف"),
  region: z.enum(["NORTH_GAZA", "GAZA_CITY", "CENTRAL", "KHAN_YOUNIS", "RAFAH", "ONLINE"], {
    message: "يجب اختيار المنطقة",
  }),
  price: z.coerce
    .number({ message: "السعر يجب أن يكون رقماً" })
    .min(0, "السعر لا يمكن أن يكون سالباً")
    .max(100000, "السعر كبير جداً"),
  priceLabel: z.string().trim().max(100, "وصف السعر لا يتجاوز 100 حرف").optional().default(""),
  deliveryMethod: z.enum(["IN_PERSON", "DELIVERY", "ONLINE", "WHATSAPP"], {
    message: "يجب اختيار طريقة التسليم",
  }),
  deliveryTime: z.string().trim().max(100, "مدة التسليم لا تتجاوز 100 حرف").optional().default(""),
  quantity: z.coerce
    .number()
    .int("الكمية يجب أن تكون رقماً صحيحاً")
    .min(0, "الكمية لا يمكن أن تكون سالبة")
    .max(9999, "الكمية كبيرة جداً")
    .optional()
    .nullable(),
  images: z.array(imageUrlSchema).max(5, "يمكن إضافة 5 صور كحد أقصى").optional().default([]),
  tags: z.array(tagSchema).max(8, "يمكن إضافة 8 وسوم كحد أقصى").optional().default([]),
});

export const createListingSchema = baseListingSchema.superRefine((data, ctx) => {
  if (data.type === "PHYSICAL" && (data.quantity === null || data.quantity === undefined)) {
    ctx.addIssue({
      code: "custom",
      path: ["quantity"],
      message: "يجب تحديد الكمية للمنتجات",
    });
  }
});

export const updateListingSchema = baseListingSchema.omit({ type: true });

export const listingIdSchema = z.object({
  listingId: z.string().trim().min(1, "العنصر غير صحيح"),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingIdInput = z.infer<typeof listingIdSchema>;
