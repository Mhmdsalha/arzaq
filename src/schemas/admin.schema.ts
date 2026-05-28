import { z } from "zod";

export const createAdminSchema = z.object({
  name: z.string().trim().min(2, "اسم الأدمن مطلوب"),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().trim().optional(),
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .max(72, "كلمة المرور طويلة جداً")
    .refine((value) => /\d/.test(value), "كلمة المرور يجب أن تحتوي على رقم"),
});

export const jobRejectionSchema = z.object({
  jobId: z.string().trim().min(1, "الطلب غير محدد"),
  note: z.string().trim().max(500, "الملاحظة لا تتجاوز 500 حرف").optional(),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
