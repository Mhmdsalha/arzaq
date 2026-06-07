import { z } from "zod";

export const nameSchema = z
  .string()
  .trim()
  .min(2, "الاسم يجب أن يكون حرفين على الأقل")
  .max(100, "الاسم طويل جداً")
  .regex(/^[\u0600-\u06FF\u0750-\u077Fa-zA-Z\s]+$/, "الاسم يجب أن يحتوي على أحرف فقط");

export const phoneSchema = z
  .string()
  .trim()
  .min(10, "رقم الجوال قصير جداً")
  .max(20, "رقم الجوال طويل جداً")
  .regex(/^[+\d\s()-]+$/, "رقم الجوال غير صحيح");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("البريد الإلكتروني غير صحيح")
  .max(255, "البريد الإلكتروني طويل جداً");

export const optionalEmailSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  emailSchema.optional(),
);

export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  .max(72, "كلمة المرور طويلة جداً")
  .regex(/[a-zA-Z]/, "يجب أن تحتوي على حرف واحد على الأقل")
  .regex(/\d/, "يجب أن تحتوي على رقم واحد على الأقل");

export const urlSchema = z
  .string()
  .trim()
  .url("الرابط غير صحيح")
  .refine((value) => value.startsWith("https://"), "يجب أن يبدأ الرابط بـ https://")
  .max(2048, "الرابط طويل جداً");

export const optionalUrlSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  urlSchema.optional(),
);

export const searchQuerySchema = z
  .string()
  .trim()
  .max(200, "عبارة البحث طويلة جداً")
  .optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  cursor: z.string().max(100).optional(),
});

export const idSchema = z
  .string()
  .trim()
  .min(1, "المعرّف مطلوب")
  .max(100, "المعرّف طويل جداً")
  .regex(/^[a-zA-Z0-9_-]+$/, "معرّف غير صحيح");

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "بيانات غير صحيحة";
}
