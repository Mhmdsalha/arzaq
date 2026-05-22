import { z } from "zod";

const phoneRegex = /^[0-9+\-\s()]{10,20}$/;

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value.toLowerCase() : undefined))
  .pipe(z.string().email("البريد الإلكتروني غير صحيح").optional());

export const accountSettingsSchema = z.object({
  phone: z.string().trim().regex(phoneRegex, "رقم الجوال غير صحيح"),
  email: optionalEmail,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: z.string().min(8, "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "كلمتا المرور غير متطابقتين",
  });

export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
