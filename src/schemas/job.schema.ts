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
const jobStatusValues = ["OPEN", "CLOSED"] as const;

export const jobFiltersSchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  region: z.enum(regionValues).optional(),
  workMode: z.enum(workModeValues).optional(),
  urgent: z.coerce.boolean().optional(),
  status: z.enum(jobStatusValues).optional(),
  page: z.coerce.number().int().positive().optional(),
});

export const createJobSchema = z.object({
  title: z.string().trim().min(10, "عنوان الطلب مطلوب ولا يقل عن 10 أحرف"),
  description: z.string().trim().min(30, "وصف الطلب مطلوب ولا يقل عن 30 حرفاً"),
  categoryId: z.string().trim().min(1, "يجب اختيار تصنيف"),
  region: z.enum(regionValues, { error: "يجب اختيار المنطقة" }),
  workMode: z.enum(workModeValues, { error: "يجب اختيار طريقة العمل" }),
  budget: z.string().trim().max(100, "الميزانية لا تتجاوز 100 حرف"),
  duration: z.string().trim().max(50, "المدة المتوقعة لا تتجاوز 50 حرفاً"),
  isUrgent: z.boolean(),
  expiresAt: z.string().trim(),
});

export const updateJobSchema = createJobSchema;

export type JobFiltersInput = z.infer<typeof jobFiltersSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
