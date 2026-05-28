import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  .max(72, "كلمة المرور طويلة جداً")
  .refine((password) => /[A-Za-z\u0600-\u06FF]/.test(password), {
    message: "يجب أن تحتوي كلمة المرور على حرف واحد على الأقل",
  })
  .refine((password) => /\d/.test(password), {
    message: "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل",
  });
