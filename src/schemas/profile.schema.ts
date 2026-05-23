import { z } from "zod";

const regionValues = [
  "NORTH_GAZA",
  "GAZA_CITY",
  "CENTRAL",
  "KHAN_YOUNIS",
  "RAFAH",
  "ONLINE",
] as const;
const workModeValues = ["ONLINE", "FIELD", "BOTH"] as const;

function optionalUrlMessage(value: string) {
  return value.trim().length === 0 || z.string().url().safeParse(value).success;
}

export const profileSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب ولا يقل عن حرفين").max(80, "الاسم طويل جدًا"),
  title: z.string().trim().max(120, "العنوان المهني طويل جدًا"),
  bio: z.string().trim().max(500, "النبذة لا تتجاوز 500 حرف"),
  region: z.enum(regionValues, { error: "يجب اختيار منطقة" }),
  workMode: z.enum(workModeValues, { error: "يجب اختيار طريقة العمل" }),
  isAvailable: z.boolean(),
  skills: z.array(z.string().cuid("مهارة غير صحيحة")).max(20, "عدد المهارات كبير جدًا"),
  whatsapp: z
    .string()
    .trim()
    .max(30, "رقم الواتساب طويل جدًا")
    .refine((value) => value.length === 0 || value.startsWith("+"), {
      message: "رقم الواتساب يجب أن يبدأ بـ +",
    }),
  avatarUrl: z.string().trim().refine(optionalUrlMessage, {
    message: "رابط الصورة غير صحيح",
  }),
  portfolioUrls: z
    .array(
      z.string().trim().refine(optionalUrlMessage, {
        message: "رابط العمل غير صحيح",
      }),
    )
    .max(8, "روابط الأعمال لا تتجاوز 8 روابط"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
