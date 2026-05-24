import { z } from "zod";

export { registerSchema, type RegisterInput } from "@/schemas/register.schema";

const requiredText = "هذا الحقل مطلوب";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "رقم الجوال مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
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
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
