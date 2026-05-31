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
  const message = {
    subject: "رمز توثيق بريدك في أرزاق",
    html: buildVerificationEmailHtml({ name, code }),
    text: `مرحباً ${name}، رمز توثيق بريدك في أرزاق هو: ${code}. ينتهي خلال 15 دقيقة. إذا لم تطلب إنشاء حساب في أرزاق، تجاهل هذه الرسالة.`,
  };

  if (emailProvider === "resend") {
    return sendWithResend({ to, ...message });
  }

  return sendWithSmtp({ to, ...message });
}

export async function sendPasswordResetCode({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}): Promise<EmailSendResult> {
  const message = {
    subject: "رمز إعادة تعيين كلمة المرور في أرزاق",
    html: buildPasswordResetEmailHtml({ name, code }),
    text: `مرحباً ${name}، رمز إعادة تعيين كلمة المرور في أرزاق هو: ${code}. ينتهي خلال 15 دقيقة. إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة.`,
  };

  if (emailProvider === "resend") {
    return sendWithResend({ to, ...message });
  }

  return sendWithSmtp({ to, ...message });
}

async function sendWithSmtp({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
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
      from: process.env.EMAIL_FROM || `"أرزاق" <${user}>`,
      replyTo: user,
      to,
      subject,
      html,
      text,
      headers: {
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "X-Entity-Ref-ID": `arzaq-${Date.now()}`,
      },
    });

    return { sent: true, devOnly: false };
  } catch (error) {
    console.error("SMTP email verification failed", error);
    return { sent: false, devOnly: false, reason: "provider-error" };
  }
}

async function sendWithResend({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailSendResult> {
  if (!resend) {
    return { sent: false, devOnly: false, reason: "missing-api-key" };
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Arzaq <onboarding@resend.dev>",
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("Resend email verification failed", error);
    return { sent: false, devOnly: false, reason: "provider-error" };
  }

  return { sent: true, devOnly: false };
}

function buildVerificationEmailHtml({ name, code }: { name: string; code: string }) {
  return buildCodeEmailHtml({
    name,
    code,
    title: "توثيق البريد الإلكتروني",
    intro: "استخدم الرمز التالي لتوثيق بريدك الإلكتروني وإكمال حماية حسابك في أرزاق.",
    footer: "ينتهي هذا الرمز خلال 15 دقيقة. إذا لم تطلب إنشاء حساب في أرزاق، تجاهل هذه الرسالة.",
  });
}

function buildPasswordResetEmailHtml({ name, code }: { name: string; code: string }) {
  return buildCodeEmailHtml({
    name,
    code,
    title: "إعادة تعيين كلمة المرور",
    intro: "وصلنا طلب لإعادة تعيين كلمة مرور حسابك. استخدم الرمز التالي لإكمال العملية.",
    footer: "ينتهي هذا الرمز خلال 15 دقيقة. إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة.",
  });
}

function buildCodeEmailHtml({
  name,
  code,
  title,
  intro,
  footer,
}: {
  name: string;
  code: string;
  title: string;
  intro: string;
  footer: string;
}) {
  return `
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title} - أرزاق</title>
      </head>
      <body style="margin:0; background:#f8fafc; font-family:Arial, Tahoma, sans-serif; color:#0f172a;">
        <div style="padding:32px 16px;">
          <div style="max-width:520px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; overflow:hidden;">
            <div style="background:#16a34a; padding:22px 28px; color:#ffffff;">
              <div style="font-size:28px; font-weight:700; line-height:1;">أرزاق</div>
              <div style="margin-top:8px; font-size:14px; opacity:.9;">منصة العمل والخدمات المحلية في غزة</div>
            </div>
            <div style="padding:28px;">
              <h1 style="margin:0 0 12px; color:#0f172a; font-size:22px;">${title}</h1>
              <p style="margin:0 0 14px; color:#334155; font-size:16px;">مرحباً ${escapeHtml(name)}</p>
              <p style="margin:0 0 22px; color:#475569; line-height:1.8; font-size:15px;">${intro}</p>
              <div style="direction:ltr; letter-spacing:8px; text-align:center; font-size:36px; font-weight:700; color:#15803d; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:16px; padding:18px;">
                ${escapeHtml(code)}
              </div>
              <p style="margin:22px 0 0; color:#64748b; font-size:13px; line-height:1.8;">${footer}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
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
