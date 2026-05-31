import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const envSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    DATABASE_URL_UNPOOLED: optionalUrl,

    AUTH_SECRET: optionalString,
    NEXTAUTH_SECRET: optionalString,
    AUTH_URL: optionalUrl,
    NEXTAUTH_URL: optionalUrl,

    CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
    CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1),
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1),
    CLOUDFLARE_R2_BUCKET_NAME: z.string().min(1),
    CLOUDFLARE_R2_PUBLIC_URL: z.string().url(),

    NEXT_PUBLIC_R2_PUBLIC_URL: optionalUrl,
    NEXT_PUBLIC_SITE_URL: z.string().url(),

    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
    SUPABASE_SERVICE_ROLE_KEY: optionalString,

    UPSTASH_REDIS_REST_URL: optionalUrl,
    UPSTASH_REDIS_REST_TOKEN: optionalString,

    EMAIL_PROVIDER: z.enum(["smtp", "resend"]).default("smtp"),
    EMAIL_FROM: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().min(1).default("Arzaq <onboarding@resend.dev>"),
    ),
    SMTP_HOST: optionalString,
    SMTP_PORT: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : Number(value)),
      z.number().int().positive().optional(),
    ),
    SMTP_SECURE: z.preprocess(
      (value) => (value === "true" ? true : value === "false" ? false : undefined),
      z.boolean().optional(),
    ),
    SMTP_USER: optionalString,
    SMTP_PASSWORD: optionalString,
    RESEND_API_KEY: optionalString,

    VAPID_PUBLIC_KEY: optionalString,
    VAPID_PRIVATE_KEY: optionalString,
    VAPID_MAILTO: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().email().optional(),
    ),

    TWILIO_ACCOUNT_SID: optionalString,
    TWILIO_AUTH_TOKEN: optionalString,
    TWILIO_VERIFY_SERVICE_SID: optionalString,

    SENTRY_DSN: optionalUrl,
  })
  .superRefine((value, ctx) => {
    const authSecret = value.NEXTAUTH_SECRET ?? value.AUTH_SECRET;

    if (!authSecret || authSecret.length < 32) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXTAUTH_SECRET"],
        message: "NEXTAUTH_SECRET أو AUTH_SECRET مطلوب ويجب أن يكون 32 حرفاً على الأقل",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("متغيرات البيئة غير مكتملة:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("متغيرات البيئة غير مكتملة أو غير صحيحة");
}

const authSecret = parsed.data.NEXTAUTH_SECRET ?? parsed.data.AUTH_SECRET;

if (!authSecret) {
  throw new Error("NEXTAUTH_SECRET أو AUTH_SECRET مطلوب");
}

export const env = {
  ...parsed.data,
  DATABASE_URL_UNPOOLED: parsed.data.DATABASE_URL_UNPOOLED ?? parsed.data.DATABASE_URL,
  NEXTAUTH_SECRET: authSecret,
  NEXTAUTH_URL:
    parsed.data.NEXTAUTH_URL ?? parsed.data.AUTH_URL ?? parsed.data.NEXT_PUBLIC_SITE_URL,
};
