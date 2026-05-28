import { z } from "zod";

import { passwordSchema } from "@/schemas/password.schema";

export { registerSchema, type RegisterInput } from "@/schemas/register.schema";

const requiredText = "هذا الحقل مطلوب";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "البريد الإلكتروني أو رقم الجوال مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1, "البريد الإلكتروني أو رقم الجوال مطلوب"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, requiredText),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "كلمتا المرور غير متطابقتين",
  });

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("البريد الإلكتروني غير صحيح"),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "رمز التحقق يجب أن يتكون من 6 أرقام"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
