import { z } from "zod";

const requiredText = "هذا الحقل مطلوب";
const phoneRegex = /^[0-9+\-\s()]{10,20}$/;

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "البريد الإلكتروني أو رقم الجوال مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب").max(80, "الاسم طويل جدًا"),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.toLowerCase() : undefined))
    .pipe(z.string().email("البريد الإلكتروني غير صحيح").optional()),
  phone: z.string().trim().regex(phoneRegex, "رقم الجوال غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  region: z.enum(["NORTH_GAZA", "GAZA_CITY", "CENTRAL", "KHAN_YOUNIS", "RAFAH", "ONLINE"], {
    error: "المنطقة مطلوبة",
  }),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1, "البريد الإلكتروني أو رقم الجوال مطلوب"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, requiredText),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "كلمتا المرور غير متطابقتين",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
