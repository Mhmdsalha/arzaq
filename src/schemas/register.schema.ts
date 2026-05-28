import { z } from "zod";

import { passwordSchema } from "@/schemas/password.schema";

const phoneRegex = /^[0-9+\-\s()]{10,20}$/;
const regionValues = [
  "NORTH_GAZA",
  "GAZA_CITY",
  "CENTRAL",
  "KHAN_YOUNIS",
  "RAFAH",
  "ONLINE",
] as const;

export const accountTypeSchema = z.enum(["CLIENT", "PROVIDER"], {
  error: "اختر نوع حسابك للمتابعة",
});

export const registerSchema = z
  .object({
    accountType: accountTypeSchema,
    name: z.string().trim().min(2, "الاسم مطلوب ولا يقل عن حرفين").max(80, "الاسم طويل جداً"),
    email: z
      .string()
      .trim()
      .min(1, "البريد الإلكتروني مطلوب")
      .toLowerCase()
      .email("البريد الإلكتروني غير صحيح"),
    phone: z.string().trim().regex(phoneRegex, "رقم الجوال غير صحيح"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
    region: z.enum(regionValues, {
      error: "المنطقة مطلوبة",
    }),
    skills: z.array(z.string().cuid("مهارة غير صحيحة")).max(10, "عدد المهارات كبير جداً"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "كلمات المرور غير متطابقة",
  });

export type AccountTypeInput = z.infer<typeof accountTypeSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
