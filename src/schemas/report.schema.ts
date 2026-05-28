import { ReportTargetType } from "@prisma/client";
import { z } from "zod";

export const createReportSchema = z.object({
  targetType: z.enum(ReportTargetType, {
    message: "نوع البلاغ غير صحيح",
  }),
  targetId: z.string().trim().min(1, "الهدف غير صحيح"),
  reason: z
    .string()
    .trim()
    .min(5, "سبب البلاغ يجب أن يكون واضحاً")
    .max(500, "سبب البلاغ لا يتجاوز 500 حرف"),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
