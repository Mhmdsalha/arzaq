import nodemailer from "nodemailer";
import { Resend } from "resend";

const emailProvider = process.env.EMAIL_PROVIDER ?? "smtp";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type EmailSendResult =
  | { sent: true; devOnly: false }
  | {
      sent: false;
      devOnly: false;
      reason: "missing-smtp-config" | "missing-api-key" | "provider-error";
    };

export async function sendEmailVerificationCode({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}): Promise<EmailSendResult> {
  if (emailProvider === "resend") {
    return sendWithResend({ to, name, code });
  }

  return sendWithSmtp({ to, name, code });
}

async function sendWithSmtp({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}): Promise<EmailSendResult> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = (process.env.SMTP_SECURE ?? "true") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    return { sent: false, devOnly: false, reason: "missing-smtp-config" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `Arzaq <${user}>`,
      to,
      subject: "رمز توثيق بريدك في أرزاق",
      html: buildVerificationEmailHtml({ name, code }),
      text: `مرحباً ${name}، رمز توثيق بريدك في أرزاق هو: ${code}. ينتهي خلال 15 دقيقة.`,
    });

    return { sent: true, devOnly: false };
  } catch (error) {
    console.error("SMTP email verification failed", error);
    return { sent: false, devOnly: false, reason: "provider-error" };
  }
}

async function sendWithResend({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}): Promise<EmailSendResult> {
  if (!resend) {
    return { sent: false, devOnly: false, reason: "missing-api-key" };
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Arzaq <onboarding@resend.dev>",
    to,
    subject: "رمز توثيق بريدك في أرزاق",
    html: buildVerificationEmailHtml({ name, code }),
    text: `مرحباً ${name}، رمز توثيق بريدك في أرزاق هو: ${code}. ينتهي خلال 15 دقيقة.`,
  });

  if (error) {
    console.error("Resend email verification failed", error);
    return { sent: false, devOnly: false, reason: "provider-error" };
  }

  return { sent: true, devOnly: false };
}

function buildVerificationEmailHtml({ name, code }: { name: string; code: string }) {
  return `
    <div dir="rtl" lang="ar" style="font-family: Arial, sans-serif; background:#f8fafc; padding:32px;">
      <div style="max-width:520px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; padding:28px;">
        <h1 style="margin:0 0 12px; color:#15803d; font-size:28px;">أرزاق</h1>
        <p style="margin:0 0 16px; color:#0f172a; font-size:18px;">مرحباً ${escapeHtml(name)}</p>
        <p style="margin:0 0 20px; color:#475569; line-height:1.8;">
          استخدم الرمز التالي لتوثيق بريدك الإلكتروني وإكمال حماية حسابك.
        </p>
        <div style="direction:ltr; letter-spacing:8px; text-align:center; font-size:36px; font-weight:700; color:#16a34a; background:#f0fdf4; border-radius:16px; padding:18px;">
          ${code}
        </div>
        <p style="margin:20px 0 0; color:#64748b; font-size:14px;">
          ينتهي هذا الرمز خلال 15 دقيقة. إذا لم تطلب إنشاء حساب في أرزاق، تجاهل هذه الرسالة.
        </p>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
