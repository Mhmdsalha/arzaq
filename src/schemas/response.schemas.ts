import { z } from "zod";

const regionSchema = z.enum([
  "NORTH_GAZA",
  "GAZA_CITY",
  "CENTRAL",
  "KHAN_YOUNIS",
  "RAFAH",
  "ONLINE",
]);
const workModeSchema = z.enum(["ONLINE", "FIELD", "BOTH"]);
const jobStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
const offerStatusSchema = z.enum(["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]);

export const providerPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  accountType: z.literal("PROVIDER").optional(),
  isVerified: z.boolean().optional(),
  createdAt: z.date().or(z.string()).optional(),
  profile: z
    .object({
      bio: z.string().nullable().optional(),
      region: regionSchema.nullable().optional(),
      avatarUrl: z.string().nullable().optional(),
      avgRating: z.number().optional(),
      totalReviews: z.number().optional(),
      isTrusted: z.boolean().optional(),
    })
    .nullable()
    .optional(),
});

export const jobListResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      budget: z.string().nullable().optional(),
      isUrgent: z.boolean(),
      region: regionSchema,
      workMode: workModeSchema,
      status: jobStatusSchema,
      createdAt: z.date().or(z.string()),
      offersCount: z.number(),
    }),
  ),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export const jobDetailResponseSchema = jobListResponseSchema.shape.items.element.extend({
  description: z.string(),
  duration: z.string().nullable().optional(),
  views: z.number().optional(),
});

export const offerResponseSchema = z.object({
  id: z.string(),
  message: z.string(),
  price: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  status: offerStatusSchema,
  createdAt: z.date().or(z.string()),
});
